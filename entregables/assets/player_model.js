// Modelo 3D detallado para el personaje jugador
// Este archivo define un modelo más complejo que el usado en el prototipo

import * as THREE from 'three';

// Clase para crear y gestionar el modelo del jugador
export class PlayerModel {
    constructor(scene, position = new THREE.Vector3(0, 0, 0)) {
        this.scene = scene;
        this.position = position.clone();
        this.model = new THREE.Group();
        this.animations = {};
        this.currentAnimation = null;
        this.mixer = null;
        
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
        const skinColor = 0xf5d0a9;
        const shirtColor = 0x2962ff;
        const pantsColor = 0x283593;
        const shoeColor = 0x212121;
        const hairColor = 0x3e2723;
        
        // Materiales
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.7,
            metalness: 0.1
        });
        
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: shirtColor,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: pantsColor,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const shoeMaterial = new THREE.MeshStandardMaterial({
            color: shoeColor,
            roughness: 0.9,
            metalness: 0.2
        });
        
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: hairColor,
            roughness: 0.7,
            metalness: 0.1
        });
        
        // Cabeza
        const head = new THREE.Group();
        
        // Cráneo
        const skullGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const skull = new THREE.Mesh(skullGeometry, skinMaterial);
        skull.castShadow = true;
        head.add(skull);
        
        // Cara
        const faceGeometry = new THREE.SphereGeometry(0.25, 32, 32, 0, Math.PI);
        const face = new THREE.Mesh(faceGeometry, skinMaterial);
        face.position.z = 0.025;
        face.castShadow = true;
        head.add(face);
        
        // Ojos
        const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.1
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 0.05, 0.18);
        leftEye.scale.z = 0.5;
        head.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 0.05, 0.18);
        rightEye.scale.z = 0.5;
        head.add(rightEye);
        
        // Pupilas
        const pupilGeometry = new THREE.SphereGeometry(0.02, 16, 16);
        const pupilMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.1,
            metalness: 0.1
        });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(0, 0, 0.025);
        leftEye.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0, 0, 0.025);
        rightEye.add(rightPupil);
        
        // Boca
        const mouthGeometry = new THREE.BoxGeometry(0.1, 0.03, 0.03);
        const mouthMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, -0.1, 0.18);
        head.add(mouth);
        
        // Pelo
        const hairGeometry = new THREE.SphereGeometry(0.27, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 0.05;
        hair.castShadow = true;
        head.add(hair);
        
        // Posicionar cabeza
        head.position.y = 1.5;
        this.model.add(head);
        
        // Torso
        const torsoGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.6, 16);
        const torso = new THREE.Mesh(torsoGeometry, shirtMaterial);
        torso.position.y = 1.1;
        torso.castShadow = true;
        this.model.add(torso);
        
        // Brazos
        const createArm = (isLeft) => {
            const arm = new THREE.Group();
            
            // Hombro
            const shoulderGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const shoulder = new THREE.Mesh(shoulderGeometry, shirtMaterial);
            shoulder.castShadow = true;
            arm.add(shoulder);
            
            // Brazo superior
            const upperArmGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.3, 16);
            const upperArm = new THREE.Mesh(upperArmGeometry, skinMaterial);
            upperArm.position.y = -0.2;
            upperArm.castShadow = true;
            arm.add(upperArm);
            
            // Codo
            const elbowGeometry = new THREE.SphereGeometry(0.06, 16, 16);
            const elbow = new THREE.Mesh(elbowGeometry, skinMaterial);
            elbow.position.y = -0.4;
            elbow.castShadow = true;
            arm.add(elbow);
            
            // Antebrazo
            const forearmGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.3, 16);
            const forearm = new THREE.Mesh(forearmGeometry, skinMaterial);
            forearm.position.y = -0.6;
            forearm.castShadow = true;
            arm.add(forearm);
            
            // Mano
            const handGeometry = new THREE.SphereGeometry(0.06, 16, 16);
            const hand = new THREE.Mesh(handGeometry, skinMaterial);
            hand.position.y = -0.75;
            hand.scale.y = 1.2;
            hand.castShadow = true;
            arm.add(hand);
            
            // Posicionar brazo
            arm.position.set(isLeft ? -0.35 : 0.35, 1.3, 0);
            
            return arm;
        };
        
        const leftArm = createArm(true);
        this.model.add(leftArm);
        
        const rightArm = createArm(false);
        this.model.add(rightArm);
        
        // Piernas
        const createLeg = (isLeft) => {
            const leg = new THREE.Group();
            
            // Cadera
            const hipGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const hip = new THREE.Mesh(hipGeometry, pantsMaterial);
            hip.castShadow = true;
            leg.add(hip);
            
            // Muslo
            const thighGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.4, 16);
            const thigh = new THREE.Mesh(thighGeometry, pantsMaterial);
            thigh.position.y = -0.25;
            thigh.castShadow = true;
            leg.add(thigh);
            
            // Rodilla
            const kneeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const knee = new THREE.Mesh(kneeGeometry, pantsMaterial);
            knee.position.y = -0.5;
            knee.castShadow = true;
            leg.add(knee);
            
            // Pantorrilla
            const calfGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.4, 16);
            const calf = new THREE.Mesh(calfGeometry, pantsMaterial);
            calf.position.y = -0.75;
            calf.castShadow = true;
            leg.add(calf);
            
            // Tobillo
            const ankleGeometry = new THREE.SphereGeometry(0.06, 16, 16);
            const ankle = new THREE.Mesh(ankleGeometry, pantsMaterial);
            ankle.position.y = -1;
            ankle.castShadow = true;
            leg.add(ankle);
            
            // Pie
            const footGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.2);
            const foot = new THREE.Mesh(footGeometry, shoeMaterial);
            foot.position.set(0, -1.05, 0.05);
            foot.castShadow = true;
            leg.add(foot);
            
            // Posicionar pierna
            leg.position.set(isLeft ? -0.15 : 0.15, 0.8, 0);
            
            return leg;
        };
        
        const leftLeg = createLeg(true);
        this.model.add(leftLeg);
        
        const rightLeg = createLeg(false);
        this.model.add(rightLeg);
        
        // Guardar referencias para animaciones
        this.head = head;
        this.leftArm = leftArm;
        this.rightArm = rightArm;
        this.leftLeg = leftLeg;
        this.rightLeg = rightLeg;
        
        // Ajustar escala global
        this.model.scale.set(1, 1, 1);
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
    
    // Método para animar el modelo al caminar
    animateWalk(deltaTime, speed = 1) {
        const time = Date.now() * 0.001 * speed;
        
        // Balanceo de brazos
        this.leftArm.rotation.x = Math.sin(time * 2) * 0.4;
        this.rightArm.rotation.x = Math.sin(time * 2 + Math.PI) * 0.4;
        
        // Balanceo de piernas
        this.leftLeg.rotation.x = Math.sin(time * 2) * 0.4;
        this.rightLeg.rotation.x = Math.sin(time * 2 + Math.PI) * 0.4;
        
        // Ligero balanceo del cuerpo
        this.model.position.y = this.position.y + Math.abs(Math.sin(time * 4)) * 0.05;
    }
    
    // Método para animar el modelo al correr
    animateRun(deltaTime, speed = 1.5) {
        const time = Date.now() * 0.001 * speed;
        
        // Balanceo de brazos más pronunciado
        this.leftArm.rotation.x = Math.sin(time * 3) * 0.8;
        this.rightArm.rotation.x = Math.sin(time * 3 + Math.PI) * 0.8;
        
        // Balanceo de piernas más pronunciado
        this.leftLeg.rotation.x = Math.sin(time * 3) * 0.8;
        this.rightLeg.rotation.x = Math.sin(time * 3 + Math.PI) * 0.8;
        
        // Mayor balanceo del cuerpo
        this.model.position.y = this.position.y + Math.abs(Math.sin(time * 6)) * 0.1;
    }
    
    // Método para animar el modelo al saltar
    animateJump(progress) {
        // progress va de 0 a 1, donde 0 es el inicio del salto y 1 es el aterrizaje
        
        // Posición de las piernas
        const legAngle = progress < 0.5 ? 
            -0.5 + progress : // Flexión al inicio, extensión en el punto más alto
            -0.5 + (1 - progress); // Volver a flexionar al aterrizar
            
        this.leftLeg.rotation.x = legAngle;
        this.rightLeg.rotation.x = legAngle;
        
        // Posición de los brazos
        const armAngle = progress < 0.3 ? 
            -0.3 + progress * 2 : // Subir los brazos al inicio
            0.3 - (progress - 0.3) * 0.5; // Bajar gradualmente
            
        this.leftArm.rotation.x = armAngle;
        this.rightArm.rotation.x = armAngle;
    }
    
    // Método para animar el modelo al recibir daño
    animateDamage() {
        // Colorear temporalmente el modelo de rojo
        this.model.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissive = new THREE.Color(0xff0000);
                child.material.emissiveIntensity = 0.5;
                
                // Restaurar color después de un tiempo
                setTimeout(() => {
                    child.material.emissiveIntensity = 0;
                }, 200);
            }
        });
    }
    
    // Método para animar el modelo al morir
    animateDeath() {
        // Rotar el modelo para que caiga hacia atrás
        const deathAnimation = () => {
            const targetRotation = -Math.PI / 2; // 90 grados hacia atrás
            const currentRotation = this.model.rotation.x;
            const step = 0.05;
            
            if (currentRotation > targetRotation) {
                this.model.rotation.x -= step;
                requestAnimationFrame(deathAnimation);
            }
        };
        
        deathAnimation();
    }
    
    // Método para actualizar el modelo
    update(deltaTime, state) {
        // Actualizar posición y rotación
        this.model.position.copy(this.position);
        
        // Animar según el estado
        if (state) {
            if (state.isMoving) {
                if (state.isSprinting) {
                    this.animateRun(deltaTime);
                } else {
                    this.animateWalk(deltaTime);
                }
            } else {
                // Posición de reposo
                this.leftArm.rotation.x = 0;
                this.rightArm.rotation.x = 0;
                this.leftLeg.rotation.x = 0;
                this.rightLeg.rotation.x = 0;
                
                // Pequeña animación de respiración
                const time = Date.now() * 0.001;
                this.model.position.y = this.position.y + Math.sin(time) * 0.01;
            }
            
            if (state.isJumping) {
                this.animateJump(state.jumpProgress);
            }
            
            if (state.isDamaged) {
                this.animateDamage();
            }
            
            if (state.isDead) {
                this.animateDeath();
            }
        }
    }
    
    // Método para eliminar el modelo de la escena
    remove() {
        if (this.model && this.model.parent) {
            this.model.parent.remove(this.model);
        }
    }
}
