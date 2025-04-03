/**
 * Sistema de Tabla de Puntuaciones para "La Hucha de Paredes"
 * Gestiona la tabla de puntuaciones y clasificaciones
 */

class LeaderboardSystem {
    constructor() {
        // Referencias a elementos del DOM
        this.leaderboardEntries = document.getElementById('leaderboard-entries');
        
        // Datos de la tabla de puntuaciones
        this.entries = [];
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicializa el sistema de tabla de puntuaciones
     */
    init() {
        // Cargar puntuaciones guardadas
        this.loadSavedScores();
        
        // Generar puntuaciones de ejemplo si no hay guardadas
        if (this.entries.length === 0) {
            this.generateDemoScores();
        }
    }
    
    /**
     * Carga las puntuaciones guardadas
     */
    loadSavedScores() {
        const savedScores = localStorage.getItem('leaderboardScores');
        
        if (savedScores) {
            try {
                this.entries = JSON.parse(savedScores);
            } catch (e) {
                console.error('Error al cargar las puntuaciones:', e);
                this.entries = [];
            }
        } else {
            this.entries = [];
        }
    }
    
    /**
     * Genera puntuaciones de ejemplo
     */
    generateDemoScores() {
        const names = [
            'Fantasma', 'Sombra', 'Espectro', 'Pesadilla', 'Terror', 
            'Miedo', 'Pánico', 'Horror', 'Oscuridad', 'Tinieblas'
        ];
        
        // Generar 10 puntuaciones aleatorias
        for (let i = 0; i < 10; i++) {
            const score = Math.floor(Math.random() * 5000) + 1000;
            const time = Math.floor(Math.random() * 1800) + 300; // 5-35 minutos
            
            this.entries.push({
                name: names[i],
                score: score,
                time: time,
                date: new Date().toISOString()
            });
        }
        
        // Ordenar por puntuación
        this.sortEntries();
        
        // Guardar
        this.saveScores();
    }
    
    /**
     * Ordena las entradas por puntuación
     */
    sortEntries() {
        this.entries.sort((a, b) => b.score - a.score);
    }
    
    /**
     * Guarda las puntuaciones
     */
    saveScores() {
        localStorage.setItem('leaderboardScores', JSON.stringify(this.entries));
    }
    
    /**
     * Actualiza la tabla de puntuaciones
     */
    refreshLeaderboard() {
        // Limpiar tabla actual
        this.leaderboardEntries.innerHTML = '';
        
        // Añadir cada entrada a la tabla
        this.entries.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            // Formatear tiempo
            const minutes = Math.floor(entry.time / 60);
            const seconds = entry.time % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            row.innerHTML = `
                <td class="rank">${index + 1}</td>
                <td class="player">${entry.name}</td>
                <td class="score">${entry.score}</td>
                <td class="time">${formattedTime}</td>
            `;
            
            // Destacar las tres primeras posiciones
            if (index < 3) {
                row.classList.add('top-rank');
                
                if (index === 0) {
                    row.classList.add('first-place');
                }
            }
            
            this.leaderboardEntries.appendChild(row);
        });
    }
    
    /**
     * Añade una nueva puntuación
     * @param {string} name - Nombre del jugador
     * @param {number} score - Puntuación
     * @param {number} time - Tiempo en segundos
     * @returns {number} Posición en la tabla
     */
    addScore(name, score, time) {
        // Crear nueva entrada
        const newEntry = {
            name: name,
            score: score,
            time: time,
            date: new Date().toISOString()
        };
        
        // Añadir a la lista
        this.entries.push(newEntry);
        
        // Ordenar
        this.sortEntries();
        
        // Limitar a 100 entradas
        if (this.entries.length > 100) {
            this.entries = this.entries.slice(0, 100);
        }
        
        // Guardar
        this.saveScores();
        
        // Actualizar tabla
        this.refreshLeaderboard();
        
        // Devolver posición
        return this.entries.findIndex(entry => 
            entry.name === name && 
            entry.score === score && 
            entry.time === time
        ) + 1;
    }
    
    /**
     * Comprueba si una puntuación entraría en el top 10
     * @param {number} score - Puntuación a comprobar
     * @returns {boolean} Verdadero si la puntuación entraría en el top 10
     */
    isTopScore(score) {
        if (this.entries.length < 10) {
            return true;
        }
        
        return score > this.entries[9].score;
    }
    
    /**
     * Limpia todas las puntuaciones
     */
    clearScores() {
        this.entries = [];
        this.saveScores();
        this.refreshLeaderboard();
    }
}

// Crear instancia global
window.leaderboardSystem = new LeaderboardSystem();
