class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return this.divide(mag);
    }

    distance(vector) {
        return this.subtract(vector).magnitude();
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
}

class SpaceObject {
    constructor(x, y, radius, mass, color, type = 'planet') {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        this.radius = radius;
        this.mass = mass;
        this.color = color;
        this.type = type;
        this.trail = [];
        this.maxTrailLength = 50;
        this.destroyed = false;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.temperature = 0; // Temperatur für Verbrennung
        this.originalRadius = radius;
        this.originalColor = color;
        this.burnParticles = [];
        
        // Eigenschaften für verschiedene Objekt-Typen
        if (type === 'asteroid') {
            this.rotationSpeed = (Math.random() - 0.5) * 0.2;
            this.shape = this.generateAsteroidShape();
        } else if (type === 'blackhole') {
            this.rotationSpeed = 0.05; // Langsamere, hypnotische Rotation
            this.eventHorizon = radius * 1.5; // Event-Horizont für Objektvernichtung
            this.accretionDisk = [];
            this.generateAccretionDisk();
        }
    }

    generateAsteroidShape() {
        const points = [];
        const sides = 8 + Math.floor(Math.random() * 4);
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const variance = 0.7 + Math.random() * 0.6;
            points.push({
                x: Math.cos(angle) * variance,
                y: Math.sin(angle) * variance
            });
        }
        return points;
    }

    generateAccretionDisk() {
        // Akkretionsscheibe für schwarzes Loch generieren
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = (this.radius * 2) + Math.random() * (this.radius * 4);
            const speed = 0.02 + Math.random() * 0.03;
            this.accretionDisk.push({
                angle: angle,
                distance: distance,
                speed: speed,
                size: 1 + Math.random() * 3,
                color: ['#ff6b35', '#ffaa00', '#ffffff', '#8b00ff'][Math.floor(Math.random() * 4)]
            });
        }
    }

    applyForce(force) {
        const acceleration = force.divide(this.mass);
        this.acceleration = this.acceleration.add(acceleration);
    }

    update(deltaTime, gravity = 0.5) {
        // Update Velocity und Position (Beschleunigung wurde bereits in PhysicsEngine gesetzt)
        this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Rotation aktualisieren
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Akkretionsscheibe für schwarze Löcher aktualisieren
        if (this.type === 'blackhole' && this.accretionDisk) {
            this.accretionDisk.forEach(particle => {
                particle.angle += particle.speed * deltaTime;
                // Partikel spiralen langsam nach innen
                particle.distance *= 0.999;
                if (particle.distance < this.radius * 1.2) {
                    // Partikel regenerieren wenn sie zu nah kommen
                    particle.distance = (this.radius * 2) + Math.random() * (this.radius * 4);
                    particle.angle = Math.random() * Math.PI * 2;
                }
            });
        }
        
        // Trail aktualisieren
        this.trail.push({
            x: this.position.x,
            y: this.position.y,
            alpha: 1.0
        });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Trail Alpha reduzieren
        this.trail.forEach((point, index) => {
            point.alpha = index / this.trail.length;
        });
    }

    updateTemperature(stars, deltaTime) {
        if (this.type === 'star' || this.type === 'blackhole') return; // Sterne und schwarze Löcher verbrennen nicht
        
        let closestStarDistance = Infinity;
        
        // Finde nächsten Stern
        stars.forEach(star => {
            if (star.type === 'star') {
                const distance = this.position.distance(star.position);
                if (distance < closestStarDistance) {
                    closestStarDistance = distance;
                }
            }
        });
        
        // Berechne Temperatur basierend auf Distanz zum nächsten Stern
        const burnDistance = 150; // Distanz bei der Verbrennung beginnt
        const vaporizeDistance = 50; // Distanz bei der sofortige Verdampfung eintritt
        
        if (closestStarDistance < burnDistance) {
            // Temperatur erhöhen je näher zur Sonne
            const heatIntensity = (burnDistance - closestStarDistance) / burnDistance;
            this.temperature += heatIntensity * deltaTime * 100;
            
            // Sofortige Zerstörung bei sehr naher Annäherung
            if (closestStarDistance < vaporizeDistance) {
                this.temperature = 1000;
                this.destroyed = true;
                return { vaporized: true, position: this.position };
            }
            
            // Schmelzen/Schrumpfen bei hoher Temperatur
            if (this.temperature > 50) {
                const shrinkRate = (this.temperature / 1000) * deltaTime;
                this.radius = Math.max(1, this.radius - shrinkRate * 10);
                
                // Farbwechsel bei Erhitzung
                this.updateColorByTemperature();
                
                // Verbrennungspartikel erzeugen
                this.createBurnParticles();
            }
            
            // Zerstörung bei extremer Hitze
            if (this.temperature > 500 || this.radius < 2) {
                this.destroyed = true;
                return { burned: true, position: this.position };
            }
        } else {
            // Abkühlung wenn weit genug weg
            this.temperature = Math.max(0, this.temperature - deltaTime * 20);
            if (this.temperature < 10) {
                this.color = this.originalColor; // Zurück zur ursprünglichen Farbe
            }
        }
        
        // Verbrennungspartikel aktualisieren
        this.burnParticles = this.burnParticles.filter(particle => {
            particle.life -= deltaTime;
            particle.position.x += particle.velocity.x * deltaTime;
            particle.position.y += particle.velocity.y * deltaTime;
            particle.size *= 0.98;
            return particle.life > 0;
        });
        
        return null;
    }

    updateColorByTemperature() {
        if (this.temperature < 50) return;
        
        const intensity = Math.min(1, this.temperature / 500);
        
        if (this.temperature < 100) {
            // Leichtes Glühen - Rot
            this.color = this.interpolateColor(this.originalColor, '#ff4500', intensity * 0.3);
        } else if (this.temperature < 200) {
            // Stärkeres Glühen - Orange
            this.color = this.interpolateColor(this.originalColor, '#ff6600', intensity * 0.6);
        } else if (this.temperature < 350) {
            // Heiß - Gelb
            this.color = this.interpolateColor('#ff6600', '#ffaa00', intensity);
        } else {
            // Sehr heiß - Weiß
            this.color = this.interpolateColor('#ffaa00', '#ffffff', intensity);
        }
    }

    interpolateColor(color1, color2, factor) {
        const hex1 = parseInt(color1.replace('#', ''), 16);
        const hex2 = parseInt(color2.replace('#', ''), 16);
        
        const r1 = (hex1 >> 16) & 255;
        const g1 = (hex1 >> 8) & 255;
        const b1 = hex1 & 255;
        
        const r2 = (hex2 >> 16) & 255;
        const g2 = (hex2 >> 8) & 255;
        const b2 = hex2 & 255;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    createBurnParticles() {
        if (this.burnParticles.length > 20) return; // Limitiere Partikelanzahl
        
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 30;
            const distance = this.radius + Math.random() * 5;
            
            this.burnParticles.push({
                position: new Vector2D(
                    Math.cos(angle) * distance,
                    Math.sin(angle) * distance
                ),
                velocity: new Vector2D(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ),
                life: 1 + Math.random() * 2,
                size: 1 + Math.random() * 3,
                color: ['#ff4500', '#ff6600', '#ffaa00', '#ffffff'][Math.floor(Math.random() * 4)]
            });
        }
    }

    drawBurnParticles(ctx, objX, objY) {
        this.burnParticles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life / 3;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(
                objX + particle.position.x, 
                objY + particle.position.y, 
                particle.size, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
        });
    }

    gravitationalForce(other) {
        let G = 30.0; // Noch höhere Base-Gravitationskonstante
        const direction = other.position.subtract(this.position);
        const distance = direction.magnitude();
        
        if (distance === 0) return new Vector2D(0, 0);
        if (distance < 5) return new Vector2D(0, 0); // Verhindert extreme Kräfte bei sehr nahen Objekten
        
        // Schwarze Löcher haben stärkere Gravitation basierend auf ihrer Größe
        if (this.type === 'blackhole') {
            const sizeMultiplier = (this.radius / 20) * 2; // Je größer, desto stärker
            G *= sizeMultiplier;
        }
        
        // Spezielle Behandlung für Sterne vs. Schwarze Löcher
        if (this.type === 'star' && other.type === 'blackhole') {
            G *= 0.8; // Sterne werden etwas weniger stark angezogen
        } else if (this.type === 'blackhole' && other.type === 'star') {
            G *= 2.0; // Schwarze Löcher ziehen Sterne viel stärker an
        }
        
        const force = G * (this.mass * other.mass) / (distance * distance);
        return direction.normalize().multiply(force);
    }

    checkCollision(other) {
        // Schwarze Löcher haben keine normalen Kollisionen - sie saugen nur an
        if (this.type === 'blackhole' || other.type === 'blackhole') {
            return false;
        }
        
        const distance = this.position.distance(other.position);
        return distance < (this.radius + other.radius);
    }

    resolveCollision(other) {
        // Elastische Kollision
        const distance = this.position.distance(other.position);
        const overlap = (this.radius + other.radius) - distance;
        
        if (overlap > 0) {
            // Objekte trennen
            const direction = this.position.subtract(other.position).normalize();
            const separation = direction.multiply(overlap / 2);
            
            this.position = this.position.add(separation);
            other.position = other.position.subtract(separation);
            
            // Geschwindigkeiten nach Kollision berechnen
            const relativeVelocity = this.velocity.subtract(other.velocity);
            const velocityInNormal = relativeVelocity.dot(direction);
            
            if (velocityInNormal > 0) return; // Objekte bewegen sich bereits auseinander
            
            const restitution = 0.8; // Elastizität
            const impulse = 2 * velocityInNormal / (this.mass + other.mass);
            
            this.velocity = this.velocity.subtract(direction.multiply(impulse * other.mass * restitution));
            other.velocity = other.velocity.add(direction.multiply(impulse * this.mass * restitution));
            
            return true; // Kollision aufgetreten
        }
        return false;
    }

    isOffScreen(canvas) {
        const margin = 100;
        return (this.position.x < -margin || 
                this.position.x > canvas.width + margin ||
                this.position.y < -margin || 
                this.position.y > canvas.height + margin);
    }

    wrapAroundScreen(canvas) {
        if (this.position.x < -this.radius) {
            this.position.x = canvas.width + this.radius;
        } else if (this.position.x > canvas.width + this.radius) {
            this.position.x = -this.radius;
        }
        
        if (this.position.y < -this.radius) {
            this.position.y = canvas.height + this.radius;
        } else if (this.position.y > canvas.height + this.radius) {
            this.position.y = -this.radius;
        }
    }

    isSwallowedByBlackhole(blackhole) {
        if (blackhole.type !== 'blackhole') return false;
        const distance = this.position.distance(blackhole.position);
        
        // Sterne brauchen näher heran für Aufsaugung (langsamerer Prozess)
        if (this.type === 'star') {
            return distance < blackhole.radius * 1.2; // Etwas leichter für Sterne
        }
        
        return distance < blackhole.eventHorizon;
    }

    growBlackhole(swallowedMass, swallowedRadius) {
        if (this.type !== 'blackhole') return;
        
        // Masse hinzufügen
        this.mass += swallowedMass;
        
        // Radius basierend auf neuer Masse erhöhen
        let growthFactor = Math.pow(swallowedMass / this.mass, 0.3);
        
        // Sterne lassen schwarze Löcher viel mehr wachsen
        if (swallowedMass > 1000) { // Wahrscheinlich ein Stern
            growthFactor *= 3;
            this.radius += swallowedRadius * 0.4; // Größeres Wachstum für Sterne
        } else {
            this.radius += swallowedRadius * growthFactor * 0.15;
        }
        
        // Event-Horizont anpassen
        this.eventHorizon = this.radius * 1.8; // Größerer Event-Horizont
        
        // Akkretionsscheibe erweitern
        if (this.accretionDisk) {
            this.accretionDisk.forEach(particle => {
                if (particle.distance < this.radius * 4) {
                    particle.distance += swallowedRadius * 0.7;
                }
            });
        }
    }
}

class PhysicsEngine {
    constructor() {
        this.objects = [];
        this.gravity = 2.0; // Höhere Standard-Gravitation
        this.timeScale = 1.0;
        this.collisionCount = 0;
        this.swallowedCount = 0;
        this.burnedCount = 0;
    }

    addObject(object) {
        this.objects.push(object);
    }

    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    update(deltaTime) {
        const scaledDeltaTime = deltaTime * this.timeScale;
        
        // Erst alle Beschleunigungen zurücksetzen
        this.objects.forEach(obj => {
            obj.acceleration = new Vector2D(0, 0);
        });
        
        // Dann Gravitationskräfte berechnen und anwenden
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const obj1 = this.objects[i];
                const obj2 = this.objects[j];
                
                const force = obj1.gravitationalForce(obj2);
                obj1.applyForce(force.multiply(this.gravity));
                obj2.applyForce(force.multiply(-this.gravity));
            }
        }
        
        // Schließlich alle Objekte aktualisieren
        const stars = this.objects.filter(obj => obj.type === 'star');
        const burnedObjects = [];
        
        this.objects.forEach(obj => {
            obj.update(scaledDeltaTime, this.gravity);
            
            // Temperatur-Update für Verbrennung
            const burnResult = obj.updateTemperature(stars, scaledDeltaTime);
            if (burnResult) {
                burnedObjects.push({ obj, type: burnResult.vaporized ? 'vaporized' : 'burned' });
            }
        });
        
        // Verbrannte/verdampfte Objekte entfernen
        burnedObjects.forEach(({ obj, type }) => {
            const index = this.objects.indexOf(obj);
            if (index > -1) {
                this.objects.splice(index, 1);
                this.burnedCount++;
            }
        });
        
        // Prüfen ob Objekte von schwarzen Löchern verschluckt werden
        const swallowedObjects = [];
        const blackholes = this.objects.filter(obj => obj.type === 'blackhole');
        
        for (let blackhole of blackholes) {
            for (let i = this.objects.length - 1; i >= 0; i--) {
                const obj = this.objects[i];
                if (obj !== blackhole && obj.isSwallowedByBlackhole(blackhole)) {
                    swallowedObjects.push({ obj, blackhole });
                    
                    // Schwarzes Loch wachsen lassen
                    blackhole.growBlackhole(obj.mass, obj.radius);
                    
                    // Verschluckte Objekte zählen
                    this.swallowedCount++;
                    
                    // Debug: Wenn ein Stern verschluckt wird
                    if (obj.type === 'star') {
                        console.log('Stern wurde verschluckt! Neuer Radius:', blackhole.radius);
                    }
                    
                    this.objects.splice(i, 1);
                }
            }
        }
        
        // Kollisionen prüfen und auflösen
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const obj1 = this.objects[i];
                const obj2 = this.objects[j];
                
                if (obj1.checkCollision(obj2)) {
                    if (obj1.resolveCollision(obj2)) {
                        this.collisionCount++;
                        return { collision: true, obj1, obj2, swallowed: swallowedObjects, burned: burnedObjects };
                    }
                }
            }
        }
        
        return { collision: false, swallowed: swallowedObjects, burned: burnedObjects };
    }

    clear() {
        this.objects = [];
        this.collisionCount = 0;
        this.swallowedCount = 0;
        this.burnedCount = 0;
    }

    getObjectCount() {
        return this.objects.length;
    }

    getCollisionCount() {
        return this.collisionCount;
    }

    getSwallowedCount() {
        return this.swallowedCount;
    }

    getBlackholeCount() {
        return this.objects.filter(obj => obj.type === 'blackhole').length;
    }

    getBurnedCount() {
        return this.burnedCount;
    }
} 