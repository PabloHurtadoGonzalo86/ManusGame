// Archivo para implementar las mecánicas básicas del juego
// Este archivo se incluirá en el prototipo para añadir interactividad

// Constantes del juego
const PLAYER_SPEED = 5.0;
const PLAYER_JUMP_FORCE = 10.0;
const GRAVITY = 20.0;
const HEALTH_MAX = 100;
const STAMINA_MAX = 100;
const STAMINA_RECOVERY_RATE = 10; // por segundo
const STAMINA_SPRINT_COST = 20; // por segundo

// Clase para el jugador
class Player {
    constructor(scene, camera, position = new THREE.Vector3(0, 1, 0)) {
        this.scene = scene;
        this.camera = camera;
        this.position = position;
        this.velocity = new THREE.Vector3();
        this.onGround = true;
        this.health = HEALTH_MAX;
        this.stamina = STAMINA_MAX;
        this.isSprinting = false;
        this.isMoving = false;
        this.direction = new THREE.Vector3();
        
        // Crear modelo del jugador
        this.createPlayerModel();
        
        // Configurar cámara en primera persona
        this.setupCamera();
        
        // Configurar controles
        this.setupControls();
    }
    
    createPlayerModel() {
        // En este prototipo, el jugador es representado por una cápsula
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            roughness: 0.7,
            metalness: 0.3
        });
        
        this.model = new THREE.Mesh(geometry, material);
        this.model.position.copy(this.position);
        this.model.castShadow = true;
        this.scene.add(this.model);
        
        // Crear colisionador
        this.collider = new THREE.Sphere(this.position, 0.5);
    }
    
    setupCamera() {
        // Configurar cámara en primera persona
        this.camera.position.set(
            this.position.x,
            this.position.y + 1.6, // Altura de los ojos
            this.position.z
        );
        
        // Crear objeto para controlar la rotación de la cámara
        this.cameraRotation = {
            x: 0,
            y: 0
        };
    }
    
    setupControls() {
        // Estado de las teclas
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false
        };
        
        // Eventos de teclado
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
        
        // Eventos de ratón para la rotación de la cámara
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
        
        // Bloquear el puntero para controles FPS
        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }
    
    handleKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.jump = true;
                break;
            case 'ShiftLeft':
                this.keys.sprint = true;
                break;
        }
    }
    
    handleKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'ShiftLeft':
                this.keys.sprint = false;
                break;
        }
    }
    
    handleMouseMove(event) {
        if (document.pointerLockElement === document.body) {
            // Sensibilidad del ratón
            const sensitivity = 0.002;
            
            // Actualizar rotación de la cámara
            this.cameraRotation.y -= event.movementX * sensitivity;
            this.cameraRotation.x -= event.movementY * sensitivity;
            
            // Limitar la rotación vertical para evitar giros completos
            this.cameraRotation.x = Math.max(
                -Math.PI / 2,
                Math.min(Math.PI / 2, this.cameraRotation.x)
            );
            
            // Aplicar rotación a la cámara
            this.updateCameraRotation();
        }
    }
    
    updateCameraRotation() {
        // Crear cuaternión para la rotación
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(
            new THREE.Euler(
                this.cameraRotation.x,
                this.cameraRotation.y,
                0,
                'YXZ'
            )
        );
        
        // Aplicar rotación a la dirección de la cámara
        this.direction.set(0, 0, -1).applyQuaternion(quaternion);
        
        // Actualizar la rotación del modelo del jugador (solo en Y)
        this.model.rotation.y = this.cameraRotation.y;
    }
    
    update(deltaTime, colliders) {
        // Actualizar posición de la cámara
        this.updateCamera();
        
        // Aplicar gravedad
        this.applyGravity(deltaTime);
        
        // Procesar movimiento
        this.processMovement(deltaTime);
        
        // Comprobar colisiones
        this.checkCollisions(colliders);
        
        // Actualizar stamina
        this.updateStamina(deltaTime);
    }
    
    updateCamera() {
        // Actualizar posición de la cámara para seguir al jugador
        this.camera.position.set(
            this.position.x,
            this.position.y + 1.6, // Altura de los ojos
            this.position.z
        );
    }
    
    applyGravity(deltaTime) {
        // Si no está en el suelo, aplicar gravedad
        if (!this.onGround) {
            this.velocity.y -= GRAVITY * deltaTime;
        } else {
            // Si está en el suelo, mantener una pequeña velocidad negativa
            // para mantener el contacto con el suelo
            this.velocity.y = -0.1;
        }
    }
    
    processMovement(deltaTime) {
        // Calcular velocidad base
        let speed = PLAYER_SPEED;
        
        // Si está corriendo y tiene stamina, aumentar velocidad
        if (this.keys.sprint && this.stamina > 0) {
            this.isSprinting = true;
            speed *= 1.5;
        } else {
            this.isSprinting = false;
        }
        
        // Vector de movimiento
        const moveVector = new THREE.Vector3(0, 0, 0);
        
        // Determinar dirección de movimiento basada en las teclas presionadas
        if (this.keys.forward) moveVector.z -= 1;
        if (this.keys.backward) moveVector.z += 1;
        if (this.keys.left) moveVector.x -= 1;
        if (this.keys.right) moveVector.x += 1;
        
        // Normalizar el vector si hay movimiento diagonal
        if (moveVector.length() > 0) {
            moveVector.normalize();
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
        
        // Convertir movimiento relativo a la cámara
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        const cameraRight = new THREE.Vector3(
            cameraDirection.z,
            0,
            -cameraDirection.x
        );
        
        // Calcular dirección final
        const finalMoveVector = new THREE.Vector3();
        finalMoveVector.addScaledVector(cameraRight, moveVector.x);
        finalMoveVector.addScaledVector(cameraDirection, -moveVector.z);
        
        // Si hay movimiento, aplicar velocidad
        if (finalMoveVector.length() > 0) {
            finalMoveVector.normalize();
            this.velocity.x = finalMoveVector.x * speed;
            this.velocity.z = finalMoveVector.z * speed;
        } else {
            // Si no hay movimiento, aplicar fricción
            this.velocity.x *= 0.9;
            this.velocity.z *= 0.9;
            
            // Si la velocidad es muy pequeña, detener completamente
            if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
            if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0;
        }
        
        // Procesar salto
        if (this.keys.jump && this.onGround) {
            this.velocity.y = PLAYER_JUMP_FORCE;
            this.onGround = false;
        }
        
        // Actualizar posición
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Actualizar modelo
        this.model.position.copy(this.position);
        
        // Actualizar colisionador
        this.collider.center.copy(this.position);
    }
    
    checkCollisions(colliders) {
        // Comprobar colisión con el suelo
        if (this.position.y < 1) {
            this.position.y = 1;
            this.velocity.y = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
        
        // Comprobar colisiones con otros objetos
        for (const collider of colliders) {
            if (this.collider.intersectsSphere(collider)) {
                // Calcular vector de separación
                const pushVector = new THREE.Vector3();
                pushVector.subVectors(this.position, collider.center);
                pushVector.normalize();
                
                // Calcular distancia de penetración
                const penetrationDistance = 
                    this.collider.radius + collider.radius - 
                    this.position.distanceTo(collider.center);
                
                // Aplicar separación
                this.position.addScaledVector(pushVector, penetrationDistance);
                
                // Actualizar modelo y colisionador
                this.model.position.copy(this.position);
                this.collider.center.copy(this.position);
            }
        }
    }
    
    updateStamina(deltaTime) {
        // Si está corriendo, reducir stamina
        if (this.isSprinting && this.isMoving) {
            this.stamina -= STAMINA_SPRINT_COST * deltaTime;
            if (this.stamina < 0) this.stamina = 0;
        } else {
            // Si no está corriendo, recuperar stamina
            this.stamina += STAMINA_RECOVERY_RATE * deltaTime;
            if (this.stamina > STAMINA_MAX) this.stamina = STAMINA_MAX;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        // Efecto visual de daño (flash rojo)
        const damageOverlay = document.getElementById('damageOverlay');
        if (damageOverlay) {
            damageOverlay.style.opacity = '0.7';
            setTimeout(() => {
                damageOverlay.style.opacity = '0';
            }, 300);
        }
        
        return this.health <= 0; // Retorna true si el jugador ha muerto
    }
    
    heal(amount) {
        this.health += amount;
        if (this.health > HEALTH_MAX) this.health = HEALTH_MAX;
    }
}

// Clase para el antagonista "La Hucha"
class Hucha {
    constructor(scene, position = new THREE.Vector3(0, 0, -5)) {
        this.scene = scene;
        this.position = position;
        this.velocity = new THREE.Vector3();
        this.target = null; // Objetivo a perseguir (jugador)
        this.state = 'idle'; // Estados: idle, chase, attack
        this.detectionRadius = 10; // Radio de detección del jugador
        this.attackRadius = 2; // Radio de ataque
        this.speed = 3.0; // Velocidad de movimiento
        this.attackCooldown = 0; // Tiempo de espera entre ataques
        this.attackDamage = 20; // Daño por ataque
        
        // Crear modelo
        this.createModel();
        
        // Crear colisionador
        this.collider = new THREE.Sphere(this.position, 1.2);
    }
    
    createModel() {
        // Grupo para contener todas las partes de La Hucha
        this.model = new THREE.Group();
        
        // Cuerpo principal (cilindro)
        const bodyGeometry = new THREE.CylinderGeometry(1, 1.2, 3, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // Marrón
            roughness: 0.7,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        this.model.add(body);
        
        // Cabeza (esfera)
        const headGeometry = new THREE.SphereGeometry(1, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xA0522D, // Marrón más claro
            roughness: 0.7,
            metalness: 0.3
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.5;
        head.castShadow = true;
        this.model.add(head);
        
        // Ojos (esferas)
        const eyeGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const eyeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000, // Rojo
            roughness: 0.3,
            metalness: 0.7,
            emissive: 0xFF0000,
            emissiveIntensity: 0.5
        });
        
        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(-0.4, 3.7, 0.8);
        this.model.add(this.leftEye);
        
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(0.4, 3.7, 0.8);
        this.model.add(this.rightEye);
        
        // Ranura (para las monedas)
        const slotGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.3);
        const slotMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000, 
            roughness: 0.9,
            metalness: 0.1
        });
        const slot = new THREE.Mesh(slotGeometry, slotMaterial);
        slot.position.set(0, 4, 0.8);
        this.model.add(slot);
        
        // Posicionar en la escena
        this.model.position.copy(this.position);
        this.scene.add(this.model);
    }
    
    update(deltaTime, player) {
        // Actualizar cooldown de ataque
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Establecer jugador como objetivo
        this.target = player;
        
        // Actualizar estado según la distancia al jugador
        this.updateState();
        
        // Comportamiento según el estado
        switch (this.state) {
            case 'idle':
                this.idle(deltaTime);
                break;
            case 'chase':
                this.chase(deltaTime);
                break;
            case 'attack':
                this.attack(deltaTime);
                break;
        }
        
        // Aplicar movimiento
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.model.position.copy(this.position);
        
        // Actualizar colisionador
        this.collider.center.copy(this.position);
    }
    
    updateState() {
        if (!this.target) return;
        
        // Calcular distancia al objetivo
        const distanceToTarget = this.position.distanceTo(this.target.position);
        
        // Cambiar estado según la distancia
        if (distanceToTarget <= this.attackRadius) {
            this.state = 'attack';
        } else if (distanceToTarget <= this.detectionRadius) {
            this.state = 'chase';
        } else {
            this.state = 'idle';
        }
    }
    
    idle(deltaTime) {
        // En estado idle, La Hucha se mueve lentamente en un patrón aleatorio
        
        // Reducir velocidad gradualmente
        this.velocity.multiplyScalar(0.95);
        
        // Movimiento aleatorio ocasional
        if (Math.random() < 0.01) {
            this.velocity.x = (Math.random() - 0.5) * this.speed * 0.5;
            this.velocity.z = (Math.random() - 0.5) * this.speed * 0.5;
        }
        
        // Animación de flotación
        this.model.position.y = this.position.y + Math.sin(Date.now() * 0.001) * 0.2;
        
        // Rotación lenta
        this.model.rotation.y += deltaTime * 0.5;
    }
    
    chase(deltaTime) {
        if (!this.target) return;
        
        // Calcular dirección hacia el objetivo
        const direction = new THREE.Vector3();
        direction.subVectors(this.target.position, this.position);
        direction.y = 0; // Mantener en el mismo plano Y
        direction.normalize();
        
        // Establecer velocidad
        this.velocity.x = direction.x * this.speed;
        this.velocity.z = direction.z * this.speed;
        
        // Orientar modelo hacia el objetivo
        if (direction.length() > 0.1) {
            this.model.lookAt(
                this.target.position.x,
                this.model.position.y,
                this.target.position.z
            );
        }
        
        // Animación de "flotación agresiva"
        this.model.position.y = this.position.y + Math.sin(Date.now() * 0.003) * 0.3;
        
        // Intensificar brillo de ojos
        this.leftEye.material.emissiveIntensity = 0.8;
        this.rightEye.material.emissiveIntensity = 0.8;
    }
    
    attack(deltaTime) {
        if (!this.target) return;
        
        // Detener movimiento durante el ataque
        this.velocity.set(0, 0, 0);
        
        // Orientar hacia el objetivo
        this.model.lookAt(
            this.target.position.x,
            this.model.position.y,
            this.target.position.z
        );
        
        // Realizar ataque si el cooldown ha terminado
        if (this.attackCooldown <= 0) {
            // Animación de ataque (movimiento rápido hacia adelante y atrás)
            const attackDirection = new THREE.Vector3();
            attackDirection.subVectors(this.target.position, this.position);
            attackDirection.y = 0;
            attackDirection.normalize();
            
            // Aplicar daño al jugador
            const playerDied = this.target.takeDamage(this.attackDamage);
            
            // Si el jugador muere, cambiar a estado idle
            if (playerDied) {
                this.state = 'idle';
            }
            
            // Establecer cooldown
            this.attackCooldown = 2.0; // 2 segundos entre ataques
            
            // Efecto visual de ataque
            this.leftEye.material.emissiveIntensity = 1.0;
            this.rightEye.material.emissiveIntensity = 1.0;
            
            // Sonido de ataque (si está disponible)
            if (typeof playSound === 'function') {
                playSound('huchaAttack');
            }
        }
    }
}

// Clase para gestionar el juego
class GameManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.player = null;
        this.enemies = [];
        this.colliders = [];
        this.gameState = 'menu'; // Estados: menu, playing, gameOver, victory
        this.score = 0;
        
        // Crear interfaz de usuario
        this.createUI();
    }
    
    createUI() {
        // Crear elementos de UI
        const uiContainer = document.createElement('div');
        uiContainer.id = 'uiContainer';
        uiContainer.style.position = 'absolute';
        uiContainer.style.top = '0';
        uiContainer.style.left = '0';
        uiContainer.style.width = '100%';
        uiContainer.style.height = '100%';
        uiContainer.style.pointerEvents = 'none';
        document.body.appendChild(uiContainer);
        
        // Barra de salud
        const healthBar = document.createElement('div');
        healthBar.id = 'healthBar';
        healthBar.style.position = 'absolute';
        healthBar.style.bottom = '20px';
        healthBar.style.left = '20px';
        healthBar.style.width = '200px';
        healthBar.style.height = '20px';
        healthBar.style.backgroundColor = '#333';
        healthBar.style.border = '2px solid #fff';
        healthBar.style.borderRadius = '10px';
        healthBar.style.overflow = 'hidden';
        uiContainer.appendChild(healthBar);
        
        const healthFill = document.createElement('div');
        healthFill.id = 'healthFill';
        healthFill.style.width = '100%';
        healthFill.style.height = '100%';
        healthFill.style.backgroundColor = '#f00';
        healthFill.style.transition = 'width 0.3s';
        healthBar.appendChild(healthFill);
        
        // Barra de stamina
        const staminaBar = document.createElement('div');
        staminaBar.id = 'staminaBar';
        staminaBar.style.position = 'absolute';
        staminaBar.style.bottom = '45px';
        staminaBar.style.left = '20px';
        staminaBar.style.width = '200px';
        staminaBar.style.height = '10px';
        staminaBar.style.backgroundColor = '#333';
        staminaBar.style.border = '2px solid #fff';
        staminaBar.style.borderRadius = '5px';
        staminaBar.style.overflow = 'hidden';
        uiContainer.appendChild(staminaBar);
        
        const staminaFill = document.createElement('div');
        staminaFill.id = 'staminaFill';
        staminaFill.style.width = '100%';
        staminaFill.style.height = '100%';
        staminaFill.style.backgroundColor = '#0f0';
        staminaFill.style.transition = 'width 0.3s';
        staminaBar.appendChild(staminaFill);
        
        // Puntuación
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'scoreDisplay';
        scoreDisplay.style.position = 'absolute';
        scoreDisplay.style.top = '20px';
        scoreDisplay.style.right = '20px';
        scoreDisplay.style.color = '#fff';
        scoreDisplay.style.fontSize = '24px';
        scoreDisplay.style.fontWeight = 'bold';
        scoreDisplay.style.textShadow = '2px 2px 2px #000';
        scoreDisplay.textContent = 'Puntuación: 0';
        uiContainer.appendChild(scoreDisplay);
        
        // Punto de mira
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.style.position = 'absolute';
        crosshair.style.top = '50%';
        crosshair.style.left = '50%';
        crosshair.style.width = '10px';
        crosshair.style.height = '10px';
        crosshair.style.borderRadius = '50%';
        crosshair.style.backgroundColor = '#fff';
        crosshair.style.transform = 'translate(-50%, -50%)';
        uiContainer.appendChild(crosshair);
        
        // Overlay de daño
        const damageOverlay = document.createElement('div');
        damageOverlay.id = 'damageOverlay';
        damageOverlay.style.position = 'absolute';
        damageOverlay.style.top = '0';
        damageOverlay.style.left = '0';
        damageOverlay.style.width = '100%';
        damageOverlay.style.height = '100%';
        damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
        damageOverlay.style.pointerEvents = 'none';
        damageOverlay.style.transition = 'opacity 0.3s';
        damageOverlay.style.opacity = '0';
        uiContainer.appendChild(damageOverlay);
        
        // Menú principal
        const mainMenu = document.createElement('div');
        mainMenu.id = 'mainMenu';
        mainMenu.style.position = 'absolute';
        mainMenu.style.top = '50%';
        mainMenu.style.left = '50%';
        mainMenu.style.transform = 'translate(-50%, -50%)';
        mainMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        mainMenu.style.padding = '20px';
        mainMenu.style.borderRadius = '10px';
        mainMenu.style.textAlign = 'center';
        mainMenu.style.color = '#fff';
        mainMenu.style.pointerEvents = 'auto';
        uiContainer.appendChild(mainMenu);
        
        const title = document.createElement('h1');
        title.textContent = 'La Hucha de Paredes';
        title.style.marginBottom = '20px';
        mainMenu.appendChild(title);
        
        const startButton = document.createElement('button');
        startButton.textContent = 'Iniciar Juego';
        startButton.style.padding = '10px 20px';
        startButton.style.fontSize = '18px';
        startButton.style.backgroundColor = '#4CAF50';
        startButton.style.color = 'white';
        startButton.style.border = 'none';
        startButton.style.borderRadius = '5px';
        startButton.style.cursor = 'pointer';
        startButton.style.marginBottom = '10px';
        startButton.addEventListener('click', () => {
            this.startGame();
        });
        mainMenu.appendChild(startButton);
        
        // Pantalla de Game Over
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'gameOverScreen';
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.top = '50%';
        gameOverScreen.style.left = '50%';
        gameOverScreen.style.transform = 'translate(-50%, -50%)';
        gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverScreen.style.padding = '20px';
        gameOverScreen.style.borderRadius = '10px';
        gameOverScreen.style.textAlign = 'center';
        gameOverScreen.style.color = '#fff';
        gameOverScreen.style.display = 'none';
        gameOverScreen.style.pointerEvents = 'auto';
        uiContainer.appendChild(gameOverScreen);
        
        const gameOverTitle = document.createElement('h1');
        gameOverTitle.textContent = 'Game Over';
        gameOverTitle.style.color = '#ff0000';
        gameOverTitle.style.marginBottom = '20px';
        gameOverScreen.appendChild(gameOverTitle);
        
        const finalScore = document.createElement('p');
        finalScore.id = 'finalScore';
        finalScore.textContent = 'Puntuación final: 0';
        finalScore.style.fontSize = '20px';
        finalScore.style.marginBottom = '20px';
        gameOverScreen.appendChild(finalScore);
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Reiniciar';
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '18px';
        restartButton.style.backgroundColor = '#4CAF50';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        restartButton.addEventListener('click', () => {
            this.restartGame();
        });
        gameOverScreen.appendChild(restartButton);
    }
    
    startGame() {
        // Cambiar estado del juego
        this.gameState = 'playing';
        
        // Ocultar menú principal
        document.getElementById('mainMenu').style.display = 'none';
        
        // Crear jugador
        this.player = new Player(this.scene, this.camera);
        
        // Crear enemigo (La Hucha)
        const hucha = new Hucha(this.scene, new THREE.Vector3(0, 0, -5));
        this.enemies.push(hucha);
        
        // Añadir colisionadores
        this.colliders.push(hucha.collider);
        
        // Bloquear el puntero para controles FPS
        document.body.requestPointerLock();
    }
    
    gameOver() {
        // Cambiar estado del juego
        this.gameState = 'gameOver';
        
        // Mostrar pantalla de Game Over
        const gameOverScreen = document.getElementById('gameOverScreen');
        gameOverScreen.style.display = 'block';
        
        // Actualizar puntuación final
        document.getElementById('finalScore').textContent = `Puntuación final: ${this.score}`;
        
        // Liberar el puntero
        document.exitPointerLock();
    }
    
    restartGame() {
        // Reiniciar puntuación
        this.score = 0;
        
        // Ocultar pantalla de Game Over
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // Eliminar enemigos actuales
        for (const enemy of this.enemies) {
            this.scene.remove(enemy.model);
        }
        this.enemies = [];
        this.colliders = [];
        
        // Eliminar jugador actual
        if (this.player) {
            this.scene.remove(this.player.model);
        }
        
        // Iniciar nuevo juego
        this.startGame();
    }
    
    update(deltaTime) {
        // Actualizar según el estado del juego
        switch (this.gameState) {
            case 'playing':
                this.updatePlaying(deltaTime);
                break;
            case 'gameOver':
                // No hay actualizaciones en estado Game Over
                break;
            case 'menu':
                // Posibles animaciones de menú
                break;
        }
    }
    
    updatePlaying(deltaTime) {
        // Actualizar jugador
        if (this.player) {
            this.player.update(deltaTime, this.colliders);
            
            // Comprobar si el jugador ha muerto
            if (this.player.health <= 0) {
                this.gameOver();
                return;
            }
            
            // Actualizar UI de salud y stamina
            document.getElementById('healthFill').style.width = `${(this.player.health / HEALTH_MAX) * 100}%`;
            document.getElementById('staminaFill').style.width = `${(this.player.stamina / STAMINA_MAX) * 100}%`;
        }
        
        // Actualizar enemigos
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, this.player);
        }
        
        // Actualizar puntuación (ejemplo: aumentar con el tiempo)
        this.score += deltaTime * 10;
        document.getElementById('scoreDisplay').textContent = `Puntuación: ${Math.floor(this.score)}`;
    }
}

// Función para inicializar las mecánicas del juego
function initGameMechanics(scene, camera) {
    // Crear gestor de juego
    const gameManager = new GameManager(scene, camera);
    
    // Devolver el gestor para su uso en el bucle principal
    return gameManager;
}
