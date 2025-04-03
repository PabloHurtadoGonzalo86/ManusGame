// Entorno 3D detallado tipo manicomio para "La Hucha de Paredes"
// Este archivo define un entorno más complejo que el usado en el prototipo

import * as THREE from 'three';

// Clase para crear y gestionar el entorno del manicomio
export class AsylumEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.lights = [];
        this.colliders = [];
        this.doors = [];
        this.windows = [];
        this.props = [];
        
        // Crear el entorno
        this.createEnvironment();
    }
    
    createEnvironment() {
        // Crear suelo
        this.createFloor();
        
        // Crear paredes
        this.createWalls();
        
        // Crear techo
        this.createCeiling();
        
        // Crear puertas
        this.createDoors();
        
        // Crear ventanas
        this.createWindows();
        
        // Crear iluminación
        this.createLighting();
        
        // Crear detalles y props
        this.createProps();
        
        // Crear efectos ambientales
        this.createAmbientEffects();
    }
    
    createFloor() {
        // Textura del suelo
        const floorTexture = this.createTileTexture();
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(20, 20);
        
        // Material del suelo
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.8,
            metalness: 0.2,
            bumpMap: floorTexture,
            bumpScale: 0.05
        });
        
        // Geometría del suelo
        const floorGeometry = new THREE.PlaneGeometry(40, 40);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.objects.push(floor);
        
        // Añadir manchas y detalles al suelo
        this.addFloorDetails();
    }
    
    createTileTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Color base
        context.fillStyle = '#AAAAAA';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar baldosas
        const tileSize = 64;
        context.fillStyle = '#999999';
        
        for (let x = 0; x < canvas.width; x += tileSize) {
            for (let y = 0; y < canvas.height; y += tileSize) {
                // Alternar colores para crear patrón de ajedrez
                if ((x / tileSize + y / tileSize) % 2 === 0) {
                    context.fillRect(x, y, tileSize, tileSize);
                }
            }
        }
        
        // Añadir líneas de separación entre baldosas
        context.strokeStyle = '#777777';
        context.lineWidth = 2;
        
        for (let x = 0; x <= canvas.width; x += tileSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += tileSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }
        
        // Añadir ruido y desgaste
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 3;
            const gray = Math.floor(Math.random() * 40 + 100);
            
            context.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
            context.fillRect(x, y, size, size);
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    addFloorDetails() {
        // Añadir manchas de sangre
        const bloodTexture = this.createBloodTexture();
        
        for (let i = 0; i < 10; i++) {
            const bloodMaterial = new THREE.MeshStandardMaterial({
                map: bloodTexture,
                transparent: true,
                opacity: 0.8,
                roughness: 0.7,
                metalness: 0.1
            });
            
            const bloodGeometry = new THREE.PlaneGeometry(1 + Math.random() * 2, 1 + Math.random() * 2);
            const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
            
            blood.rotation.x = -Math.PI / 2;
            blood.position.set(
                (Math.random() - 0.5) * 30,
                0.01, // Ligeramente por encima del suelo
                (Math.random() - 0.5) * 30
            );
            blood.rotation.z = Math.random() * Math.PI * 2;
            
            this.scene.add(blood);
            this.objects.push(blood);
        }
        
        // Añadir grietas en el suelo
        const crackTexture = this.createCrackTexture();
        
        for (let i = 0; i < 15; i++) {
            const crackMaterial = new THREE.MeshStandardMaterial({
                map: crackTexture,
                transparent: true,
                opacity: 0.7,
                roughness: 0.9,
                metalness: 0.1
            });
            
            const crackGeometry = new THREE.PlaneGeometry(2 + Math.random() * 3, 2 + Math.random() * 3);
            const crack = new THREE.Mesh(crackGeometry, crackMaterial);
            
            crack.rotation.x = -Math.PI / 2;
            crack.position.set(
                (Math.random() - 0.5) * 35,
                0.02, // Ligeramente por encima del suelo
                (Math.random() - 0.5) * 35
            );
            crack.rotation.z = Math.random() * Math.PI * 2;
            
            this.scene.add(crack);
            this.objects.push(crack);
        }
    }
    
    createBloodTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Fondo transparente
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar mancha de sangre
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Gradiente radial para la mancha principal
        const gradient = context.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, canvas.width / 2
        );
        
        gradient.addColorStop(0, 'rgba(180, 0, 0, 0.9)');
        gradient.addColorStop(0.7, 'rgba(120, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(centerX, centerY, canvas.width / 2, 0, Math.PI * 2);
        context.fill();
        
        // Añadir salpicaduras
        context.fillStyle = 'rgba(180, 0, 0, 0.8)';
        
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 10 + 5;
            
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Añadir gotas
        for (let i = 0; i < 30; i++) {
            const x = centerX + (Math.random() - 0.5) * canvas.width;
            const y = centerY + (Math.random() - 0.5) * canvas.height;
            const size = Math.random() * 5 + 2;
            
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
            
            // Añadir "cola" a algunas gotas para simular escurrimiento
            if (Math.random() > 0.5) {
                const length = Math.random() * 20 + 10;
                const angle = Math.random() * Math.PI * 2;
                
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                context.lineWidth = size * 2;
                context.strokeStyle = 'rgba(180, 0, 0, 0.7)';
                context.stroke();
            }
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createCrackTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Fondo transparente
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar grietas
        context.strokeStyle = 'rgba(30, 30, 30, 0.8)';
        context.lineWidth = 2;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Grieta principal
        context.beginPath();
        context.moveTo(centerX, centerY);
        
        // Crear ramas de la grieta
        const createCrackBranch = (x, y, length, angle, width, depth = 0) => {
            if (depth > 3) return; // Limitar profundidad de recursión
            
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;
            
            context.lineWidth = width;
            context.beginPath();
            context.moveTo(x, y);
            
            // Añadir puntos intermedios para hacer la grieta más natural
            const segments = Math.floor(length / 20) + 2;
            
            for (let i = 1; i <= segments; i++) {
                const t = i / segments;
                const segX = x + (endX - x) * t + (Math.random() - 0.5) * 10;
                const segY = y + (endY - y) * t + (Math.random() - 0.5) * 10;
                context.lineTo(segX, segY);
            }
            
            context.stroke();
            
            // Crear ramas secundarias
            if (Math.random() > 0.3 || depth === 0) {
                const branchAngle1 = angle + (Math.random() * 0.5 + 0.3);
                const branchAngle2 = angle - (Math.random() * 0.5 + 0.3);
                const branchLength = length * (Math.random() * 0.4 + 0.3);
                const branchWidth = width * 0.7;
                
                createCrackBranch(endX, endY, branchLength, branchAngle1, branchWidth, depth + 1);
                createCrackBranch(endX, endY, branchLength, branchAngle2, branchWidth, depth + 1);
            }
        };
        
        // Crear varias grietas principales
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const length = 50 + Math.random() * 50;
            createCrackBranch(centerX, centerY, length, angle, 3);
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createWalls() {
        // Textura de pared
        const wallTexture = this.createWallTexture();
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(5, 2);
        
        // Material de pared
        const wallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture,
            roughness: 0.9,
            metalness: 0.1,
            bumpMap: wallTexture,
            bumpScale: 0.05
        });
        
        // Crear paredes exteriores
        const wallThickness = 0.5;
        const wallHeight = 5;
        const roomSize = 40;
        
        // Pared norte
        const northWallGeometry = new THREE.BoxGeometry(roomSize, wallHeight, wallThickness);
        const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
        northWall.position.set(0, wallHeight / 2, -roomSize / 2);
        northWall.castShadow = true;
        northWall.receiveShadow = true;
        this.scene.add(northWall);
        this.objects.push(northWall);
        this.colliders.push(northWall);
        
        // Pared sur
        const southWallGeometry = new THREE.BoxGeometry(roomSize, wallHeight, wallThickness);
        const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
        southWall.position.set(0, wallHeight / 2, roomSize / 2);
        southWall.castShadow = true;
        southWall.receiveShadow = true;
        this.scene.add(southWall);
        this.objects.push(southWall);
        this.colliders.push(southWall);
        
        // Pared este
        const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, roomSize);
        const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
        eastWall.position.set(roomSize / 2, wallHeight / 2, 0);
        eastWall.castShadow = true;
        eastWall.receiveShadow = true;
        this.scene.add(eastWall);
        this.objects.push(eastWall);
        this.colliders.push(eastWall);
        
        // Pared oeste
        const westWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, roomSize);
        const westWall = new THREE.Mesh(westWallGeometry, wallMaterial);
        westWall.position.set(-roomSize / 2, wallHeight / 2, 0);
        westWall.castShadow = true;
        westWall.receiveShadow = true;
        this.scene.add(westWall);
        this.objects.push(westWall);
        this.colliders.push(westWall);
        
        // Añadir detalles a las paredes
        this.addWallDetails();
    }
    
    createWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Color base (blanco sucio)
        context.fillStyle = '#E0E0E0';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Añadir textura de azulejos
        const tileSize = 128;
        context.strokeStyle = '#CCCCCC';
        context.lineWidth = 2;
        
        for (let x = 0; x <= canvas.width; x += tileSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += tileSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }
        
        // Añadir manchas y suciedad
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 30 + 10;
            const alpha = Math.random() * 0.3;
            
            context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Añadir grietas
        context.strokeStyle = '#999999';
        
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const length = Math.random() * 100 + 50;
            const angle = Math.random() * Math.PI * 2;
            
            context.beginPath();
            context.moveTo(x, y);
            
            // Crear una línea ondulada
            for (let j = 0; j < length; j += 10) {
                const newX = x + Math.cos(angle) * j + (Math.random() - 0.5) * 10;
                const newY = y + Math.sin(angle) * j + (Math.random() - 0.5) * 10;
                context.lineTo(newX, newY);
            }
            
            context.lineWidth = Math.random() * 2 + 1;
            context.stroke();
        }
        
        // Añadir manchas de humedad
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 100 + 50;
            
            const gradient = context.createRadialGradient(
                x, y, 0,
                x, y, size
            );
            
            gradient.addColorStop(0, 'rgba(100, 100, 100, 0.5)');
            gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    addWallDetails() {
        // Añadir manchas de sangre en las paredes
        const bloodTexture = this.createBloodTexture();
        
        for (let i = 0; i < 8; i++) {
            const bloodMaterial = new THREE.MeshStandardMaterial({
                map: bloodTexture,
                transparent: true,
                opacity: 0.8,
                roughness: 0.7,
                metalness: 0.1
            });
            
            const bloodGeometry = new THREE.PlaneGeometry(1 + Math.random() * 2, 1 + Math.random() * 2);
            const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
            
            // Posicionar en una pared aleatoria
            const wallIndex = Math.floor(Math.random() * 4);
            const roomSize = 40;
            const wallHeight = 5;
            
            switch (wallIndex) {
                case 0: // Norte
                    blood.position.set(
                        (Math.random() - 0.5) * roomSize,
                        Math.random() * wallHeight * 0.8 + wallHeight * 0.2,
                        -roomSize / 2 + 0.01
                    );
                    blood.rotation.y = Math.PI;
                    break;
                case 1: // Sur
                    blood.position.set(
                        (Math.random() - 0.5) * roomSize,
                        Math.random() * wallHeight * 0.8 + wallHeight * 0.2,
                        roomSize / 2 - 0.01
                    );
                    break;
                case 2: // Este
                    blood.position.set(
                        roomSize / 2 - 0.01,
                        Math.random() * wallHeight * 0.8 + wallHeight * 0.2,
                        (Math.random() - 0.5) * roomSize
                    );
                    blood.rotation.y = -Math.PI / 2;
                    break;
                case 3: // Oeste
                    blood.position.set(
                        -roomSize / 2 + 0.01,
                        Math.random() * wallHeight * 0.8 + wallHeight * 0.2,
                        (Math.random() - 0.5) * roomSize
                    );
                    blood.rotation.y = Math.PI / 2;
                    break;
            }
            
            this.scene.add(blood);
            this.objects.push(blood);
        }
        
        // Añadir escrituras en las paredes
        const writingTexture = this.createWallWritingTexture();
        
        for (let i = 0; i < 5; i++) {
            const writingMaterial = new THREE.MeshStandardMaterial({
                map: writingTexture,
                transparent: true,
                opacity: 0.9,
                roughness: 0.7,
                metalness: 0.1
            });
            
            const writingGeometry = new THREE.PlaneGeometry(2 + Math.random() * 3, 1 + Math.random() * 2);
            const writing = new THREE.Mesh(writingGeometry, writingMaterial);
            
            // Posicionar en una pared aleatoria
            const wallIndex = Math.floor(Math.random() * 4);
            const roomSize = 40;
            const wallHeight = 5;
            
            switch (wallIndex) {
                case 0: // Norte
                    writing.position.set(
                        (Math.random() - 0.5) * roomSize,
                        Math.random() * wallHeight * 0.6 + wallHeight * 0.3,
                        -roomSize / 2 + 0.02
                    );
                    writing.rotation.y = Math.PI;
                    break;
                case 1: // Sur
                    writing.position.set(
                        (Math.random() - 0.5) * roomSize,
                        Math.random() * wallHeight * 0.6 + wallHeight * 0.3,
                        roomSize / 2 - 0.02
                    );
                    break;
                case 2: // Este
                    writing.position.set(
                        roomSize / 2 - 0.02,
                        Math.random() * wallHeight * 0.6 + wallHeight * 0.3,
                        (Math.random() - 0.5) * roomSize
                    );
                    writing.rotation.y = -Math.PI / 2;
                    break;
                case 3: // Oeste
                    writing.position.set(
                        -roomSize / 2 + 0.02,
                        Math.random() * wallHeight * 0.6 + wallHeight * 0.3,
                        (Math.random() - 0.5) * roomSize
                    );
                    writing.rotation.y = Math.PI / 2;
                    break;
            }
            
            this.scene.add(writing);
            this.objects.push(writing);
        }
    }
    
    createWallWritingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Fondo transparente
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Mensajes inquietantes
        const messages = [
            "AYÚDAME",
            "NO MIRES ATRÁS",
            "ELLA ESTÁ AQUÍ",
            "CORRE",
            "NO HAY SALIDA",
            "ÉL VIENE",
            "SÁLVAME",
            "666",
            "LA HUCHA TE OBSERVA",
            "NO DUERMAS"
        ];
        
        // Seleccionar mensaje aleatorio
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Dibujar texto
        context.font = 'bold 72px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Efecto de sangre
        context.fillStyle = 'rgba(180, 0, 0, 0.9)';
        context.fillText(message, canvas.width / 2, canvas.height / 2);
        
        // Añadir goteos
        for (let i = 0; i < message.length * 3; i++) {
            const x = canvas.width / 2 + (Math.random() - 0.5) * message.length * 30;
            const y = canvas.height / 2;
            
            const dropLength = Math.random() * 100 + 20;
            const dropWidth = Math.random() * 10 + 2;
            
            context.beginPath();
            context.moveTo(x, y);
            
            // Crear línea ondulada hacia abajo
            for (let j = 0; j < dropLength; j += 5) {
                const newX = x + (Math.random() - 0.5) * 5;
                const newY = y + j;
                context.lineTo(newX, newY);
            }
            
            context.lineWidth = dropWidth;
            context.strokeStyle = 'rgba(180, 0, 0, 0.7)';
            context.stroke();
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createCeiling() {
        // Textura del techo
        const ceilingTexture = this.createCeilingTexture();
        ceilingTexture.wrapS = THREE.RepeatWrapping;
        ceilingTexture.wrapT = THREE.RepeatWrapping;
        ceilingTexture.repeat.set(10, 10);
        
        // Material del techo
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            map: ceilingTexture,
            roughness: 0.8,
            metalness: 0.2,
            bumpMap: ceilingTexture,
            bumpScale: 0.05
        });
        
        // Geometría del techo
        const ceilingGeometry = new THREE.PlaneGeometry(40, 40);
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 5;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
        this.objects.push(ceiling);
    }
    
    createCeilingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Color base
        context.fillStyle = '#CCCCCC';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Añadir textura de paneles
        const panelSize = 128;
        context.strokeStyle = '#AAAAAA';
        context.lineWidth = 3;
        
        for (let x = 0; x <= canvas.width; x += panelSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += panelSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }
        
        // Añadir manchas de humedad
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 80 + 40;
            
            const gradient = context.createRadialGradient(
                x, y, 0,
                x, y, size
            );
            
            gradient.addColorStop(0, 'rgba(100, 100, 100, 0.7)');
            gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Añadir detalles de óxido y deterioro
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 10 + 5;
            
            context.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.5 + 0.2})`;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createDoors() {
        // Textura de puerta
        const doorTexture = this.createDoorTexture();
        
        // Material de puerta
        const doorMaterial = new THREE.MeshStandardMaterial({
            map: doorTexture,
            roughness: 0.8,
            metalness: 0.3,
            bumpMap: doorTexture,
            bumpScale: 0.1
        });
        
        // Crear puertas en las paredes
        const roomSize = 40;
        const wallHeight = 5;
        const doorWidth = 2;
        const doorHeight = 3;
        
        // Puerta en pared norte
        const northDoorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.2);
        const northDoor = new THREE.Mesh(northDoorGeometry, doorMaterial);
        northDoor.position.set(roomSize / 4, doorHeight / 2, -roomSize / 2 + 0.1);
        northDoor.castShadow = true;
        northDoor.receiveShadow = true;
        this.scene.add(northDoor);
        this.objects.push(northDoor);
        this.doors.push(northDoor);
        
        // Puerta en pared sur
        const southDoorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.2);
        const southDoor = new THREE.Mesh(southDoorGeometry, doorMaterial);
        southDoor.position.set(-roomSize / 4, doorHeight / 2, roomSize / 2 - 0.1);
        southDoor.castShadow = true;
        southDoor.receiveShadow = true;
        this.scene.add(southDoor);
        this.objects.push(southDoor);
        this.doors.push(southDoor);
        
        // Puerta en pared este
        const eastDoorGeometry = new THREE.BoxGeometry(0.2, doorHeight, doorWidth);
        const eastDoor = new THREE.Mesh(eastDoorGeometry, doorMaterial);
        eastDoor.position.set(roomSize / 2 - 0.1, doorHeight / 2, roomSize / 4);
        eastDoor.castShadow = true;
        eastDoor.receiveShadow = true;
        this.scene.add(eastDoor);
        this.objects.push(eastDoor);
        this.doors.push(eastDoor);
        
        // Añadir marcos de puertas
        this.addDoorFrames();
    }
    
    createDoorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Color base (marrón oscuro)
        context.fillStyle = '#5D4037';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Añadir textura de madera
        context.strokeStyle = '#3E2723';
        context.lineWidth = 2;
        
        // Líneas verticales
        for (let x = 20; x < canvas.width; x += 40) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        
        // Líneas horizontales para paneles
        for (let y = canvas.height / 4; y < canvas.height; y += canvas.height / 4) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }
        
        // Añadir detalles de desgaste
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 3 + 1;
            const gray = Math.floor(Math.random() * 20 + 30);
            
            context.fillStyle = `rgb(${gray}, ${Math.floor(gray * 0.7)}, ${Math.floor(gray * 0.4)})`;
            context.fillRect(x, y, size, size);
        }
        
        // Añadir manija de puerta
        const handleY = canvas.height / 2;
        const handleX = canvas.width * 0.8;
        
        // Base de la manija
        context.fillStyle = '#B87333'; // Cobre
        context.beginPath();
        context.arc(handleX, handleY, 10, 0, Math.PI * 2);
        context.fill();
        
        // Manija
        context.beginPath();
        context.arc(handleX, handleY, 5, 0, Math.PI * 2);
        context.fillStyle = '#D4AF37'; // Oro
        context.fill();
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    addDoorFrames() {
        // Material para marcos de puertas
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3E2723,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const roomSize = 40;
        const doorWidth = 2;
        const doorHeight = 3;
        const frameThickness = 0.1;
        
        // Marcos para puerta norte
        const northDoorPosition = new THREE.Vector3(roomSize / 4, doorHeight / 2, -roomSize / 2 + 0.1);
        
        // Marco superior
        const northTopFrameGeometry = new THREE.BoxGeometry(doorWidth + frameThickness * 2, frameThickness, 0.3);
        const northTopFrame = new THREE.Mesh(northTopFrameGeometry, frameMaterial);
        northTopFrame.position.set(northDoorPosition.x, doorHeight + frameThickness / 2, northDoorPosition.z);
        this.scene.add(northTopFrame);
        this.objects.push(northTopFrame);
        
        // Marcos laterales
        const northSideFrameGeometry = new THREE.BoxGeometry(frameThickness, doorHeight, 0.3);
        
        const northLeftFrame = new THREE.Mesh(northSideFrameGeometry, frameMaterial);
        northLeftFrame.position.set(northDoorPosition.x - doorWidth / 2 - frameThickness / 2, doorHeight / 2, northDoorPosition.z);
        this.scene.add(northLeftFrame);
        this.objects.push(northLeftFrame);
        
        const northRightFrame = new THREE.Mesh(northSideFrameGeometry, frameMaterial);
        northRightFrame.position.set(northDoorPosition.x + doorWidth / 2 + frameThickness / 2, doorHeight / 2, northDoorPosition.z);
        this.scene.add(northRightFrame);
        this.objects.push(northRightFrame);
        
        // Repetir para las otras puertas...
        // (Código similar para las puertas sur y este)
    }
    
    createWindows() {
        // Textura de ventana
        const windowTexture = this.createWindowTexture();
        
        // Material de ventana
        const windowMaterial = new THREE.MeshStandardMaterial({
            map: windowTexture,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.5,
            bumpMap: windowTexture,
            bumpScale: 0.05
        });
        
        // Crear ventanas en las paredes
        const roomSize = 40;
        const wallHeight = 5;
        const windowWidth = 1.5;
        const windowHeight = 1.5;
        const windowY = 3;
        
        // Ventanas en pared norte
        for (let i = -1; i <= 1; i += 2) {
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(i * roomSize / 3, windowY, -roomSize / 2 + 0.05);
            windowMesh.castShadow = false;
            windowMesh.receiveShadow = true;
            this.scene.add(windowMesh);
            this.objects.push(windowMesh);
            this.windows.push(windowMesh);
        }
        
        // Ventanas en pared sur
        for (let i = -1; i <= 1; i += 2) {
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(i * roomSize / 3, windowY, roomSize / 2 - 0.05);
            windowMesh.rotation.y = Math.PI;
            windowMesh.castShadow = false;
            windowMesh.receiveShadow = true;
            this.scene.add(windowMesh);
            this.objects.push(windowMesh);
            this.windows.push(windowMesh);
        }
        
        // Ventanas en pared este
        for (let i = -1; i <= 1; i += 2) {
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(roomSize / 2 - 0.05, windowY, i * roomSize / 3);
            windowMesh.rotation.y = -Math.PI / 2;
            windowMesh.castShadow = false;
            windowMesh.receiveShadow = true;
            this.scene.add(windowMesh);
            this.objects.push(windowMesh);
            this.windows.push(windowMesh);
        }
        
        // Ventanas en pared oeste
        for (let i = -1; i <= 1; i += 2) {
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(-roomSize / 2 + 0.05, windowY, i * roomSize / 3);
            windowMesh.rotation.y = Math.PI / 2;
            windowMesh.castShadow = false;
            windowMesh.receiveShadow = true;
            this.scene.add(windowMesh);
            this.objects.push(windowMesh);
            this.windows.push(windowMesh);
        }
        
        // Añadir marcos de ventanas
        this.addWindowFrames();
    }
    
    createWindowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Fondo semitransparente (vidrio)
        context.fillStyle = 'rgba(200, 230, 255, 0.6)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Añadir reflejos
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 50 + 20;
            
            const gradient = context.createRadialGradient(
                x, y, 0,
                x, y, size
            );
            
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Añadir suciedad y manchas
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 5 + 1;
            
            context.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Añadir grietas
        if (Math.random() > 0.5) {
            const centerX = Math.random() * canvas.width;
            const centerY = Math.random() * canvas.height;
            
            context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            context.lineWidth = 1;
            
            const createCrack = (x, y, length, angle, depth = 0) => {
                if (depth > 3) return;
                
                const endX = x + Math.cos(angle) * length;
                const endY = y + Math.sin(angle) * length;
                
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(endX, endY);
                context.stroke();
                
                if (Math.random() > 0.3) {
                    const newAngle1 = angle + (Math.random() * 0.8 - 0.4);
                    const newAngle2 = angle + (Math.random() * 0.8 - 0.4);
                    const newLength = length * 0.7;
                    
                    createCrack(endX, endY, newLength, newAngle1, depth + 1);
                    createCrack(endX, endY, newLength, newAngle2, depth + 1);
                }
            };
            
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                createCrack(centerX, centerY, 30 + Math.random() * 30, angle);
            }
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    addWindowFrames() {
        // Material para marcos de ventanas
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x3E2723,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Añadir marcos a cada ventana
        for (const windowMesh of this.windows) {
            const windowWidth = windowMesh.geometry.parameters.width;
            const windowHeight = windowMesh.geometry.parameters.height;
            const frameThickness = 0.1;
            
            // Crear grupo para el marco
            const frameGroup = new THREE.Group();
            frameGroup.position.copy(windowMesh.position);
            frameGroup.rotation.copy(windowMesh.rotation);
            
            // Marco superior
            const topFrameGeometry = new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, 0.1);
            const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
            topFrame.position.set(0, windowHeight / 2 + frameThickness / 2, 0);
            frameGroup.add(topFrame);
            
            // Marco inferior
            const bottomFrameGeometry = new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, 0.1);
            const bottomFrame = new THREE.Mesh(bottomFrameGeometry, frameMaterial);
            bottomFrame.position.set(0, -windowHeight / 2 - frameThickness / 2, 0);
            frameGroup.add(bottomFrame);
            
            // Marco izquierdo
            const leftFrameGeometry = new THREE.BoxGeometry(frameThickness, windowHeight, 0.1);
            const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
            leftFrame.position.set(-windowWidth / 2 - frameThickness / 2, 0, 0);
            frameGroup.add(leftFrame);
            
            // Marco derecho
            const rightFrameGeometry = new THREE.BoxGeometry(frameThickness, windowHeight, 0.1);
            const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
            rightFrame.position.set(windowWidth / 2 + frameThickness / 2, 0, 0);
            frameGroup.add(rightFrame);
            
            // Añadir cruceta horizontal
            const horizontalBarGeometry = new THREE.BoxGeometry(windowWidth, frameThickness / 2, 0.05);
            const horizontalBar = new THREE.Mesh(horizontalBarGeometry, frameMaterial);
            horizontalBar.position.set(0, 0, 0.01);
            frameGroup.add(horizontalBar);
            
            // Añadir cruceta vertical
            const verticalBarGeometry = new THREE.BoxGeometry(frameThickness / 2, windowHeight, 0.05);
            const verticalBar = new THREE.Mesh(verticalBarGeometry, frameMaterial);
            verticalBar.position.set(0, 0, 0.01);
            frameGroup.add(verticalBar);
            
            this.scene.add(frameGroup);
            this.objects.push(frameGroup);
        }
    }
    
    createLighting() {
        // Luz ambiental tenue
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Luces de techo (fluorescentes)
        const createCeilingLight = (x, z) => {
            // Luz
            const light = new THREE.PointLight(0xCCFFFF, 0.8, 15);
            light.position.set(x, 4.8, z);
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            this.scene.add(light);
            this.lights.push(light);
            
            // Carcasa de la luz
            const fixtureGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
            const fixtureMaterial = new THREE.MeshStandardMaterial({
                color: 0xCCCCCC,
                roughness: 0.5,
                metalness: 0.7
            });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(x, 4.9, z);
            this.scene.add(fixture);
            this.objects.push(fixture);
            
            // Tubo fluorescente
            const tubeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 16);
            const tubeMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                roughness: 0.3,
                metalness: 0.8,
                emissive: 0xCCFFFF,
                emissiveIntensity: 0.5
            });
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            tube.rotation.z = Math.PI / 2;
            tube.position.set(x, 4.75, z);
            this.scene.add(tube);
            this.objects.push(tube);
            
            // Añadir parpadeo aleatorio
            const flickerLight = () => {
                if (Math.random() > 0.97) {
                    light.intensity = Math.random() * 0.5 + 0.3;
                    tube.material.emissiveIntensity = light.intensity * 0.6;
                    
                    // Restaurar después de un tiempo aleatorio
                    setTimeout(() => {
                        light.intensity = 0.8;
                        tube.material.emissiveIntensity = 0.5;
                    }, Math.random() * 200 + 50);
                }
                
                setTimeout(flickerLight, Math.random() * 1000 + 500);
            };
            
            flickerLight();
            
            return { light, fixture, tube };
        };
        
        // Crear varias luces de techo
        createCeilingLight(-10, -10);
        createCeilingLight(10, -10);
        createCeilingLight(-10, 10);
        createCeilingLight(10, 10);
        createCeilingLight(0, 0);
        
        // Luz exterior que entra por las ventanas
        for (const windowMesh of this.windows) {
            const windowLight = new THREE.SpotLight(0x6699CC, 0.5, 20, Math.PI / 4, 0.5, 1);
            
            // Posicionar la luz según la orientación de la ventana
            const direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(windowMesh.quaternion);
            
            const lightPosition = windowMesh.position.clone();
            lightPosition.add(direction.multiplyScalar(-2)); // Colocar fuera de la ventana
            
            windowLight.position.copy(lightPosition);
            windowLight.target.position.copy(windowMesh.position);
            windowLight.target.updateMatrixWorld();
            
            this.scene.add(windowLight);
            this.scene.add(windowLight.target);
            this.lights.push(windowLight);
        }
    }
    
    createProps() {
        // Crear camas
        this.createBeds();
        
        // Crear mesas y sillas
        this.createFurniture();
        
        // Crear equipamiento médico
        this.createMedicalEquipment();
        
        // Crear objetos decorativos
        this.createDecorativeObjects();
    }
    
    createBeds() {
        // Material para camas
        const bedFrameMaterial = new THREE.MeshStandardMaterial({
            color: 0x8D6E63,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const mattressMaterial = new THREE.MeshStandardMaterial({
            color: 0xEEEEEE,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const sheetMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Crear varias camas
        const createBed = (x, z, rotation = 0) => {
            const bed = new THREE.Group();
            
            // Marco de la cama
            const frameGeometry = new THREE.BoxGeometry(1, 0.2, 2);
            const frame = new THREE.Mesh(frameGeometry, bedFrameMaterial);
            frame.position.y = 0.1;
            bed.add(frame);
            
            // Cabecera
            const headboardGeometry = new THREE.BoxGeometry(1, 0.8, 0.1);
            const headboard = new THREE.Mesh(headboardGeometry, bedFrameMaterial);
            headboard.position.set(0, 0.5, -0.95);
            bed.add(headboard);
            
            // Piecera
            const footboardGeometry = new THREE.BoxGeometry(1, 0.4, 0.1);
            const footboard = new THREE.Mesh(footboardGeometry, bedFrameMaterial);
            footboard.position.set(0, 0.3, 0.95);
            bed.add(footboard);
            
            // Colchón
            const mattressGeometry = new THREE.BoxGeometry(0.9, 0.1, 1.9);
            const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
            mattress.position.y = 0.25;
            bed.add(mattress);
            
            // Sábana
            const sheetGeometry = new THREE.BoxGeometry(0.9, 0.05, 1.5);
            const sheet = new THREE.Mesh(sheetGeometry, sheetMaterial);
            sheet.position.set(0, 0.325, 0.2);
            bed.add(sheet);
            
            // Almohada
            const pillowGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.3);
            const pillow = new THREE.Mesh(pillowGeometry, sheetMaterial);
            pillow.position.set(0, 0.35, -0.7);
            bed.add(pillow);
            
            // Posicionar y rotar la cama
            bed.position.set(x, 0, z);
            bed.rotation.y = rotation;
            
            // Añadir manchas a la cama
            if (Math.random() > 0.5) {
                const bloodTexture = this.createBloodTexture();
                const bloodMaterial = new THREE.MeshStandardMaterial({
                    map: bloodTexture,
                    transparent: true,
                    opacity: 0.8,
                    roughness: 0.7,
                    metalness: 0.1
                });
                
                const bloodGeometry = new THREE.PlaneGeometry(0.7, 0.7);
                const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
                blood.rotation.x = -Math.PI / 2;
                blood.position.set(0, 0.36, 0);
                blood.rotation.z = Math.random() * Math.PI * 2;
                bed.add(blood);
            }
            
            this.scene.add(bed);
            this.objects.push(bed);
            this.colliders.push(bed);
            
            return bed;
        };
        
        // Crear camas en diferentes posiciones
        createBed(-15, -15, Math.PI / 4);
        createBed(-15, 15, -Math.PI / 4);
        createBed(15, -15, -Math.PI / 4 * 3);
        createBed(15, 15, Math.PI / 4 * 3);
    }
    
    createFurniture() {
        // Material para muebles
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x5D4037,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xB0BEC5,
            roughness: 0.5,
            metalness: 0.7
        });
        
        // Crear mesas
        const createTable = (x, z, rotation = 0) => {
            const table = new THREE.Group();
            
            // Tablero
            const topGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
            const top = new THREE.Mesh(topGeometry, woodMaterial);
            top.position.y = 0.75;
            table.add(top);
            
            // Patas
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.75, 8);
            
            for (let i = 0; i < 4; i++) {
                const leg = new THREE.Mesh(legGeometry, woodMaterial);
                leg.position.set(
                    ((i % 2) * 2 - 1) * 0.5,
                    0.375,
                    (Math.floor(i / 2) * 2 - 1) * 0.3
                );
                table.add(leg);
            }
            
            // Posicionar y rotar la mesa
            table.position.set(x, 0, z);
            table.rotation.y = rotation;
            
            this.scene.add(table);
            this.objects.push(table);
            this.colliders.push(table);
            
            return table;
        };
        
        // Crear sillas
        const createChair = (x, z, rotation = 0) => {
            const chair = new THREE.Group();
            
            // Asiento
            const seatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
            const seat = new THREE.Mesh(seatGeometry, woodMaterial);
            seat.position.y = 0.45;
            chair.add(seat);
            
            // Respaldo
            const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
            const back = new THREE.Mesh(backGeometry, woodMaterial);
            back.position.set(0, 0.7, -0.225);
            chair.add(back);
            
            // Patas
            const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8);
            
            for (let i = 0; i < 4; i++) {
                const leg = new THREE.Mesh(legGeometry, woodMaterial);
                leg.position.set(
                    ((i % 2) * 2 - 1) * 0.2,
                    0.225,
                    (Math.floor(i / 2) * 2 - 1) * 0.2
                );
                chair.add(leg);
            }
            
            // Posicionar y rotar la silla
            chair.position.set(x, 0, z);
            chair.rotation.y = rotation;
            
            this.scene.add(chair);
            this.objects.push(chair);
            this.colliders.push(chair);
            
            return chair;
        };
        
        // Crear conjuntos de mesa y sillas
        const createTableSet = (x, z, rotation = 0) => {
            const table = createTable(x, z, rotation);
            
            // Añadir sillas alrededor de la mesa
            createChair(x, z + 0.9, 0);
            createChair(x, z - 0.9, Math.PI);
            createChair(x + 0.9, z, Math.PI / 2);
            createChair(x - 0.9, z, -Math.PI / 2);
            
            return table;
        };
        
        // Crear conjuntos de mesa y sillas en diferentes posiciones
        createTableSet(0, 0);
        createTableSet(-10, 10, Math.PI / 4);
        createTableSet(10, -10, -Math.PI / 4);
    }
    
    createMedicalEquipment() {
        // Material para equipamiento médico
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xB0BEC5,
            roughness: 0.5,
            metalness: 0.7
        });
        
        const plasticMaterial = new THREE.MeshStandardMaterial({
            color: 0xECEFF1,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Crear carrito médico
        const createMedicalCart = (x, z, rotation = 0) => {
            const cart = new THREE.Group();
            
            // Base
            const baseGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.4);
            const base = new THREE.Mesh(baseGeometry, metalMaterial);
            base.position.y = 0.1;
            cart.add(base);
            
            // Estantes
            for (let i = 0; i < 3; i++) {
                const shelfGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.4);
                const shelf = new THREE.Mesh(shelfGeometry, metalMaterial);
                shelf.position.y = 0.3 + i * 0.3;
                cart.add(shelf);
            }
            
            // Estructura
            for (let i = 0; i < 4; i++) {
                const poleGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.9, 8);
                const pole = new THREE.Mesh(poleGeometry, metalMaterial);
                pole.position.set(
                    ((i % 2) * 2 - 1) * 0.28,
                    0.45,
                    (Math.floor(i / 2) * 2 - 1) * 0.18
                );
                cart.add(pole);
            }
            
            // Ruedas
            for (let i = 0; i < 4; i++) {
                const wheelGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
                wheelGeometry.rotateX(Math.PI / 2);
                const wheel = new THREE.Mesh(wheelGeometry, plasticMaterial);
                wheel.position.set(
                    ((i % 2) * 2 - 1) * 0.25,
                    0.03,
                    (Math.floor(i / 2) * 2 - 1) * 0.15
                );
                cart.add(wheel);
            }
            
            // Añadir algunos objetos médicos en los estantes
            const createMedicalItem = (y, size, color) => {
                const itemGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                const itemMaterial = new THREE.MeshStandardMaterial({
                    color: color,
                    roughness: 0.7,
                    metalness: 0.3
                });
                const item = new THREE.Mesh(itemGeometry, itemMaterial);
                item.position.y = y;
                item.position.x = (Math.random() - 0.5) * 0.4;
                item.position.z = (Math.random() - 0.5) * 0.2;
                cart.add(item);
            };
            
            // Añadir varios objetos médicos
            createMedicalItem(0.33, { x: 0.1, y: 0.05, z: 0.1 }, 0xFF5252); // Rojo
            createMedicalItem(0.33, { x: 0.15, y: 0.03, z: 0.08 }, 0x2196F3); // Azul
            createMedicalItem(0.63, { x: 0.2, y: 0.1, z: 0.15 }, 0xFFFFFF); // Blanco
            createMedicalItem(0.93, { x: 0.1, y: 0.15, z: 0.1 }, 0x4CAF50); // Verde
            
            // Posicionar y rotar el carrito
            cart.position.set(x, 0, z);
            cart.rotation.y = rotation;
            
            this.scene.add(cart);
            this.objects.push(cart);
            this.colliders.push(cart);
            
            return cart;
        };
        
        // Crear silla de ruedas
        const createWheelchair = (x, z, rotation = 0) => {
            const wheelchair = new THREE.Group();
            
            // Asiento
            const seatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
            const seat = new THREE.Mesh(seatGeometry, plasticMaterial);
            seat.position.y = 0.5;
            wheelchair.add(seat);
            
            // Respaldo
            const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
            const back = new THREE.Mesh(backGeometry, plasticMaterial);
            back.position.set(0, 0.75, -0.225);
            wheelchair.add(back);
            
            // Estructura
            const frameGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
            
            for (let i = 0; i < 4; i++) {
                const frame = new THREE.Mesh(frameGeometry, metalMaterial);
                frame.position.set(
                    ((i % 2) * 2 - 1) * 0.24,
                    0.25,
                    (Math.floor(i / 2) * 2 - 1) * 0.24
                );
                wheelchair.add(frame);
            }
            
            // Ruedas grandes
            for (let i = 0; i < 2; i++) {
                const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
                wheelGeometry.rotateX(Math.PI / 2);
                const wheel = new THREE.Mesh(wheelGeometry, metalMaterial);
                wheel.position.set(((i * 2) - 1) * 0.3, 0.2, 0.1);
                wheelchair.add(wheel);
                
                // Radios
                for (let j = 0; j < 8; j++) {
                    const spokeGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.18, 4);
                    const spoke = new THREE.Mesh(spokeGeometry, metalMaterial);
                    spoke.position.copy(wheel.position);
                    spoke.rotation.z = j * Math.PI / 4;
                    wheelchair.add(spoke);
                }
            }
            
            // Ruedas pequeñas
            for (let i = 0; i < 2; i++) {
                const wheelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16);
                wheelGeometry.rotateX(Math.PI / 2);
                const wheel = new THREE.Mesh(wheelGeometry, plasticMaterial);
                wheel.position.set(((i * 2) - 1) * 0.2, 0.05, -0.2);
                wheelchair.add(wheel);
            }
            
            // Posicionar y rotar la silla de ruedas
            wheelchair.position.set(x, 0, z);
            wheelchair.rotation.y = rotation;
            
            this.scene.add(wheelchair);
            this.objects.push(wheelchair);
            this.colliders.push(wheelchair);
            
            return wheelchair;
        };
        
        // Crear equipamiento médico en diferentes posiciones
        createMedicalCart(-5, 5, Math.PI / 6);
        createMedicalCart(8, -8, -Math.PI / 3);
        createWheelchair(-8, -5, Math.PI / 4);
        createWheelchair(5, 8, -Math.PI / 2);
    }
    
    createDecorativeObjects() {
        // Crear cuadros en las paredes
        this.createPaintings();
        
        // Crear manchas de sangre y otros detalles
        this.createBloodTrails();
        
        // Crear objetos tirados por el suelo
        this.createDebris();
    }
    
    createPaintings() {
        // Material para marcos
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x5D4037,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Crear cuadros
        const createPainting = (x, y, z, width, height, rotation, wallIndex) => {
            const painting = new THREE.Group();
            
            // Crear textura para el cuadro
            const paintingTexture = this.createPaintingTexture();
            
            // Lienzo
            const canvasMaterial = new THREE.MeshStandardMaterial({
                map: paintingTexture,
                roughness: 0.8,
                metalness: 0.1
            });
            
            const canvasGeometry = new THREE.PlaneGeometry(width - 0.1, height - 0.1);
            const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
            canvas.position.z = 0.01;
            painting.add(canvas);
            
            // Marco
            const frameWidth = 0.05;
            
            // Marco superior
            const topFrameGeometry = new THREE.BoxGeometry(width, frameWidth, 0.05);
            const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
            topFrame.position.y = height / 2 - frameWidth / 2;
            painting.add(topFrame);
            
            // Marco inferior
            const bottomFrameGeometry = new THREE.BoxGeometry(width, frameWidth, 0.05);
            const bottomFrame = new THREE.Mesh(bottomFrameGeometry, frameMaterial);
            bottomFrame.position.y = -height / 2 + frameWidth / 2;
            painting.add(bottomFrame);
            
            // Marco izquierdo
            const leftFrameGeometry = new THREE.BoxGeometry(frameWidth, height - frameWidth * 2, 0.05);
            const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
            leftFrame.position.x = -width / 2 + frameWidth / 2;
            painting.add(leftFrame);
            
            // Marco derecho
            const rightFrameGeometry = new THREE.BoxGeometry(frameWidth, height - frameWidth * 2, 0.05);
            const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
            rightFrame.position.x = width / 2 - frameWidth / 2;
            painting.add(rightFrame);
            
            // Posicionar y rotar el cuadro
            painting.position.set(x, y, z);
            
            // Rotar según la pared
            switch (wallIndex) {
                case 0: // Norte
                    painting.rotation.y = Math.PI;
                    break;
                case 1: // Sur
                    painting.rotation.y = 0;
                    break;
                case 2: // Este
                    painting.rotation.y = -Math.PI / 2;
                    break;
                case 3: // Oeste
                    painting.rotation.y = Math.PI / 2;
                    break;
            }
            
            // Añadir rotación adicional
            painting.rotation.z = rotation;
            
            this.scene.add(painting);
            this.objects.push(painting);
            
            return painting;
        };
        
        // Crear cuadros en diferentes paredes
        const roomSize = 40;
        
        // Pared norte
        createPainting(-8, 3, -roomSize / 2 + 0.1, 1.5, 1, 0, 0);
        createPainting(5, 2.5, -roomSize / 2 + 0.1, 2, 1.5, Math.PI / 20, 0);
        
        // Pared sur
        createPainting(-5, 2.8, roomSize / 2 - 0.1, 1.8, 1.2, -Math.PI / 30, 1);
        createPainting(8, 3.2, roomSize / 2 - 0.1, 1.2, 1.8, Math.PI / 40, 1);
        
        // Pared este
        createPainting(roomSize / 2 - 0.1, 2.5, -7, 1.5, 1.2, Math.PI / 25, 2);
        
        // Pared oeste
        createPainting(-roomSize / 2 + 0.1, 3, 6, 1.3, 1.7, -Math.PI / 15, 3);
    }
    
    createPaintingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Fondo
        context.fillStyle = '#F5F5F5';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Tipo de pintura (aleatorio)
        const paintingType = Math.floor(Math.random() * 4);
        
        switch (paintingType) {
            case 0: // Retrato perturbador
                // Fondo oscuro
                context.fillStyle = '#333333';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                // Cara
                context.fillStyle = '#DDDDDD';
                context.beginPath();
                context.arc(canvas.width / 2, canvas.height / 2 - 20, 60, 0, Math.PI * 2);
                context.fill();
                
                // Ojos
                context.fillStyle = '#000000';
                context.beginPath();
                context.arc(canvas.width / 2 - 20, canvas.height / 2 - 30, 10, 0, Math.PI * 2);
                context.fill();
                
                context.beginPath();
                context.arc(canvas.width / 2 + 20, canvas.height / 2 - 30, 10, 0, Math.PI * 2);
                context.fill();
                
                // Boca perturbadora
                context.strokeStyle = '#990000';
                context.lineWidth = 3;
                context.beginPath();
                context.arc(canvas.width / 2, canvas.height / 2, 30, 0.2, Math.PI - 0.2);
                context.stroke();
                
                // Manchas de sangre
                context.fillStyle = '#990000';
                for (let i = 0; i < 20; i++) {
                    context.beginPath();
                    context.arc(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        Math.random() * 5 + 2,
                        0,
                        Math.PI * 2
                    );
                    context.fill();
                }
                break;
                
            case 1: // Paisaje tétrico
                // Cielo
                const skyGradient = context.createLinearGradient(0, 0, 0, canvas.height * 0.6);
                skyGradient.addColorStop(0, '#000033');
                skyGradient.addColorStop(1, '#660000');
                context.fillStyle = skyGradient;
                context.fillRect(0, 0, canvas.width, canvas.height * 0.6);
                
                // Tierra
                context.fillStyle = '#332200';
                context.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
                
                // Luna
                context.fillStyle = '#FFCCCC';
                context.beginPath();
                context.arc(canvas.width * 0.8, canvas.height * 0.2, 30, 0, Math.PI * 2);
                context.fill();
                
                // Árboles muertos
                context.strokeStyle = '#111111';
                context.lineWidth = 2;
                
                for (let i = 0; i < 5; i++) {
                    const x = canvas.width * (0.1 + i * 0.2);
                    const y = canvas.height * 0.6;
                    
                    // Tronco
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x, y - 50 - Math.random() * 30);
                    context.stroke();
                    
                    // Ramas
                    this.drawBranch(context, x, y - 50, 30, -Math.PI / 2, 3);
                }
                break;
                
            case 2: // Patrón abstracto
                // Fondo
                context.fillStyle = '#EEEEEE';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                // Formas geométricas
                for (let i = 0; i < 30; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const size = Math.random() * 50 + 10;
                    
                    // Color aleatorio oscuro
                    const r = Math.floor(Math.random() * 100);
                    const g = Math.floor(Math.random() * 100);
                    const b = Math.floor(Math.random() * 100);
                    context.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    
                    // Forma aleatoria
                    const shape = Math.floor(Math.random() * 3);
                    
                    switch (shape) {
                        case 0: // Círculo
                            context.beginPath();
                            context.arc(x, y, size / 2, 0, Math.PI * 2);
                            context.fill();
                            break;
                        case 1: // Cuadrado
                            context.fillRect(x - size / 2, y - size / 2, size, size);
                            break;
                        case 2: // Triángulo
                            context.beginPath();
                            context.moveTo(x, y - size / 2);
                            context.lineTo(x + size / 2, y + size / 2);
                            context.lineTo(x - size / 2, y + size / 2);
                            context.closePath();
                            context.fill();
                            break;
                    }
                }
                
                // Líneas que conectan las formas
                context.strokeStyle = '#660000';
                context.lineWidth = 1;
                
                for (let i = 0; i < 20; i++) {
                    const x1 = Math.random() * canvas.width;
                    const y1 = Math.random() * canvas.height;
                    const x2 = Math.random() * canvas.width;
                    const y2 = Math.random() * canvas.height;
                    
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.stroke();
                }
                break;
                
            case 3: // Mensaje escrito con sangre
                // Fondo
                context.fillStyle = '#EEEEEE';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                // Mensajes inquietantes
                const messages = [
                    "AYÚDAME",
                    "NO MIRES ATRÁS",
                    "ELLA ESTÁ AQUÍ",
                    "CORRE",
                    "NO HAY SALIDA",
                    "ÉL VIENE",
                    "SÁLVAME",
                    "666",
                    "LA HUCHA TE OBSERVA",
                    "NO DUERMAS"
                ];
                
                // Seleccionar mensaje aleatorio
                const message = messages[Math.floor(Math.random() * messages.length)];
                
                // Dibujar texto
                context.font = 'bold 36px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                
                // Efecto de sangre
                context.fillStyle = 'rgba(180, 0, 0, 0.9)';
                context.fillText(message, canvas.width / 2, canvas.height / 2);
                
                // Añadir goteos
                for (let i = 0; i < message.length * 3; i++) {
                    const x = canvas.width / 2 + (Math.random() - 0.5) * message.length * 15;
                    const y = canvas.height / 2 + 20;
                    
                    const dropLength = Math.random() * 100 + 20;
                    const dropWidth = Math.random() * 5 + 1;
                    
                    context.beginPath();
                    context.moveTo(x, y);
                    
                    // Crear línea ondulada hacia abajo
                    for (let j = 0; j < dropLength; j += 5) {
                        const newX = x + (Math.random() - 0.5) * 5;
                        const newY = y + j;
                        context.lineTo(newX, newY);
                    }
                    
                    context.lineWidth = dropWidth;
                    context.strokeStyle = 'rgba(180, 0, 0, 0.7)';
                    context.stroke();
                }
                
                // Añadir manchas
                for (let i = 0; i < 10; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const size = Math.random() * 10 + 5;
                    
                    context.beginPath();
                    context.arc(x, y, size, 0, Math.PI * 2);
                    context.fillStyle = 'rgba(180, 0, 0, 0.6)';
                    context.fill();
                }
                break;
        }
        
        // Añadir efecto de envejecimiento
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2 + 0.5;
            const alpha = Math.random() * 0.3;
            
            context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            context.fillRect(x, y, size, size);
        }
        
        // Crear textura de Three.js
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    drawBranch(context, x, y, length, angle, depth) {
        if (depth === 0) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(endX, endY);
        context.stroke();
        
        // Dibujar ramas recursivamente
        this.drawBranch(
            context,
            endX,
            endY,
            length * 0.7,
            angle + Math.random() * 0.5 - 0.25,
            depth - 1
        );
        
        this.drawBranch(
            context,
            endX,
            endY,
            length * 0.7,
            angle + Math.random() * 0.5 + 0.25,
            depth - 1
        );
    }
    
    createBloodTrails() {
        // Crear rastros de sangre en el suelo
        const createBloodTrail = (startX, startZ, length, angle) => {
            const points = [];
            
            // Crear puntos para el rastro
            for (let i = 0; i < length; i += 0.2) {
                const x = startX + Math.cos(angle) * i + (Math.random() - 0.5) * 0.3;
                const z = startZ + Math.sin(angle) * i + (Math.random() - 0.5) * 0.3;
                points.push(new THREE.Vector2(x, z));
            }
            
            // Crear forma
            const shape = new THREE.Shape(points);
            shape.autoClose = false;
            
            // Añadir grosor
            for (let i = 0; i < length; i += 0.2) {
                const width = 0.2 - i / length * 0.15; // Más ancho al principio
                const perpAngle = angle + Math.PI / 2;
                const x = startX + Math.cos(angle) * i + Math.cos(perpAngle) * width;
                const z = startZ + Math.sin(angle) * i + Math.sin(perpAngle) * width;
                points.unshift(new THREE.Vector2(x, z));
            }
            
            // Crear geometría
            const geometry = new THREE.ShapeGeometry(shape);
            
            // Crear material
            const bloodMaterial = new THREE.MeshStandardMaterial({
                color: 0x990000,
                roughness: 0.7,
                metalness: 0.1,
                transparent: true,
                opacity: 0.8
            });
            
            // Crear malla
            const bloodTrail = new THREE.Mesh(geometry, bloodMaterial);
            bloodTrail.rotation.x = -Math.PI / 2;
            bloodTrail.position.y = 0.01;
            
            this.scene.add(bloodTrail);
            this.objects.push(bloodTrail);
            
            return bloodTrail;
        };
        
        // Crear varios rastros de sangre
        createBloodTrail(-5, -5, 10, Math.PI / 4);
        createBloodTrail(8, 3, 7, -Math.PI / 6);
        createBloodTrail(-2, 7, 5, Math.PI);
    }
    
    createDebris() {
        // Material para escombros
        const debrisMaterial = new THREE.MeshStandardMaterial({
            color: 0xAAAAAA,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const paperMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Crear escombros
        for (let i = 0; i < 50; i++) {
            const size = Math.random() * 0.3 + 0.1;
            const geometry = new THREE.BoxGeometry(size, size * 0.2, size);
            const debris = new THREE.Mesh(geometry, debrisMaterial);
            
            // Posición aleatoria
            debris.position.set(
                (Math.random() - 0.5) * 38,
                size * 0.1,
                (Math.random() - 0.5) * 38
            );
            
            // Rotación aleatoria
            debris.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.scene.add(debris);
            this.objects.push(debris);
        }
        
        // Crear papeles tirados
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.PlaneGeometry(0.2, 0.3);
            const paper = new THREE.Mesh(geometry, paperMaterial);
            
            // Posición aleatoria
            paper.position.set(
                (Math.random() - 0.5) * 38,
                0.02,
                (Math.random() - 0.5) * 38
            );
            
            // Rotación aleatoria
            paper.rotation.x = -Math.PI / 2;
            paper.rotation.z = Math.random() * Math.PI;
            
            this.scene.add(paper);
            this.objects.push(paper);
        }
    }
    
    createAmbientEffects() {
        // Niebla
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);
        
        // Partículas flotantes
        this.createFloatingParticles();
    }
    
    createFloatingParticles() {
        // Geometría para partículas
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color = new THREE.Color();
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Posición
            positions[i3] = (Math.random() - 0.5) * 40;
            positions[i3 + 1] = Math.random() * 5;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;
            
            // Color
            color.set(0xCCCCCC);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Tamaño
            sizes[i] = Math.random() * 0.05 + 0.02;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Material para partículas
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true
        });
        
        // Crear sistema de partículas
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        
        // Animación de partículas
        const animateParticles = () => {
            const positions = particleGeometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                // Movimiento suave
                positions[i3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
                
                // Mantener dentro de los límites
                if (positions[i3 + 1] > 5) positions[i3 + 1] = 0;
                if (positions[i3 + 1] < 0) positions[i3 + 1] = 5;
            }
            
            particleGeometry.attributes.position.needsUpdate = true;
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
    
    // Método para obtener todos los objetos colisionables
    getColliders() {
        return this.colliders;
    }
    
    // Método para actualizar el entorno
    update(deltaTime) {
        // Actualizar efectos dinámicos
        this.updateLights(deltaTime);
        this.updateWindows(deltaTime);
    }
    
    updateLights(deltaTime) {
        // Parpadeo aleatorio de luces
        for (const light of this.lights) {
            if (light.type === 'PointLight' && Math.random() > 0.99) {
                const originalIntensity = light.intensity;
                light.intensity = Math.random() * 0.5;
                
                setTimeout(() => {
                    light.intensity = originalIntensity;
                }, Math.random() * 200 + 50);
            }
        }
    }
    
    updateWindows(deltaTime) {
        // Efecto de relámpagos a través de las ventanas
        if (Math.random() > 0.997) {
            for (const window of this.windows) {
                const originalEmissive = window.material.emissive.getHex();
                window.material.emissive.set(0xFFFFFF);
                window.material.emissiveIntensity = 1;
                
                setTimeout(() => {
                    window.material.emissive.setHex(originalEmissive);
                    window.material.emissiveIntensity = 0;
                }, Math.random() * 200 + 100);
            }
        }
    }
}
