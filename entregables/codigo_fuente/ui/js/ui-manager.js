/**
 * UI Manager para "La Hucha de Paredes"
 * Gestiona la navegación entre pantallas y la interfaz de usuario general
 */

class UIManager {
    constructor() {
        // Referencias a las pantallas
        this.loadingScreen = document.getElementById('loading-screen');
        this.startScreen = document.getElementById('start-screen');
        this.mainMenu = document.getElementById('main-menu');
        this.lobbyScreen = document.getElementById('lobby-screen');
        this.createGameScreen = document.getElementById('create-game-screen');
        this.customizationScreen = document.getElementById('customization-screen');
        this.leaderboardScreen = document.getElementById('leaderboard-screen');
        this.gameUI = document.getElementById('game-ui');
        this.gameOverScreen = document.getElementById('game-over-screen');
        
        // Referencias a botones y elementos interactivos
        this.startGameBtn = document.getElementById('start-game-btn');
        this.optionsBtn = document.getElementById('options-btn');
        this.creditsBtn = document.getElementById('credits-btn');
        
        this.joinGameBtn = document.getElementById('join-game-btn');
        this.createGameBtn = document.getElementById('create-game-btn');
        this.customizeBtn = document.getElementById('customize-btn');
        this.leaderboardBtn = document.getElementById('leaderboard-btn');
        this.backToStartBtn = document.getElementById('back-to-start-btn');
        
        this.readyBtn = document.getElementById('ready-btn');
        this.leaveLobbyBtn = document.getElementById('leave-lobby-btn');
        
        this.createBtn = document.getElementById('create-btn');
        this.cancelCreateBtn = document.getElementById('cancel-create-btn');
        this.gamePrivacy = document.getElementById('game-privacy');
        this.passwordGroup = document.getElementById('password-group');
        
        this.saveCustomizationBtn = document.getElementById('save-customization-btn');
        this.cancelCustomizationBtn = document.getElementById('cancel-customization-btn');
        
        this.backFromLeaderboardBtn = document.getElementById('back-from-leaderboard-btn');
        
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.backToMenuBtn = document.getElementById('back-to-menu-btn');
        
        // Estado de la interfaz
        this.currentScreen = null;
        this.isPlayerReady = false;
        this.isGameRunning = false;
        
        // Inicializar eventos
        this.initEvents();
        
        // Mostrar pantalla de inicio por defecto
        this.showScreen(this.startScreen);
    }
    
    /**
     * Inicializa todos los eventos de la interfaz
     */
    initEvents() {
        // Eventos de la pantalla de inicio
        this.startGameBtn.addEventListener('click', () => this.showScreen(this.mainMenu));
        this.optionsBtn.addEventListener('click', () => this.showOptions());
        this.creditsBtn.addEventListener('click', () => this.showCredits());
        
        // Eventos del menú principal
        this.joinGameBtn.addEventListener('click', () => this.showScreen(this.lobbyScreen));
        this.createGameBtn.addEventListener('click', () => this.showScreen(this.createGameScreen));
        this.customizeBtn.addEventListener('click', () => this.showScreen(this.customizationScreen));
        this.leaderboardBtn.addEventListener('click', () => this.showScreen(this.leaderboardScreen));
        this.backToStartBtn.addEventListener('click', () => this.showScreen(this.startScreen));
        
        // Eventos de la pantalla de lobby
        this.readyBtn.addEventListener('click', () => this.toggleReady());
        this.leaveLobbyBtn.addEventListener('click', () => this.showScreen(this.mainMenu));
        
        // Eventos de la pantalla de creación de partida
        document.getElementById('create-game-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createGame();
        });
        this.cancelCreateBtn.addEventListener('click', () => this.showScreen(this.mainMenu));
        this.gamePrivacy.addEventListener('change', () => this.togglePasswordField());
        
        // Eventos de la pantalla de personalización
        this.saveCustomizationBtn.addEventListener('click', () => {
            this.saveCustomization();
            this.showScreen(this.mainMenu);
        });
        this.cancelCustomizationBtn.addEventListener('click', () => this.showScreen(this.mainMenu));
        
        // Eventos de la tabla de puntuaciones
        this.backFromLeaderboardBtn.addEventListener('click', () => this.showScreen(this.mainMenu));
        
        // Eventos de la pantalla de Game Over
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        this.backToMenuBtn.addEventListener('click', () => this.showScreen(this.mainMenu));
        
        // Eventos del chat
        document.getElementById('chat-send').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // Eventos de teclado globales
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    /**
     * Muestra una pantalla específica y oculta las demás
     * @param {HTMLElement} screen - La pantalla a mostrar
     */
    showScreen(screen) {
        // Ocultar todas las pantallas
        this.loadingScreen.style.display = 'none';
        this.startScreen.style.display = 'none';
        this.mainMenu.style.display = 'none';
        this.lobbyScreen.style.display = 'none';
        this.createGameScreen.style.display = 'none';
        this.customizationScreen.style.display = 'none';
        this.leaderboardScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        
        // Si estamos saliendo del juego, ocultar la interfaz del juego
        if (this.currentScreen === this.gameUI && screen !== this.gameOverScreen) {
            this.gameUI.style.display = 'none';
            this.isGameRunning = false;
            // Notificar al sistema de juego que se ha salido
            if (window.gameSystem) {
                window.gameSystem.exitGame();
            }
        }
        
        // Mostrar la pantalla solicitada
        screen.style.display = 'flex';
        this.currentScreen = screen;
        
        // Acciones específicas según la pantalla
        if (screen === this.lobbyScreen) {
            // Actualizar lista de partidas
            if (window.lobbySystem) {
                window.lobbySystem.refreshGameList();
            }
        } else if (screen === this.leaderboardScreen) {
            // Actualizar tabla de puntuaciones
            if (window.leaderboardSystem) {
                window.leaderboardSystem.refreshLeaderboard();
            }
        } else if (screen === this.customizationScreen) {
            // Inicializar vista previa de personalización
            if (window.customizationSystem) {
                window.customizationSystem.initPreview();
            }
        }
    }
    
    /**
     * Muestra la pantalla de opciones
     */
    showOptions() {
        // Implementar modal de opciones
        alert('Opciones del juego (Implementación pendiente)');
    }
    
    /**
     * Muestra los créditos del juego
     */
    showCredits() {
        // Implementar modal de créditos
        alert('La Hucha de Paredes\n\nDesarrollado por: Manus AI\n\nUn juego de terror multijugador en 3D');
    }
    
    /**
     * Cambia el estado de "listo" del jugador en el lobby
     */
    toggleReady() {
        this.isPlayerReady = !this.isPlayerReady;
        
        if (this.isPlayerReady) {
            this.readyBtn.textContent = 'No Listo';
            this.readyBtn.classList.remove('accent');
            this.readyBtn.classList.add('secondary');
        } else {
            this.readyBtn.textContent = 'Listo';
            this.readyBtn.classList.remove('secondary');
            this.readyBtn.classList.add('accent');
        }
        
        // Notificar al sistema de lobby
        if (window.lobbySystem) {
            window.lobbySystem.setPlayerReady(this.isPlayerReady);
        }
    }
    
    /**
     * Muestra u oculta el campo de contraseña según la privacidad seleccionada
     */
    togglePasswordField() {
        if (this.gamePrivacy.value === 'private') {
            this.passwordGroup.style.display = 'block';
        } else {
            this.passwordGroup.style.display = 'none';
        }
    }
    
    /**
     * Crea una nueva partida con los datos del formulario
     */
    createGame() {
        const gameName = document.getElementById('game-name').value;
        const maxPlayers = document.getElementById('max-players').value;
        const gameMode = document.getElementById('game-mode').value;
        const privacy = document.getElementById('game-privacy').value;
        const password = privacy === 'private' ? document.getElementById('game-password').value : '';
        
        // Validar datos
        if (!gameName) {
            alert('Por favor, introduce un nombre para la partida');
            return;
        }
        
        if (privacy === 'private' && !password) {
            alert('Por favor, introduce una contraseña para la partida privada');
            return;
        }
        
        // Crear partida a través del sistema de lobby
        if (window.lobbySystem) {
            window.lobbySystem.createGame(gameName, maxPlayers, gameMode, privacy, password);
            this.showScreen(this.lobbyScreen);
        }
    }
    
    /**
     * Guarda la configuración de personalización del personaje
     */
    saveCustomization() {
        if (window.customizationSystem) {
            window.customizationSystem.saveCustomization();
        }
    }
    
    /**
     * Envía un mensaje de chat
     */
    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (message) {
            // Enviar mensaje a través del sistema de chat
            if (window.lobbySystem) {
                window.lobbySystem.sendChatMessage(message);
            }
            
            // Limpiar campo de entrada
            chatInput.value = '';
        }
    }
    
    /**
     * Maneja eventos de teclado globales
     * @param {KeyboardEvent} e - El evento de teclado
     */
    handleKeyDown(e) {
        // Tecla Escape para abrir menú durante el juego
        if (e.key === 'Escape' && this.isGameRunning) {
            this.toggleInGameMenu();
        }
        
        // Tecla T para abrir chat durante el juego
        if (e.key === 't' && this.isGameRunning) {
            document.getElementById('chat-input').focus();
        }
    }
    
    /**
     * Muestra u oculta el menú durante el juego
     */
    toggleInGameMenu() {
        // Implementar menú in-game
        if (this.isGameRunning) {
            // Pausar juego y mostrar menú
            if (window.gameSystem) {
                window.gameSystem.togglePause();
            }
        }
    }
    
    /**
     * Inicia el juego y muestra la interfaz de juego
     */
    startGame() {
        this.showLoadingScreen('Cargando partida...', () => {
            this.gameUI.style.display = 'block';
            this.isGameRunning = true;
            
            // Inicializar interfaz de juego
            if (window.gameInterface) {
                window.gameInterface.init();
            }
            
            // Iniciar el juego
            if (window.gameSystem) {
                window.gameSystem.startGame();
            }
        });
    }
    
    /**
     * Reinicia el juego después de Game Over
     */
    restartGame() {
        this.showLoadingScreen('Reiniciando partida...', () => {
            this.gameOverScreen.style.display = 'none';
            this.gameUI.style.display = 'block';
            this.isGameRunning = true;
            
            // Reiniciar el juego
            if (window.gameSystem) {
                window.gameSystem.restartGame();
            }
        });
    }
    
    /**
     * Muestra la pantalla de Game Over con la puntuación final
     * @param {number} score - Puntuación final del jugador
     */
    showGameOver(score) {
        document.getElementById('final-score-value').textContent = score;
        this.showScreen(this.gameOverScreen);
        this.isGameRunning = false;
    }
    
    /**
     * Muestra la pantalla de carga con un mensaje personalizado
     * @param {string} message - Mensaje a mostrar durante la carga
     * @param {Function} callback - Función a ejecutar cuando finalice la carga
     */
    showLoadingScreen(message, callback) {
        // Mostrar pantalla de carga
        document.getElementById('loading-text').textContent = message || 'Cargando...';
        document.getElementById('loading-bar').style.width = '0%';
        this.showScreen(this.loadingScreen);
        
        // Simular progreso de carga
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Esperar un momento antes de continuar
                setTimeout(() => {
                    if (callback) callback();
                }, 500);
            }
            document.getElementById('loading-bar').style.width = `${progress}%`;
        }, 200);
    }
    
    /**
     * Añade un mensaje al chat
     * @param {string} sender - Nombre del remitente
     * @param {string} message - Contenido del mensaje
     * @param {boolean} isSystem - Indica si es un mensaje del sistema
     */
    addChatMessage(sender, message, isSystem = false) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        if (isSystem) {
            messageElement.innerHTML = `<span class="system">${message}</span>`;
        } else {
            messageElement.innerHTML = `<span class="sender">${sender}:</span> ${message}`;
        }
        
        chatMessages.insertBefore(messageElement, chatMessages.firstChild);
    }
    
    /**
     * Actualiza la barra de salud
     * @param {number} health - Valor actual de salud (0-100)
     */
    updateHealth(health) {
        const healthBar = document.getElementById('health-bar');
        healthBar.style.width = `${health}%`;
        
        // Cambiar color según la salud
        if (health > 60) {
            healthBar.style.backgroundColor = 'var(--color-primary)';
        } else if (health > 30) {
            healthBar.style.backgroundColor = 'var(--color-warning)';
        } else {
            healthBar.style.backgroundColor = 'var(--color-danger)';
        }
        
        // Efecto de daño si la salud es baja
        if (health < 30) {
            document.getElementById('damage-overlay').style.backgroundColor = 'rgba(153, 0, 0, 0.3)';
        } else {
            document.getElementById('damage-overlay').style.backgroundColor = 'rgba(153, 0, 0, 0)';
        }
    }
    
    /**
     * Actualiza la barra de stamina
     * @param {number} stamina - Valor actual de stamina (0-100)
     */
    updateStamina(stamina) {
        const staminaBar = document.getElementById('stamina-bar');
        staminaBar.style.width = `${stamina}%`;
    }
    
    /**
     * Actualiza la puntuación mostrada
     * @param {number} score - Puntuación actual
     */
    updateScore(score) {
        document.getElementById('score-value').textContent = score;
    }
    
    /**
     * Actualiza el temporizador
     * @param {number} seconds - Tiempo en segundos
     */
    updateTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('timer-value').textContent = formattedTime;
    }
    
    /**
     * Muestra u oculta el prompt de interacción
     * @param {boolean} show - Indica si se debe mostrar el prompt
     * @param {string} text - Texto personalizado (opcional)
     */
    toggleInteractionPrompt(show, text) {
        const prompt = document.getElementById('interaction-prompt');
        
        if (show) {
            prompt.textContent = text || 'Presiona E para interactuar';
            prompt.style.display = 'block';
        } else {
            prompt.style.display = 'none';
        }
    }
    
    /**
     * Crea un efecto de salpicadura de sangre en la pantalla
     */
    createBloodSplatter() {
        const splatter = document.createElement('div');
        splatter.className = 'blood-splatter';
        
        // Posición aleatoria
        const size = Math.random() * 200 + 100;
        splatter.style.width = `${size}px`;
        splatter.style.height = `${size}px`;
        splatter.style.top = `${Math.random() * 100}%`;
        splatter.style.left = `${Math.random() * 100}%`;
        splatter.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        document.body.appendChild(splatter);
        
        // Eliminar después de la animación
        setTimeout(() => {
            document.body.removeChild(splatter);
        }, 2000);
    }
    
    /**
     * Crea un efecto de sacudida en la pantalla
     */
    shakeScreen() {
        document.body.classList.add('shake');
        
        setTimeout(() => {
            document.body.classList.remove('shake');
        }, 500);
    }
}

// Crear instancia global
window.uiManager = new UIManager();
