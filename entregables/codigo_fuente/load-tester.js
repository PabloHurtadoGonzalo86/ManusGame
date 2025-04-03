/**
 * Pruebas de carga para el sistema multijugador de "La Hucha de Paredes"
 * Implementa simulaciones de carga para probar el rendimiento del sistema multijugador
 */

class LoadTester {
    constructor() {
        // Configuración de pruebas
        this.config = {
            // Número de jugadores simulados
            numPlayers: 10,
            
            // Duración de la prueba en segundos
            duration: 60,
            
            // Intervalo de actualización en ms
            updateInterval: 100,
            
            // Probabilidad de eventos (0-1)
            eventProbabilities: {
                movement: 0.8,    // Movimiento de jugador
                action: 0.2,      // Acción de jugador (interacción, ataque)
                chat: 0.05,       // Mensaje de chat
                join: 0.01,       // Unirse a partida
                leave: 0.01       // Abandonar partida
            },
            
            // Latencia simulada (ms)
            simulatedLatency: {
                min: 20,
                max: 200
            },
            
            // Pérdida de paquetes simulada (0-1)
            packetLoss: 0.02,
            
            // Jitter simulado (ms)
            jitter: 10
        };
        
        // Estado de la prueba
        this.isRunning = false;
        this.startTime = 0;
        this.endTime = 0;
        this.simulatedPlayers = [];
        this.updateInterval = null;
        
        // Resultados
        this.results = {
            messagesProcessed: 0,
            messagesDropped: 0,
            averageLatency: 0,
            peakLatency: 0,
            averageServerLoad: 0,
            peakServerLoad: 0,
            averageClientFPS: 0,
            minimumClientFPS: 60,
            errors: []
        };
        
        // Gráficos de resultados
        this.metrics = {
            timestamps: [],
            latency: [],
            serverLoad: [],
            clientFPS: [],
            activeConnections: []
        };
    }
    
    /**
     * Inicia una prueba de carga
     * @param {Object} options - Opciones de configuración (opcional)
     */
    startLoadTest(options = {}) {
        // Aplicar opciones personalizadas
        this.config = { ...this.config, ...options };
        
        console.log(`Iniciando prueba de carga con ${this.config.numPlayers} jugadores simulados...`);
        
        // Reiniciar estado y resultados
        this.isRunning = true;
        this.startTime = performance.now();
        this.endTime = this.startTime + (this.config.duration * 1000);
        this.simulatedPlayers = [];
        this.results = {
            messagesProcessed: 0,
            messagesDropped: 0,
            averageLatency: 0,
            peakLatency: 0,
            averageServerLoad: 0,
            peakServerLoad: 0,
            averageClientFPS: 0,
            minimumClientFPS: 60,
            errors: []
        };
        this.metrics = {
            timestamps: [],
            latency: [],
            serverLoad: [],
            clientFPS: [],
            activeConnections: []
        };
        
        // Crear jugadores simulados
        this.createSimulatedPlayers();
        
        // Iniciar bucle de actualización
        this.updateInterval = setInterval(() => this.update(), this.config.updateInterval);
        
        // Mostrar interfaz de prueba
        this.showTestInterface();
        
        return true;
    }
    
    /**
     * Crea jugadores simulados para la prueba
     */
    createSimulatedPlayers() {
        for (let i = 0; i < this.config.numPlayers; i++) {
            const player = {
                id: `sim_player_${i}`,
                name: `SimPlayer${i}`,
                position: {
                    x: Math.random() * 100 - 50,
                    y: 0,
                    z: Math.random() * 100 - 50
                },
                rotation: Math.random() * Math.PI * 2,
                health: 100,
                isActive: true,
                lastUpdate: performance.now(),
                latency: this.getRandomLatency(),
                connection: {
                    packetsReceived: 0,
                    packetsSent: 0,
                    packetsDropped: 0
                }
            };
            
            this.simulatedPlayers.push(player);
        }
    }
    
    /**
     * Actualiza la simulación
     */
    update() {
        const now = performance.now();
        
        // Comprobar si la prueba ha finalizado
        if (now >= this.endTime) {
            this.stopLoadTest();
            return;
        }
        
        // Actualizar jugadores simulados
        this.updateSimulatedPlayers();
        
        // Simular eventos del servidor
        this.simulateServerEvents();
        
        // Actualizar métricas
        this.updateMetrics();
        
        // Actualizar interfaz
        this.updateTestInterface();
    }
    
    /**
     * Actualiza los jugadores simulados
     */
    updateSimulatedPlayers() {
        this.simulatedPlayers.forEach(player => {
            if (!player.isActive) return;
            
            // Simular eventos de jugador según probabilidades
            if (Math.random() < this.config.eventProbabilities.movement) {
                this.simulatePlayerMovement(player);
            }
            
            if (Math.random() < this.config.eventProbabilities.action) {
                this.simulatePlayerAction(player);
            }
            
            if (Math.random() < this.config.eventProbabilities.chat) {
                this.simulatePlayerChat(player);
            }
            
            // Simular desconexión
            if (Math.random() < this.config.eventProbabilities.leave) {
                player.isActive = false;
                this.simulatePlayerLeave(player);
            }
        });
        
        // Simular nuevas conexiones para reemplazar jugadores inactivos
        const inactivePlayers = this.simulatedPlayers.filter(p => !p.isActive).length;
        
        if (inactivePlayers > 0 && Math.random() < this.config.eventProbabilities.join) {
            const inactivePlayer = this.simulatedPlayers.find(p => !p.isActive);
            
            if (inactivePlayer) {
                inactivePlayer.isActive = true;
                inactivePlayer.health = 100;
                inactivePlayer.position = {
                    x: Math.random() * 100 - 50,
                    y: 0,
                    z: Math.random() * 100 - 50
                };
                inactivePlayer.rotation = Math.random() * Math.PI * 2;
                inactivePlayer.latency = this.getRandomLatency();
                
                this.simulatePlayerJoin(inactivePlayer);
            }
        }
    }
    
    /**
     * Simula el movimiento de un jugador
     * @param {Object} player - Jugador simulado
     */
    simulatePlayerMovement(player) {
        // Generar movimiento aleatorio
        player.position.x += (Math.random() - 0.5) * 0.5;
        player.position.z += (Math.random() - 0.5) * 0.5;
        player.rotation += (Math.random() - 0.5) * 0.2;
        
        // Enviar actualización al servidor (simulado)
        this.sendMessageToServer({
            type: 'player_movement',
            playerId: player.id,
            position: player.position,
            rotation: player.rotation,
            timestamp: performance.now()
        }, player.latency);
    }
    
    /**
     * Simula una acción de un jugador
     * @param {Object} player - Jugador simulado
     */
    simulatePlayerAction(player) {
        // Generar acción aleatoria
        const actionType = Math.random() < 0.5 ? 'interact' : 'attack';
        
        // Enviar actualización al servidor (simulado)
        this.sendMessageToServer({
            type: 'player_action',
            playerId: player.id,
            actionType: actionType,
            position: player.position,
            timestamp: performance.now()
        }, player.latency);
    }
    
    /**
     * Simula un mensaje de chat de un jugador
     * @param {Object} player - Jugador simulado
     */
    simulatePlayerChat(player) {
        const messages = [
            '¡Hola a todos!',
            '¿Alguien ha visto a La Hucha?',
            'Necesito ayuda por aquí',
            'Cuidado, está cerca',
            '¡Corran!',
            'Estoy en el ala este',
            'Tengo poca vida',
            'Síganme',
            '¿Alguien tiene vendas?',
            'Escuché algo por allí'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Enviar mensaje al servidor (simulado)
        this.sendMessageToServer({
            type: 'chat_message',
            playerId: player.id,
            playerName: player.name,
            message: message,
            timestamp: performance.now()
        }, player.latency);
    }
    
    /**
     * Simula la conexión de un jugador
     * @param {Object} player - Jugador simulado
     */
    simulatePlayerJoin(player) {
        // Enviar evento al servidor (simulado)
        this.sendMessageToServer({
            type: 'player_join',
            playerId: player.id,
            playerName: player.name,
            position: player.position,
            timestamp: performance.now()
        }, player.latency);
    }
    
    /**
     * Simula la desconexión de un jugador
     * @param {Object} player - Jugador simulado
     */
    simulatePlayerLeave(player) {
        // Enviar evento al servidor (simulado)
        this.sendMessageToServer({
            type: 'player_leave',
            playerId: player.id,
            timestamp: performance.now()
        }, player.latency);
    }
    
    /**
     * Envía un mensaje al servidor simulado
     * @param {Object} message - Mensaje a enviar
     * @param {number} latency - Latencia simulada
     */
    sendMessageToServer(message, latency) {
        // Simular pérdida de paquetes
        if (Math.random() < this.config.packetLoss) {
            this.results.messagesDropped++;
            return;
        }
        
        // Aplicar jitter a la latencia
        const jitter = (Math.random() - 0.5) * this.config.jitter * 2;
        const totalLatency = Math.max(0, latency + jitter);
        
        // Simular envío con latencia
        setTimeout(() => {
            // Procesar mensaje en el servidor
            this.processServerMessage(message, totalLatency);
        }, totalLatency / 2); // Dividir por 2 porque la latencia total incluye ida y vuelta
        
        // Incrementar contador de mensajes enviados
        const player = this.simulatedPlayers.find(p => p.id === message.playerId);
        if (player) {
            player.connection.packetsSent++;
        }
    }
    
    /**
     * Procesa un mensaje en el servidor simulado
     * @param {Object} message - Mensaje recibido
     * @param {number} latency - Latencia simulada
     */
    processServerMessage(message, latency) {
        // Incrementar contador de mensajes procesados
        this.results.messagesProcessed++;
        
        // Actualizar latencia máxima
        if (latency > this.results.peakLatency) {
            this.results.peakLatency = latency;
        }
        
        // Simular carga del servidor
        const processingTime = Math.random() * 5 + 1; // 1-6ms de tiempo de procesamiento
        
        // Actualizar carga del servidor
        const serverLoad = (processingTime / 16) * 100; // Porcentaje de un frame de 16ms
        if (serverLoad > this.results.peakServerLoad) {
            this.results.peakServerLoad = serverLoad;
        }
        
        // Simular broadcast a otros jugadores
        setTimeout(() => {
            this.broadcastToPlayers(message, latency);
        }, processingTime);
    }
    
    /**
     * Simula el broadcast de un mensaje a todos los jugadores
     * @param {Object} message - Mensaje a enviar
     * @param {number} latency - Latencia simulada
     */
    broadcastToPlayers(message, latency) {
        // Enviar a todos los jugadores activos excepto al remitente
        this.simulatedPlayers.forEach(player => {
            if (!player.isActive || player.id === message.playerId) return;
            
            // Simular pérdida de paquetes
            if (Math.random() < this.config.packetLoss) {
                player.connection.packetsDropped++;
                return;
            }
            
            // Aplicar jitter a la latencia
            const jitter = (Math.random() - 0.5) * this.config.jitter * 2;
            const totalLatency = Math.max(0, player.latency + jitter);
            
            // Simular recepción con latencia
            setTimeout(() => {
                // Procesar mensaje en el cliente
                this.processClientMessage(player, message);
            }, totalLatency / 2);
        });
    }
    
    /**
     * Procesa un mensaje en un cliente simulado
     * @param {Object} player - Jugador que recibe el mensaje
     * @param {Object} message - Mensaje recibido
     */
    processClientMessage(player, message) {
        // Incrementar contador de mensajes recibidos
        player.connection.packetsReceived++;
        
        // Simular procesamiento del cliente
        // En una implementación real, aquí se actualizaría el estado del juego
    }
    
    /**
     * Obtiene una latencia aleatoria según la configuración
     * @returns {number} Latencia en ms
     */
    getRandomLatency() {
        const { min, max } = this.config.simulatedLatency;
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Simula eventos del servidor
     */
    simulateServerEvents() {
        // Simular eventos del enemigo principal
        if (Math.random() < 0.1) {
            // Seleccionar un jugador aleatorio como objetivo
            const activePlayers = this.simulatedPlayers.filter(p => p.isActive);
            
            if (activePlayers.length > 0) {
                const targetPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];
                
                // Simular ataque del enemigo
                if (Math.random() < 0.3) {
                    // Aplicar daño al jugador
                    targetPlayer.health = Math.max(0, targetPlayer.health - Math.floor(Math.random() * 20 + 5));
                    
                    // Enviar evento a todos los jugadores
                    this.simulatedPlayers.forEach(player => {
                        if (!player.isActive) return;
                        
                        this.sendMessageToServer({
                            type: 'enemy_attack',
                            targetId: targetPlayer.id,
                            damage: targetPlayer.health,
                            position: targetPlayer.position,
                            timestamp: performance.now()
                        }, player.latency);
                    });
                }
            }
        }
    }
    
    /**
     * Actualiza las métricas de la prueba
     */
    updateMetrics() {
        const now = performance.now();
        const elapsedSeconds = (now - this.startTime) / 1000;
        
        // Calcular métricas actuales
        const activeConnections = this.simulatedPlayers.filter(p => p.isActive).length;
        const averageLatency = this.simulatedPlayers.reduce((sum, p) => sum + p.latency, 0) / this.simulatedPlayers.length;
        const serverLoad = Math.min(100, (this.results.messagesProcessed / elapsedSeconds) * 0.5);
        const clientFPS = 60 - (serverLoad / 10); // Simulación simplificada
        
        // Actualizar resultados acumulados
        this.results.averageLatency = (this.results.averageLatency * this.metrics.timestamps.length + averageLatency) / 
                                     (this.metrics.timestamps.length + 1);
        this.results.averageServerLoad = (this.results.averageServerLoad * this.metrics.timestamps.length + serverLoad) / 
                                        (this.metrics.timestamps.length + 1);
        this.results.averageClientFPS = (this.results.averageClientFPS * this.metrics.timestamps.length + clientFPS) / 
                                       (this.metrics.timestamps.length + 1);
        
        if (clientFPS < this.results.minimumClientFPS) {
            this.results.minimumClientFPS = clientFPS;
        }
        
        // Guardar métricas para gráficos
        this.metrics.timestamps.push(elapsedSeconds);
        this.metrics.latency.push(averageLatency);
        this.metrics.serverLoad.push(serverLoad);
        this.metrics.clientFPS.push(clientFPS);
        this.metrics.activeConnections.push(activeConnections);
    }
    
    /**
     * Detiene la prueba de carga
     */
    stopLoadTest() {
        if (!this.isRunning) return;
        
        console.log('Finalizando prueba de carga...');
        
        // Detener bucle de actualización
        clearInterval(this.updateInterval);
        this.updateInterval = null;
        
        // Actualizar estado
        this.isRunning = false;
        this.endTime = performance.now();
        
        // Calcular resultados finales
        this.finalizeResults();
        
        // Mostrar resultados
        this.showResults();
        
        return this.results;
    }
    
    /**
     * Finaliza los cálculos de resultados
     */
    finalizeResults() {
        const totalDuration = (this.endTime - this.startTime) / 1000;
        
        // Calcular estadísticas finales
        this.results.messagesPerSecond = this.results.messagesProcessed / totalDuration;
        this.results.packetLossRate = this.results.messagesDropped / 
                                     (this.results.messagesProcessed + this.results.messagesDropped);
        
        console.log('Prueba de carga completada:', this.results);
    }
    
    /**
     * Muestra la interfaz de la prueba
     */
    showTestInterface() {
        // Crear contenedor si no existe
        let testContainer = document.getElementById('load-test-container');
        
        if (!testContainer) {
            testContainer = document.createElement('div');
            testContainer.id = 'load-test-container';
            testContainer.style.position = 'fixed';
            testContainer.style.top = '50px';
            testContainer.style.left = '50%';
            testContainer.style.transform = 'translateX(-50%)';
            testContainer.style.width = '80%';
            testContainer.style.maxWidth = '800px';
            testContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            testContainer.style.color = 'white';
            testContainer.style.padding = '20px';
            testContainer.style.borderRadius = '10px';
            testContainer.style.zIndex = '1000';
            testContainer.style.fontFamily = 'monospace';
            
            // Título
            const title = document.createElement('h2');
            title.textContent = 'Prueba de Carga - La Hucha de Paredes';
            title.style.textAlign = 'center';
            title.style.marginBottom = '20px';
            
            // Contenido
            const content = document.createElement('div');
            content.id = 'load-test-content';
            
            // Botón para detener
            const stopButton = document.createElement('button');
            stopButton.textContent = 'Detener Prueba';
            stopButton.style.display = 'block';
            stopButton.style.margin = '20px auto';
            stopButton.style.padding = '10px 20px';
            stopButton.style.backgroundColor = '#ff3333';
            stopButton.style.color = 'white';
            stopButton.style.border = 'none';
            stopButton.style.borderRadius = '5px';
            stopButton.style.cursor = 'pointer';
            
            stopButton.addEventListener('click', () => {
                this.stopLoadTest();
            });
            
            testContainer.appendChild(title);
            testContainer.appendChild(content);
            testContainer.appendChild(stopButton);
            
            document.body.appendChild(testContainer);
        }
    }
    
    /**
     * Actualiza la interfaz de la prueba
     */
    updateTestInterface() {
        const content = document.getElementById('load-test-content');
        
        if (!content) return;
        
        const elapsedSeconds = Math.floor((performance.now() - this.startTime) / 1000);
        const remainingSeconds = Math.max(0, this.config.duration - elapsedSeconds);
        
        const activeConnections = this.simulatedPlayers.filter(p => p.isActive).length;
        
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div>
                    <strong>Tiempo:</strong> ${elapsedSeconds}s / ${this.config.duration}s
                    <div class="progress-bar" style="height: 10px; background-color: #333; margin-top: 5px; border-radius: 5px;">
                        <div style="height: 100%; width: ${(elapsedSeconds / this.config.duration) * 100}%; background-color: #4CAF50; border-radius: 5px;"></div>
                    </div>
                </div>
                <div>
                    <strong>Restante:</strong> ${remainingSeconds}s
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <strong>Jugadores activos:</strong> ${activeConnections} / ${this.config.numPlayers}
                </div>
                <div>
                    <strong>Mensajes procesados:</strong> ${this.results.messagesProcessed}
                </div>
                <div>
                    <strong>Latencia promedio:</strong> ${this.results.averageLatency.toFixed(2)} ms
                </div>
                <div>
                    <strong>Latencia máxima:</strong> ${this.results.peakLatency.toFixed(2)} ms
                </div>
                <div>
                    <strong>Carga del servidor:</strong> ${this.results.averageServerLoad.toFixed(2)}%
                </div>
                <div>
                    <strong>FPS cliente:</strong> ${this.results.averageClientFPS.toFixed(2)}
                </div>
            </div>
            
            <div>
                <strong>Estado:</strong> <span style="color: #4CAF50;">Ejecutando prueba...</span>
            </div>
        `;
    }
    
    /**
     * Muestra los resultados de la prueba
     */
    showResults() {
        const content = document.getElementById('load-test-content');
        
        if (!content) return;
        
        // Determinar estado general
        let overallStatus = 'Excelente';
        let statusColor = '#4CAF50';
        
        if (this.results.minimumClientFPS < 30 || this.results.peakLatency > 150 || this.results.peakServerLoad > 80) {
            overallStatus = 'Problemas de rendimiento';
            statusColor = '#ff3333';
        } else if (this.results.minimumClientFPS < 50 || this.results.peakLatency > 100 || this.results.peakServerLoad > 60) {
            overallStatus = 'Aceptable';
            statusColor = '#FFC107';
        }
        
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin-bottom: 10px;">Resultados de la Prueba</h3>
                <div style="font-size: 18px; font-weight: bold; color: ${statusColor};">${overallStatus}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <strong>Duración total:</strong> ${((this.endTime - this.startTime) / 1000).toFixed(2)}s
                </div>
                <div>
                    <strong>Jugadores simulados:</strong> ${this.config.numPlayers}
                </div>
                <div>
                    <strong>Mensajes procesados:</strong> ${this.results.messagesProcessed}
                </div>
                <div>
                    <strong>Mensajes por segundo:</strong> ${this.results.messagesPerSecond.toFixed(2)}
                </div>
                <div>
                    <strong>Latencia promedio:</strong> ${this.results.averageLatency.toFixed(2)} ms
                </div>
                <div>
                    <strong>Latencia máxima:</strong> ${this.results.peakLatency.toFixed(2)} ms
                </div>
                <div>
                    <strong>Carga promedio:</strong> ${this.results.averageServerLoad.toFixed(2)}%
                </div>
                <div>
                    <strong>Carga máxima:</strong> ${this.results.peakServerLoad.toFixed(2)}%
                </div>
                <div>
                    <strong>FPS cliente promedio:</strong> ${this.results.averageClientFPS.toFixed(2)}
                </div>
                <div>
                    <strong>FPS cliente mínimo:</strong> ${this.results.minimumClientFPS.toFixed(2)}
                </div>
                <div>
                    <strong>Tasa de pérdida:</strong> ${(this.results.packetLossRate * 100).toFixed(2)}%
                </div>
                <div>
                    <strong>Errores:</strong> ${this.results.errors.length}
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4>Recomendaciones:</h4>
                <ul style="margin-left: 20px;">
                    ${this.getRecommendations().map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button id="new-load-test" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Nueva Prueba</button>
                <button id="close-load-test" style="padding: 10px 20px; background-color: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
            </div>
        `;
        
        // Eventos para botones
        document.getElementById('new-load-test').addEventListener('click', () => {
            // Mostrar opciones para nueva prueba
            this.showConfigDialog();
        });
        
        document.getElementById('close-load-test').addEventListener('click', () => {
            // Cerrar interfaz
            const container = document.getElementById('load-test-container');
            if (container) {
                document.body.removeChild(container);
            }
        });
    }
    
    /**
     * Obtiene recomendaciones basadas en los resultados
     * @returns {Array} Lista de recomendaciones
     */
    getRecommendations() {
        const recommendations = [];
        
        // Analizar resultados y generar recomendaciones
        if (this.results.peakLatency > 150) {
            recommendations.push('Optimizar la red para reducir la latencia máxima.');
        }
        
        if (this.results.packetLossRate > 0.05) {
            recommendations.push('Implementar un sistema más robusto de recuperación de paquetes perdidos.');
        }
        
        if (this.results.peakServerLoad > 80) {
            recommendations.push('Considerar la distribución de carga entre múltiples servidores.');
        }
        
        if (this.results.minimumClientFPS < 30) {
            recommendations.push('Optimizar el renderizado del cliente para mejorar el rendimiento en momentos de alta carga.');
        }
        
        if (this.results.messagesPerSecond > 100 && this.results.peakServerLoad > 60) {
            recommendations.push('Implementar un sistema de priorización de mensajes para reducir la carga del servidor.');
        }
        
        // Si todo está bien, dar recomendaciones generales
        if (recommendations.length === 0) {
            recommendations.push('El sistema muestra un buen rendimiento bajo la carga actual.');
            recommendations.push('Considerar pruebas con mayor número de jugadores para verificar la escalabilidad.');
        }
        
        return recommendations;
    }
    
    /**
     * Muestra un diálogo para configurar una nueva prueba
     */
    showConfigDialog() {
        // Crear diálogo
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = '#222';
        dialog.style.color = 'white';
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '10px';
        dialog.style.zIndex = '2000';
        dialog.style.width = '400px';
        
        dialog.innerHTML = `
            <h3 style="text-align: center; margin-bottom: 20px;">Configuración de Prueba</h3>
            
            <div style="margin-bottom: 15px;">
                <label for="num-players" style="display: block; margin-bottom: 5px;">Número de jugadores:</label>
                <input type="range" id="num-players" min="5" max="100" value="${this.config.numPlayers}" style="width: 100%;">
                <div style="display: flex; justify-content: space-between;">
                    <span>5</span>
                    <span id="num-players-value">${this.config.numPlayers}</span>
                    <span>100</span>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label for="test-duration" style="display: block; margin-bottom: 5px;">Duración (segundos):</label>
                <input type="range" id="test-duration" min="10" max="300" value="${this.config.duration}" style="width: 100%;">
                <div style="display: flex; justify-content: space-between;">
                    <span>10s</span>
                    <span id="test-duration-value">${this.config.duration}s</span>
                    <span>300s</span>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label for="latency-max" style="display: block; margin-bottom: 5px;">Latencia máxima (ms):</label>
                <input type="range" id="latency-max" min="20" max="500" value="${this.config.simulatedLatency.max}" style="width: 100%;">
                <div style="display: flex; justify-content: space-between;">
                    <span>20ms</span>
                    <span id="latency-max-value">${this.config.simulatedLatency.max}ms</span>
                    <span>500ms</span>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label for="packet-loss" style="display: block; margin-bottom: 5px;">Pérdida de paquetes:</label>
                <input type="range" id="packet-loss" min="0" max="0.2" step="0.01" value="${this.config.packetLoss}" style="width: 100%;">
                <div style="display: flex; justify-content: space-between;">
                    <span>0%</span>
                    <span id="packet-loss-value">${(this.config.packetLoss * 100).toFixed(0)}%</span>
                    <span>20%</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button id="start-test-btn" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Iniciar Prueba</button>
                <button id="cancel-test-btn" style="padding: 10px 20px; background-color: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Actualizar valores en tiempo real
        const numPlayersInput = document.getElementById('num-players');
        const numPlayersValue = document.getElementById('num-players-value');
        numPlayersInput.addEventListener('input', () => {
            numPlayersValue.textContent = numPlayersInput.value;
        });
        
        const testDurationInput = document.getElementById('test-duration');
        const testDurationValue = document.getElementById('test-duration-value');
        testDurationInput.addEventListener('input', () => {
            testDurationValue.textContent = `${testDurationInput.value}s`;
        });
        
        const latencyMaxInput = document.getElementById('latency-max');
        const latencyMaxValue = document.getElementById('latency-max-value');
        latencyMaxInput.addEventListener('input', () => {
            latencyMaxValue.textContent = `${latencyMaxInput.value}ms`;
        });
        
        const packetLossInput = document.getElementById('packet-loss');
        const packetLossValue = document.getElementById('packet-loss-value');
        packetLossInput.addEventListener('input', () => {
            packetLossValue.textContent = `${(packetLossInput.value * 100).toFixed(0)}%`;
        });
        
        // Eventos para botones
        document.getElementById('start-test-btn').addEventListener('click', () => {
            // Obtener valores configurados
            const options = {
                numPlayers: parseInt(numPlayersInput.value),
                duration: parseInt(testDurationInput.value),
                simulatedLatency: {
                    min: 20,
                    max: parseInt(latencyMaxInput.value)
                },
                packetLoss: parseFloat(packetLossInput.value)
            };
            
            // Cerrar diálogo
            document.body.removeChild(dialog);
            
            // Iniciar nueva prueba
            this.startLoadTest(options);
        });
        
        document.getElementById('cancel-test-btn').addEventListener('click', () => {
            // Cerrar diálogo
            document.body.removeChild(dialog);
        });
    }
}

// Crear instancia global
window.loadTester = new LoadTester();
