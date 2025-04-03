// Modelo 3D detallado para el antagonista "La Hucha de Paredes"
// Este archivo define un modelo más complejo que el usado en el prototipo

import * as THREE from 'three';

// Clase para crear y gestionar el modelo de La Hucha
export class HuchaModel {
    constructor(scene, position = new THREE.Vector3(0, 0, 0)) {
        this.scene = scene;
        this.position = position.clone();
        this.model = new THREE.Group();
        this.animations = {};
        this.currentAnimation = null;
        this.mixer = null;
        this.state = 'idle'; // idle, chase, attack
        
        // Crear el modelo
        this.createModel();
        
        // Posicionar el modelo
        this.model.position.copy(this.position);
        this.scene.add(this.model);
    }
    
    createModel() {
        // Grupo principal
        this.model = new THREE.Group();
        
        // Colores
        const primaryColor = 0x8B4513; // Marrón oscuro
        const secondaryColor = 0xA0522D; // Marrón más claro
        const detailColor = 0x5D4037; // Marrón muy oscuro
        const metalColor = 0xB87333; // Cobre
        const eyeColor = 0xFF0000; // Rojo
        
        // Materiales
        const primaryMaterial = new THREE.MeshStandardMaterial({
            color: primaryColor,
            roughness: 0.7,
            metalness: 0.3,
            map: this.createWoodTexture()
        });
        
        const secondaryMaterial = new THREE.MeshStandardMaterial({
            color: secondaryColor,
            roughness: 0.6,
            metalness: 0.3,
            map: this.createWoodTexture(true)
        });
        
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: detailColor,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: metalColor,
            roughness: 0.3,
            metalness: 0.8
        });
        
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: eyeColor,
            roughness: 0.3,
            metalness: 0.7,
            emissive: eyeColor,
            emissiveIntensity: 0.5
        });
        
        // Cuerpo principal (cilindro con forma de hucha)
        const bodyGeometry = new THREE.CylinderGeometry(1, 1.2, 3, 16);
        this.body = new THREE.Mesh(bodyGeometry, primaryMaterial);
        this.body.position.y = 1.5;
        this.body.castShadow = true;
        this.model.add(this.body);
        
        // Cabeza (esfera)
        const headGeometry = new THREE.SphereGeometry(1, 32, 32);
        this.head = new THREE.Mesh(headGeometry, secondaryMaterial);
        this.head.position.y = 3.5;
        this.head.castShadow = true;
        this.model.add(this.head);
        
        // Ojos (esferas)
        const eyeGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        
        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(-0.4, 3.7, 0.8);
        this.model.add(this.leftEye);
        
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(0.4, 3.7, 0.8);
        this.model.add(this.rightEye);
        
        // Pupilas (esferas más pequeñas)
        const pupilGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const pupilMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.1,
            metalness: 0.1
        });
        
        this.leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.leftPupil.position.z = 0.15;
        this.leftEye.add(this.leftPupil);
        
        this.rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.rightPupil.position.z = 0.15;
        this.rightEye.add(this.rightPupil);
        
        // Ranura para monedas
        const slotGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.3);
        const slot = new THREE.Mesh(slotGeometry, detailMaterial);
        slot.position.set(0, 4, 0.8);
        this.model.add(slot);
        
        // Detalles decorativos
        
        // Bandas metálicas alrededor del cuerpo
        const createBand = (y) => {
            const bandGeometry = new THREE.TorusGeometry(1.05, 0.05, 16, 32);
            const band = new THREE.Mesh(bandGeometry, metalMaterial);
            band.position.y = y;
            band.rotation.x = Math.PI / 2;
            this.body.add(band);
            return band;
        };
        
        this.upperBand = createBand(1);
        this.middleBand = createBand(0);
        this.lowerBand = createBand(-1);
        
        // Detalles en la cabeza
        const createHeadDetail = (x, y, z, scale = 1) => {
            const detailGeometry = new THREE.SphereGeometry(0.1 * scale, 16, 16);
            const detail = new THREE.Mesh(detailGeometry, detailMaterial);
            detail.position.set(x, y, z);
            this.head.add(detail);
            return detail;
        };
        
        // Orejas
        this.leftEar = createHeadDetail(-0.9, 0.3, 0, 1.5);
        this.rightEar = createHeadDetail(0.9, 0.3, 0, 1.5);
        
        // Nariz
        this.nose = createHeadDetail(0, 0, 0.9, 1.2);
        
        // Brazos (tentáculos)
        const createArm = (isLeft) => {
            const arm = new THREE.Group();
            
            // Segmentos del tentáculo
            const segments = 5;
            const segmentHeight = 0.3;
            const startRadius = 0.2;
            
            for (let i = 0; i < segments; i++) {
                const radius = startRadius * (1 - i / segments * 0.5);
                const segmentGeometry = new THREE.CylinderGeometry(radius, radius * 0.9, segmentHeight, 8);
                const segment = new THREE.Mesh(segmentGeometry, primaryMaterial);
                segment.position.y = -i * segmentHeight;
                
                // Añadir articulación
                if (i > 0) {
                    segment.rotation.x = Math.sin(i) * 0.3;
                }
                
                // Añadir al segmento anterior o al grupo principal
                if (i === 0) {
                    arm.add(segment);
                } else {
                    // Encontrar el último segmento añadido
                    let lastSegment = arm;
                    for (let j = 0; j < i; j++) {
                        lastSegment = lastSegment.children[0];
                    }
                    lastSegment.add(segment);
                }
            }
            
            // Añadir "mano" al final
            const handGeometry = new THREE.SphereGeometry(startRadius * 0.7, 16, 16);
            const hand = new THREE.Mesh(handGeometry, secondaryMaterial);
            
            // Encontrar el último segmento
            let lastSegment = arm;
            for (let i = 0; i < segments; i++) {
                lastSegment = lastSegment.children[0];
            }
            
            hand.position.y = -segmentHeight / 2;
            lastSegment.add(hand);
            
            // Posicionar brazo
            arm.position.set(isLeft ? -1.2 : 1.2, 2, 0);
            
            return arm;
        };
        
        this.leftArm = createArm(true);
        this.model.add(this.leftArm);
        
        this.rightArm = createArm(false);
        this.model.add(this.rightArm);
        
        // Base (parte inferior de la hucha)
        const baseGeometry = new THREE.CylinderGeometry(1.2, 1.3, 0.3, 16);
        const base = new THREE.Mesh(baseGeometry, detailMaterial);
        base.position.y = 0.15;
        this.model.add(base);
        
        // Patas
        const createLeg = (angle) => {
            const leg = new THREE.Group();
            
            // Parte superior de la pata
            const upperLegGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.4, 8);
            const upperLeg = new THREE.Mesh(upperLegGeometry, detailMaterial);
            upperLeg.position.y = -0.2;
            leg.add(upperLeg);
            
            // Parte inferior de la pata
            const lowerLegGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.3, 8);
            const lowerLeg = new THREE.Mesh(lowerLegGeometry, detailMaterial);
            lowerLeg.position.y = -0.55;
            leg.add(lowerLeg);
            
            // Pie
            const footGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const foot = new THREE.Mesh(footGeometry, detailMaterial);
            foot.position.y = -0.75;
            foot.scale.y = 0.5;
            leg.add(foot);
            
            // Posicionar pata
            const radius = 1.1;
            leg.position.x = Math.cos(angle) * radius;
            leg.position.z = Math.sin(angle) * radius;
            leg.position.y = 0;
            
            return leg;
        };
        
        // Crear 4 patas en diferentes ángulos
        this.legs = [];
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2) + Math.PI / 4;
            const leg = createLeg(angle);
            this.model.add(leg);
            this.legs.push(leg);
        }
        
        // Ajustar escala global
        this.model.scale.set(1, 1, 1);
    }
    
    // Crear textura de madera procedural
    createWoodTexture(lighter = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Color base
        const baseColor = lighter ? '#A0522D' : '#8B4513';
        context.fillStyle = baseColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Añadir vetas de madera
        const grainColor = lighter ? '#D2B48C' : '#A0522D';
        context.strokeStyle = grainColor;
        context.lineWidth = 1;
        
        for (let i = 0; i < 40; i++) {
            const y = Math.random() * canvas.height;
            context.beginPath();
            context.moveTo(0, y);
            
            // Crear una línea ondulada
            for (let x = 0; x < canvas.width; x += 10) {
                const yOffset = y + Math.sin(x * 0.05) * 5 + (Math.random() * 4 - 2);
                context.lineTo(x, yOffset);
            }
            
            context.stroke();
        }
        
        // Añadir nudos de madera
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 5 + Math.random() * 10;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = '#5D4037';
            context.fill();
            
            // Anillo alrededor del nudo
            context.beginPath();
            context.arc(x, y, radius + 2, 0, Math.PI * 2);
            context.strokeStyle = '#3E2723';
            context.lineWidth = 1;
            context.stroke();
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        
        return texture;
    }
    
    // Método para actualizar la posición del modelo
    setPosition(position) {
        this.position.copy(position);
        this.model.position.copy(position);
    }
    
    // Método para actualizar la rotación del modelo
    setRotation(rotation) {
        this.model.rotation.y = rotation;
    }
    
    // Método para animar el modelo en estado idle
    animateIdle(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Flotación suave
        this.model.position.y = this.position.y + Math.sin(time) * 0.2;
        
        // Rotación lenta
        this.model.rotation.y += deltaTime * 0.5;
        
        // Movimiento de brazos ondulante
        this.leftArm.rotation.x = Math.sin(time * 0.5) * 0.2;
        this.rightArm.rotation.x = Math.sin(time * 0.5 + Math.PI) * 0.2;
        
        // Parpadeo ocasional
        if (Math.sin(time * 2) > 0.95) {
            this.leftEye.scale.y = 0.1;
            this.rightEye.scale.y = 0.1;
        } else {
            this.leftEye.scale.y = 1;
            this.rightEye.scale.y = 1;
        }
        
        // Intensidad de ojos baja
        this.leftEye.material.emissiveIntensity = 0.5;
        this.rightEye.material.emissiveIntensity = 0.5;
    }
    
    // Método para animar el modelo en estado de persecución
    animateChase(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Flotación más agresiva
        this.model.position.y = this.position.y + Math.sin(time * 2) * 0.3;
        
        // Movimiento de brazos más rápido
        this.leftArm.rotation.x = Math.sin(time * 2) * 0.5 - 0.2;
        this.rightArm.rotation.x = Math.sin(time * 2 + Math.PI) * 0.5 - 0.2;
        
        // Movimiento de brazos lateral
        this.leftArm.rotation.z = Math.sin(time * 1.5) * 0.3;
        this.rightArm.rotation.z = Math.sin(time * 1.5 + Math.PI) * 0.3;
        
        // Rotación de cabeza buscando al jugador
        this.head.rotation.y = Math.sin(time * 1.5) * 0.3;
        
        // Intensidad de ojos media
        this.leftEye.material.emissiveIntensity = 0.8;
        this.rightEye.material.emissiveIntensity = 0.8;
        
        // Pupilas más pequeñas
        this.leftPupil.scale.set(0.8, 0.8, 1);
        this.rightPupil.scale.set(0.8, 0.8, 1);
    }
    
    // Método para animar el modelo en estado de ataque
    animateAttack(deltaTime, attackProgress = 0) {
        const time = Date.now() * 0.001;
        
        // Si estamos en la animación de ataque específica
        if (attackProgress > 0) {
            // Animación de ataque en 3 fases: preparación, golpe, retroceso
            if (attackProgress < 0.3) {
                // Fase 1: Preparación
                const phase1Progress = attackProgress / 0.3;
                this.model.position.z = this.position.z - phase1Progress * 0.5;
                this.leftArm.rotation.x = -phase1Progress * 1.2;
                this.rightArm.rotation.x = -phase1Progress * 1.2;
                
            } else if (attackProgress < 0.6) {
                // Fase 2: Golpe
                const phase2Progress = (attackProgress - 0.3) / 0.3;
                this.model.position.z = this.position.z - 0.5 + phase2Progress * 1.5;
                this.leftArm.rotation.x = -1.2 + phase2Progress * 2.4;
                this.rightArm.rotation.x = -1.2 + phase2Progress * 2.4;
                
            } else {
                // Fase 3: Retroceso
                const phase3Progress = (attackProgress - 0.6) / 0.4;
                this.model.position.z = this.position.z + 1 - phase3Progress;
                this.leftArm.rotation.x = 1.2 - phase3Progress * 1.2;
                this.rightArm.rotation.x = 1.2 - phase3Progress * 1.2;
            }
        } else {
            // Animación de estado de ataque general
            // Flotación agresiva y errática
            this.model.position.y = this.position.y + Math.sin(time * 3) * 0.2 + Math.sin(time * 5) * 0.1;
            
            // Movimiento de brazos amenazante
            this.leftArm.rotation.x = Math.sin(time * 3) * 0.7;
            this.rightArm.rotation.x = Math.sin(time * 3 + Math.PI) * 0.7;
            
            // Rotación de cabeza más errática
            this.head.rotation.y = Math.sin(time * 2.5) * 0.4;
            this.head.rotation.x = Math.sin(time * 2) * 0.2;
        }
        
        // Intensidad de ojos alta
        this.leftEye.material.emissiveIntensity = 1.0;
        this.rightEye.material.emissiveIntensity = 1.0;
        
        // Pupilas muy pequeñas
        this.leftPupil.scale.set(0.6, 0.6, 1);
        this.rightPupil.scale.set(0.6, 0.6, 1);
    }
    
    // Método para animar el modelo al recibir daño
    animateDamage() {
        // Colorear temporalmente el modelo
        this.model.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissive = new THREE.Color(0xffffff);
                child.material.emissiveIntensity = 0.5;
                
                // Restaurar color después de un tiempo
                setTimeout(() => {
                    if (child !== this.leftEye && child !== this.rightEye) {
                        child.material.emissiveIntensity = 0;
                    } else {
                        // Restaurar intensidad de ojos según el estado
                        const intensity = this.state === 'idle' ? 0.5 : 
                                         this.state === 'chase' ? 0.8 : 1.0;
                        child.material.emissiveIntensity = intensity;
                    }
                }, 200);
            }
        });
        
        // Sacudir el modelo
        const originalPosition = this.model.position.clone();
        const shake = () => {
            this.model.position.x = originalPosition.x + (Math.random() - 0.5) * 0.3;
            this.model.position.z = originalPosition.z + (Math.random() - 0.5) * 0.3;
        };
        
        // Aplicar sacudida varias veces
        shake();
        setTimeout(() => {
            shake();
            setTimeout(() => {
                shake();
                setTimeout(() => {
                    // Restaurar posición
                    this.model.position.copy(originalPosition);
                }, 50);
            }, 50);
        }, 50);
    }
    
    // Método para animar el modelo al morir
    animateDeath() {
        // Animación de "derretimiento"
        const meltAnimation = () => {
            // Reducir altura gradualmente
            if (this.model.scale.y > 0.1) {
                this.model.scale.y *= 0.95;
                this.model.position.y -= 0.05;
                
                // Aumentar anchura ligeramente
                this.model.scale.x *= 1.01;
                this.model.scale.z *= 1.01;
                
                // Continuar animación
                requestAnimationFrame(meltAnimation);
            } else {
                // Desvanecer al final
                const fadeOut = () => {
                    this.model.traverse((child) => {
                        if (child.isMesh && child.material) {
                            if (child.material.opacity === undefined) {
                                child.material.transparent = true;
                                child.material.opacity = 1.0;
                            }
                            
                            child.material.opacity *= 0.95;
                            
                            if (child.material.opacity > 0.01) {
                                requestAnimationFrame(fadeOut);
                            }
                        }
                    });
                };
                
                fadeOut();
            }
        };
        
        // Apagar ojos
        this.leftEye.material.emissiveIntensity = 0;
        this.rightEye.material.emissiveIntensity = 0;
        
        // Iniciar animación
        meltAnimation();
    }
    
    // Método para actualizar el modelo
    update(deltaTime, state) {
        // Actualizar estado si se proporciona
        if (state && state.state) {
            this.state = state.state;
        }
        
        // Animar según el estado
        switch (this.state) {
            case 'idle':
                this.animateIdle(deltaTime);
                break;
            case 'chase':
                this.animateChase(deltaTime);
                break;
            case 'attack':
                this.animateAttack(deltaTime, state ? state.attackProgress : 0);
                break;
        }
        
        // Animar daño si es necesario
        if (state && state.isDamaged) {
            this.animateDamage();
        }
        
        // Animar muerte si es necesario
        if (state && state.isDead) {
            this.animateDeath();
        }
    }
    
    // Método para eliminar el modelo de la escena
    remove() {
        if (this.model && this.model.parent) {
            this.model.parent.remove(this.model);
        }
    }
}
