// Archivo para implementar la funcionalidad multijugador
// Este archivo se integrará con las mecánicas básicas del juego

// Importaciones (se cargarán desde el HTML principal)
// import * as THREE from 'three';

// Constantes para la configuración de red
const SYNC_RATE = 10; // Actualizaciones por segundo
const INTERPOLATION_DELAY = 100; // ms de retraso para interpolación
const PREDICTION_TOLERANCE = 0.5; // Tolerancia para reconciliación de posición

// Clase para gestionar la conexión WebSocket
class NetworkManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.socket = null;
        this.connected = false;
        this.playerId = null;
        this.players = new Map(); // Mapa de jugadores remotos
        this.pendingInputs = []; // Inputs pendientes de confirmación
        this.serverTime = 0; // Tiempo del servidor
        this.serverTimeOffset = 0; // Diferencia entre tiempo local y servidor
        this.lastSyncTime = 0; // Último tiempo de sincronización
        this.syncInterval = 1000 / SYNC_RATE; // Intervalo de sincronización en ms
        
        // Buffer para interpolación
        this.stateBuffer = new Map(); // Mapa de buffers de estado por jugador
    }
    
    // Conectar al servidor
    connect(serverUrl) {
        try {
            this.socket = new WebSocket(serverUrl);
            
            this.socket.onopen = () => {
                console.log('Conexión establecida con el servidor');
                this.connected = true;
                
                // Enviar mensaje de conexión
                this.send('connect', {
                    clientTime: Date.now()
                });
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.socket.onclose = () => {
                console.log('Conexión cerrada');
                this.connected = false;
                this.gameManager.handleDisconnect();
            };
            
            this.socket.onerror = (error) => {
                console.error('Error de conexión:', error);
                this.gameManager.handleNetworkError(error);
            };
        } catch (error) {
            console.error('Error al conectar:', error);
            this.gameManager.handleNetworkError(error);
        }
    }
    
    // Desconectar del servidor
    disconnect() {
        if (this.socket && this.connected) {
            this.socket.close();
        }
    }
    
    // Enviar mensaje al servidor
    send(type, data) {
        if (!this.connected) return;
        
        const message = {
            type: type,
            data: data,
            timestamp: Date.now()
        };
        
        this.socket.send(JSON.stringify(message));
    }
    
    // Manejar mensaje recibido
    handleMessage(message) {
        const { type, data, timestamp } = message;
        
        // Actualizar tiempo del servidor
        this.updateServerTime(timestamp);
        
        switch (type) {
            case 'welcome':
                this.handleWelcome(data);
                break;
            case 'player_joined':
                this.handlePlayerJoined(data);
                break;
            case 'player_left':
                this.handlePlayerLeft(data);
                break;
            case 'game_state':
                this.handleGameState(data);
                break;
            case 'input_ack':
                this.handleInputAck(data);
                break;
            case 'chat_message':
                this.handleChatMessage(data);
                break;
            case 'error':
                this.handleError(data);
                break;
            default:
                console.warn('Mensaje desconocido:', type);
        }
    }
    
    // Actualizar tiempo del servidor
    updateServerTime(serverTimestamp) {
        const now = Date.now();
        this.serverTimeOffset = serverTimestamp - now;
        this.serverTime = now + this.serverTimeOffset;
    }
    
    // Obtener tiempo actual del servidor
    getServerTime() {
        return Date.now() + this.serverTimeOffset;
    }
    
    // Manejar mensaje de bienvenida
    handleWelcome(data) {
        this.playerId = data.playerId;
        this.gameManager.setLocalPlayerId(this.playerId);
        
        // Inicializar jugadores existentes
        for (const player of data.players) {
            if (player.id !== this.playerId) {
                this.addRemotePlayer(player);
            }
        }
        
        console.log(`Conectado como jugador ${this.playerId}`);
        this.gameManager.handleConnected();
    }
    
    // Manejar nuevo jugador
    handlePlayerJoined(data) {
        if (data.player.id !== this.playerId) {
            this.addRemotePlayer(data.player);
            this.gameManager.handlePlayerJoined(data.player);
        }
    }
    
    // Manejar jugador desconectado
    handlePlayerLeft(data) {
        this.removeRemotePlayer(data.playerId);
        this.gameManager.handlePlayerLeft(data.playerId);
    }
    
    // Manejar actualización de estado del juego
    handleGameState(data) {
        // Actualizar estado de jugadores remotos
        for (const playerState of data.players) {
            if (playerState.id !== this.playerId) {
                this.updateRemotePlayerState(playerState);
            } else {
                // Reconciliación del estado local
                this.reconcileLocalState(playerState);
            }
        }
        
        // Actualizar estado de enemigos
        this.gameManager.updateEnemiesState(data.enemies);
        
        // Actualizar otros elementos del juego
        if (data.gameInfo) {
            this.gameManager.updateGameInfo(data.gameInfo);
        }
    }
    
    // Manejar confirmación de input
    handleInputAck(data) {
        const { inputSequence } = data;
        
        // Eliminar inputs confirmados
        this.pendingInputs = this.pendingInputs.filter(
            input => input.sequence > inputSequence
        );
    }
    
    // Manejar mensaje de chat
    handleChatMessage(data) {
        this.gameManager.handleChatMessage(data);
    }
    
    // Manejar error
    handleError(data) {
        console.error('Error del servidor:', data.message);
        this.gameManager.handleNetworkError(data);
    }
    
    // Añadir jugador remoto
    addRemotePlayer(playerData) {
        const remotePlayer = new RemotePlayer(
            this.gameManager.scene,
            playerData.id,
            new THREE.Vector3(
                playerData.position.x,
                playerData.position.y,
                playerData.position.z
            )
        );
        
        this.players.set(playerData.id, remotePlayer);
        this.stateBuffer.set(playerData.id, []);
        
        return remotePlayer;
    }
    
    // Eliminar jugador remoto
    removeRemotePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.remove();
            this.players.delete(playerId);
            this.stateBuffer.delete(playerId);
        }
    }
    
    // Actualizar estado de jugador remoto
    updateRemotePlayerState(playerState) {
        // Añadir estado al buffer para interpolación
        const buffer = this.stateBuffer.get(playerState.id);
        if (buffer) {
            // Añadir timestamp del servidor
            playerState.timestamp = this.getServerTime();
            
            // Añadir al buffer
            buffer.push(playerState);
            
            // Mantener buffer ordenado por timestamp
            buffer.sort((a, b) => a.timestamp - b.timestamp);
            
            // Limitar tamaño del buffer
            const maxBufferSize = 60; // 2 segundos a 30 fps
            if (buffer.length > maxBufferSize) {
                buffer.shift();
            }
        }
    }
    
    // Reconciliar estado local con el servidor
    reconcileLocalState(serverState) {
        // Encontrar el último input confirmado
        const lastAckedInput = this.pendingInputs.length > 0 ? 
            this.pendingInputs[0].sequence - 1 : 
            serverState.lastProcessedInput;
        
        // Si hay discrepancia, corregir posición
        if (this.gameManager.player) {
            const player = this.gameManager.player;
            
            // Calcular diferencia
            const posDiff = new THREE.Vector3(
                serverState.position.x - player.position.x,
                serverState.position.y - player.position.y,
                serverState.position.z - player.position.z
            );
            
            // Si la diferencia es significativa, corregir
            if (posDiff.length() > PREDICTION_TOLERANCE) {
                // Corregir posición
                player.position.set(
                    serverState.position.x,
                    serverState.position.y,
                    serverState.position.z
                );
                
                // Aplicar inputs pendientes
                for (const input of this.pendingInputs) {
                    this.gameManager.applyInput(input);
                }
            }
            
            // Actualizar otros estados
            player.health = serverState.health;
            player.stamina = serverState.stamina;
        }
    }
    
    // Enviar input al servidor
    sendInput(input) {
        // Añadir secuencia y timestamp
        input.sequence = this.gameManager.inputSequence++;
        input.timestamp = Date.now();
        
        // Añadir a pendientes
        this.pendingInputs.push(input);
        
        // Enviar al servidor
        this.send('player_input', input);
        
        return input;
    }
    
    // Enviar mensaje de chat
    sendChatMessage(message) {
        this.send('chat_message', {
            message: message
        });
    }
    
    // Actualizar jugadores remotos
    update(deltaTime) {
        // Actualizar jugadores remotos con interpolación
        for (const [playerId, player] of this.players.entries()) {
            this.interpolatePlayerState(playerId, player, deltaTime);
        }
        
        // Enviar actualizaciones al servidor
        const now = Date.now();
        if (now - this.lastSyncTime >= this.syncInterval) {
            this.syncWithServer();
            this.lastSyncTime = now;
        }
    }
    
    // Interpolar estado de jugador remoto
    interpolatePlayerState(playerId, player, deltaTime) {
        const buffer = this.stateBuffer.get(playerId);
        if (!buffer || buffer.length < 2) return;
        
        // Calcular tiempo de renderizado (con retraso para interpolación)
        const renderTime = this.getServerTime() - INTERPOLATION_DELAY;
        
        // Encontrar estados para interpolar
        let i = 0;
        while (i < buffer.length - 1 && buffer[i + 1].timestamp <= renderTime) {
            i++;
        }
        
        // Si no hay suficientes estados, salir
        if (i >= buffer.length - 1) return;
        
        const state0 = buffer[i];
        const state1 = buffer[i + 1];
        
        // Calcular factor de interpolación
        const t0 = state0.timestamp;
        const t1 = state1.timestamp;
        const alpha = (renderTime - t0) / (t1 - t0);
        
        // Interpolar posición
        player.position.lerpVectors(
            new THREE.Vector3(state0.position.x, state0.position.y, state0.position.z),
            new THREE.Vector3(state1.position.x, state1.position.y, state1.position.z),
            alpha
        );
        
        // Interpolar rotación
        player.rotation.y = this.lerpAngle(state0.rotation.y, state1.rotation.y, alpha);
        
        // Actualizar modelo
        player.updateModel();
        
        // Limpiar estados antiguos
        while (buffer.length > 0 && buffer[0].timestamp < renderTime - 1000) {
            buffer.shift();
        }
    }
    
    // Interpolar ángulo (teniendo en cuenta el cruce de 0 a 2π)
    lerpAngle(a, b, t) {
        const PI2 = Math.PI * 2;
        const da = (b - a) % PI2;
        const shortestAngle = 2 * da % PI2 - da;
        return a + shortestAngle * t;
    }
    
    // Sincronizar con el servidor
    syncWithServer() {
        if (!this.gameManager.player) return;
        
        // Enviar estado actual
        this.send('player_state', {
            position: {
                x: this.gameManager.player.position.x,
                y: this.gameManager.player.position.y,
                z: this.gameManager.player.position.z
            },
            rotation: {
                y: this.gameManager.player.model.rotation.y
            },
            health: this.gameManager.player.health,
            stamina: this.gameManager.player.stamina,
            lastProcessedInput: this.gameManager.inputSequence - 1
        });
    }
}

// Clase para representar jugadores remotos
class RemotePlayer {
    constructor(scene, id, position) {
        this.scene = scene;
        this.id = id;
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.health = 100;
        
        // Crear modelo
        this.createModel();
        
        // Crear etiqueta de nombre
        this.createNameTag();
    }
    
    createModel() {
        // Grupo para contener el modelo
        this.model = new THREE.Group();
        
        // Cuerpo (cápsula)
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x0088ff, // Azul para jugadores remotos
            roughness: 0.7,
            metalness: 0.3
        });
        
        this.body = new THREE.Mesh(geometry, material);
        this.body.castShadow = true;
        this.model.add(this.body);
        
        // Posicionar modelo
        this.model.position.copy(this.position);
        this.scene.add(this.model);
    }
    
    createNameTag() {
        // Crear canvas para el nombre
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        // Dibujar fondo
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar texto
        context.font = 'bold 24px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`Jugador ${this.id}`, canvas.width / 2, canvas.height / 2);
        
        // Crear textura
        const texture = new THREE.CanvasTexture(canvas);
        
        // Crear sprite
        const material = new THREE.SpriteMaterial({ map: texture });
        this.nameTag = new THREE.Sprite(material);
        this.nameTag.scale.set(2, 0.5, 1);
        this.nameTag.position.y = 2.5;
        
        this.model.add(this.nameTag);
    }
    
    updateModel() {
        // Actualizar posición del modelo
        this.model.position.copy(this.position);
    }
    
    remove() {
        // Eliminar modelo de la escena
        this.scene.remove(this.model);
    }
}

// Clase para el sistema de chat
class ChatSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.messages = [];
        this.maxMessages = 10;
        this.visible = false;
        
        // Crear elementos de UI
        this.createUI();
    }
    
    createUI() {
        // Contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'chatContainer';
        this.container.style.position = 'absolute';
        this.container.style.bottom = '20px';
        this.container.style.right = '20px';
        this.container.style.width = '300px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.container.style.borderRadius = '5px';
        this.container.style.padding = '10px';
        this.container.style.display = 'none';
        document.body.appendChild(this.container);
        
        // Área de mensajes
        this.messagesArea = document.createElement('div');
        this.messagesArea.id = 'chatMessages';
        this.messagesArea.style.height = '150px';
        this.messagesArea.style.overflowY = 'auto';
        this.messagesArea.style.marginBottom = '10px';
        this.messagesArea.style.color = 'white';
        this.container.appendChild(this.messagesArea);
        
        // Campo de entrada
        this.inputField = document.createElement('input');
        this.inputField.type = 'text';
        this.inputField.id = 'chatInput';
        this.inputField.placeholder = 'Escribe un mensaje...';
        this.inputField.style.width = '100%';
        this.inputField.style.padding = '5px';
        this.inputField.style.boxSizing = 'border-box';
        this.inputField.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        this.inputField.style.border = 'none';
        this.inputField.style.borderRadius = '3px';
        this.container.appendChild(this.inputField);
        
        // Eventos
        this.inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
                event.preventDefault();
            } else if (event.key === 'Escape') {
                this.toggle();
                event.preventDefault();
            }
        });
        
        // Tecla T para abrir chat
        document.addEventListener('keydown', (event) => {
            if (event.key === 't' && !this.visible && 
                this.gameManager.gameState === 'playing') {
                this.toggle();
                event.preventDefault();
            }
        });
    }
    
    toggle() {
        this.visible = !this.visible;
        this.container.style.display = this.visible ? 'block' : 'none';
        
        if (this.visible) {
            this.inputField.focus();
        } else {
            this.inputField.blur();
        }
    }
    
    sendMessage() {
        const message = this.inputField.value.trim();
        if (message) {
            // Enviar mensaje a través del gestor de red
            this.gameManager.networkManager.sendChatMessage(message);
            
            // Limpiar campo
            this.inputField.value = '';
        }
        
        // Cerrar chat
        this.toggle();
    }
    
    addMessage(sender, message, isSystem = false) {
        // Crear elemento de mensaje
        const messageElement = document.createElement('div');
        messageElement.style.marginBottom = '5px';
        messageElement.style.wordWrap = 'break-word';
        
        if (isSystem) {
            messageElement.style.color = '#ffff00';
            messageElement.textContent = message;
        } else {
            const senderSpan = document.createElement('span');
            senderSpan.style.fontWeight = 'bold';
            senderSpan.style.color = sender === this.gameManager.networkManager.playerId ? 
                '#00ff00' : '#00ffff';
            senderSpan.textContent = `Jugador ${sender}: `;
            
            const messageSpan = document.createElement('span');
            messageSpan.textContent = message;
            
            messageElement.appendChild(senderSpan);
            messageElement.appendChild(messageSpan);
        }
        
        // Añadir a la lista
        this.messagesArea.appendChild(messageElement);
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
        
        // Limitar número de mensajes
        while (this.messagesArea.childNodes.length > this.maxMessages) {
            this.messagesArea.removeChild(this.messagesArea.firstChild);
        }
        
        // Guardar mensaje
        this.messages.push({
            sender,
            message,
            isSystem,
            timestamp: Date.now()
        });
        
        // Limitar número de mensajes guardados
        if (this.messages.length > this.maxMessages * 2) {
            this.messages.shift();
        }
    }
}

// Clase para el sistema de lobby
class LobbySystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.visible = false;
        this.rooms = [];
        this.selectedRoom = null;
        
        // Crear elementos de UI
        this.createUI();
    }
    
    createUI() {
        // Contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'lobbyContainer';
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.width = '600px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.borderRadius = '10px';
        this.container.style.padding = '20px';
        this.container.style.color = 'white';
        this.container.style.display = 'none';
        this.container.style.zIndex = '1000';
        document.body.appendChild(this.container);
        
        // Título
        const title = document.createElement('h2');
        title.textContent = 'Lobby - La Hucha de Paredes';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        this.container.appendChild(title);
        
        // Contenedor de salas
        const roomsContainer = document.createElement('div');
        roomsContainer.style.display = 'flex';
        roomsContainer.style.marginBottom = '20px';
        this.container.appendChild(roomsContainer);
        
        // Lista de salas
        const roomsList = document.createElement('div');
        roomsList.id = 'roomsList';
        roomsList.style.flex = '1';
        roomsList.style.marginRight = '20px';
        roomsList.style.height = '300px';
        roomsList.style.overflowY = 'auto';
        roomsList.style.border = '1px solid #444';
        roomsList.style.borderRadius = '5px';
        roomsList.style.padding = '10px';
        roomsContainer.appendChild(roomsList);
        this.roomsList = roomsList;
        
        // Detalles de sala
        const roomDetails = document.createElement('div');
        roomDetails.id = 'roomDetails';
        roomDetails.style.flex = '1';
        roomDetails.style.height = '300px';
        roomDetails.style.border = '1px solid #444';
        roomDetails.style.borderRadius = '5px';
        roomDetails.style.padding = '10px';
        roomsContainer.appendChild(roomDetails);
        this.roomDetails = roomDetails;
        
        // Botones
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'space-between';
        this.container.appendChild(buttonsContainer);
        
        // Botón crear sala
        const createButton = document.createElement('button');
        createButton.textContent = 'Crear Sala';
        createButton.style.padding = '10px 20px';
        createButton.style.backgroundColor = '#4CAF50';
        createButton.style.color = 'white';
        createButton.style.border = 'none';
        createButton.style.borderRadius = '5px';
        createButton.style.cursor = 'pointer';
        createButton.addEventListener('click', () => {
            this.createRoom();
        });
        buttonsContainer.appendChild(createButton);
        
        // Botón unirse
        const joinButton = document.createElement('button');
        joinButton.textContent = 'Unirse';
        joinButton.style.padding = '10px 20px';
        joinButton.style.backgroundColor = '#2196F3';
        joinButton.style.color = 'white';
        joinButton.style.border = 'none';
        joinButton.style.borderRadius = '5px';
        joinButton.style.cursor = 'pointer';
        joinButton.addEventListener('click', () => {
            if (this.selectedRoom) {
                this.joinRoom(this.selectedRoom.id);
            }
        });
        buttonsContainer.appendChild(joinButton);
        this.joinButton = joinButton;
        
        // Botón actualizar
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Actualizar';
        refreshButton.style.padding = '10px 20px';
        refreshButton.style.backgroundColor = '#FF9800';
        refreshButton.style.color = 'white';
        refreshButton.style.border = 'none';
        refreshButton.style.borderRadius = '5px';
        refreshButton.style.cursor = 'pointer';
        refreshButton.addEventListener('click', () => {
            this.refreshRooms();
        });
        buttonsContainer.appendChild(refreshButton);
        
        // Botón volver
        const backButton = document.createElement('button');
        backButton.textContent = 'Volver';
        backButton.style.padding = '10px 20px';
        backButton.style.backgroundColor = '#f44336';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.addEventListener('click', () => {
            this.hide();
        });
        buttonsContainer.appendChild(backButton);
    }
    
    show() {
        this.visible = true;
        this.container.style.display = 'block';
        this.refreshRooms();
    }
    
    hide() {
        this.visible = false;
        this.container.style.display = 'none';
        this.gameManager.showMainMenu();
    }
    
    refreshRooms() {
        // Solicitar lista de salas al servidor
        this.gameManager.networkManager.send('get_rooms', {});
        
        // Mientras tanto, mostrar mensaje de carga
        this.roomsList.innerHTML = '<div style="text-align: center; padding: 20px;">Cargando salas...</div>';
    }
    
    updateRooms(rooms) {
        this.rooms = rooms;
        this.roomsList.innerHTML = '';
        
        if (rooms.length === 0) {
            this.roomsList.innerHTML = '<div style="text-align: center; padding: 20px;">No hay salas disponibles</div>';
            return;
        }
        
        for (const room of rooms) {
            const roomElement = document.createElement('div');
            roomElement.className = 'room-item';
            roomElement.style.padding = '10px';
            roomElement.style.marginBottom = '5px';
            roomElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            roomElement.style.borderRadius = '5px';
            roomElement.style.cursor = 'pointer';
            
            roomElement.innerHTML = `
                <div style="font-weight: bold;">${room.name}</div>
                <div>Jugadores: ${room.players.length}/${room.maxPlayers}</div>
            `;
            
            roomElement.addEventListener('click', () => {
                this.selectRoom(room);
                
                // Resaltar sala seleccionada
                const items = this.roomsList.querySelectorAll('.room-item');
                items.forEach(item => {
                    item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                });
                roomElement.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            });
            
            this.roomsList.appendChild(roomElement);
        }
    }
    
    selectRoom(room) {
        this.selectedRoom = room;
        
        // Actualizar detalles
        this.roomDetails.innerHTML = `
            <h3>${room.name}</h3>
            <p>Creada por: Jugador ${room.creator}</p>
            <p>Jugadores: ${room.players.length}/${room.maxPlayers}</p>
            <p>Estado: ${room.inProgress ? 'En progreso' : 'En espera'}</p>
            <h4>Jugadores:</h4>
            <ul>
                ${room.players.map(player => `<li>Jugador ${player.id}</li>`).join('')}
            </ul>
        `;
        
        // Habilitar/deshabilitar botón unirse
        this.joinButton.disabled = room.inProgress || room.players.length >= room.maxPlayers;
        this.joinButton.style.opacity = this.joinButton.disabled ? '0.5' : '1';
    }
    
    createRoom() {
        // Mostrar diálogo para crear sala
        const roomName = prompt('Nombre de la sala:', `Sala de Jugador ${this.gameManager.networkManager.playerId}`);
        
        if (roomName) {
            this.gameManager.networkManager.send('create_room', {
                name: roomName,
                maxPlayers: 4
            });
        }
    }
    
    joinRoom(roomId) {
        this.gameManager.networkManager.send('join_room', {
            roomId: roomId
        });
    }
    
    handleRoomJoined(roomData) {
        this.hide();
        this.gameManager.handleRoomJoined(roomData);
    }
}

// Extensión del GameManager para multijugador
class MultiplayerGameManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.networkManager = new NetworkManager(this);
        this.chatSystem = new ChatSystem(this);
        this.lobbySystem = new LobbySystem(this);
        this.inputSequence = 0;
        this.roomData = null;
        
        // Añadir botón multijugador al menú principal
        this.addMultiplayerButton();
    }
    
    addMultiplayerButton() {
        const mainMenu = document.getElementById('mainMenu');
        if (!mainMenu) return;
        
        // Botón multijugador
        const multiplayerButton = document.createElement('button');
        multiplayerButton.textContent = 'Modo Multijugador';
        multiplayerButton.style.padding = '10px 20px';
        multiplayerButton.style.fontSize = '18px';
        multiplayerButton.style.backgroundColor = '#2196F3';
        multiplayerButton.style.color = 'white';
        multiplayerButton.style.border = 'none';
        multiplayerButton.style.borderRadius = '5px';
        multiplayerButton.style.cursor = 'pointer';
        multiplayerButton.style.marginBottom = '10px';
        multiplayerButton.style.display = 'block';
        multiplayerButton.style.width = '100%';
        multiplayerButton.addEventListener('click', () => {
            this.startMultiplayer();
        });
        
        // Insertar después del botón de inicio
        const startButton = mainMenu.querySelector('button');
        if (startButton) {
            mainMenu.insertBefore(multiplayerButton, startButton.nextSibling);
        } else {
            mainMenu.appendChild(multiplayerButton);
        }
    }
    
    startMultiplayer() {
        // Conectar al servidor
        this.connectToServer();
        
        // Mostrar lobby
        this.lobbySystem.show();
    }
    
    connectToServer() {
        // URL del servidor WebSocket
        const serverUrl = 'wss://game-server.example.com/ws';
        
        // En desarrollo, usar servidor local
        const localServerUrl = 'ws://localhost:8080';
        
        // Intentar conectar
        try {
            this.networkManager.connect(localServerUrl);
        } catch (error) {
            console.error('Error al conectar al servidor:', error);
            alert('No se pudo conectar al servidor. Intente de nuevo más tarde.');
        }
    }
    
    // Métodos para manejar eventos de red
    
    setLocalPlayerId(playerId) {
        this.localPlayerId = playerId;
    }
    
    handleConnected() {
        // Mostrar mensaje de conexión exitosa
        this.chatSystem.addMessage(null, 'Conectado al servidor', true);
    }
    
    handleDisconnect() {
        // Mostrar mensaje de desconexión
        this.chatSystem.addMessage(null, 'Desconectado del servidor', true);
        
        // Volver al menú principal
        this.gameManager.gameState = 'menu';
        document.getElementById('mainMenu').style.display = 'block';
        
        // Ocultar lobby si está visible
        if (this.lobbySystem.visible) {
            this.lobbySystem.hide();
        }
    }
    
    handleNetworkError(error) {
        console.error('Error de red:', error);
        this.chatSystem.addMessage(null, `Error: ${error.message || 'Error de conexión'}`, true);
    }
    
    handlePlayerJoined(player) {
        // Mostrar mensaje de nuevo jugador
        this.chatSystem.addMessage(null, `Jugador ${player.id} se ha unido`, true);
    }
    
    handlePlayerLeft(playerId) {
        // Mostrar mensaje de jugador desconectado
        this.chatSystem.addMessage(null, `Jugador ${playerId} se ha desconectado`, true);
    }
    
    handleChatMessage(data) {
        // Añadir mensaje al chat
        this.chatSystem.addMessage(data.senderId, data.message);
    }
    
    handleRoomJoined(roomData) {
        this.roomData = roomData;
        
        // Mostrar mensaje
        this.chatSystem.addMessage(null, `Te has unido a la sala: ${roomData.name}`, true);
        
        // Si la partida ya está en progreso, iniciar juego
        if (roomData.inProgress) {
            this.startMultiplayerGame();
        } else {
            // Mostrar sala de espera
            this.showWaitingRoom(roomData);
        }
    }
    
    showWaitingRoom(roomData) {
        // Ocultar menú principal
        document.getElementById('mainMenu').style.display = 'none';
        
        // Crear sala de espera
        const waitingRoom = document.createElement('div');
        waitingRoom.id = 'waitingRoom';
        waitingRoom.style.position = 'absolute';
        waitingRoom.style.top = '50%';
        waitingRoom.style.left = '50%';
        waitingRoom.style.transform = 'translate(-50%, -50%)';
        waitingRoom.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        waitingRoom.style.padding = '20px';
        waitingRoom.style.borderRadius = '10px';
        waitingRoom.style.color = 'white';
        waitingRoom.style.textAlign = 'center';
        waitingRoom.style.zIndex = '1000';
        
        waitingRoom.innerHTML = `
            <h2>${roomData.name}</h2>
            <p>Esperando jugadores...</p>
            <div id="playersList"></div>
            <button id="startGameButton" style="
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                display: ${roomData.creator === this.localPlayerId ? 'block' : 'none'};
            ">Iniciar Juego</button>
            <button id="leaveRoomButton" style="
                padding: 10px 20px;
                margin-top: 10px;
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Salir</button>
        `;
        
        document.body.appendChild(waitingRoom);
        
        // Actualizar lista de jugadores
        this.updatePlayersList(roomData.players);
        
        // Eventos de botones
        document.getElementById('startGameButton').addEventListener('click', () => {
            this.networkManager.send('start_game', {
                roomId: roomData.id
            });
        });
        
        document.getElementById('leaveRoomButton').addEventListener('click', () => {
            this.networkManager.send('leave_room', {
                roomId: roomData.id
            });
            document.body.removeChild(waitingRoom);
            this.lobbySystem.show();
        });
    }
    
    updatePlayersList(players) {
        const playersList = document.getElementById('playersList');
        if (!playersList) return;
        
        playersList.innerHTML = '';
        
        for (const player of players) {
            const playerItem = document.createElement('div');
            playerItem.style.padding = '5px';
            playerItem.style.margin = '5px 0';
            playerItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            playerItem.style.borderRadius = '5px';
            
            playerItem.innerHTML = `
                <span style="font-weight: bold;">Jugador ${player.id}</span>
                ${player.id === this.localPlayerId ? ' (Tú)' : ''}
                ${player.id === this.roomData.creator ? ' (Anfitrión)' : ''}
            `;
            
            playersList.appendChild(playerItem);
        }
    }
    
    startMultiplayerGame() {
        // Ocultar sala de espera si existe
        const waitingRoom = document.getElementById('waitingRoom');
        if (waitingRoom) {
            document.body.removeChild(waitingRoom);
        }
        
        // Iniciar juego
        this.gameManager.startGame();
        
        // Mostrar chat
        this.chatSystem.container.style.display = 'block';
        
        // Enviar mensaje de inicio
        this.chatSystem.addMessage(null, 'La partida ha comenzado', true);
    }
    
    updateEnemiesState(enemiesState) {
        // Actualizar estado de enemigos
        for (const enemyState of enemiesState) {
            const enemy = this.gameManager.enemies.find(e => e.id === enemyState.id);
            
            if (enemy) {
                // Actualizar posición y estado
                enemy.position.set(
                    enemyState.position.x,
                    enemyState.position.y,
                    enemyState.position.z
                );
                
                enemy.state = enemyState.state;
                
                // Actualizar modelo
                enemy.model.position.copy(enemy.position);
                
                // Actualizar rotación si está disponible
                if (enemyState.rotation) {
                    enemy.model.rotation.y = enemyState.rotation.y;
                }
            }
        }
    }
    
    updateGameInfo(gameInfo) {
        // Actualizar información del juego (puntuación, tiempo, etc.)
        if (gameInfo.score !== undefined) {
            this.gameManager.score = gameInfo.score;
            document.getElementById('scoreDisplay').textContent = `Puntuación: ${Math.floor(this.gameManager.score)}`;
        }
    }
    
    // Métodos para integrar con el GameManager original
    
    applyInput(input) {
        // Aplicar input al jugador local
        // Este método simula el procesamiento del servidor para reconciliación
        if (!this.gameManager.player) return;
        
        const player = this.gameManager.player;
        const deltaTime = input.deltaTime || 0.016; // 60fps por defecto
        
        // Movimiento
        if (input.movement) {
            // Calcular dirección de movimiento
            const moveVector = new THREE.Vector3(
                input.movement.x || 0,
                0,
                input.movement.z || 0
            );
            
            if (moveVector.length() > 0) {
                moveVector.normalize();
                
                // Aplicar velocidad
                const speed = input.sprint && player.stamina > 0 ? 
                    player.PLAYER_SPEED * 1.5 : player.PLAYER_SPEED;
                
                player.velocity.x = moveVector.x * speed;
                player.velocity.z = moveVector.z * speed;
            }
        }
        
        // Salto
        if (input.jump && player.onGround) {
            player.velocity.y = player.PLAYER_JUMP_FORCE;
            player.onGround = false;
        }
        
        // Actualizar posición
        player.position.x += player.velocity.x * deltaTime;
        player.position.y += player.velocity.y * deltaTime;
        player.position.z += player.velocity.z * deltaTime;
        
        // Actualizar modelo
        player.model.position.copy(player.position);
    }
    
    showMainMenu() {
        // Mostrar menú principal
        document.getElementById('mainMenu').style.display = 'block';
    }
    
    // Método principal de actualización
    update(deltaTime) {
        // Actualizar gestor de red
        if (this.networkManager && this.networkManager.connected) {
            this.networkManager.update(deltaTime);
        }
        
        // Si estamos en modo multijugador y jugando, enviar inputs
        if (this.gameManager.gameState === 'playing' && 
            this.networkManager && 
            this.networkManager.connected &&
            this.gameManager.player) {
            
            // Recopilar inputs del jugador
            const input = {
                movement: {
                    x: 0,
                    z: 0
                },
                jump: this.gameManager.player.keys.jump,
                sprint: this.gameManager.player.keys.sprint,
                deltaTime: deltaTime
            };
            
            // Determinar dirección de movimiento
            if (this.gameManager.player.keys.forward) input.movement.z -= 1;
            if (this.gameManager.player.keys.backward) input.movement.z += 1;
            if (this.gameManager.player.keys.left) input.movement.x -= 1;
            if (this.gameManager.player.keys.right) input.movement.x += 1;
            
            // Enviar input si hay movimiento o acciones
            if (input.movement.x !== 0 || input.movement.z !== 0 || 
                input.jump || input.sprint) {
                
                // Aplicar predicción local
                this.gameManager.player.processMovement(deltaTime);
                
                // Enviar al servidor
                this.networkManager.sendInput(input);
            }
        }
    }
}

// Función para inicializar la funcionalidad multijugador
function initMultiplayer(gameManager) {
    return new MultiplayerGameManager(gameManager);
}
