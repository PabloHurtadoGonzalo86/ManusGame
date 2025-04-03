/**
 * Sistema de Personalización para "La Hucha de Paredes"
 * Gestiona la personalización del avatar del jugador
 */

class CustomizationSystem {
    constructor() {
        // Referencias a elementos del DOM
        this.canvas = document.getElementById('avatar-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Opciones de personalización
        this.skinColorOptions = document.getElementById('skin-colors');
        this.hairColorOptions = document.getElementById('hair-colors');
        this.eyeColorOptions = document.getElementById('eye-colors');
        this.outfitColorOptions = document.getElementById('outfit-colors');
        
        this.hairStyleSlider = document.getElementById('hair-style');
        this.outfitStyleSlider = document.getElementById('outfit-style');
        
        // Configuración actual del avatar
        this.avatarConfig = {
            skinColor: '#FFD8B4',
            hairColor: '#090806',
            hairStyle: 0,
            eyeColor: '#634E34',
            outfitStyle: 0,
            outfitColor: '#1F1F1F'
        };
        
        // Recursos gráficos
        this.resources = {
            hairStyles: [
                'pelo_corto.png',
                'pelo_medio.png',
                'pelo_largo.png',
                'pelo_rizado.png',
                'pelo_mohawk.png',
                'pelo_calvo.png'
            ],
            outfitStyles: [
                'ropa_casual.png',
                'ropa_formal.png',
                'ropa_deportiva.png',
                'ropa_medica.png',
                'ropa_seguridad.png',
                'ropa_paciente.png'
            ]
        };
        
        // Inicializar eventos
        this.initEvents();
    }
    
    /**
     * Inicializa los eventos de personalización
     */
    initEvents() {
        // Eventos para selección de colores
        this.initColorSelectors(this.skinColorOptions, 'skinColor');
        this.initColorSelectors(this.hairColorOptions, 'hairColor');
        this.initColorSelectors(this.eyeColorOptions, 'eyeColor');
        this.initColorSelectors(this.outfitColorOptions, 'outfitColor');
        
        // Eventos para sliders
        this.hairStyleSlider.addEventListener('input', () => {
            this.avatarConfig.hairStyle = parseInt(this.hairStyleSlider.value);
            this.updatePreview();
        });
        
        this.outfitStyleSlider.addEventListener('input', () => {
            this.avatarConfig.outfitStyle = parseInt(this.outfitStyleSlider.value);
            this.updatePreview();
        });
    }
    
    /**
     * Inicializa los selectores de color
     * @param {HTMLElement} container - Contenedor de opciones de color
     * @param {string} property - Propiedad del avatar a modificar
     */
    initColorSelectors(container, property) {
        const options = container.querySelectorAll('.color-option');
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Quitar selección anterior
                container.querySelector('.selected').classList.remove('selected');
                
                // Seleccionar nueva opción
                option.classList.add('selected');
                
                // Actualizar configuración
                this.avatarConfig[property] = option.getAttribute('data-color');
                
                // Actualizar vista previa
                this.updatePreview();
            });
        });
    }
    
    /**
     * Inicializa la vista previa del avatar
     */
    initPreview() {
        // Cargar configuración guardada si existe
        this.loadSavedConfig();
        
        // Actualizar UI con la configuración cargada
        this.updateUI();
        
        // Generar vista previa inicial
        this.updatePreview();
    }
    
    /**
     * Carga la configuración guardada del avatar
     */
    loadSavedConfig() {
        const savedConfig = localStorage.getItem('avatarConfig');
        
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                this.avatarConfig = { ...this.avatarConfig, ...parsedConfig };
            } catch (e) {
                console.error('Error al cargar la configuración del avatar:', e);
            }
        }
    }
    
    /**
     * Actualiza la UI con la configuración actual
     */
    updateUI() {
        // Actualizar selección de colores
        this.updateColorSelection(this.skinColorOptions, this.avatarConfig.skinColor);
        this.updateColorSelection(this.hairColorOptions, this.avatarConfig.hairColor);
        this.updateColorSelection(this.eyeColorOptions, this.avatarConfig.eyeColor);
        this.updateColorSelection(this.outfitColorOptions, this.avatarConfig.outfitColor);
        
        // Actualizar sliders
        this.hairStyleSlider.value = this.avatarConfig.hairStyle;
        this.outfitStyleSlider.value = this.avatarConfig.outfitStyle;
    }
    
    /**
     * Actualiza la selección de color en la UI
     * @param {HTMLElement} container - Contenedor de opciones de color
     * @param {string} color - Color seleccionado
     */
    updateColorSelection(container, color) {
        // Quitar selección anterior
        const currentSelected = container.querySelector('.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        
        // Seleccionar nueva opción
        const newSelected = container.querySelector(`[data-color="${color}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
        }
    }
    
    /**
     * Actualiza la vista previa del avatar
     */
    updatePreview() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar avatar
        this.drawAvatar();
    }
    
    /**
     * Dibuja el avatar en el canvas
     */
    drawAvatar() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Dibujar fondo
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0, 0, width, height);
        
        // Dibujar cuerpo base
        this.drawBody();
        
        // Dibujar ropa
        this.drawOutfit();
        
        // Dibujar cabeza
        this.drawHead();
        
        // Dibujar pelo
        this.drawHair();
        
        // Dibujar ojos
        this.drawEyes();
    }
    
    /**
     * Dibuja el cuerpo del avatar
     */
    drawBody() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Torso
        this.ctx.fillStyle = this.avatarConfig.skinColor;
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2, height / 2 + 50, 40, 80, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Brazos
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2 - 50, height / 2 + 30, 15, 60, Math.PI / 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2 + 50, height / 2 + 30, 15, 60, -Math.PI / 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Manos
        this.ctx.beginPath();
        this.ctx.arc(width / 2 - 60, height / 2 + 80, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(width / 2 + 60, height / 2 + 80, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Dibuja la ropa del avatar
     */
    drawOutfit() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Color base de la ropa
        this.ctx.fillStyle = this.avatarConfig.outfitColor;
        
        // Estilo de ropa según selección
        switch (this.avatarConfig.outfitStyle) {
            case 0: // Casual
                // Camiseta
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2, height / 2 + 50, 45, 70, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Cuello en V
                this.ctx.fillStyle = this.avatarConfig.skinColor;
                this.ctx.beginPath();
                this.ctx.moveTo(width / 2, height / 2 - 10);
                this.ctx.lineTo(width / 2 - 20, height / 2 + 30);
                this.ctx.lineTo(width / 2 + 20, height / 2 + 30);
                this.ctx.fill();
                break;
                
            case 1: // Formal
                // Camisa
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2, height / 2 + 50, 45, 70, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Cuello de camisa
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.moveTo(width / 2, height / 2 - 10);
                this.ctx.lineTo(width / 2 - 25, height / 2 + 20);
                this.ctx.lineTo(width / 2 + 25, height / 2 + 20);
                this.ctx.fill();
                
                // Corbata
                this.ctx.fillStyle = '#AA0000';
                this.ctx.beginPath();
                this.ctx.moveTo(width / 2, height / 2 - 5);
                this.ctx.lineTo(width / 2 - 10, height / 2 + 15);
                this.ctx.lineTo(width / 2, height / 2 + 60);
                this.ctx.lineTo(width / 2 + 10, height / 2 + 15);
                this.ctx.fill();
                break;
                
            case 2: // Deportiva
                // Camiseta deportiva
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2, height / 2 + 50, 45, 70, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Líneas decorativas
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 5;
                this.ctx.beginPath();
                this.ctx.moveTo(width / 2 - 40, height / 2);
                this.ctx.lineTo(width / 2 + 40, height / 2);
                this.ctx.stroke();
                
                this.ctx.beginPath();
                this.ctx.moveTo(width / 2 - 40, height / 2 + 20);
                this.ctx.lineTo(width / 2 + 40, height / 2 + 20);
                this.ctx.stroke();
                break;
                
            case 3: // Médica
                // Bata médica
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2, height / 2 + 50, 45, 70, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Detalles de la bata
                this.ctx.strokeStyle = this.avatarConfig.outfitColor;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(width / 2 - 20, height / 2 - 10);
                this.ctx.lineTo(width / 2 - 20, height / 2 + 80);
                this.ctx.stroke();
                
                // Bolsillo
                this.ctx.strokeRect(width / 2 - 10, height / 2 + 30, 20, 25);
                break;
                
            case 4: // Seguridad
                // Uniforme de seguridad
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2, height / 2 + 50, 45, 70, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Placa
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(width / 2 - 20, height / 2 + 20, 10, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Cinturón
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(width / 2 - 45, height / 2 + 60, 90, 10);
                break;
                
            case 5: // Paciente
                // Bata de paciente
                this.ctx.fillStyle = '#E0E0E0';
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2, height / 2 + 50, 45, 70, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Patrón de lunares (manchas de sangre)
                this.ctx.fillStyle = '#990000';
                for (let i = 0; i < 10; i++) {
                    const x = width / 2 + (Math.random() - 0.5) * 80;
                    const y = height / 2 + 50 + (Math.random() - 0.5) * 120;
                    const radius = Math.random() * 5 + 2;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
        }
    }
    
    /**
     * Dibuja la cabeza del avatar
     */
    drawHead() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Cabeza
        this.ctx.fillStyle = this.avatarConfig.skinColor;
        this.ctx.beginPath();
        this.ctx.arc(width / 2, height / 2 - 50, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cuello
        this.ctx.beginPath();
        this.ctx.rect(width / 2 - 15, height / 2, 30, 30);
        this.ctx.fill();
        
        // Orejas
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2 - 50, height / 2 - 50, 10, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2 + 50, height / 2 - 50, 10, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Boca
        this.ctx.fillStyle = '#CC6666';
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2, height / 2 - 30, 20, 5, 0, 0, Math.PI);
        this.ctx.fill();
        
        // Nariz
        this.ctx.fillStyle = this.avatarConfig.skinColor;
        this.ctx.beginPath();
        this.ctx.arc(width / 2, height / 2 - 45, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Dibuja el pelo del avatar
     */
    drawHair() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Color del pelo
        this.ctx.fillStyle = this.avatarConfig.hairColor;
        
        // Estilo de pelo según selección
        switch (this.avatarConfig.hairStyle) {
            case 0: // Pelo corto
                this.ctx.beginPath();
                this.ctx.arc(width / 2, height / 2 - 70, 40, 0, Math.PI, true);
                this.ctx.fill();
                
                // Laterales
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2 - 45, height / 2 - 60, 15, 25, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2 + 45, height / 2 - 60, 15, 25, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 1: // Pelo medio
                this.ctx.beginPath();
                this.ctx.arc(width / 2, height / 2 - 70, 45, 0, Math.PI, true);
                this.ctx.fill();
                
                // Laterales más largos
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2 - 45, height / 2 - 50, 20, 40, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2 + 45, height / 2 - 50, 20, 40, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 2: // Pelo largo
                this.ctx.beginPath();
                this.ctx.arc(width / 2, height / 2 - 70, 50, 0, Math.PI, true);
                this.ctx.fill();
                
                // Pelo largo cayendo
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2, height / 2, 60, 100, 0, 0, Math.PI, true);
                this.ctx.fill();
                break;
                
            case 3: // Pelo rizado
                for (let i = 0; i < 20; i++) {
                    const angle = (i / 20) * Math.PI * 2;
                    const x = width / 2 + Math.cos(angle) * 60;
                    const y = height / 2 - 70 + Math.sin(angle) * 60;
                    const radius = Math.random() * 10 + 10;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
                
            case 4: // Mohawk
                this.ctx.beginPath();
                this.ctx.moveTo(width / 2 - 10, height / 2 - 50);
                this.ctx.lineTo(width / 2, height / 2 - 120);
                this.ctx.lineTo(width / 2 + 10, height / 2 - 50);
                this.ctx.fill();
                
                // Laterales rapados
                this.ctx.fillStyle = this.avatarConfig.skinColor;
                this.ctx.beginPath();
                this.ctx.arc(width / 2, height / 2 - 50, 50, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Mohawk por encima
                this.ctx.fillStyle = this.avatarConfig.hairColor;
                this.ctx.beginPath();
                this.ctx.moveTo(width / 2 - 10, height / 2 - 50);
                this.ctx.lineTo(width / 2, height / 2 - 120);
                this.ctx.lineTo(width / 2 + 10, height / 2 - 50);
                this.ctx.fill();
                break;
                
            case 5: // Calvo
                // Solo un poco de pelo en los lados
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2 - 40, height / 2 - 40, 15, 20, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.ellipse(width / 2 + 40, height / 2 - 40, 15, 20, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
    }
    
    /**
     * Dibuja los ojos del avatar
     */
    drawEyes() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Blancos de los ojos
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2 - 20, height / 2 - 60, 10, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2 + 20, height / 2 - 60, 10, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Iris
        this.ctx.fillStyle = this.avatarConfig.eyeColor;
        this.ctx.beginPath();
        this.ctx.arc(width / 2 - 20, height / 2 - 60, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(width / 2 + 20, height / 2 - 60, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupilas
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(width / 2 - 20, height / 2 - 60, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(width / 2 + 20, height / 2 - 60, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cejas
        this.ctx.fillStyle = this.avatarConfig.hairColor;
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2 - 20, height / 2 - 75, 15, 3, 0, 0, Math.PI);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.ellipse(width / 2 + 20, height / 2 - 75, 15, 3, 0, 0, Math.PI);
        this.ctx.fill();
    }
    
    /**
     * Guarda la configuración actual del avatar
     */
    saveCustomization() {
        // Guardar en localStorage
        localStorage.setItem('avatarConfig', JSON.stringify(this.avatarConfig));
        
        // Notificar al sistema de lobby
        if (window.lobbySystem) {
            window.lobbySystem.playerAvatar = { ...this.avatarConfig };
        }
        
        // Notificar al usuario
        if (window.uiManager) {
            window.uiManager.addChatMessage('Sistema', 'Personalización guardada correctamente', true);
        }
    }
    
    /**
     * Obtiene la configuración actual del avatar
     * @returns {Object} Configuración del avatar
     */
    getAvatarConfig() {
        return { ...this.avatarConfig };
    }
}

// Crear instancia global
window.customizationSystem = new CustomizationSystem();
