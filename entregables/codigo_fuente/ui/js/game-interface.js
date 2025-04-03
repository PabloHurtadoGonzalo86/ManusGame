/**
 * Interfaz de Juego para "La Hucha de Paredes"
 * Gestiona la interfaz durante el juego
 */

class GameInterface {
    constructor() {
        // Referencias a elementos del DOM
        this.healthBar = document.getElementById('health-bar');
        this.staminaBar = document.getElementById('stamina-bar');
        this.scoreValue = document.getElementById('score-value');
        this.timerValue = document.getElementById('timer-value');
        this.interactionPrompt = document.getElementById('interaction-prompt');
        this.damageOverlay = document.getElementById('damage-overlay');
        
        // Estado del juego
        this.health = 100;
        this.stamina = 100;
        this.score = 0;
        this.timer = 0;
        this.isGamePaused = false;
        
        // Temporizadores
        this.gameTimer = null;
        this.staminaRecoveryTimer = null;
        
        // Configuración
        this.config = {
            staminaRecoveryRate: 5, // Puntos por segundo
            staminaSprintCost: 10,  // Puntos por segundo
            staminaJumpCost: 20,    // Puntos por salto
            scoreIncreaseRate: 10   // Puntos por minuto
        };
    }
    
    /**
     * Inicializa la interfaz de juego
     */
    init() {
        // Restablecer valores
        this.health = 100;
        this.stamina = 100;
        this.score = 0;
        this.timer = 0;
        
        // Actualizar interfaz
        this.updateHealth(this.health);
        this.updateStamina(this.stamina);
        this.updateScore(this.score);
        this.updateTimer(this.timer);
        
        // Iniciar temporizadores
        this.startGameTimer();
        this.startStaminaRecovery();
        
        // Ocultar prompt de interacción
        this.toggleInteractionPrompt(false);
        
        // Limpiar overlay de daño
        this.damageOverlay.style.backgroundColor = 'rgba(153, 0, 0, 0)';
        
        console.log('Interfaz de juego inicializada');
    }
    
    /**
     * Inicia el temporizador del juego
     */
    startGameTimer() {
        // Limpiar temporizador existente
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        // Iniciar nuevo temporizador
        this.gameTimer = setInterval(() => {
            if (!this.isGamePaused) {
                // Incrementar tiempo
                this.timer++;
                this.updateTimer(this.timer);
                
                // Incrementar puntuación cada minuto
                if (this.timer % 60 === 0) {
                    this.increaseScore(this.config.scoreIncreaseRate);
                }
            }
        }, 1000);
    }
    
    /**
     * Inicia la recuperación de stamina
     */
    startStaminaRecovery() {
        // Limpiar temporizador existente
        if (this.staminaRecoveryTimer) {
            clearInterval(this.staminaRecoveryTimer);
        }
        
        // Iniciar nuevo temporizador
        this.staminaRecoveryTimer = setInterval(() => {
            if (!this.isGamePaused && this.stamina < 100) {
                // Incrementar stamina
                this.stamina = Math.min(100, this.stamina + this.config.staminaRecoveryRate / 10);
                this.updateStamina(this.stamina);
            }
        }, 100);
    }
    
    /**
     * Actualiza la barra de salud
     * @param {number} health - Valor actual de salud (0-100)
     */
    updateHealth(health) {
        this.health = health;
        this.healthBar.style.width = `${health}%`;
        
        // Cambiar color según la salud
        if (health > 60) {
            this.healthBar.style.backgroundColor = 'var(--color-primary)';
        } else if (health > 30) {
            this.healthBar.style.backgroundColor = 'var(--color-warning)';
        } else {
            this.healthBar.style.backgroundColor = 'var(--color-danger)';
        }
        
        // Efecto de daño si la salud es baja
        if (health < 30) {
            this.damageOverlay.style.backgroundColor = 'rgba(153, 0, 0, 0.3)';
        } else {
            this.damageOverlay.style.backgroundColor = 'rgba(153, 0, 0, 0)';
        }
        
        // Comprobar si el jugador ha muerto
        if (health <= 0) {
            this.gameOver();
        }
    }
    
    /**
     * Actualiza la barra de stamina
     * @param {number} stamina - Valor actual de stamina (0-100)
     */
    updateStamina(stamina) {
        this.stamina = stamina;
        this.staminaBar.style.width = `${stamina}%`;
    }
    
    /**
     * Actualiza la puntuación mostrada
     * @param {number} score - Puntuación actual
     */
    updateScore(score) {
        this.score = score;
        this.scoreValue.textContent = score;
    }
    
    /**
     * Incrementa la puntuación
     * @param {number} amount - Cantidad a incrementar
     */
    increaseScore(amount) {
        this.score += amount;
        this.updateScore(this.score);
    }
    
    /**
     * Actualiza el temporizador
     * @param {number} seconds - Tiempo en segundos
     */
    updateTimer(seconds) {
        this.timer = seconds;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        this.timerValue.textContent = formattedTime;
    }
    
    /**
     * Muestra u oculta el prompt de interacción
     * @param {boolean} show - Indica si se debe mostrar el prompt
     * @param {string} text - Texto personalizado (opcional)
     */
    toggleInteractionPrompt(show, text) {
        if (show) {
            this.interactionPrompt.textContent = text || 'Presiona E para interactuar';
            this.interactionPrompt.style.display = 'block';
        } else {
            this.interactionPrompt.style.display = 'none';
        }
    }
    
    /**
     * Aplica daño al jugador
     * @param {number} amount - Cantidad de daño
     */
    takeDamage(amount) {
        // Reducir salud
        this.health = Math.max(0, this.health - amount);
        this.updateHealth(this.health);
        
        // Efectos visuales
        this.createBloodSplatter();
        this.shakeScreen();
        
        // Efecto de daño temporal
        this.damageOverlay.style.backgroundColor = 'rgba(153, 0, 0, 0.5)';
        setTimeout(() => {
            if (this.health > 30) {
                this.damageOverlay.style.backgroundColor = 'rgba(153, 0, 0, 0)';
            } else {
                this.damageOverlay.style.backgroundColor = 'rgba(153, 0, 0, 0.3)';
            }
        }, 500);
    }
    
    /**
     * Cura al jugador
     * @param {number} amount - Cantidad de curación
     */
    heal(amount) {
        // Incrementar salud
        this.health = Math.min(100, this.health + amount);
        this.updateHealth(this.health);
    }
    
    /**
     * Consume stamina
     * @param {number} amount - Cantidad de stamina a consumir
     * @returns {boolean} Verdadero si hay suficiente stamina
     */
    useStamina(amount) {
        if (this.stamina >= amount) {
            this.stamina -= amount;
            this.updateStamina(this.stamina);
            return true;
        }
        return false;
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
    
    /**
     * Pausa o reanuda el juego
     */
    togglePause() {
        this.isGamePaused = !this.isGamePaused;
        
        if (this.isGamePaused) {
            // Mostrar menú de pausa
            console.log('Juego pausado');
        } else {
            // Ocultar menú de pausa
            console.log('Juego reanudado');
        }
    }
    
    /**
     * Finaliza el juego
     */
    gameOver() {
        // Detener temporizadores
        clearInterval(this.gameTimer);
        clearInterval(this.staminaRecoveryTimer);
        
        // Mostrar pantalla de Game Over
        if (window.uiManager) {
            window.uiManager.showGameOver(this.score);
        }
        
        console.log('Game Over');
    }
    
    /**
     * Limpia los recursos al salir del juego
     */
    cleanup() {
        // Detener temporizadores
        clearInterval(this.gameTimer);
        clearInterval(this.staminaRecoveryTimer);
        
        console.log('Interfaz de juego limpiada');
    }
}

// Crear instancia global
window.gameInterface = new GameInterface();
