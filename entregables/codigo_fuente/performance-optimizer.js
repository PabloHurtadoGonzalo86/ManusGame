/**
 * Optimizaciones de rendimiento para "La Hucha de Paredes"
 * Implementa técnicas para mejorar el rendimiento del juego en diferentes dispositivos
 */

class PerformanceOptimizer {
    constructor() {
        // Configuración de rendimiento
        this.config = {
            // Calidad gráfica (0: baja, 1: media, 2: alta)
            graphicsQuality: 1,
            
            // Distancia de renderizado
            renderDistance: 100,
            
            // Nivel de detalle (LOD)
            lodLevels: 3,
            lodDistances: [10, 30, 60],
            
            // Límites de FPS
            targetFPS: 60,
            minAcceptableFPS: 30,
            
            // Oclusión
            enableOcclusion: true,
            
            // Sombras
            shadowQuality: 1, // 0: desactivadas, 1: baja, 2: alta
            
            // Antialiasing
            antialiasing: true,
            
            // Texturas
            textureQuality: 1, // 0: baja, 1: media, 2: alta
            
            // Efectos de postprocesado
            postProcessing: true,
            
            // Física
            physicsQuality: 1, // 0: simplificada, 1: completa
            
            // Multijugador
            networkUpdateRate: 10, // Actualizaciones por segundo
            interpolationBuffer: 100, // ms
            
            // Optimización de memoria
            unloadUnusedAssets: true,
            assetCacheSize: 50, // MB
            
            // Detección automática
            autoDetectSettings: true
        };
        
        // Métricas de rendimiento
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            networkLatency: 0,
            assetLoadTime: 0,
            drawCalls: 0,
            triangleCount: 0
        };
        
        // Estado
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.fpsHistory = [];
        this.fpsHistoryMaxLength = 60; // 1 minuto a 1 FPS
        this.lastFrameTime = 0;
        this.frameCount = 0;
        
        // Referencia al renderer de Three.js (se establecerá más tarde)
        this.renderer = null;
        this.scene = null;
        this.camera = null;
    }
    
    /**
     * Inicializa el optimizador de rendimiento
     * @param {Object} renderer - Instancia del renderer de Three.js
     * @param {Object} scene - Instancia de la escena de Three.js
     * @param {Object} camera - Instancia de la cámara de Three.js
     */
    init(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        // Detectar capacidades del dispositivo
        if (this.config.autoDetectSettings) {
            this.detectDeviceCapabilities();
        }
        
        // Aplicar configuración inicial
        this.applySettings();
        
        // Iniciar monitoreo de rendimiento
        this.startPerformanceMonitoring();
        
        console.log('Optimizador de rendimiento inicializado');
    }
    
    /**
     * Detecta las capacidades del dispositivo y ajusta la configuración
     */
    detectDeviceCapabilities() {
        console.log('Detectando capacidades del dispositivo...');
        
        // Comprobar si es móvil
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Comprobar GPU mediante canvas
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            // WebGL no disponible, usar configuración mínima
            this.setLowQualityPreset();
            console.log('WebGL no disponible, usando configuración mínima');
            return;
        }
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let gpuInfo = 'desconocida';
        
        if (debugInfo) {
            gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
        
        console.log('GPU detectada:', gpuInfo);
        
        // Estimar capacidad basada en información disponible
        let isHighEnd = false;
        let isMidRange = false;
        
        // Comprobar GPU de alta gama
        if (gpuInfo) {
            const highEndGPUs = ['NVIDIA', 'RTX', 'GTX', 'Radeon', 'AMD Radeon', 'Intel Iris'];
            isHighEnd = highEndGPUs.some(gpu => gpuInfo.includes(gpu));
            
            const midRangeGPUs = ['Intel HD', 'Intel UHD', 'AMD'];
            isMidRange = midRangeGPUs.some(gpu => gpuInfo.includes(gpu));
        }
        
        // Comprobar memoria
        const memory = navigator.deviceMemory || 4; // Valor por defecto si no está disponible
        
        // Establecer configuración basada en detección
        if (isMobile) {
            if (isHighEnd) {
                this.setMediumQualityPreset();
            } else {
                this.setLowQualityPreset();
            }
        } else {
            if (isHighEnd && memory >= 8) {
                this.setHighQualityPreset();
            } else if (isMidRange || memory >= 4) {
                this.setMediumQualityPreset();
            } else {
                this.setLowQualityPreset();
            }
        }
        
        console.log('Configuración automática aplicada:', 
                    isMobile ? 'Dispositivo móvil' : 'Escritorio', 
                    isHighEnd ? 'GPU alta gama' : (isMidRange ? 'GPU gama media' : 'GPU gama baja'),
                    'Memoria:', memory + 'GB');
    }
    
    /**
     * Establece la configuración de calidad baja
     */
    setLowQualityPreset() {
        this.config.graphicsQuality = 0;
        this.config.renderDistance = 50;
        this.config.lodLevels = 2;
        this.config.lodDistances = [5, 15];
        this.config.shadowQuality = 0;
        this.config.antialiasing = false;
        this.config.textureQuality = 0;
        this.config.postProcessing = false;
        this.config.physicsQuality = 0;
    }
    
    /**
     * Establece la configuración de calidad media
     */
    setMediumQualityPreset() {
        this.config.graphicsQuality = 1;
        this.config.renderDistance = 100;
        this.config.lodLevels = 3;
        this.config.lodDistances = [10, 30, 60];
        this.config.shadowQuality = 1;
        this.config.antialiasing = true;
        this.config.textureQuality = 1;
        this.config.postProcessing = true;
        this.config.physicsQuality = 1;
    }
    
    /**
     * Establece la configuración de calidad alta
     */
    setHighQualityPreset() {
        this.config.graphicsQuality = 2;
        this.config.renderDistance = 200;
        this.config.lodLevels = 4;
        this.config.lodDistances = [20, 50, 100, 150];
        this.config.shadowQuality = 2;
        this.config.antialiasing = true;
        this.config.textureQuality = 2;
        this.config.postProcessing = true;
        this.config.physicsQuality = 1;
    }
    
    /**
     * Aplica la configuración actual al renderer y la escena
     */
    applySettings() {
        if (!this.renderer || !this.scene || !this.camera) {
            console.warn('No se puede aplicar la configuración: renderer, scene o camera no definidos');
            return;
        }
        
        // Configurar renderer
        this.renderer.setPixelRatio(window.devicePixelRatio * (this.config.graphicsQuality * 0.5 + 0.5));
        
        // Antialiasing
        if (this.config.antialiasing) {
            this.renderer.antialias = true;
        }
        
        // Sombras
        this.renderer.shadowMap.enabled = this.config.shadowQuality > 0;
        this.renderer.shadowMap.type = this.config.shadowQuality === 2 ? 
            THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
        
        // Configurar cámara
        this.camera.far = this.config.renderDistance;
        
        // Aplicar LOD a los objetos de la escena
        this.applyLODToScene();
        
        console.log('Configuración aplicada al renderer y la escena');
    }
    
    /**
     * Aplica Level of Detail (LOD) a los objetos de la escena
     */
    applyLODToScene() {
        if (!this.scene) return;
        
        // Recorrer todos los objetos de la escena
        this.scene.traverse(object => {
            // Si el objeto tiene LOD configurado
            if (object.isLOD) {
                // Ajustar distancias de LOD según la configuración
                for (let i = 0; i < object.levels.length && i < this.config.lodLevels; i++) {
                    if (i < this.config.lodDistances.length) {
                        object.levels[i].distance = this.config.lodDistances[i];
                    }
                }
            }
        });
    }
    
    /**
     * Inicia el monitoreo de rendimiento
     */
    startPerformanceMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        // Monitorear FPS
        const updateFPS = () => {
            if (!this.isMonitoring) return;
            
            const now = performance.now();
            const elapsed = now - this.lastFrameTime;
            
            this.frameCount++;
            
            // Actualizar FPS cada segundo
            if (elapsed >= 1000) {
                this.metrics.fps = Math.round((this.frameCount * 1000) / elapsed);
                this.metrics.frameTime = elapsed / this.frameCount;
                
                // Guardar historial de FPS
                this.fpsHistory.push(this.metrics.fps);
                if (this.fpsHistory.length > this.fpsHistoryMaxLength) {
                    this.fpsHistory.shift();
                }
                
                // Comprobar si es necesario ajustar la calidad
                this.checkPerformance();
                
                // Reiniciar contadores
                this.lastFrameTime = now;
                this.frameCount = 0;
                
                // Actualizar métricas adicionales
                this.updateAdditionalMetrics();
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        // Iniciar monitoreo
        updateFPS();
        
        // Monitorear memoria y otras métricas cada 5 segundos
        this.monitoringInterval = setInterval(() => {
            this.updateAdditionalMetrics();
        }, 5000);
        
        console.log('Monitoreo de rendimiento iniciado');
    }
    
    /**
     * Detiene el monitoreo de rendimiento
     */
    stopPerformanceMonitoring() {
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('Monitoreo de rendimiento detenido');
    }
    
    /**
     * Actualiza métricas adicionales de rendimiento
     */
    updateAdditionalMetrics() {
        // Memoria (si está disponible)
        if (window.performance && window.performance.memory) {
            this.metrics.memoryUsage = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
        }
        
        // Métricas de Three.js
        if (this.renderer && this.renderer.info) {
            this.metrics.drawCalls = this.renderer.info.render.calls;
            this.metrics.triangleCount = this.renderer.info.render.triangles;
        }
        
        // Latencia de red (simulada para el prototipo)
        if (window.lobbySystem) {
            // En una implementación real, esto vendría de mediciones reales
            this.metrics.networkLatency = Math.random() * 50 + 20; // 20-70ms
        }
    }
    
    /**
     * Comprueba el rendimiento y ajusta la configuración si es necesario
     */
    checkPerformance() {
        // Calcular FPS promedio de los últimos 5 segundos
        const recentFPS = this.fpsHistory.slice(-5);
        const avgFPS = recentFPS.reduce((sum, fps) => sum + fps, 0) / recentFPS.length;
        
        // Si el FPS es demasiado bajo, reducir calidad
        if (avgFPS < this.config.minAcceptableFPS && this.config.graphicsQuality > 0) {
            this.config.graphicsQuality--;
            
            // Aplicar cambios según el nivel de calidad
            if (this.config.graphicsQuality === 0) {
                this.setLowQualityPreset();
            } else if (this.config.graphicsQuality === 1) {
                this.setMediumQualityPreset();
            }
            
            // Aplicar configuración
            this.applySettings();
            
            console.log('Rendimiento bajo detectado, reduciendo calidad a:', 
                        this.config.graphicsQuality === 0 ? 'Baja' : 
                        this.config.graphicsQuality === 1 ? 'Media' : 'Alta');
        }
        
        // Si el FPS es muy alto, considerar aumentar la calidad
        else if (avgFPS > this.config.targetFPS * 1.5 && this.config.graphicsQuality < 2) {
            // Solo aumentar si ha sido estable durante al menos 10 segundos
            if (recentFPS.length >= 10 && recentFPS.every(fps => fps > this.config.targetFPS * 1.2)) {
                this.config.graphicsQuality++;
                
                // Aplicar cambios según el nivel de calidad
                if (this.config.graphicsQuality === 1) {
                    this.setMediumQualityPreset();
                } else if (this.config.graphicsQuality === 2) {
                    this.setHighQualityPreset();
                }
                
                // Aplicar configuración
                this.applySettings();
                
                console.log('Rendimiento excelente detectado, aumentando calidad a:', 
                            this.config.graphicsQuality === 0 ? 'Baja' : 
                            this.config.graphicsQuality === 1 ? 'Media' : 'Alta');
            }
        }
    }
    
    /**
     * Implementa Level of Detail (LOD) para un modelo
     * @param {Object} model - Modelo 3D
     * @param {Array} detailLevels - Array de geometrías con diferentes niveles de detalle
     * @returns {Object} Objeto LOD configurado
     */
    createLODModel(model, detailLevels) {
        // Crear objeto LOD
        const lod = new THREE.LOD();
        
        // Añadir niveles de detalle
        for (let i = 0; i < detailLevels.length && i < this.config.lodLevels; i++) {
            const level = detailLevels[i];
            const distance = i < this.config.lodDistances.length ? 
                            this.config.lodDistances[i] : 
                            this.config.lodDistances[this.config.lodDistances.length - 1] * (i + 1);
            
            lod.addLevel(level, distance);
        }
        
        // Copiar posición y rotación del modelo original
        lod.position.copy(model.position);
        lod.rotation.copy(model.rotation);
        lod.scale.copy(model.scale);
        
        return lod;
    }
    
    /**
     * Implementa oclusión para mejorar el rendimiento
     * @param {Object} scene - Escena de Three.js
     * @param {Object} camera - Cámara de Three.js
     */
    implementOcclusion(scene, camera) {
        if (!this.config.enableOcclusion) return;
        
        // Crear frustum para comprobar visibilidad
        const frustum = new THREE.Frustum();
        const projScreenMatrix = new THREE.Matrix4();
        
        // Actualizar matriz de proyección
        projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(projScreenMatrix);
        
        // Recorrer objetos de la escena
        scene.traverse(object => {
            // Solo procesar objetos visibles con geometría
            if (object.isMesh && object.geometry) {
                // Comprobar si el objeto está en el frustum de la cámara
                if (!object.boundingSphere) {
                    object.geometry.computeBoundingSphere();
                    object.boundingSphere = object.geometry.boundingSphere.clone();
                }
                
                // Actualizar boundingSphere a coordenadas mundiales
                const boundingSphere = object.boundingSphere.clone();
                boundingSphere.applyMatrix4(object.matrixWorld);
                
                // Activar/desactivar según visibilidad
                object.visible = frustum.intersectsSphere(boundingSphere);
            }
        });
    }
    
    /**
     * Optimiza texturas según la configuración
     * @param {Object} texture - Textura de Three.js
     */
    optimizeTexture(texture) {
        if (!texture) return;
        
        // Ajustar filtro según calidad
        if (this.config.textureQuality === 0) {
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;
        } else if (this.config.textureQuality === 1) {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
        } else {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 1;
            texture.generateMipmaps = true;
        }
    }
    
    /**
     * Optimiza geometrías para mejorar el rendimiento
     * @param {Object} geometry - Geometría de Three.js
     * @returns {Object} Geometría optimizada
     */
    optimizeGeometry(geometry) {
        if (!geometry) return geometry;
        
        // Crear copia para no modificar la original
        const optimized = geometry.clone();
        
        // Fusionar vértices
        optimized.mergeVertices();
        
        // Calcular normales si no existen
        if (!optimized.attributes.normal) {
            optimized.computeVertexNormals();
        }
        
        // Calcular boundingSphere para oclusión
        optimized.computeBoundingSphere();
        
        return optimized;
    }
    
    /**
     * Implementa instancing para objetos repetidos
     * @param {Object} mesh - Mesh original
     * @param {Array} positions - Array de posiciones [x, y, z, x, y, z, ...]
     * @returns {Object} InstancedMesh con todas las instancias
     */
    createInstancedMesh(mesh, positions) {
        const count = positions.length / 3;
        const instancedMesh = new THREE.InstancedMesh(
            mesh.geometry,
            mesh.material,
            count
        );
        
        const matrix = new THREE.Matrix4();
        let index = 0;
        
        for (let i = 0; i < positions.length; i += 3) {
            matrix.setPosition(
                positions[i],
                positions[i + 1],
                positions[i + 2]
            );
            
            instancedMesh.setMatrixAt(index, matrix);
            index++;
        }
        
        return instancedMesh;
    }
    
    /**
     * Obtiene estadísticas de rendimiento
     * @returns {Object} Métricas de rendimiento
     */
    getPerformanceStats() {
        return { ...this.metrics };
    }
    
    /**
     * Muestra estadísticas de rendimiento en pantalla
     * @param {boolean} show - Indica si se deben mostrar las estadísticas
     */
    showPerformanceStats(show) {
        // Buscar o crear contenedor de estadísticas
        let statsContainer = document.getElementById('performance-stats');
        
        if (show) {
            if (!statsContainer) {
                statsContainer = document.createElement('div');
                statsContainer.id = 'performance-stats';
                statsContainer.style.position = 'absolute';
                statsContainer.style.top = '10px';
                statsContainer.style.right = '10px';
                statsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                statsContainer.style.color = 'white';
                statsContainer.style.padding = '10px';
                statsContainer.style.borderRadius = '5px';
                statsContainer.style.fontFamily = 'monospace';
                statsContainer.style.fontSize = '12px';
                statsContainer.style.zIndex = '1000';
                document.body.appendChild(statsContainer);
            }
            
            // Actualizar estadísticas cada segundo
            if (!this.statsInterval) {
                this.statsInterval = setInterval(() => {
                    statsContainer.innerHTML = `
                        FPS: ${this.metrics.fps}<br>
                        Frame Time: ${this.metrics.frameTime.toFixed(2)} ms<br>
                        Memory: ${this.metrics.memoryUsage} MB<br>
                        Draw Calls: ${this.metrics.drawCalls}<br>
                        Triangles: ${this.metrics.triangleCount}<br>
                        Network Latency: ${this.metrics.networkLatency.toFixed(0)} ms<br>
                        Quality: ${this.config.graphicsQuality === 0 ? 'Low' : 
                                  this.config.graphicsQuality === 1 ? 'Medium' : 'High'}
                    `;
                }, 1000);
            }
        } else {
            // Ocultar estadísticas
            if (statsContainer) {
                document.body.removeChild(statsContainer);
            }
            
            if (this.statsInterval) {
                clearInterval(this.statsInterval);
                this.statsInterval = null;
            }
        }
    }
}

// Crear instancia global
window.performanceOptimizer = new PerformanceOptimizer();
