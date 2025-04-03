/**
 * Compatibilidad entre navegadores para "La Hucha de Paredes"
 * Implementa detección y adaptación para diferentes navegadores y dispositivos
 */

class BrowserCompatibility {
    constructor() {
        // Información del navegador
        this.browser = {
            name: '',
            version: '',
            engine: '',
            isCompatible: false,
            isMobile: false,
            isTablet: false,
            isDesktop: false,
            supportsWebGL: false,
            supportsWebGL2: false,
            supportsWebSockets: false,
            supportsWebRTC: false,
            supportsWebAudio: false,
            supportsPointerLock: false,
            supportsFullscreen: false,
            supportsGamepads: false,
            supportsTouchEvents: false,
            pixelRatio: 1
        };
        
        // Problemas detectados
        this.issues = [];
        
        // Soluciones aplicadas
        this.appliedFixes = [];
        
        // Inicializar
        this.detectBrowser();
        this.checkCompatibility();
    }
    
    /**
     * Detecta el navegador y sus capacidades
     */
    detectBrowser() {
        const ua = navigator.userAgent;
        
        // Detectar nombre y versión del navegador
        if (ua.indexOf('Firefox') !== -1) {
            this.browser.name = 'Firefox';
            this.browser.version = ua.match(/Firefox\/([\d.]+)/)[1];
            this.browser.engine = 'Gecko';
        } else if (ua.indexOf('Chrome') !== -1) {
            this.browser.name = 'Chrome';
            this.browser.version = ua.match(/Chrome\/([\d.]+)/)[1];
            this.browser.engine = 'Blink';
        } else if (ua.indexOf('Safari') !== -1) {
            this.browser.name = 'Safari';
            this.browser.version = ua.match(/Version\/([\d.]+)/)[1];
            this.browser.engine = 'WebKit';
        } else if (ua.indexOf('Edge') !== -1 || ua.indexOf('Edg/') !== -1) {
            this.browser.name = 'Edge';
            this.browser.version = ua.match(/Edge\/([\d.]+)/) || ua.match(/Edg\/([\d.]+)/);
            this.browser.version = this.browser.version ? this.browser.version[1] : '';
            this.browser.engine = 'Blink';
        } else if (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') !== -1) {
            this.browser.name = 'Internet Explorer';
            this.browser.version = ua.match(/MSIE ([\d.]+)/) || ua.match(/rv:([\d.]+)/);
            this.browser.version = this.browser.version ? this.browser.version[1] : '';
            this.browser.engine = 'Trident';
        } else if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR/') !== -1) {
            this.browser.name = 'Opera';
            this.browser.version = ua.match(/Opera\/([\d.]+)/) || ua.match(/OPR\/([\d.]+)/);
            this.browser.version = this.browser.version ? this.browser.version[1] : '';
            this.browser.engine = 'Blink';
        } else {
            this.browser.name = 'Unknown';
            this.browser.version = 'Unknown';
            this.browser.engine = 'Unknown';
        }
        
        // Detectar tipo de dispositivo
        this.browser.isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        this.browser.isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
        this.browser.isDesktop = !this.browser.isMobile && !this.browser.isTablet;
        
        // Detectar capacidades
        this.browser.supportsWebGL = this.checkWebGLSupport();
        this.browser.supportsWebGL2 = this.checkWebGL2Support();
        this.browser.supportsWebSockets = 'WebSocket' in window;
        this.browser.supportsWebRTC = 'RTCPeerConnection' in window;
        this.browser.supportsWebAudio = 'AudioContext' in window || 'webkitAudioContext' in window;
        this.browser.supportsPointerLock = 'pointerLockElement' in document || 
                                          'mozPointerLockElement' in document || 
                                          'webkitPointerLockElement' in document;
        this.browser.supportsFullscreen = 'fullscreenElement' in document || 
                                         'mozFullScreenElement' in document || 
                                         'webkitFullscreenElement' in document || 
                                         'msFullscreenElement' in document;
        this.browser.supportsGamepads = 'getGamepads' in navigator;
        this.browser.supportsTouchEvents = 'ontouchstart' in window;
        this.browser.pixelRatio = window.devicePixelRatio || 1;
        
        console.log('Navegador detectado:', this.browser.name, this.browser.version);
        console.log('Tipo de dispositivo:', 
                   this.browser.isMobile ? 'Móvil' : 
                   this.browser.isTablet ? 'Tablet' : 'Escritorio');
    }
    
    /**
     * Comprueba si el navegador soporta WebGL
     * @returns {boolean} Verdadero si soporta WebGL
     */
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Comprueba si el navegador soporta WebGL 2
     * @returns {boolean} Verdadero si soporta WebGL 2
     */
    checkWebGL2Support() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Comprueba la compatibilidad del navegador con el juego
     */
    checkCompatibility() {
        // Limpiar problemas anteriores
        this.issues = [];
        
        // Comprobar requisitos mínimos
        if (!this.browser.supportsWebGL) {
            this.issues.push({
                severity: 'critical',
                message: 'Tu navegador no soporta WebGL, que es necesario para ejecutar este juego.',
                solution: 'Actualiza tu navegador o utiliza un navegador compatible como Chrome, Firefox o Edge.'
            });
        }
        
        if (!this.browser.supportsWebSockets) {
            this.issues.push({
                severity: 'critical',
                message: 'Tu navegador no soporta WebSockets, que son necesarios para la funcionalidad multijugador.',
                solution: 'Actualiza tu navegador o utiliza un navegador compatible como Chrome, Firefox o Edge.'
            });
        }
        
        // Comprobar problemas específicos de navegadores
        if (this.browser.name === 'Internet Explorer') {
            this.issues.push({
                severity: 'critical',
                message: 'Internet Explorer no es compatible con este juego.',
                solution: 'Utiliza un navegador moderno como Chrome, Firefox o Edge.'
            });
        }
        
        if (this.browser.name === 'Safari' && parseFloat(this.browser.version) < 11) {
            this.issues.push({
                severity: 'high',
                message: 'Esta versión de Safari puede tener problemas de rendimiento con el juego.',
                solution: 'Actualiza Safari a la última versión o utiliza Chrome o Firefox.'
            });
        }
        
        // Comprobar problemas específicos de dispositivos móviles
        if (this.browser.isMobile) {
            this.issues.push({
                severity: 'medium',
                message: 'Los dispositivos móviles pueden experimentar menor rendimiento en este juego.',
                solution: 'Para una mejor experiencia, juega en un ordenador de escritorio o portátil.'
            });
            
            if (!this.browser.supportsTouchEvents) {
                this.issues.push({
                    severity: 'high',
                    message: 'Tu dispositivo móvil no soporta eventos táctiles correctamente.',
                    solution: 'Utiliza un dispositivo móvil más reciente o juega en un ordenador.'
                });
            }
        }
        
        // Comprobar WebRTC para comunicación P2P
        if (!this.browser.supportsWebRTC) {
            this.issues.push({
                severity: 'medium',
                message: 'Tu navegador no soporta WebRTC, lo que puede afectar a la calidad de la comunicación en el juego.',
                solution: 'Actualiza tu navegador o utiliza Chrome o Firefox para una mejor experiencia.'
            });
        }
        
        // Comprobar WebAudio para efectos de sonido
        if (!this.browser.supportsWebAudio) {
            this.issues.push({
                severity: 'low',
                message: 'Tu navegador no soporta WebAudio, lo que afectará a los efectos de sonido del juego.',
                solution: 'Actualiza tu navegador o utiliza Chrome o Firefox para una experiencia completa.'
            });
        }
        
        // Comprobar Pointer Lock para controles de cámara
        if (!this.browser.supportsPointerLock) {
            this.issues.push({
                severity: 'medium',
                message: 'Tu navegador no soporta Pointer Lock, lo que afectará a los controles de cámara.',
                solution: 'Actualiza tu navegador o utiliza Chrome o Firefox para una mejor experiencia.'
            });
        }
        
        // Determinar compatibilidad general
        this.browser.isCompatible = !this.issues.some(issue => issue.severity === 'critical');
        
        console.log('Compatibilidad del navegador:', this.browser.isCompatible ? 'Compatible' : 'No compatible');
        console.log('Problemas detectados:', this.issues.length);
    }
    
    /**
     * Aplica soluciones para problemas de compatibilidad
     */
    applyCompatibilityFixes() {
        // Limpiar soluciones anteriores
        this.appliedFixes = [];
        
        // Polyfill para RequestAnimationFrame
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (function() {
                return window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.oRequestAnimationFrame ||
                       window.msRequestAnimationFrame ||
                       function(callback) {
                           window.setTimeout(callback, 1000 / 60);
                       };
            })();
            
            this.appliedFixes.push('Polyfill para RequestAnimationFrame');
        }
        
        // Polyfill para WebSockets
        if (!window.WebSocket && window.MozWebSocket) {
            window.WebSocket = window.MozWebSocket;
            this.appliedFixes.push('Polyfill para WebSockets (Mozilla)');
        }
        
        // Polyfill para Pointer Lock
        if (!navigator.pointer && navigator.webkitPointer) {
            navigator.pointer = navigator.webkitPointer;
            this.appliedFixes.push('Polyfill para Pointer API');
        }
        
        // Polyfill para Fullscreen API
        if (!document.fullscreenElement && 
            (document.mozFullScreenElement || 
             document.webkitFullscreenElement || 
             document.msFullscreenElement)) {
            
            document.fullscreenElement = 
                document.mozFullScreenElement || 
                document.webkitFullscreenElement || 
                document.msFullscreenElement;
                
            document.exitFullscreen = 
                document.exitFullscreen || 
                document.mozCancelFullScreen || 
                document.webkitExitFullscreen || 
                document.msExitFullscreen;
                
            Element.prototype.requestFullscreen = 
                Element.prototype.requestFullscreen || 
                Element.prototype.mozRequestFullScreen || 
                Element.prototype.webkitRequestFullscreen || 
                Element.prototype.msRequestFullscreen;
                
            this.appliedFixes.push('Polyfill para Fullscreen API');
        }
        
        // Adaptaciones para dispositivos móviles
        if (this.browser.isMobile || this.browser.isTablet) {
            // Ajustar controles para táctil
            this.setupTouchControls();
            this.appliedFixes.push('Controles táctiles para dispositivos móviles');
            
            // Ajustar resolución para rendimiento
            if (window.performanceOptimizer) {
                window.performanceOptimizer.setLowQualityPreset();
                this.appliedFixes.push('Calidad gráfica reducida para dispositivos móviles');
            }
        }
        
        // Adaptaciones para Safari
        if (this.browser.name === 'Safari') {
            // Solución para problemas de audio en Safari
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.appliedFixes.push('Polyfill para AudioContext en Safari');
            
            // Solución para problemas de WebGL en Safari
            if (window.performanceOptimizer) {
                // Desactivar sombras en Safari para evitar problemas
                window.performanceOptimizer.config.shadowQuality = 0;
                this.appliedFixes.push('Sombras desactivadas en Safari');
            }
        }
        
        console.log('Soluciones aplicadas:', this.appliedFixes.length);
        return this.appliedFixes;
    }
    
    /**
     * Configura controles táctiles para dispositivos móviles
     */
    setupTouchControls() {
        // Crear elementos de control táctil si no existen
        if (!document.getElementById('touch-controls')) {
            const touchControls = document.createElement('div');
            touchControls.id = 'touch-controls';
            touchControls.style.position = 'absolute';
            touchControls.style.bottom = '20px';
            touchControls.style.left = '20px';
            touchControls.style.right = '20px';
            touchControls.style.display = 'flex';
            touchControls.style.justifyContent = 'space-between';
            touchControls.style.zIndex = '1000';
            
            // Joystick izquierdo para movimiento
            const leftJoystick = document.createElement('div');
            leftJoystick.id = 'left-joystick';
            leftJoystick.className = 'joystick';
            leftJoystick.style.width = '100px';
            leftJoystick.style.height = '100px';
            leftJoystick.style.borderRadius = '50%';
            leftJoystick.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            leftJoystick.style.position = 'relative';
            
            const leftJoystickKnob = document.createElement('div');
            leftJoystickKnob.id = 'left-joystick-knob';
            leftJoystickKnob.style.width = '40px';
            leftJoystickKnob.style.height = '40px';
            leftJoystickKnob.style.borderRadius = '50%';
            leftJoystickKnob.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            leftJoystickKnob.style.position = 'absolute';
            leftJoystickKnob.style.top = '30px';
            leftJoystickKnob.style.left = '30px';
            
            leftJoystick.appendChild(leftJoystickKnob);
            
            // Botones de acción a la derecha
            const actionButtons = document.createElement('div');
            actionButtons.id = 'action-buttons';
            actionButtons.style.display = 'flex';
            actionButtons.style.flexDirection = 'column';
            actionButtons.style.gap = '10px';
            
            const jumpButton = document.createElement('button');
            jumpButton.id = 'jump-button';
            jumpButton.textContent = 'Saltar';
            jumpButton.style.width = '80px';
            jumpButton.style.height = '80px';
            jumpButton.style.borderRadius = '50%';
            jumpButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            jumpButton.style.border = 'none';
            jumpButton.style.color = 'white';
            jumpButton.style.fontSize = '16px';
            
            const actionButton = document.createElement('button');
            actionButton.id = 'action-button';
            actionButton.textContent = 'Acción';
            actionButton.style.width = '80px';
            actionButton.style.height = '80px';
            actionButton.style.borderRadius = '50%';
            actionButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            actionButton.style.border = 'none';
            actionButton.style.color = 'white';
            actionButton.style.fontSize = '16px';
            
            actionButtons.appendChild(jumpButton);
            actionButtons.appendChild(actionButton);
            
            touchControls.appendChild(leftJoystick);
            touchControls.appendChild(actionButtons);
            
            document.body.appendChild(touchControls);
            
            // Configurar eventos táctiles para el joystick
            this.setupJoystickEvents(leftJoystick, leftJoystickKnob);
            
            // Configurar eventos para botones
            jumpButton.addEventListener('touchstart', () => {
                // Simular pulsación de tecla de salto (espacio)
                const event = new KeyboardEvent('keydown', { key: ' ' });
                document.dispatchEvent(event);
            });
            
            jumpButton.addEventListener('touchend', () => {
                // Simular liberación de tecla de salto
                const event = new KeyboardEvent('keyup', { key: ' ' });
                document.dispatchEvent(event);
            });
            
            actionButton.addEventListener('touchstart', () => {
                // Simular pulsación de tecla de acción (E)
                const event = new KeyboardEvent('keydown', { key: 'e' });
                document.dispatchEvent(event);
            });
            
            actionButton.addEventListener('touchend', () => {
                // Simular liberación de tecla de acción
                const event = new KeyboardEvent('keyup', { key: 'e' });
                document.dispatchEvent(event);
            });
        }
    }
    
    /**
     * Configura eventos para el joystick táctil
     * @param {HTMLElement} joystick - Elemento del joystick
     * @param {HTMLElement} knob - Elemento del mando del joystick
     */
    setupJoystickEvents(joystick, knob) {
        let isDragging = false;
        let centerX, centerY;
        let currentX, currentY;
        const maxDistance = 30; // Distancia máxima del joystick
        
        // Calcular centro del joystick
        const updateCenter = () => {
            const rect = joystick.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        };
        
        // Iniciar arrastre
        const startDrag = (clientX, clientY) => {
            isDragging = true;
            updateCenter();
            moveKnob(clientX, clientY);
        };
        
        // Mover mando
        const moveKnob = (clientX, clientY) => {
            if (!isDragging) return;
            
            // Calcular distancia desde el centro
            let deltaX = clientX - centerX;
            let deltaY = clientY - centerY;
            
            // Limitar distancia
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > maxDistance) {
                deltaX = deltaX * maxDistance / distance;
                deltaY = deltaY * maxDistance / distance;
            }
            
            // Actualizar posición del mando
            currentX = deltaX;
            currentY = deltaY;
            knob.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            
            // Simular teclas de movimiento
            simulateMovementKeys(deltaX, deltaY);
        };
        
        // Finalizar arrastre
        const endDrag = () => {
            isDragging = false;
            
            // Volver al centro
            knob.style.transform = 'translate(0, 0)';
            currentX = 0;
            currentY = 0;
            
            // Detener movimiento
            stopMovement();
        };
        
        // Simular teclas de movimiento
        const simulateMovementKeys = (deltaX, deltaY) => {
            // Normalizar deltas a valores entre -1 y 1
            const normalizedX = deltaX / maxDistance;
            const normalizedY = deltaY / maxDistance;
            
            // Determinar teclas a simular
            const pressW = normalizedY < -0.3;
            const pressS = normalizedY > 0.3;
            const pressA = normalizedX < -0.3;
            const pressD = normalizedX > 0.3;
            
            // Simular eventos de teclado
            simulateKey('w', pressW);
            simulateKey('s', pressS);
            simulateKey('a', pressA);
            simulateKey('d', pressD);
        };
        
        // Detener todo movimiento
        const stopMovement = () => {
            simulateKey('w', false);
            simulateKey('s', false);
            simulateKey('a', false);
            simulateKey('d', false);
        };
        
        // Simular pulsación/liberación de tecla
        const keyStates = { w: false, a: false, s: false, d: false };
        const simulateKey = (key, isPressed) => {
            if (keyStates[key] === isPressed) return;
            
            keyStates[key] = isPressed;
            const eventType = isPressed ? 'keydown' : 'keyup';
            const event = new KeyboardEvent(eventType, { key: key });
            document.dispatchEvent(event);
        };
        
        // Eventos táctiles
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
        });
        
        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            moveKnob(touch.clientX, touch.clientY);
        });
        
        joystick.addEventListener('touchend', () => {
            endDrag();
        });
        
        joystick.addEventListener('touchcancel', () => {
            endDrag();
        });
        
        // Eventos de ratón (para pruebas en escritorio)
        joystick.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            moveKnob(e.clientX, e.clientY);
        });
        
        document.addEventListener('mouseup', () => {
            endDrag();
        });
    }
    
    /**
     * Muestra advertencias de compatibilidad al usuario
     */
    showCompatibilityWarnings() {
        // Si no hay problemas, no mostrar nada
        if (this.issues.length === 0) {
            return;
        }
        
        // Crear contenedor de advertencias si no existe
        let warningsContainer = document.getElementById('compatibility-warnings');
        
        if (!warningsContainer) {
            warningsContainer = document.createElement('div');
            warningsContainer.id = 'compatibility-warnings';
            warningsContainer.style.position = 'fixed';
            warningsContainer.style.top = '0';
            warningsContainer.style.left = '0';
            warningsContainer.style.right = '0';
            warningsContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
            warningsContainer.style.color = 'white';
            warningsContainer.style.padding = '10px';
            warningsContainer.style.textAlign = 'center';
            warningsContainer.style.zIndex = '2000';
            warningsContainer.style.fontFamily = 'Arial, sans-serif';
            
            document.body.insertBefore(warningsContainer, document.body.firstChild);
        }
        
        // Mostrar problemas críticos primero
        const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
        
        if (criticalIssues.length > 0) {
            warningsContainer.innerHTML = `
                <strong>¡Atención!</strong> Tu navegador no es compatible con este juego.<br>
                ${criticalIssues[0].message}<br>
                <em>${criticalIssues[0].solution}</em>
                <button id="close-warning" style="margin-left: 20px; padding: 5px 10px;">Entendido</button>
            `;
        } else {
            // Mostrar advertencias no críticas
            const warnings = this.issues.filter(issue => issue.severity !== 'critical');
            
            if (warnings.length > 0) {
                warningsContainer.innerHTML = `
                    <strong>Advertencia:</strong> ${warnings[0].message}<br>
                    <em>${warnings[0].solution}</em>
                    <button id="close-warning" style="margin-left: 20px; padding: 5px 10px;">Entendido</button>
                `;
            }
        }
        
        // Evento para cerrar la advertencia
        document.getElementById('close-warning').addEventListener('click', () => {
            warningsContainer.style.display = 'none';
        });
    }
    
    /**
     * Comprueba si el navegador es compatible con el juego
     * @returns {boolean} Verdadero si el navegador es compatible
     */
    isCompatible() {
        return this.browser.isCompatible;
    }
    
    /**
     * Obtiene información detallada del navegador
     * @returns {Object} Información del navegador
     */
    getBrowserInfo() {
        return { ...this.browser };
    }
    
    /**
     * Obtiene los problemas de compatibilidad detectados
     * @returns {Array} Lista de problemas
     */
    getCompatibilityIssues() {
        return [...this.issues];
    }
    
    /**
     * Obtiene las soluciones aplicadas
     * @returns {Array} Lista de soluciones
     */
    getAppliedFixes() {
        return [...this.appliedFixes];
    }
}

// Crear instancia global
window.browserCompatibility = new BrowserCompatibility();
