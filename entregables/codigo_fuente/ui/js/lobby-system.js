/**
 * Sistema de Lobby para "La Hucha de Paredes"
 * Gestiona la creación y unión a partidas, así como la comunicación entre jugadores
 */

class LobbySystem {
    constructor() {
        // Referencias a elementos del DOM
        this.gameList = document.getElementById('game-items');
        this.playerList = document.getElementById('player-list');
        
        // Estado del lobby
        this.games = [];
        this.currentGame = null;
        this.players = [];
        this.isHost = false;
        this.playerId = this.generatePlayerId();
        this.playerName = `Jugador_${Math.floor(Math.random() * 1000)}`;
        this.playerAvatar = this.getDefaultAvatar();
        
        // Configuración de WebSocket
        this.socket = null;
        this.isConnected = false;
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicializa el sistema de lobby
     */
    init() {
        // Simular conexión al servidor
        this.connectToServer();
        
        // Generar partidas de ejemplo para demostración
        this.generateDemoGames();
        
        // Configurar eventos de actualización periódica
        setInterval(() => this.refreshGameList(), 5000);
    }
    
    /**
     * Conecta con el servidor de lobby
     */
    connectToServer() {
        // En una implementación real, aquí se establecería la conexión WebSocket
        console.log('Conectando al servidor de lobby...');
        
        // Simular conexión exitosa
        setTimeout(() => {
            this.isConnected = true;
            console.log('Conectado al servidor de lobby');
            
            // Notificar al usuario
            if (window.uiManager) {
                window.uiManager.addChatMessage('Sistema', 'Conectado al servidor de lobby', true);
            }
        }, 1000);
    }
    
    /**
     * Genera un ID único para el jugador
     * @returns {string} ID del jugador
     */
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Obtiene la configuración de avatar por defecto
     * @returns {Object} Configuración del avatar
     */
    getDefaultAvatar() {
        return {
            skinColor: '#FFD8B4',
            hairColor: '#090806',
            hairStyle: 0,
            eyeColor: '#634E34',
            outfitStyle: 0,
            outfitColor: '#1F1F1F'
        };
    }
    
    /**
     * Genera partidas de ejemplo para demostración
     */
    generateDemoGames() {
        this.games = [
            {
                id: 'game_1',
                name: 'Manicomio Abandonado',
                host: 'Anfitrión1',
                players: ['Anfitrión1', 'Jugador2', 'Jugador3'],
                maxPlayers: 4,
                mode: 'survival',
                status: 'waiting',
                privacy: 'public',
                password: ''
            },
            {
                id: 'game_2',
                name: 'Pesadilla Nocturna',
                host: 'Anfitrión2',
                players: ['Anfitrión2'],
                maxPlayers: 6,
                mode: 'team',
                status: 'waiting',
                privacy: 'public',
                password: ''
            },
            {
                id: 'game_3',
                name: 'Hucha Infernal',
                host: 'Anfitrión3',
                players: ['Anfitrión3', 'Jugador4', 'Jugador5', 'Jugador6'],
                maxPlayers: 4,
                mode: 'versus',
                status: 'in_progress',
                privacy: 'private',
                password: '1234'
            }
        ];
    }
    
    /**
     * Actualiza la lista de partidas disponibles
     */
    refreshGameList() {
        // Limpiar lista actual
        this.gameList.innerHTML = '';
        
        // Filtrar partidas en progreso si no estamos en modo desarrollo
        const availableGames = this.games.filter(game => game.status !== 'in_progress' || game.id === 'game_3');
        
        if (availableGames.length === 0) {
            const noGamesMessage = document.createElement('div');
            noGamesMessage.className = 'game-item';
            noGamesMessage.innerHTML = '<p>No hay partidas disponibles. ¡Crea una nueva!</p>';
            this.gameList.appendChild(noGamesMessage);
            return;
        }
        
        // Añadir cada partida a la lista
        availableGames.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';
            gameItem.innerHTML = `
                <h3>${game.name}</h3>
                <p>Modo: ${this.getGameModeName(game.mode)}</p>
                <p class="players">Jugadores: ${game.players.length}/${game.maxPlayers}</p>
                <p class="status ${game.status === 'waiting' ? 'waiting' : ''}">${this.getStatusName(game.status)}</p>
                ${game.privacy === 'private' ? '<p><i>Privada</i></p>' : ''}
            `;
            
            // Añadir evento de clic para unirse a la partida
            gameItem.addEventListener('click', () => {
                if (game.privacy === 'private' && !this.isInGame(game.id)) {
                    this.promptForPassword(game);
                } else {
                    this.joinGame(game.id);
                }
            });
            
            this.gameList.appendChild(gameItem);
        });
    }
    
    /**
     * Obtiene el nombre del modo de juego
     * @param {string} mode - Identificador del modo de juego
     * @returns {string} Nombre del modo de juego
     */
    getGameModeName(mode) {
        switch (mode) {
            case 'survival': return 'Supervivencia';
            case 'team': return 'Equipos';
            case 'versus': return 'Todos contra Todos';
            default: return 'Desconocido';
        }
    }
    
    /**
     * Obtiene el nombre del estado de la partida
     * @param {string} status - Identificador del estado
     * @returns {string} Nombre del estado
     */
    getStatusName(status) {
        switch (status) {
            case 'waiting': return 'Esperando jugadores';
            case 'in_progress': return 'En progreso';
            default: return 'Desconocido';
        }
    }
    
    /**
     * Comprueba si el jugador ya está en una partida
     * @param {string} gameId - ID de la partida
     * @returns {boolean} Verdadero si el jugador está en la partida
     */
    isInGame(gameId) {
        return this.currentGame && this.currentGame.id === gameId;
    }
    
    /**
     * Solicita contraseña para unirse a una partida privada
     * @param {Object} game - Datos de la partida
     */
    promptForPassword(game) {
        const password = prompt(`La partida "${game.name}" es privada. Introduce la contraseña:`);
        
        if (password === null) {
            return; // Cancelado
        }
        
        if (password === game.password) {
            this.joinGame(game.id);
        } else {
            alert('Contraseña incorrecta');
        }
    }
    
    /**
     * Une al jugador a una partida
     * @param {string} gameId - ID de la partida
     */
    joinGame(gameId) {
        // Buscar la partida
        const game = this.games.find(g => g.id === gameId);
        
        if (!game) {
            alert('La partida no existe');
            return;
        }
        
        if (game.players.length >= game.maxPlayers && !this.isInGame(gameId)) {
            alert('La partida está llena');
            return;
        }
        
        if (game.status === 'in_progress' && !this.isInGame(gameId)) {
            alert('La partida ya ha comenzado');
            return;
        }
        
        // Establecer partida actual
        this.currentGame = game;
        
        // Si no estamos ya en la partida, añadir al jugador
        if (!this.isInGame(gameId)) {
            game.players.push(this.playerName);
        }
        
        // Determinar si somos el anfitrión
        this.isHost = game.host === this.playerName;
        
        // Actualizar lista de jugadores
        this.refreshPlayerList();
        
        // Notificar al sistema
        if (window.uiManager) {
            window.uiManager.addChatMessage('Sistema', `Te has unido a la partida "${game.name}"`, true);
        }
    }
    
    /**
     * Crea una nueva partida
     * @param {string} name - Nombre de la partida
     * @param {number} maxPlayers - Número máximo de jugadores
     * @param {string} mode - Modo de juego
     * @param {string} privacy - Privacidad de la partida
     * @param {string} password - Contraseña (si es privada)
     */
    createGame(name, maxPlayers, mode, privacy, password) {
        // Crear nueva partida
        const gameId = 'game_' + Math.random().toString(36).substr(2, 9);
        
        const newGame = {
            id: gameId,
            name: name,
            host: this.playerName,
            players: [this.playerName],
            maxPlayers: parseInt(maxPlayers),
            mode: mode,
            status: 'waiting',
            privacy: privacy,
            password: password
        };
        
        // Añadir a la lista de partidas
        this.games.push(newGame);
        
        // Establecer como partida actual
        this.currentGame = newGame;
        this.isHost = true;
        
        // Actualizar interfaz
        this.refreshGameList();
        this.refreshPlayerList();
        
        // Notificar al sistema
        if (window.uiManager) {
            window.uiManager.addChatMessage('Sistema', `Has creado la partida "${name}"`, true);
        }
    }
    
    /**
     * Actualiza la lista de jugadores en la partida actual
     */
    refreshPlayerList() {
        // Limpiar lista actual
        this.playerList.innerHTML = '';
        
        if (!this.currentGame) {
            return;
        }
        
        // Generar lista de jugadores simulados
        this.players = this.currentGame.players.map((playerName, index) => {
            return {
                id: `player_${index}`,
                name: playerName,
                isReady: Math.random() > 0.5, // Aleatorio para demostración
                isHost: playerName === this.currentGame.host,
                avatar: this.getRandomAvatar()
            };
        });
        
        // Asegurarse de que nuestro jugador esté en la lista con el estado correcto
        const ourPlayerIndex = this.players.findIndex(p => p.name === this.playerName);
        if (ourPlayerIndex >= 0) {
            this.players[ourPlayerIndex].isReady = window.uiManager ? window.uiManager.isPlayerReady : false;
        }
        
        // Añadir cada jugador a la lista
        this.players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            
            // Iniciales para el avatar
            const initials = player.name.substring(0, 2).toUpperCase();
            
            playerItem.innerHTML = `
                <div class="player-avatar" style="background-color: ${this.getAvatarColor(player.name)}">${initials}</div>
                <div class="player-info">
                    <div class="player-name">${player.name} ${player.isHost ? '<span class="host-badge">Anfitrión</span>' : ''}</div>
                    <div class="player-status ${player.isReady ? '' : 'not-ready'}">${player.isReady ? 'Listo' : 'No listo'}</div>
                </div>
            `;
            
            this.playerList.appendChild(playerItem);
        });
        
        // Actualizar botones según si somos anfitrión
        if (this.isHost) {
            // Añadir botón de iniciar partida si todos están listos
            const allReady = this.players.every(p => p.isReady || p.isHost);
            
            if (allReady && this.players.length >= 2) {
                const startButton = document.createElement('button');
                startButton.textContent = 'Iniciar Partida';
                startButton.className = 'accent';
                startButton.style.width = '100%';
                startButton.style.marginBottom = '15px';
                
                startButton.addEventListener('click', () => this.startGame());
                
                this.playerList.insertBefore(startButton, this.playerList.firstChild);
            }
        }
    }
    
    /**
     * Obtiene un color para el avatar basado en el nombre del jugador
     * @param {string} name - Nombre del jugador
     * @returns {string} Color en formato hexadecimal
     */
    getAvatarColor(name) {
        // Generar color basado en el nombre
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#E57373', '#F06292', '#BA68C8', '#9575CD', 
            '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1', 
            '#4DB6AC', '#81C784', '#AED581', '#DCE775', 
            '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    /**
     * Obtiene una configuración de avatar aleatoria
     * @returns {Object} Configuración del avatar
     */
    getRandomAvatar() {
        const skinColors = ['#FFD8B4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C3836'];
        const hairColors = ['#090806', '#71635A', '#B7A69E', '#D6C4C2', '#F4D7A7', '#A8503C'];
        const eyeColors = ['#634E34', '#2C5784', '#366A6A', '#704241', '#1F1F1F', '#497665'];
        const outfitColors = ['#1F1F1F', '#7D4D4D', '#4D7D4D', '#4D4D7D', '#7D4D7D', '#7D7D4D'];
        
        return {
            skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
            hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
            hairStyle: Math.floor(Math.random() * 6),
            eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
            outfitStyle: Math.floor(Math.random() * 6),
            outfitColor: outfitColors[Math.floor(Math.random() * outfitColors.length)]
        };
    }
    
    /**
     * Establece el estado de "listo" del jugador
     * @param {boolean} isReady - Estado de "listo"
     */
    setPlayerReady(isReady) {
        // Actualizar estado
        if (this.currentGame) {
            // Buscar nuestro jugador
            const ourPlayerIndex = this.players.findIndex(p => p.name === this.playerName);
            
            if (ourPlayerIndex >= 0) {
                this.players[ourPlayerIndex].isReady = isReady;
            }
            
            // En una implementación real, enviaríamos este estado al servidor
            console.log(`Jugador ${this.playerName} ${isReady ? 'listo' : 'no listo'}`);
            
            // Actualizar lista de jugadores
            this.refreshPlayerList();
        }
    }
    
    /**
     * Inicia la partida actual
     */
    startGame() {
        if (!this.currentGame) {
            return;
        }
        
        // Comprobar si somos el anfitrión
        if (!this.isHost) {
            alert('Solo el anfitrión puede iniciar la partida');
            return;
        }
        
        // Comprobar si hay suficientes jugadores
        if (this.players.length < 2) {
            alert('Se necesitan al menos 2 jugadores para iniciar la partida');
            return;
        }
        
        // Comprobar si todos los jugadores están listos
        const allReady = this.players.every(p => p.isReady || p.isHost);
        
        if (!allReady) {
            alert('No todos los jugadores están listos');
            return;
        }
        
        // Actualizar estado de la partida
        this.currentGame.status = 'in_progress';
        
        // Notificar al sistema
        if (window.uiManager) {
            window.uiManager.addChatMessage('Sistema', 'La partida ha comenzado', true);
            window.uiManager.startGame();
        }
    }
    
    /**
     * Envía un mensaje de chat
     * @param {string} message - Contenido del mensaje
     */
    sendChatMessage(message) {
        if (!this.isConnected) {
            alert('No estás conectado al servidor');
            return;
        }
        
        // En una implementación real, enviaríamos el mensaje al servidor
        console.log(`Mensaje de ${this.playerName}: ${message}`);
        
        // Añadir mensaje al chat local
        if (window.uiManager) {
            window.uiManager.addChatMessage(this.playerName, message);
        }
        
        // Simular respuestas de otros jugadores
        if (Math.random() > 0.7) {
            setTimeout(() => {
                const otherPlayers = this.players.filter(p => p.name !== this.playerName);
                
                if (otherPlayers.length > 0) {
                    const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                    const responses = [
                        '¡Vamos!',
                        'Tengan cuidado con La Hucha',
                        'Escuché algo por el pasillo',
                        '¿Alguien tiene vendas?',
                        'Necesito ayuda',
                        'Estoy en el ala este',
                        '¡Corran!',
                        'Creo que nos está siguiendo'
                    ];
                    
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    
                    if (window.uiManager) {
                        window.uiManager.addChatMessage(randomPlayer.name, randomResponse);
                    }
                }
            }, Math.random() * 3000 + 1000);
        }
    }
    
    /**
     * Sale de la partida actual
     */
    leaveGame() {
        if (!this.currentGame) {
            return;
        }
        
        // Eliminar jugador de la partida
        const playerIndex = this.currentGame.players.indexOf(this.playerName);
        
        if (playerIndex >= 0) {
            this.currentGame.players.splice(playerIndex, 1);
        }
        
        // Si éramos el anfitrión, asignar nuevo anfitrión
        if (this.isHost && this.currentGame.players.length > 0) {
            this.currentGame.host = this.currentGame.players[0];
        }
        
        // Si la partida queda vacía, eliminarla
        if (this.currentGame.players.length === 0) {
            const gameIndex = this.games.findIndex(g => g.id === this.currentGame.id);
            
            if (gameIndex >= 0) {
                this.games.splice(gameIndex, 1);
            }
        }
        
        // Limpiar estado
        this.currentGame = null;
        this.isHost = false;
        this.players = [];
        
        // Actualizar interfaz
        this.refreshGameList();
        this.refreshPlayerList();
        
        // Notificar al sistema
        if (window.uiManager) {
            window.uiManager.addChatMessage('Sistema', 'Has abandonado la partida', true);
        }
    }
}

// Crear instancia global
window.lobbySystem = new LobbySystem();
