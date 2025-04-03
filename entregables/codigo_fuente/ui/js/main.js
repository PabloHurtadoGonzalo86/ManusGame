/**
 * Archivo principal para "La Hucha de Paredes"
 * Coordina todos los sistemas y gestiona el flujo del juego
 */

class GameSystem {
    constructor() {
        // Referencias a otros sistemas
        this.uiManager = window.uiManager;
        this.lobbySystem = window.lobbySystem;
        this.customizationSystem = window.customizationSystem;
        this.gameInterface = window.gameInterface;
        this.leaderboardSystem = window.leaderboardSystem;
        
        // Estado del juego
        this.isGameRunning = false;
        this.isPaused = false;
        this.gameMode = 'survival';
        this.players = [];
        this.enemies = [];
        
        // Configuración
        this.config = {
            enemySpawnRate: 30, // Segundos entre apariciones
            maxEnemies: 5,      // Máximo de enemigos simultáneos
            difficultyIncrease: 0.1 // Factor de aumento de dificultad por minuto
        };
        
        // Temporizadores
        this.enemySpawnTimer = null;
        
        // Inicializar eventos
        this.initEvents();
    }
    
    /**
     * Inicializa los eventos del juego
     */
    initEvents() {
        // Eventos de teclado para el juego
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        console.log('Sistema de juego inicializado');
    }
    
    /**
     * Maneja eventos de teclado
     * @param {KeyboardEvent} e - Evento de teclado
     */
    handleKeyDown(e) {
        if (!this.isGameRunning) return;
        
        // Tecla Escape para pausar/reanudar
        if (e.key === 'Escape') {
            this.togglePause();
        }
        
        // Tecla E para interactuar
        if (e.key === 'e' || e.key === 'E') {
            this.interact();
        }
        
        // Tecla Espacio para saltar
        if (e.key === ' ' && !this.isPaused) {
            this.jump();
        }
        
        // Tecla Shift para sprint
        if (e.key === 'Shift' && !this.isPaused) {
            this.sprint(true);
        }
    }
    
    /**
     * Inicia el juego
     */
    startGame() {
        if (this.isGameRunning) return;
        
        console.log('Iniciando juego...');
        
        // Inicializar interfaz
        this.gameInterface.init();
        
        // Configurar modo de juego
        this.gameMode = this.lobbySystem.currentGame ? this.lobbySystem.currentGame.mode : 'survival';
        
        // Inicializar jugadores
        this.initPlayers();
        
        // Inicializar enemigos
        this.initEnemies();
        
        // Iniciar temporizador de aparición de enemigos
        this.startEnemySpawnTimer();
        
        // Marcar como iniciado
        this.isGameRunning = true;
        this.isPaused = false;
        
        console.log('Juego iniciado en modo:', this.gameMode);
    }
    
    /**
     * Inicializa los jugadores
     */
    initPlayers() {
        // En una implementación real, aquí se crearían los jugadores basados en los conectados al lobby
        this.players = [];
        
        // Añadir jugador local
        this.players.push({
            id: 'local_player',
            name: this.lobbySystem.playerName,
            avatar: this.customizationSystem.getAvatarConfig(),
            health: 100,
            position: { x: 0, y: 0, z: 0 },
            rotation: 0,
            isLocal: true
        });
        
        // Añadir jugadores remotos si estamos en multijugador
        if (this.lobbySystem.currentGame) {
            this.lobbySystem.players.forEach(player => {
                if (player.name !== this.lobbySystem.playerName) {
                    this.players.push({
                        id: player.id,
                        name: player.name,
                        avatar: player.avatar,
                        health: 100,
                        position: { x: Math.random() * 10 - 5, y: 0, z: Math.random() * 10 - 5 },
                        rotation: Math.random() * Math.PI * 2,
                        isLocal: false
                    });
                }
            });
        }
        
        console.log('Jugadores inicializados:', this.players.length);
    }
    
    /**
     * Inicializa los enemigos
     */
    initEnemies() {
        this.enemies = [];
        
        // Crear enemigo inicial
        this.spawnEnemy();
        
        console.log('Enemigos inicializados');
    }
    
    /**
     * Inicia el temporizador de aparición de enemigos
     */
    startEnemySpawnTimer() {
        // Limpiar temporizador existente
        if (this.enemySpawnTimer) {
            clearInterval(this.enemySpawnTimer);
        }
        
        // Iniciar nuevo temporizador
        this.enemySpawnTimer = setInterval(() => {
            if (!this.isPaused && this.enemies.length < this.config.maxEnemies) {
                this.spawnEnemy();
            }
        }, this.config.enemySpawnRate * 1000);
    }
    
    /**
     * Crea un nuevo enemigo
     */
    spawnEnemy() {
        // Calcular posición aleatoria lejos del jugador
        const playerPos = this.players[0].position;
        let enemyPos;
        
        do {
            enemyPos = {
                x: Math.random() * 50 - 25,
                y: 0,
                z: Math.random() * 50 - 25
            };
        } while (this.getDistance(playerPos, enemyPos) < 10); // Asegurar distancia mínima
        
        // Crear enemigo
        const enemy = {
            id: 'enemy_' + Math.random().toString(36).substr(2, 9),
            type: 'hucha',
            health: 100,
            position: enemyPos,
            rotation: Math.random() * Math.PI * 2,
            state: 'idle', // idle, chase, attack
            target: null,
            speed: 0.5 + (this.gameInterface.timer / 600) * this.config.difficultyIncrease, // Aumenta con el tiempo
            damage: 10 + (this.gameInterface.timer / 600) * this.config.difficultyIncrease * 5
        };
        
        // Añadir a la lista
        this.enemies.push(enemy);
        
        console.log('Enemigo creado:', enemy.id);
        
        // Notificar al jugador con un sonido o efecto
        this.playSound('enemy_spawn');
    }
    
    /**
     * Calcula la distancia entre dos posiciones
     * @param {Object} pos1 - Primera posición {x, y, z}
     * @param {Object} pos2 - Segunda posición {x, y, z}
     * @returns {number} Distancia
     */
    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    /**
     * Reproduce un sonido
     * @param {string} soundId - Identificador del sonido
     */
    playSound(soundId) {
        // En una implementación real, aquí se reproduciría el sonido
        console.log('Reproduciendo sonido:', soundId);
    }
    
    /**
     * Pausa o reanuda el juego
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        // Notificar a la interfaz
        this.gameInterface.togglePause();
        
        console.log('Juego', this.isPaused ? 'pausado' : 'reanudado');
    }
    
    /**
     * Realiza una interacción
     */
    interact() {
        if (!this.isGameRunning || this.isPaused) return;
        
        // En una implementación real, aquí se comprobaría si hay algo con lo que interactuar
        console.log('Interactuando...');
        
        // Simular interacción con objeto
        if (Math.random() > 0.7) {
            // Encontrar objeto
            const items = ['vendas', 'botiquín', 'munición', 'batería', 'llave'];
            const item = items[Math.floor(Math.random() * items.length)];
            
            // Notificar al jugador
            this.uiManager.addChatMessage('Sistema', `Has encontrado: ${item}`, true);
            
            // Aplicar efecto
            if (item === 'vendas' || item === 'botiquín') {
                const healAmount = item === 'vendas' ? 20 : 50;
                this.gameInterface.heal(healAmount);
            } else if (item === 'batería') {
                this.gameInterface.increaseScore(100);
            }
        }
    }
    
    /**
     * Realiza un salto
     */
    jump() {
        if (!this.isGameRunning || this.isPaused) return;
        
        // Comprobar si hay suficiente stamina
        if (this.gameInterface.useStamina(this.gameInterface.config.staminaJumpCost)) {
            console.log('Saltando...');
            
            // En una implementación real, aquí se aplicaría la física del salto
            
            // Reproducir sonido
            this.playSound('jump');
        } else {
            console.log('No hay suficiente stamina para saltar');
        }
    }
    
    /**
     * Activa o desactiva el sprint
     * @param {boolean} isRunning - Indica si está corriendo
     */
    sprint(isRunning) {
        if (!this.isGameRunning || this.isPaused) return;
        
        if (isRunning) {
            // Comprobar si hay suficiente stamina
            if (this.gameInterface.stamina > 0) {
                console.log('Sprint activado');
                
                // Consumir stamina continuamente mientras se mantiene pulsada la tecla
                const sprintInterval = setInterval(() => {
                    if (!this.gameInterface.useStamina(this.gameInterface.config.staminaSprintCost / 10) || !isRunning) {
                        clearInterval(sprintInterval);
                        console.log('Sprint desactivado');
                    }
                }, 100);
                
                // Detectar cuando se suelta la tecla
                const handleKeyUp = (e) => {
                    if (e.key === 'Shift') {
                        isRunning = false;
                        document.removeEventListener('keyup', handleKeyUp);
                    }
                };
                
                document.addEventListener('keyup', handleKeyUp);
            } else {
                console.log('No hay suficiente stamina para correr');
            }
        }
    }
    
    /**
     * Aplica daño a un enemigo
     * @param {string} enemyId - ID del enemigo
     * @param {number} damage - Cantidad de daño
     */
    damageEnemy(enemyId, damage) {
        // Buscar enemigo
        const enemyIndex = this.enemies.findIndex(e => e.id === enemyId);
        
        if (enemyIndex >= 0) {
            const enemy = this.enemies[enemyIndex];
            
            // Reducir salud
            enemy.health -= damage;
            
            // Comprobar si ha muerto
            if (enemy.health <= 0) {
                // Eliminar enemigo
                this.enemies.splice(enemyIndex, 1);
                
                // Incrementar puntuación
                this.gameInterface.increaseScore(200);
                
                // Notificar al jugador
                this.uiManager.addChatMessage('Sistema', 'Has eliminado a La Hucha', true);
                
                // Reproducir sonido
                this.playSound('enemy_death');
                
                console.log('Enemigo eliminado:', enemyId);
            } else {
                // Reproducir sonido de daño
                this.playSound('enemy_hit');
                
                console.log('Daño aplicado a enemigo:', enemyId, damage);
            }
        }
    }
    
    /**
     * Aplica daño al jugador
     * @param {number} damage - Cantidad de daño
     */
    damagePlayer(damage) {
        if (!this.isGameRunning || this.isPaused) return;
        
        // Aplicar daño
        this.gameInterface.takeDamage(damage);
        
        // Reproducir sonido
        this.playSound('player_hit');
        
        console.log('Daño aplicado al jugador:', damage);
    }
    
    /**
     * Actualiza la lógica del juego
     * @param {number} deltaTime - Tiempo transcurrido desde la última actualización
     */
    update(deltaTime) {
        if (!this.isGameRunning || this.isPaused) return;
        
        // Actualizar enemigos
        this.updateEnemies(deltaTime);
        
        // En una implementación real, aquí se actualizaría la física, colisiones, etc.
    }
    
    /**
     * Actualiza la lógica de los enemigos
     * @param {number} deltaTime - Tiempo transcurrido desde la última actualización
     */
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            // Determinar estado
            if (enemy.state === 'idle') {
                // Buscar jugador cercano
                const nearestPlayer = this.findNearestPlayer(enemy.position);
                
                if (nearestPlayer && this.getDistance(enemy.position, nearestPlayer.position) < 15) {
                    // Cambiar a estado de persecución
                    enemy.state = 'chase';
                    enemy.target = nearestPlayer.id;
                    
                    // Reproducir sonido
                    this.playSound('enemy_alert');
                } else {
                    // Movimiento aleatorio
                    this.moveEnemyRandomly(enemy, deltaTime);
                }
            } else if (enemy.state === 'chase') {
                // Buscar jugador objetivo
                const target = this.players.find(p => p.id === enemy.target);
                
                if (target) {
                    const distance = this.getDistance(enemy.position, target.position);
                    
                    if (distance < 2) {
                        // Cambiar a estado de ataque
                        enemy.state = 'attack';
                    } else if (distance > 20) {
                        // Volver a estado de reposo si el jugador está muy lejos
                        enemy.state = 'idle';
                        enemy.target = null;
                    } else {
                        // Perseguir al jugador
                        this.moveEnemyTowardsTarget(enemy, target.position, deltaTime);
                    }
                } else {
                    // Objetivo perdido, volver a estado de reposo
                    enemy.state = 'idle';
                    enemy.target = null;
                }
            } else if (enemy.state === 'attack') {
                // Buscar jugador objetivo
                const target = this.players.find(p => p.id === enemy.target);
                
                if (target) {
                    const distance = this.getDistance(enemy.position, target.position);
                    
                    if (distance < 2) {
                        // Atacar al jugador
                        if (target.isLocal) {
                            // Solo aplicar daño si es el jugador local
                            this.damagePlayer(enemy.damage);
                        }
                        
                        // Reproducir sonido
                        this.playSound('enemy_attack');
                    } else {
                        // Volver a estado de persecución
                        enemy.state = 'chase';
                    }
                } else {
                    // Objetivo perdido, volver a estado de reposo
                    enemy.state = 'idle';
                    enemy.target = null;
                }
            }
        });
    }
    
    /**
     * Encuentra al jugador más cercano a una posición
     * @param {Object} position - Posición {x, y, z}
     * @returns {Object|null} Jugador más cercano o null si no hay ninguno
     */
    findNearestPlayer(position) {
        let nearestPlayer = null;
        let minDistance = Infinity;
        
        this.players.forEach(player => {
            const distance = this.getDistance(position, player.position);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestPlayer = player;
            }
        });
        
        return nearestPlayer;
    }
    
    /**
     * Mueve un enemigo aleatoriamente
     * @param {Object} enemy - Enemigo
     * @param {number} deltaTime - Tiempo transcurrido
     */
    moveEnemyRandomly(enemy, deltaTime) {
        // Cambiar dirección ocasionalmente
        if (Math.random() < 0.01) {
            enemy.rotation = Math.random() * Math.PI * 2;
        }
        
        // Mover en la dirección actual
        const speed = enemy.speed * 0.5; // Más lento en estado de reposo
        enemy.position.x += Math.cos(enemy.rotation) * speed * deltaTime;
        enemy.position.z += Math.sin(enemy.rotation) * speed * deltaTime;
    }
    
    /**
     * Mueve un enemigo hacia un objetivo
     * @param {Object} enemy - Enemigo
     * @param {Object} targetPosition - Posición objetivo {x, y, z}
     * @param {number} deltaTime - Tiempo transcurrido
     */
    moveEnemyTowardsTarget(enemy, targetPosition, deltaTime) {
        // Calcular dirección
        const dx = targetPosition.x - enemy.position.x;
        const dz = targetPosition.z - enemy.position.z;
        
        // Normalizar
        const length = Math.sqrt(dx * dx + dz * dz);
        const ndx = dx / length;
        const ndz = dz / length;
        
        // Actualizar rotación
        enemy.rotation = Math.atan2(ndz, ndx);
        
        // Mover
        enemy.position.x += ndx * enemy.speed * deltaTime;
        enemy.position.z += ndz * enemy.speed * deltaTime;
    }
    
    /**
     * Reinicia el juego
     */
    restartGame() {
        // Detener juego actual
        this.stopGame();
        
        // Iniciar nuevo juego
        this.startGame();
        
        console.log('Juego reiniciado');
    }
    
    /**
     * Detiene el juego
     */
    stopGame() {
        if (!this.isGameRunning) return;
        
        // Detener temporizadores
        if (this.enemySpawnTimer) {
            clearInterval(this.enemySpawnTimer);
        }
        
        // Limpiar estado
        this.isGameRunning = false;
        this.isPaused = false;
        this.players = [];
        this.enemies = [];
        
        // Limpiar interfaz
        this.gameInterface.cleanup();
        
        console.log('Juego detenido');
    }
    
    /**
     * Sale del juego
     */
    exitGame() {
        // Guardar puntuación si es una puntuación alta
        if (this.gameInterface && this.gameInterface.score > 0) {
            if (this.leaderboardSystem.isTopScore(this.gameInterface.score)) {
                const playerName = prompt('¡Has conseguido una puntuación alta! Introduce tu nombre:', this.lobbySystem.playerName);
                
                if (playerName) {
                    const position = this.leaderboardSystem.addScore(
                        playerName,
                        this.gameInterface.score,
                        this.gameInterface.timer
                    );
                    
                    alert(`¡Felicidades! Has quedado en la posición ${position}`);
                }
            }
        }
        
        // Detener juego
        this.stopGame();
        
        // Salir del lobby si estamos en uno
        if (this.lobbySystem.currentGame) {
            this.lobbySystem.leaveGame();
        }
        
        console.log('Saliendo del juego');
    }
}

// Crear instancia global
window.gameSystem = new GameSystem();

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando sistemas...');
    
    // Comprobar que todos los sistemas estén disponibles
    if (window.uiManager && window.lobbySystem && 
        window.customizationSystem && window.gameInterface && 
        window.leaderboardSystem) {
        
        console.log('Todos los sistemas inicializados correctamente');
    } else {
        console.error('Error: No se han podido inicializar todos los sistemas');
    }
});
