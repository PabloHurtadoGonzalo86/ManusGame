/**
 * Integración de optimizaciones y compatibilidad para "La Hucha de Paredes"
 * Integra los sistemas de optimización, compatibilidad y pruebas de carga
 */

class GameOptimizationManager {
    constructor() {
        // Referencias a los sistemas
        this.performanceOptimizer = null;
        this.browserCompatibility = null;
        this.loadTester = null;
        
        // Estado de inicialización
        this.initialized = false;
        
        // Configuración
        this.config = {
            // Activar optimización automática
            autoOptimize: true,
            
            // Mostrar estadísticas de rendimiento
            showPerformanceStats: false,
            
            // Mostrar advertencias de compatibilidad
            showCompatibilityWarnings: true,
            
            // Intervalo de monitoreo (ms)
            monitoringInterval: 5000,
            
            // Umbral de FPS para optimización
            fpsThreshold: 45,
            
            // Umbral de memoria para optimización (MB)
            memoryThreshold: 500
        };
        
        // Métricas de rendimiento
        this.metrics = {
            lastCheck: 0,
            averageFPS: 60,
            memoryUsage: 0,
            drawCalls: 0,
            triangleCount: 0,
            networkLatency: 0
        };
        
        // Intervalo de monitoreo
        this.monitoringInterval = null;
    }
    
    /**
     * Inicializa el gestor de optimización
     * @param {Object} renderer - Instancia del renderer de Three.js
     * @param {Object} scene - Instancia de la escena de Three.js
     * @param {Object} camera - Instancia de la cámara de Three.js
     */
    init(renderer, scene, camera) {
        console.log('Inicializando GameOptimizationManager...');
        
        // Inicializar optimizador de rendimiento
        if (window.performanceOptimizer) {
            this.performanceOptimizer = window.performanceOptimizer;
            this.performanceOptimizer.init(renderer, scene, camera);
            console.log('PerformanceOptimizer inicializado');
        } else {
            console.warn('PerformanceOptimizer no encontrado');
        }
        
        // Inicializar sistema de compatibilidad
        if (window.browserCompatibility) {
            this.browserCompatibility = window.browserCompatibility;
            
            // Aplicar soluciones de compatibilidad
            const fixes = this.browserCompatibility.applyCompatibilityFixes();
            console.log('BrowserCompatibility inicializado, soluciones aplicadas:', fixes.length);
            
            // Mostrar advertencias si es necesario
            if (this.config.showCompatibilityWarnings) {
                this.browserCompatibility.showCompatibilityWarnings();
            }
        } else {
            console.warn('BrowserCompatibility no encontrado');
        }
        
        // Inicializar sistema de pruebas de carga
        if (window.loadTester) {
            this.loadTester = window.loadTester;
            console.log('LoadTester inicializado');
        } else {
            console.warn('LoadTester no encontrado');
        }
        
        // Iniciar monitoreo de rendimiento
        this.startMonitoring();
        
        this.initialized = true;
        console.log('GameOptimizationManager inicializado correctamente');
        
        return this.initialized;
    }
    
    /**
     * Inicia el monitoreo de rendimiento
     */
    startMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        this.monitoringInterval = setInterval(() => {
            this.checkPerformance();
        }, this.config.monitoringInterval);
        
        console.log('Monitoreo de rendimiento iniciado');
    }
    
    /**
     * Detiene el monitoreo de rendimiento
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('Monitoreo de rendimiento detenido');
    }
    
    /**
     * Comprueba el rendimiento y aplica optimizaciones si es necesario
     */
    checkPerformance() {
        if (!this.performanceOptimizer) return;
        
        const now = performance.now();
        this.metrics.lastCheck = now;
        
        // Obtener métricas actuales
        const stats = this.performanceOptimizer.getPerformanceStats();
        this.metrics.averageFPS = stats.fps;
        this.metrics.memoryUsage = stats.memoryUsage;
        this.metrics.drawCalls = stats.drawCalls;
        this.metrics.triangleCount = stats.triangleCount;
        this.metrics.networkLatency = stats.networkLatency;
        
        // Comprobar si es necesario optimizar
        if (this.config.autoOptimize) {
            if (this.metrics.averageFPS < this.config.fpsThreshold) {
                this.applyPerformanceOptimizations();
            }
            
            if (this.metrics.memoryUsage > this.config.memoryThreshold) {
                this.applyMemoryOptimizations();
            }
        }
        
        // Actualizar estadísticas si están activadas
        if (this.config.showPerformanceStats) {
            this.performanceOptimizer.showPerformanceStats(true);
        }
    }
    
    /**
     * Aplica optimizaciones de rendimiento
     */
    applyPerformanceOptimizations() {
        console.log('Aplicando optimizaciones de rendimiento...');
        
        if (!this.performanceOptimizer) return;
        
        // Reducir calidad gráfica si es necesario
        if (this.performanceOptimizer.config.graphicsQuality > 0) {
            this.performanceOptimizer.config.graphicsQuality--;
            
            if (this.performanceOptimizer.config.graphicsQuality === 0) {
                this.performanceOptimizer.setLowQualityPreset();
            } else if (this.performanceOptimizer.config.graphicsQuality === 1) {
                this.performanceOptimizer.setMediumQualityPreset();
            }
            
            this.performanceOptimizer.applySettings();
            
            console.log('Calidad gráfica reducida a:', 
                      this.performanceOptimizer.config.graphicsQuality === 0 ? 'Baja' : 
                      this.performanceOptimizer.config.graphicsQuality === 1 ? 'Media' : 'Alta');
        }
        
        // Aplicar oclusión
        if (this.performanceOptimizer.config.enableOcclusion && 
            this.performanceOptimizer.scene && 
            this.performanceOptimizer.camera) {
            this.performanceOptimizer.implementOcclusion(
                this.performanceOptimizer.scene, 
                this.performanceOptimizer.camera
            );
        }
    }
    
    /**
     * Aplica optimizaciones de memoria
     */
    applyMemoryOptimizations() {
        console.log('Aplicando optimizaciones de memoria...');
        
        if (!this.performanceOptimizer) return;
        
        // Reducir calidad de texturas
        if (this.performanceOptimizer.config.textureQuality > 0) {
            this.performanceOptimizer.config.textureQuality--;
            this.performanceOptimizer.applySettings();
            console.log('Calidad de texturas reducida');
        }
        
        // Descargar assets no utilizados
        if (this.performanceOptimizer.config.unloadUnusedAssets) {
            // En una implementación real, aquí se descargarían los assets
            console.log('Descargando assets no utilizados');
        }
    }
    
    /**
     * Inicia una prueba de carga del sistema multijugador
     * @param {Object} options - Opciones de configuración (opcional)
     */
    startLoadTest(options = {}) {
        if (!this.loadTester) {
            console.warn('LoadTester no disponible');
            return false;
        }
        
        return this.loadTester.startLoadTest(options);
    }
    
    /**
     * Detiene la prueba de carga actual
     */
    stopLoadTest() {
        if (!this.loadTester) return null;
        
        return this.loadTester.stopLoadTest();
    }
    
    /**
     * Comprueba la compatibilidad del navegador
     * @returns {boolean} Verdadero si el navegador es compatible
     */
    checkBrowserCompatibility() {
        if (!this.browserCompatibility) {
            console.warn('BrowserCompatibility no disponible');
            return true; // Asumir compatible por defecto
        }
        
        return this.browserCompatibility.isCompatible();
    }
    
    /**
     * Obtiene información del navegador
     * @returns {Object} Información del navegador
     */
    getBrowserInfo() {
        if (!this.browserCompatibility) return {};
        
        return this.browserCompatibility.getBrowserInfo();
    }
    
    /**
     * Muestra u oculta las estadísticas de rendimiento
     * @param {boolean} show - Indica si se deben mostrar las estadísticas
     */
    togglePerformanceStats(show) {
        this.config.showPerformanceStats = show;
        
        if (this.performanceOptimizer) {
            this.performanceOptimizer.showPerformanceStats(show);
        }
    }
    
    /**
     * Activa o desactiva la optimización automática
     * @param {boolean} enable - Indica si se debe activar la optimización automática
     */
    toggleAutoOptimize(enable) {
        this.config.autoOptimize = enable;
        console.log('Optimización automática:', enable ? 'Activada' : 'Desactivada');
    }
    
    /**
     * Obtiene las métricas de rendimiento actuales
     * @returns {Object} Métricas de rendimiento
     */
    getPerformanceMetrics() {
        return { ...this.metrics };
    }
    
    /**
     * Genera un informe completo de rendimiento y compatibilidad
     * @returns {Object} Informe de rendimiento y compatibilidad
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            performance: this.performanceOptimizer ? this.performanceOptimizer.getPerformanceStats() : {},
            browser: this.browserCompatibility ? this.browserCompatibility.getBrowserInfo() : {},
            compatibility: {
                isCompatible: this.checkBrowserCompatibility(),
                issues: this.browserCompatibility ? this.browserCompatibility.getCompatibilityIssues() : [],
                appliedFixes: this.browserCompatibility ? this.browserCompatibility.getAppliedFixes() : []
            },
            config: { ...this.config }
        };
        
        console.log('Informe generado:', report);
        return report;
    }
}

// Crear instancia global
window.gameOptimizationManager = new GameOptimizationManager();

// Función para integrar con el juego
function integrateOptimizationSystems(game) {
    if (!window.gameOptimizationManager) {
        console.error('GameOptimizationManager no disponible');
        return false;
    }
    
    // Inicializar con el renderer, escena y cámara del juego
    if (game && game.renderer && game.scene && game.camera) {
        window.gameOptimizationManager.init(game.renderer, game.scene, game.camera);
        
        // Añadir botones de control a la interfaz
        addOptimizationControls();
        
        return true;
    } else {
        console.error('Objetos del juego no disponibles');
        return false;
    }
}

// Función para añadir controles de optimización a la interfaz
function addOptimizationControls() {
    // Crear contenedor de controles si no existe
    let controlsContainer = document.getElementById('optimization-controls');
    
    if (!controlsContainer) {
        controlsContainer = document.createElement('div');
        controlsContainer.id = 'optimization-controls';
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.bottom = '10px';
        controlsContainer.style.right = '10px';
        controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        controlsContainer.style.color = 'white';
        controlsContainer.style.padding = '10px';
        controlsContainer.style.borderRadius = '5px';
        controlsContainer.style.fontFamily = 'Arial, sans-serif';
        controlsContainer.style.fontSize = '12px';
        controlsContainer.style.zIndex = '1000';
        
        // Botones de control
        const statsButton = document.createElement('button');
        statsButton.textContent = 'Mostrar Estadísticas';
        statsButton.style.display = 'block';
        statsButton.style.margin = '5px 0';
        statsButton.style.padding = '5px 10px';
        statsButton.style.backgroundColor = '#333';
        statsButton.style.color = 'white';
        statsButton.style.border = 'none';
        statsButton.style.borderRadius = '3px';
        statsButton.style.cursor = 'pointer';
        
        statsButton.addEventListener('click', () => {
            const showStats = !window.gameOptimizationManager.config.showPerformanceStats;
            window.gameOptimizationManager.togglePerformanceStats(showStats);
            statsButton.textContent = showStats ? 'Ocultar Estadísticas' : 'Mostrar Estadísticas';
        });
        
        const autoOptimizeButton = document.createElement('button');
        autoOptimizeButton.textContent = 'Desactivar Auto-Optimización';
        autoOptimizeButton.style.display = 'block';
        autoOptimizeButton.style.margin = '5px 0';
        autoOptimizeButton.style.padding = '5px 10px';
        autoOptimizeButton.style.backgroundColor = '#333';
        autoOptimizeButton.style.color = 'white';
        autoOptimizeButton.style.border = 'none';
        autoOptimizeButton.style.borderRadius = '3px';
        autoOptimizeButton.style.cursor = 'pointer';
        
        autoOptimizeButton.addEventListener('click', () => {
            const enableAutoOptimize = !window.gameOptimizationManager.config.autoOptimize;
            window.gameOptimizationManager.toggleAutoOptimize(enableAutoOptimize);
            autoOptimizeButton.textContent = enableAutoOptimize ? 
                'Desactivar Auto-Optimización' : 'Activar Auto-Optimización';
        });
        
        const loadTestButton = document.createElement('button');
        loadTestButton.textContent = 'Iniciar Prueba de Carga';
        loadTestButton.style.display = 'block';
        loadTestButton.style.margin = '5px 0';
        loadTestButton.style.padding = '5px 10px';
        loadTestButton.style.backgroundColor = '#333';
        loadTestButton.style.color = 'white';
        loadTestButton.style.border = 'none';
        loadTestButton.style.borderRadius = '3px';
        loadTestButton.style.cursor = 'pointer';
        
        loadTestButton.addEventListener('click', () => {
            if (window.gameOptimizationManager.loadTester) {
                window.gameOptimizationManager.loadTester.showConfigDialog();
            } else {
                alert('Sistema de pruebas de carga no disponible');
            }
        });
        
        const reportButton = document.createElement('button');
        reportButton.textContent = 'Generar Informe';
        reportButton.style.display = 'block';
        reportButton.style.margin = '5px 0';
        reportButton.style.padding = '5px 10px';
        reportButton.style.backgroundColor = '#333';
        reportButton.style.color = 'white';
        reportButton.style.border = 'none';
        reportButton.style.borderRadius = '3px';
        reportButton.style.cursor = 'pointer';
        
        reportButton.addEventListener('click', () => {
            const report = window.gameOptimizationManager.generateReport();
            console.log('Informe de rendimiento y compatibilidad:', report);
            alert('Informe generado. Consulta la consola para más detalles.');
        });
        
        // Añadir botones al contenedor
        controlsContainer.appendChild(statsButton);
        controlsContainer.appendChild(autoOptimizeButton);
        controlsContainer.appendChild(loadTestButton);
        controlsContainer.appendChild(reportButton);
        
        // Añadir contenedor al documento
        document.body.appendChild(controlsContainer);
    }
}

// Exportar funciones
window.integrateOptimizationSystems = integrateOptimizationSystems;
