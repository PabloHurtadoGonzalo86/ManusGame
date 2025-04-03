# Manual de Implementación: La Hucha de Paredes

## Índice

1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
5. [Compilación del Proyecto](#compilación-del-proyecto)
6. [Despliegue en Kubernetes](#despliegue-en-kubernetes)
7. [Configuración de Base de Datos](#configuración-de-base-de-datos)
8. [Configuración de Red](#configuración-de-red)
9. [Monitoreo y Logging](#monitoreo-y-logging)
10. [Solución de Problemas](#solución-de-problemas)
11. [Mantenimiento](#mantenimiento)

## Introducción

Este manual proporciona instrucciones detalladas para implementar y desplegar "La Hucha de Paredes", un juego web multijugador 3D. El documento está dirigido a administradores de sistemas y desarrolladores responsables de la implementación y mantenimiento del juego.

## Requisitos del Sistema

### Entorno de Desarrollo
- Node.js 16.x o superior
- npm 7.x o superior
- Git
- Editor de código (recomendado: Visual Studio Code)
- Navegador moderno con soporte para WebGL 2.0

### Entorno de Producción
- Cluster Kubernetes 1.20 o superior
- Ingress Controller (NGINX recomendado)
- Cert-Manager para certificados TLS
- MongoDB 4.4 o superior
- Redis 6.x o superior
- Almacenamiento persistente para datos
- Registro de contenedores Docker

### Requisitos de Hardware Recomendados
- **Nodos de Kubernetes**: 
  - CPU: 4 cores por nodo (mínimo)
  - RAM: 8GB por nodo (mínimo)
  - Almacenamiento: 50GB por nodo (mínimo)
- **Base de Datos**:
  - CPU: 4 cores
  - RAM: 8GB
  - Almacenamiento: 100GB SSD

## Estructura del Proyecto

```
la_hucha_de_paredes/
├── prototipo/                  # Código fuente del juego
│   ├── index.html              # Punto de entrada HTML
│   ├── game-mechanics.js       # Mecánicas de juego
│   ├── multiplayer.js          # Funcionalidad multijugador
│   ├── performance-optimizer.js # Optimizaciones de rendimiento
│   ├── browser-compatibility.js # Compatibilidad entre navegadores
│   ├── load-tester.js          # Pruebas de carga
│   ├── optimization-integration.js # Integración de optimizaciones
│   ├── ui/                     # Interfaz de usuario
│   │   ├── styles.css          # Estilos CSS
│   │   ├── index.html          # Interfaz principal
│   │   └── js/                 # Scripts de UI
│   │       ├── ui-manager.js   # Gestor de UI
│   │       ├── lobby-system.js # Sistema de lobby
│   │       ├── customization.js # Personalización de personajes
│   │       ├── game-interface.js # Interfaz durante el juego
│   │       ├── leaderboard.js  # Tabla de puntuaciones
│   │       └── main.js         # Script principal de UI
│   └── modelos/                # Modelos 3D
│       ├── player_model.js     # Modelo del jugador
│       ├── hucha_model.js      # Modelo del antagonista
│       └── asylum_environment.js # Entorno del manicomio
├── kubernetes/                 # Configuración de Kubernetes
│   ├── namespace.yaml          # Definición de namespace
│   ├── frontend-deployment.yaml # Despliegue del frontend
│   ├── frontend-service.yaml   # Servicio del frontend
│   ├── frontend-hpa.yaml       # Autoescalado del frontend
│   ├── game-server-deployment.yaml # Despliegue del servidor
│   ├── game-server-service.yaml # Servicio del servidor
│   ├── game-server-hpa.yaml    # Autoescalado del servidor
│   ├── ingress.yaml            # Configuración de ingress
│   ├── configmap.yaml          # ConfigMap con configuraciones
│   └── secrets.yaml            # Secrets con datos sensibles
└── documentacion/              # Documentación del proyecto
    ├── documentacion_tecnica.md # Documentación técnica
    ├── manual_implementacion.md # Este manual
    ├── guia_usuario.md         # Guía de usuario
    └── guia_mantenimiento.md   # Guía de mantenimiento
```

## Configuración del Entorno de Desarrollo

### Instalación de Dependencias

1. **Instalar Node.js y npm**:
   ```bash
   # En Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # En macOS con Homebrew
   brew install node

   # En Windows
   # Descargar e instalar desde https://nodejs.org/
   ```

2. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-organizacion/la-hucha-de-paredes.git
   cd la-hucha-de-paredes
   ```

3. **Instalar dependencias del proyecto**:
   ```bash
   npm install
   ```

### Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# Entorno
NODE_ENV=development

# Servidor
PORT=3000
HOST=localhost

# Base de datos
MONGODB_URI=mongodb://localhost:27017/hucha-de-paredes
REDIS_HOST=localhost
REDIS_PORT=6379

# Seguridad
JWT_SECRET=your-development-secret-key

# Configuración del juego
MAX_PLAYERS_PER_ROOM=10
GAME_DURATION_MINUTES=15
```

### Configuración de Base de Datos Local

1. **MongoDB**:
   ```bash
   # Instalar MongoDB (Ubuntu)
   sudo apt-get install -y mongodb

   # Iniciar servicio
   sudo systemctl start mongodb
   ```

2. **Redis**:
   ```bash
   # Instalar Redis (Ubuntu)
   sudo apt-get install -y redis-server

   # Iniciar servicio
   sudo systemctl start redis
   ```

### Ejecución en Desarrollo

1. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Acceder al juego**:
   Abrir un navegador y navegar a `http://localhost:3000`

## Compilación del Proyecto

### Compilación para Producción

1. **Compilar assets**:
   ```bash
   npm run build
   ```

   Esto generará los archivos optimizados en el directorio `dist/`.

2. **Verificar la compilación**:
   ```bash
   npm run serve
   ```

   Esto iniciará un servidor local con los archivos compilados.

### Creación de Imágenes Docker

1. **Construir imagen del frontend**:
   ```bash
   docker build -f Dockerfile.frontend -t your-registry/la-hucha-de-paredes/frontend:latest .
   ```

2. **Construir imagen del servidor de juego**:
   ```bash
   docker build -f Dockerfile.game-server -t your-registry/la-hucha-de-paredes/game-server:latest .
   ```

3. **Subir imágenes al registro**:
   ```bash
   docker push your-registry/la-hucha-de-paredes/frontend:latest
   docker push your-registry/la-hucha-de-paredes/game-server:latest
   ```

## Despliegue en Kubernetes

### Preparación del Cluster

1. **Configurar acceso al cluster**:
   ```bash
   # Ejemplo con GKE
   gcloud container clusters get-credentials your-cluster --zone your-zone --project your-project
   
   # Ejemplo con EKS
   aws eks update-kubeconfig --name your-cluster --region your-region
   
   # Ejemplo con AKS
   az aks get-credentials --resource-group your-resource-group --name your-cluster
   ```

2. **Verificar conexión**:
   ```bash
   kubectl cluster-info
   ```

### Configuración de Secrets

1. **Crear secret para credenciales del registro**:
   ```bash
   kubectl create secret docker-registry registry-credentials \
     --docker-server=your-registry-server \
     --docker-username=your-username \
     --docker-password=your-password \
     --docker-email=your-email
   ```

2. **Actualizar valores en secrets.yaml**:
   Editar el archivo `kubernetes/secrets.yaml` y actualizar los valores con credenciales reales.

### Despliegue de Componentes

1. **Crear namespace**:
   ```bash
   kubectl apply -f kubernetes/namespace.yaml
   ```

2. **Aplicar ConfigMap y Secrets**:
   ```bash
   kubectl apply -f kubernetes/configmap.yaml
   kubectl apply -f kubernetes/secrets.yaml
   ```

3. **Desplegar servicios de base de datos** (si no se utilizan servicios gestionados):
   ```bash
   # Ejemplo para MongoDB y Redis
   kubectl apply -f kubernetes/mongodb.yaml
   kubectl apply -f kubernetes/redis.yaml
   ```

4. **Desplegar componentes del juego**:
   ```bash
   kubectl apply -f kubernetes/frontend-deployment.yaml
   kubectl apply -f kubernetes/frontend-service.yaml
   kubectl apply -f kubernetes/game-server-deployment.yaml
   kubectl apply -f kubernetes/game-server-service.yaml
   ```

5. **Configurar autoescalado**:
   ```bash
   kubectl apply -f kubernetes/frontend-hpa.yaml
   kubectl apply -f kubernetes/game-server-hpa.yaml
   ```

6. **Configurar ingress**:
   ```bash
   kubectl apply -f kubernetes/ingress.yaml
   ```

### Verificación del Despliegue

1. **Verificar pods**:
   ```bash
   kubectl get pods -n la-hucha-de-paredes
   ```

2. **Verificar servicios**:
   ```bash
   kubectl get services -n la-hucha-de-paredes
   ```

3. **Verificar ingress**:
   ```bash
   kubectl get ingress -n la-hucha-de-paredes
   ```

4. **Verificar HPA**:
   ```bash
   kubectl get hpa -n la-hucha-de-paredes
   ```

## Configuración de Base de Datos

### MongoDB

1. **Configuración de Replica Set** (recomendado para producción):
   ```bash
   # Ejemplo de configuración en kubernetes/mongodb-statefulset.yaml
   kubectl apply -f kubernetes/mongodb-statefulset.yaml
   ```

2. **Inicialización de la base de datos**:
   ```bash
   # Conectar al pod de MongoDB
   kubectl exec -it mongodb-0 -n la-hucha-de-paredes -- mongo

   # Crear usuario administrador
   use admin
   db.createUser({
     user: "admin",
     pwd: "your-admin-password",
     roles: [ { role: "root", db: "admin" } ]
   })

   # Crear base de datos y usuario para el juego
   use hucha-de-paredes
   db.createUser({
     user: "gameuser",
     pwd: "your-game-user-password",
     roles: [ { role: "readWrite", db: "hucha-de-paredes" } ]
   })

   # Crear colecciones iniciales
   db.createCollection("players")
   db.createCollection("games")
   db.createCollection("leaderboard")
   ```

### Redis

1. **Configuración de Redis Cluster** (recomendado para producción):
   ```bash
   # Ejemplo de configuración en kubernetes/redis-statefulset.yaml
   kubectl apply -f kubernetes/redis-statefulset.yaml
   ```

2. **Configuración de persistencia**:
   ```bash
   # Verificar que la persistencia esté habilitada
   kubectl exec -it redis-master-0 -n la-hucha-de-paredes -- redis-cli

   # Verificar configuración
   CONFIG GET save
   CONFIG GET appendonly
   ```

## Configuración de Red

### DNS

1. **Configurar dominio**:
   Apuntar el dominio `hucha-de-paredes.example.com` a la dirección IP del Ingress Controller.

2. **Verificar resolución DNS**:
   ```bash
   nslookup hucha-de-paredes.example.com
   ```

### TLS/SSL

1. **Configurar Cert-Manager** (si no está instalado):
   ```bash
   # Instalar Cert-Manager
   kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.5.3/cert-manager.yaml

   # Crear ClusterIssuer para Let's Encrypt
   kubectl apply -f kubernetes/letsencrypt-prod.yaml
   ```

2. **Verificar certificado**:
   ```bash
   kubectl get certificate -n la-hucha-de-paredes
   ```

## Monitoreo y Logging

### Prometheus y Grafana

1. **Instalar Prometheus Operator** (si no está instalado):
   ```bash
   # Usando Helm
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo update
   helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
   ```

2. **Configurar ServiceMonitor para el juego**:
   ```bash
   kubectl apply -f kubernetes/service-monitor.yaml
   ```

3. **Acceder a Grafana**:
   ```bash
   # Obtener contraseña
   kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode

   # Hacer port-forward
   kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
   ```

   Acceder a `http://localhost:3000` e importar los dashboards proporcionados en `monitoring/dashboards/`.

### ELK Stack para Logging

1. **Instalar ELK Stack** (si no está instalado):
   ```bash
   # Usando Helm
   helm repo add elastic https://helm.elastic.co
   helm repo update
   helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
   helm install kibana elastic/kibana -n logging
   helm install filebeat elastic/filebeat -n logging
   ```

2. **Configurar índices en Kibana**:
   Acceder a Kibana y configurar índices para los logs del juego.

## Solución de Problemas

### Problemas Comunes y Soluciones

#### Pods en estado CrashLoopBackOff

1. **Verificar logs**:
   ```bash
   kubectl logs <pod-name> -n la-hucha-de-paredes
   ```

2. **Verificar eventos**:
   ```bash
   kubectl describe pod <pod-name> -n la-hucha-de-paredes
   ```

3. **Soluciones comunes**:
   - Verificar variables de entorno y secrets
   - Comprobar conexión a bases de datos
   - Revisar recursos asignados (CPU/memoria)

#### Problemas de Conexión a Servicios

1. **Verificar servicios**:
   ```bash
   kubectl get svc -n la-hucha-de-paredes
   ```

2. **Probar conectividad**:
   ```bash
   # Desde un pod temporal
   kubectl run -it --rm debug --image=busybox -n la-hucha-de-paredes -- sh
   # Dentro del pod
   wget -O- http://frontend:80/health
   wget -O- http://game-server:3000/health
   ```

#### Problemas con Ingress

1. **Verificar ingress**:
   ```bash
   kubectl describe ingress game-ingress -n la-hucha-de-paredes
   ```

2. **Verificar controlador de ingress**:
   ```bash
   kubectl get pods -n ingress-nginx
   kubectl logs <ingress-controller-pod> -n ingress-nginx
   ```

### Herramientas de Diagnóstico

1. **Kubectl Debug**:
   ```bash
   kubectl debug <pod-name> -n la-hucha-de-paredes --image=busybox
   ```

2. **Port-Forward para Diagnóstico Directo**:
   ```bash
   kubectl port-forward <pod-name> -n la-hucha-de-paredes <local-port>:<pod-port>
   ```

3. **Verificación de Recursos**:
   ```bash
   kubectl top pods -n la-hucha-de-paredes
   kubectl top nodes
   ```

## Mantenimiento

### Actualizaciones

1. **Actualizar imágenes**:
   ```bash
   # Construir y subir nuevas imágenes
   docker build -f Dockerfile.frontend -t your-registry/la-hucha-de-paredes/frontend:v2 .
   docker push your-registry/la-hucha-de-paredes/frontend:v2

   # Actualizar despliegue
   kubectl set image deployment/frontend frontend=your-registry/la-hucha-de-paredes/frontend:v2 -n la-hucha-de-paredes
   ```

2. **Actualizar configuraciones**:
   ```bash
   kubectl apply -f kubernetes/configmap.yaml
   ```

3. **Verificar actualización**:
   ```bash
   kubectl rollout status deployment/frontend -n la-hucha-de-paredes
   ```

### Backups

1. **Backup de MongoDB**:
   ```bash
   # Desde dentro del pod
   kubectl exec -it mongodb-0 -n la-hucha-de-paredes -- mongodump --out /tmp/backup

   # Copiar a local
   kubectl cp mongodb-0:/tmp/backup ./mongodb-backup -n la-hucha-de-paredes
   ```

2. **Backup de Redis**:
   ```bash
   # Trigger RDB snapshot
   kubectl exec -it redis-master-0 -n la-hucha-de-paredes -- redis-cli SAVE

   # Copiar archivo dump.rdb
   kubectl cp redis-master-0:/data/dump.rdb ./redis-backup.rdb -n la-hucha-de-paredes
   ```

3. **Automatizar backups**:
   Configurar CronJobs en Kubernetes para realizar backups periódicos.

### Monitoreo Continuo

1. **Alertas**:
   Configurar alertas en Prometheus para:
   - Alto uso de CPU/memoria
   - Latencia elevada
   - Errores HTTP 5xx
   - Pods en estado no disponible

2. **Revisión de Logs**:
   Revisar regularmente los logs en Kibana para identificar patrones de error.

3. **Métricas de Juego**:
   Monitorear métricas específicas del juego como:
   - Jugadores concurrentes
   - Tiempo de respuesta del servidor
   - Uso de recursos por partida
   - Tasa de desconexiones
