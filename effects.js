class Particle {
    constructor(x, y, velocity, color, life, size = 2) {
        this.position = new Vector2D(x, y);
        this.velocity = velocity;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.gravity = new Vector2D(0, 0);
        this.fadeRate = 1 / life;
        this.sizeDecay = 0.98;
    }

    update(deltaTime) {
        this.velocity = this.velocity.add(this.gravity.multiply(deltaTime));
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.life -= deltaTime;
        this.size *= this.sizeDecay;
        return this.life > 0;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class StarField {
    constructor(canvas) {
        this.canvas = canvas;
        this.stars = [];
        this.generateStars();
    }

    generateStars() {
        const starCount = 200;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }

    update(deltaTime) {
        this.stars.forEach(star => {
            star.twinkleOffset += star.twinkleSpeed * deltaTime;
        });
    }

    draw(ctx) {
        ctx.save();
        this.stars.forEach(star => {
            const twinkle = Math.sin(star.twinkleOffset) * 0.3 + 0.7;
            ctx.globalAlpha = star.brightness * twinkle;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.stars = [];
        this.generateStars();
    }
}

class ExplosionEffect {
    constructor(x, y, size = 50, color = '#ff6b35') {
        this.position = new Vector2D(x, y);
        this.particles = [];
        this.size = size;
        this.color = color;
        this.createExplosion();
    }

    createExplosion() {
        const particleCount = 20 + Math.floor(this.size / 5);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = 100 + Math.random() * 150;
            const velocity = new Vector2D(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            const life = 1 + Math.random() * 2;
            const particleSize = 2 + Math.random() * 4;
            
            // Verschiedene Farben für realistische Explosion
            let colors;
            if (this.color === '#8b00ff') {
                // Spezielle Farben für schwarzes Loch
                colors = ['#8b00ff', '#4b0082', '#9400d3', '#6a0dad', '#ffffff'];
            } else if (this.color === '#ff4500') {
                // Spezielle Farben für Verbrennung
                colors = ['#ff4500', '#ff6600', '#ffaa00', '#ff8c00', '#ff7700'];
            } else if (this.color === '#ffffff') {
                // Spezielle Farben für Verdampfung
                colors = ['#ffffff', '#ffffcc', '#ffcccc', '#ccffff', '#ccccff'];
            } else {
                colors = [
                    '#ff6b35', '#ff8e53', '#ff6b35', '#ffaa00', 
                    '#ffffff', '#ffd700', '#ff4500', '#ff1744'
                ];
            }
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(new Particle(
                this.position.x, 
                this.position.y, 
                velocity, 
                color, 
                life, 
                particleSize
            ));
        }

        // Zusätzliche Funken
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 200 + Math.random() * 200;
            const velocity = new Vector2D(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            this.particles.push(new Particle(
                this.position.x, 
                this.position.y, 
                velocity, 
                '#ffffff', 
                0.5 + Math.random() * 0.5, 
                1
            ));
        }
    }

    update(deltaTime) {
        this.particles = this.particles.filter(particle => 
            particle.update(deltaTime)
        );
        return this.particles.length > 0;
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}

class TrailEffect {
    constructor() {
        this.trails = new Map();
    }

    addTrail(objectId, position, color) {
        if (!this.trails.has(objectId)) {
            this.trails.set(objectId, []);
        }
        
        const trail = this.trails.get(objectId);
        trail.push({
            position: new Vector2D(position.x, position.y),
            color: color,
            life: 2.0,
            maxLife: 2.0
        });
        
        // Limitiere Trail-Länge
        if (trail.length > 30) {
            trail.shift();
        }
    }

    update(deltaTime) {
        this.trails.forEach((trail, objectId) => {
            for (let i = trail.length - 1; i >= 0; i--) {
                trail[i].life -= deltaTime;
                if (trail[i].life <= 0) {
                    trail.splice(i, 1);
                }
            }
            
            if (trail.length === 0) {
                this.trails.delete(objectId);
            }
        });
    }

    draw(ctx) {
        this.trails.forEach(trail => {
            if (trail.length < 2) return;
            
            ctx.save();
            ctx.strokeStyle = trail[0].color;
            ctx.lineWidth = 2;
            ctx.globalCompositeOperation = 'screen';
            
            for (let i = 1; i < trail.length; i++) {
                const alpha = (trail[i].life / trail[i].maxLife) * (i / trail.length);
                ctx.globalAlpha = alpha;
                
                ctx.beginPath();
                ctx.moveTo(trail[i-1].position.x, trail[i-1].position.y);
                ctx.lineTo(trail[i].position.x, trail[i].position.y);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    clear() {
        this.trails.clear();
    }
}

class GlowEffect {
    static drawGlow(ctx, x, y, radius, color, intensity = 1) {
        ctx.save();
        
        // Äußerer Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, color + Math.floor(intensity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, color + Math.floor(intensity * 128).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, color + '00');
        
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class ShockwaveEffect {
    constructor(x, y, maxRadius, color = '#ffffff') {
        this.center = new Vector2D(x, y);
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.life = 1.0;
        this.speed = maxRadius / 2; // Geschwindigkeit der Ausbreitung
        this.color = color;
    }

    update(deltaTime) {
        this.radius += this.speed * deltaTime;
        this.life = Math.max(0, 1 - this.radius / this.maxRadius);
        return this.life > 0;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.life * 0.8;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Innerer Ring
        ctx.globalAlpha = this.life * 0.4;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

class BigBangEffect {
    constructor(x, y, canvas, collisionObj1 = null, collisionObj2 = null) {
        this.center = new Vector2D(x, y);
        this.canvas = canvas;
        this.particles = [];
        this.shockwaves = [];
        this.age = 0;
        this.maxAge = 25; // 25 Sekunden für viel längeren Big Bang
        this.phase = 'collision'; // collision, explosion, expansion, cooling, formation, galaxy_birth
        this.collisionObjects = { obj1: collisionObj1, obj2: collisionObj2 };
        this.preExplosionTime = 8; // 8 Sekunden für längere Kollisionssequenz
        this.scale = 1; // Zoom-Faktor für das Universum
        this.targetScale = 0.3; // Rauszoomen auf 30%
        this.galaxies = [];
        this.cosmicStructures = [];
        
        if (collisionObj1 && collisionObj2) {
            this.createCollisionSequence();
        } else {
            this.createInitialExplosion();
        }
    }

    createCollisionSequence() {
        // Zwei massive Objekte aufeinander zu bewegen
        const obj1 = this.collisionObjects.obj1;
        const obj2 = this.collisionObjects.obj2;
        
        // Objekte massiver machen für längere Spirale
        obj1.mass *= 150; // Weniger extrem für längere Animation
        obj2.mass *= 150;
        obj1.radius *= 1.3;
        obj2.radius *= 1.3;
        
        // Sanftere Orbitalbewegung für längere Spirale
        const distance = obj1.position.distance(obj2.position);
        const center = obj1.position.add(obj2.position).divide(2);
        
        // Langsamere Orbital-Geschwindigkeiten für längere Animation
        const orbitalSpeed = Math.sqrt((obj1.mass + obj2.mass) * 0.08 / distance) * 0.6;
        
        // Senkrechte Richtungen für Kreisbahn
        const direction = obj2.position.subtract(obj1.position).normalize();
        const perpendicular = new Vector2D(-direction.y, direction.x);
        
        // Setze langsamere Orbitalgeschwindigkeiten mit schwächerer Spirale
        obj1.velocity = perpendicular.multiply(orbitalSpeed).add(direction.multiply(8)); // Schwächer
        obj2.velocity = perpendicular.multiply(-orbitalSpeed).add(direction.multiply(-8));
        
        // Pre-Collision Effekte über längeren Zeitraum
        this.createExtendedPreCollisionEffects();
    }

    createExtendedPreCollisionEffects() {
        // Längere Gravitationswellen-Effekte
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                this.shockwaves.push(new ShockwaveEffect(
                    this.center.x, 
                    this.center.y, 
                    100 + i * 60,
                    '#8b00ff' // Lila für schwarze Löcher
                ));
            }, i * 200); // Längere Intervalle
        }
        
        // Kontinuierliche Energieaufbau-Partikel über längeren Zeitraum
        for (let wave = 0; wave < 8; wave++) {
            setTimeout(() => {
                for (let i = 0; i < 50; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 100 + Math.random() * 200;
                    const isAroundObj1 = Math.random() < 0.5;
                    
                    const targetPos = isAroundObj1 ? this.collisionObjects.obj1.position : this.collisionObjects.obj2.position;
                    
                    this.particles.push({
                        position: new Vector2D(
                            targetPos.x + Math.cos(angle) * distance,
                            targetPos.y + Math.sin(angle) * distance
                        ),
                        velocity: new Vector2D(
                            -Math.cos(angle) * 20,
                            -Math.sin(angle) * 20
                        ),
                        mass: 1.0,
                        temperature: 60000 + wave * 5000,
                        size: 2 + Math.random() * 4,
                        type: 'pre_collision',
                        life: 1.0,
                        targetCenter: true,
                        orbitalMotion: true,
                        targetObject: isAroundObj1 ? 'obj1' : 'obj2',
                        wave: wave
                    });
                }
            }, wave * 800); // Alle 0.8 Sekunden neue Welle
        }
    }

    createInitialExplosion() {
        const particleCount = 2000; // Mehr Partikel für dramatischeren Effekt
        
        // Verschiedene Explosionsschichten
        for (let layer = 0; layer < 5; layer++) {
            const layerParticles = particleCount / 5;
            const layerSpeed = 100 + layer * 150;
            const layerTemp = 50000 - layer * 8000;
            
            for (let i = 0; i < layerParticles; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = layerSpeed + Math.random() * 100;
                const mass = 1 + Math.random() * 8;
                
                this.particles.push({
                    position: new Vector2D(this.center.x, this.center.y),
                    velocity: new Vector2D(
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed
                    ),
                    mass: mass,
                    temperature: layerTemp,
                    size: 1 + Math.random() * 4,
                    type: 'energy',
                    life: 1.0,
                    coalescenceTimer: Math.random() * 8 + 5,
                    layer: layer
                });
            }
        }

        // Massive Shockwaves
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.shockwaves.push(new ShockwaveEffect(
                    this.center.x, 
                    this.center.y, 
                    200 + i * 300
                ));
            }, i * 150);
        }
    }

    update(deltaTime) {
        this.age += deltaTime;
        
        // Erweiterte Phasen-Management für längere Animation
        if (this.age < this.preExplosionTime) {
            this.phase = 'collision';
        } else if (this.age < 10) {
            if (this.phase === 'collision') {
                this.createInitialExplosion();
                this.phase = 'explosion';
            }
        } else if (this.age < 15) {
            this.phase = 'expansion';
            this.updateUniverseScale(deltaTime);
        } else if (this.age < 19) {
            this.phase = 'cooling';
        } else if (this.age < 23) {
            this.phase = 'formation';
        } else {
            this.phase = 'galaxy_birth';
            this.formGalaxies();
        }

        // Partikel aktualisieren
        this.particles = this.particles.filter(particle => {
            if (particle.targetCenter && this.phase === 'collision') {
                if (particle.orbitalMotion && this.collisionObjects.obj1 && this.collisionObjects.obj2) {
                    // Orbitalbewegung um die schwarzen Löcher
                    const targetObj = particle.targetObject === 'obj1' ? this.collisionObjects.obj1 : this.collisionObjects.obj2;
                    
                    if (targetObj) {
                        const distance = particle.position.distance(targetObj.position);
                        const direction = targetObj.position.subtract(particle.position).normalize();
                        const perpendicular = new Vector2D(-direction.y, direction.x);
                        
                        // Verbesserte Orbitale und spiralförmige Bewegung
                        const orbitalSpeed = Math.sqrt(targetObj.mass / Math.max(distance, 10)) * 0.2;
                        const spiralSpeed = 5 + (particle.wave || 0) * 2; // Verschiedene Spiralgeschwindigkeiten
                        
                        particle.velocity = perpendicular.multiply(orbitalSpeed).add(direction.multiply(spiralSpeed));
                    }
                } else {
                    // Normale Bewegung zum Zentrum für Energieaufbau
                    const direction = this.center.subtract(particle.position).normalize();
                    particle.velocity = direction.multiply(80);
                }
            }
            
            // Position aktualisieren
            particle.position = particle.position.add(particle.velocity.multiply(deltaTime));
            
            // Temperatur abkühlen
            if (this.phase === 'cooling' || this.phase === 'formation' || this.phase === 'galaxy_birth') {
                particle.temperature = Math.max(100, particle.temperature - deltaTime * 3000);
            }
            
            // Geschwindigkeit durch kosmische Reibung reduzieren
            if (this.phase !== 'collision') {
                particle.velocity = particle.velocity.multiply(0.998);
            }
            
            // Koaleszenz-Timer
            particle.coalescenceTimer -= deltaTime;
            
            return particle.life > 0 && this.age < this.maxAge;
        });

        // Shockwaves aktualisieren
        this.shockwaves = this.shockwaves.filter(wave => wave.update(deltaTime));

        return this.age < this.maxAge;
    }

    updateUniverseScale(deltaTime) {
        // Sanftes Rauszoomen
        if (this.scale > this.targetScale) {
            this.scale = Math.max(this.targetScale, this.scale - deltaTime * 0.1);
        }
    }

    formGalaxies() {
        if (this.galaxies.length > 0) return; // Bereits geformt
        
        // Weniger aber größere Galaxien für bessere Sichtbarkeit
        const galaxyCount = 4 + Math.floor(Math.random() * 3); // 4-6 statt 6-10
        
        for (let i = 0; i < galaxyCount; i++) {
            const angle = (i / galaxyCount) * Math.PI * 2 + Math.random() * 0.3;
            const distance = 400 + Math.random() * 300; // Weiter auseinander
            
            const galaxyCenter = {
                x: this.center.x + Math.cos(angle) * distance,
                y: this.center.y + Math.sin(angle) * distance,
                mass: 0,
                particles: [],
                type: Math.random() < 0.4 ? 'elliptical' : 'spiral', // Mehr Spiralgalaxien
                rotation: Math.random() * Math.PI * 2,
                size: 150 + Math.random() * 100, // Größenvariabilität
                armCount: Math.random() < 0.3 ? 2 : 3, // 2 oder 3 Spiralarme
                brightness: 0.7 + Math.random() * 0.3 // Helligkeitsvariationen
            };
            
            this.galaxies.push(galaxyCenter);
        }
    }

    getFormableObjects() {
        if (this.phase === 'formation') {
            return this.getRegularObjects();
        } else if (this.phase === 'galaxy_birth') {
            return this.getGalacticObjects();
        }
        return [];
    }

    getRegularObjects() {
        const formableObjects = [];
        const groups = this.groupNearbyParticles();
        
        groups.forEach(group => {
            if (group.length >= 3) {
                const centerX = group.reduce((sum, p) => sum + p.position.x, 0) / group.length;
                const centerY = group.reduce((sum, p) => sum + p.position.y, 0) / group.length;
                const totalMass = group.reduce((sum, p) => sum + p.mass, 0);
                const avgVelocity = group.reduce((acc, p) => acc.add(p.velocity), new Vector2D(0, 0)).divide(group.length);
                
                let objectType = 'asteroid';
                let radius = 5 + Math.random() * 10;
                
                // Bessere Objektverteilung basierend auf Masse und Zufall
                if (totalMass > 50) {
                    // Nur sehr große Massen werden zu Sternen
                    objectType = 'star';
                    radius = 25 + Math.random() * 15;
                } else if (totalMass > 20) {
                    // Mittlere Massen werden zu Planeten
                    objectType = 'planet';
                    radius = 15 + Math.random() * 20;
                } else if (totalMass > 8) {
                    // Kleine Massen haben eine Chance auf Planet oder bleiben Asteroid
                    if (Math.random() < 0.4) {
                        objectType = 'planet';
                        radius = 10 + Math.random() * 15;
                    } else {
                        objectType = 'asteroid';
                        radius = 5 + Math.random() * 12;
                    }
                } else {
                    // Sehr kleine Massen bleiben Asteroiden
                    objectType = 'asteroid';
                    radius = 3 + Math.random() * 8;
                }
                
                formableObjects.push({
                    x: centerX,
                    y: centerY,
                    radius: radius,
                    mass: totalMass * 120, // Etwas reduziert für bessere Balance
                    velocity: avgVelocity.multiply(0.5),
                    type: objectType,
                    particles: group
                });
            }
        });
        
        return formableObjects;
    }

    getGalacticObjects() {
        const galacticObjects = [];
        
        // Partikel zu Galaxien zuordnen mit verbesserter Reichweite
        this.particles.forEach(particle => {
            if (particle.coalescenceTimer > 0) return;
            
            let nearestGalaxy = null;
            let minDistance = Infinity;
            
            this.galaxies.forEach(galaxy => {
                const distance = Math.sqrt(
                    Math.pow(particle.position.x - galaxy.x, 2) + 
                    Math.pow(particle.position.y - galaxy.y, 2)
                );
                
                if (distance < galaxy.size && distance < minDistance) { // Größenabhängige Reichweite
                    nearestGalaxy = galaxy;
                    minDistance = distance;
                }
            });
            
            if (nearestGalaxy) {
                nearestGalaxy.particles.push(particle);
                nearestGalaxy.mass += particle.mass;
            }
        });
        
        // Detaillierte Galaxien-Objekte erstellen
        this.galaxies.forEach(galaxy => {
            if (galaxy.particles.length < 15) return; // Weniger strenge Anforderung
            
            if (galaxy.type === 'spiral') {
                this.createSpiralGalaxy(galaxy, galacticObjects);
            } else {
                this.createEllipticalGalaxy(galaxy, galacticObjects);
            }
            
            // Zentrales supermassives schwarzes Loch
            galacticObjects.push({
                x: galaxy.x,
                y: galaxy.y,
                radius: 25 + Math.random() * 15,
                mass: galaxy.mass * 1500, // Noch massiver
                velocity: new Vector2D(0, 0),
                type: 'blackhole',
                particles: galaxy.particles.slice(0, 8),
                galacticCenter: true
            });
        });
        
        return galacticObjects;
    }

    createSpiralGalaxy(galaxy, galacticObjects) {
        const armCount = galaxy.armCount;
        const objectsPerArm = Math.floor(galaxy.particles.length / (armCount * 3));
        
        for (let arm = 0; arm < armCount; arm++) {
            for (let i = 0; i < objectsPerArm; i++) {
                // Spiralarm-Parameter
                const armAngle = (arm * 2 * Math.PI / armCount) + galaxy.rotation;
                const normalizedPos = i / objectsPerArm; // 0 bis 1
                const radius = 30 + normalizedPos * galaxy.size; // Von innen nach außen
                
                // Spiralform: Winkel nimmt mit Radius zu
                const spiralTightness = 3; // Wie eng die Spirale ist
                const totalSpiralAngle = armAngle + (normalizedPos * spiralTightness);
                
                // Position mit leichter Streuung für natürlicheren Look
                const scatter = 15; // Streuung um die Spirallinie
                const scatterAngle = (Math.random() - 0.5) * 0.3;
                const scatterRadius = (Math.random() - 0.5) * scatter;
                
                const x = galaxy.x + Math.cos(totalSpiralAngle + scatterAngle) * (radius + scatterRadius);
                const y = galaxy.y + Math.sin(totalSpiralAngle + scatterAngle) * (radius + scatterRadius);
                
                // Orbital velocity für realistische Bewegung
                const orbitalSpeed = Math.sqrt(galaxy.mass / radius) * 8;
                const velocity = new Vector2D(
                    -Math.sin(totalSpiralAngle) * orbitalSpeed,
                    Math.cos(totalSpiralAngle) * orbitalSpeed
                );
                
                // Objekttyp basierend auf Position in der Galaxie
                let objectType, objRadius, objMass;
                
                if (normalizedPos < 0.3) {
                    // Innerer Bereich: Hauptsächlich Sterne
                    objectType = Math.random() < 0.8 ? 'star' : 'planet';
                    objRadius = objectType === 'star' ? 15 + Math.random() * 10 : 8 + Math.random() * 8;
                    objMass = (15 + Math.random() * 25) * 200;
                } else if (normalizedPos < 0.7) {
                    // Mittlerer Bereich: Gemischt
                    const rand = Math.random();
                    if (rand < 0.4) {
                        objectType = 'star';
                        objRadius = 12 + Math.random() * 8;
                        objMass = (10 + Math.random() * 20) * 180;
                    } else if (rand < 0.7) {
                        objectType = 'planet';
                        objRadius = 8 + Math.random() * 12;
                        objMass = (8 + Math.random() * 15) * 150;
                    } else {
                        objectType = 'asteroid';
                        objRadius = 4 + Math.random() * 8;
                        objMass = (3 + Math.random() * 8) * 100;
                    }
                } else {
                    // Äußerer Bereich: Hauptsächlich Planeten und Asteroiden
                    objectType = Math.random() < 0.6 ? 'asteroid' : 'planet';
                    objRadius = objectType === 'asteroid' ? 3 + Math.random() * 6 : 6 + Math.random() * 10;
                    objMass = (3 + Math.random() * 10) * 120;
                }
                
                galacticObjects.push({
                    x: x,
                    y: y,
                    radius: objRadius,
                    mass: objMass,
                    velocity: velocity,
                    type: objectType,
                    particles: galaxy.particles.slice(i * 2, (i + 1) * 2),
                    galaxyMember: true,
                    galaxyType: 'spiral'
                });
            }
        }
    }

    createEllipticalGalaxy(galaxy, galacticObjects) {
        const objectCount = Math.floor(galaxy.particles.length / 4);
        
        for (let i = 0; i < objectCount; i++) {
            // Elliptische Verteilung
            const angle = Math.random() * Math.PI * 2;
            const normalizedRadius = Math.pow(Math.random(), 0.7); // Dichter im Zentrum
            const maxRadius = galaxy.size * 0.8;
            
            // Elliptische Form (breiter als hoch)
            const ellipseRatio = 0.6 + Math.random() * 0.3; // 0.6 bis 0.9
            const x = galaxy.x + Math.cos(angle) * normalizedRadius * maxRadius;
            const y = galaxy.y + Math.sin(angle) * normalizedRadius * maxRadius * ellipseRatio;
            
            // Zufälligere Bewegung in elliptischen Galaxien
            const velocity = new Vector2D(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            );
            
            // Objekttyp: Elliptische Galaxien haben mehr alte Sterne
            let objectType, objRadius, objMass;
            const rand = Math.random();
            
            if (rand < 0.6) {
                // Viele alte, rote Sterne
                objectType = 'star';
                objRadius = 10 + Math.random() * 12;
                objMass = (12 + Math.random() * 20) * 190;
            } else if (rand < 0.8) {
                objectType = 'planet';
                objRadius = 6 + Math.random() * 10;
                objMass = (6 + Math.random() * 12) * 140;
            } else {
                objectType = 'asteroid';
                objRadius = 3 + Math.random() * 6;
                objMass = (2 + Math.random() * 6) * 110;
            }
            
            galacticObjects.push({
                x: x,
                y: y,
                radius: objRadius,
                mass: objMass,
                velocity: velocity,
                type: objectType,
                particles: galaxy.particles.slice(i * 3, (i + 1) * 3),
                galaxyMember: true,
                galaxyType: 'elliptical'
            });
        }
    }

    groupNearbyParticles() {
        const groups = [];
        const used = new Set();
        const groupDistance = 40; // Größere Gruppierungsdistanz
        
        this.particles.forEach((particle, index) => {
            if (used.has(index) || particle.coalescenceTimer > 0) return;
            
            const group = [particle];
            used.add(index);
            
            this.particles.forEach((other, otherIndex) => {
                if (used.has(otherIndex) || other.coalescenceTimer > 0) return;
                
                const distance = particle.position.distance(other.position);
                if (distance < groupDistance) {
                    group.push(other);
                    used.add(otherIndex);
                }
            });
            
            groups.push(group);
        });
        
        return groups;
    }

    getScale() {
        return this.scale;
    }

    draw(ctx) {
        ctx.save();
        
        // Universum-Skalierung anwenden
        if (this.phase === 'expansion' || this.phase === 'cooling' || 
            this.phase === 'formation' || this.phase === 'galaxy_birth') {
            ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            ctx.scale(this.scale, this.scale);
            ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        }
        
        // Kosmischer Hintergrund-Glow
        if (this.age < 6) {
            const intensity = Math.max(0, 1 - (this.age - 2) / 4);
            ctx.save();
            ctx.globalAlpha = intensity * 0.4;
            ctx.globalCompositeOperation = 'screen';
            
            const gradient = ctx.createRadialGradient(
                this.center.x, this.center.y, 0,
                this.center.x, this.center.y, Math.min(this.canvas.width, this.canvas.height) * 2
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.2, '#ffd700');
            gradient.addColorStop(0.4, '#ff8c00');
            gradient.addColorStop(0.6, '#ff4500');
            gradient.addColorStop(0.8, '#8a2be2');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(-this.canvas.width, -this.canvas.height, 
                        this.canvas.width * 3, this.canvas.height * 3);
            ctx.restore();
        }

        // Galaxien-Strukturen zeichnen
        if (this.phase === 'galaxy_birth') {
            this.galaxies.forEach(galaxy => {
                if (galaxy.particles.length < 10) return;
                
                ctx.save();
                ctx.globalAlpha = galaxy.brightness * 0.4;
                
                if (galaxy.type === 'spiral') {
                    // Detaillierte Spiralarme zeichnen
                    ctx.strokeStyle = '#4a90e2';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#4a90e2';
                    ctx.shadowBlur = 8;
                    
                    for (let arm = 0; arm < galaxy.armCount; arm++) {
                        ctx.beginPath();
                        const armAngle = (arm * 2 * Math.PI / galaxy.armCount) + galaxy.rotation;
                        
                        let firstPoint = true;
                        for (let r = 20; r <= galaxy.size; r += 8) {
                            const spiralTightness = 3;
                            const normalizedPos = (r - 20) / (galaxy.size - 20);
                            const totalSpiralAngle = armAngle + (normalizedPos * spiralTightness);
                            
                            const x = galaxy.x + Math.cos(totalSpiralAngle) * r;
                            const y = galaxy.y + Math.sin(totalSpiralAngle) * r;
                            
                            if (firstPoint) {
                                ctx.moveTo(x, y);
                                firstPoint = false;
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                        ctx.stroke();
                        
                        // Dickerer innerer Bereich
                        ctx.lineWidth = 5;
                        ctx.globalAlpha = galaxy.brightness * 0.6;
                        ctx.beginPath();
                        for (let r = 20; r <= galaxy.size * 0.4; r += 6) {
                            const spiralTightness = 3;
                            const normalizedPos = (r - 20) / (galaxy.size - 20);
                            const totalSpiralAngle = armAngle + (normalizedPos * spiralTightness);
                            
                            const x = galaxy.x + Math.cos(totalSpiralAngle) * r;
                            const y = galaxy.y + Math.sin(totalSpiralAngle) * r;
                            
                            if (r === 20) {
                                ctx.moveTo(x, y);
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                        ctx.stroke();
                        ctx.lineWidth = 3;
                        ctx.globalAlpha = galaxy.brightness * 0.4;
                    }
                    
                    // Zentraler Bulge
                    ctx.globalAlpha = galaxy.brightness * 0.8;
                    ctx.fillStyle = '#ffd700';
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(galaxy.x, galaxy.y, 25, 0, Math.PI * 2);
                    ctx.fill();
                    
                } else {
                    // Elliptische Galaxie mit Graduierung
                    const maxRadius = galaxy.size * 0.8;
                    const ellipseRatio = 0.7;
                    
                    // Mehrere konzentrische Ellipsen für Tiefeneffekt
                    for (let i = 3; i >= 1; i--) {
                        const radius = maxRadius * (i / 3);
                        const alpha = galaxy.brightness * 0.2 * i;
                        
                        ctx.globalAlpha = alpha;
                        ctx.strokeStyle = '#e24a90';
                        ctx.lineWidth = 2 * i;
                        ctx.shadowColor = '#e24a90';
                        ctx.shadowBlur = 10;
                        
                        ctx.beginPath();
                        ctx.ellipse(galaxy.x, galaxy.y, radius, radius * ellipseRatio, 0, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    
                    // Gefüllter Kern
                    ctx.globalAlpha = galaxy.brightness * 0.6;
                    ctx.fillStyle = '#ffaa88';
                    ctx.shadowColor = '#ffaa88';
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.ellipse(galaxy.x, galaxy.y, maxRadius * 0.3, maxRadius * 0.3 * ellipseRatio, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Galaxien-Bezeichnung (optional)
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                    galaxy.type === 'spiral' ? `Spiral (${galaxy.armCount} Arms)` : 'Elliptical',
                    galaxy.x,
                    galaxy.y - galaxy.size - 20
                );
                
                ctx.restore();
            });
        }

        // Shockwaves zeichnen
        this.shockwaves.forEach(wave => wave.draw(ctx));

        // Partikel zeichnen
        this.particles.forEach(particle => {
            ctx.save();
            
            let color = '#ffffff';
            let glowIntensity = 1;
            
            // Farbe basierend auf Temperatur und Phase
            if (particle.temperature > 20000) {
                color = '#ffffff';
                glowIntensity = 2;
            } else if (particle.temperature > 10000) {
                color = '#e6e6ff';
                glowIntensity = 1.5;
            } else if (particle.temperature > 5000) {
                color = '#ffd700';
            } else if (particle.temperature > 3000) {
                color = '#ff8c00';
            } else if (particle.temperature > 1000) {
                color = '#ff4500';
            } else {
                color = particle.layer ? `hsl(${240 + particle.layer * 30}, 70%, 60%)` : '#8888ff';
            }
            
            ctx.globalAlpha = Math.min(1, particle.life);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Verstärkter Glow-Effekt
            if (particle.temperature > 1000) {
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.3 * glowIntensity;
                ctx.beginPath();
                ctx.arc(particle.position.x, particle.position.y, particle.size * glowIntensity * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }
}

class EffectsManager {
    constructor() {
        this.explosions = [];
        this.shockwaves = [];
        this.starField = null;
        this.trailEffect = new TrailEffect();
        this.bigBangEffect = null;
    }

    setStarField(starField) {
        this.starField = starField;
    }

    createExplosion(x, y, size = 50) {
        this.explosions.push(new ExplosionEffect(x, y, size));
        this.shockwaves.push(new ShockwaveEffect(x, y, size * 2));
    }

    createBigBang(x, y, canvas, collisionObj1 = null, collisionObj2 = null) {
        this.bigBangEffect = new BigBangEffect(x, y, canvas, collisionObj1, collisionObj2);
    }

    update(deltaTime) {
        // Explosionen aktualisieren
        this.explosions = this.explosions.filter(explosion => 
            explosion.update(deltaTime)
        );
        
        // Shockwaves aktualisieren
        this.shockwaves = this.shockwaves.filter(shockwave => 
            shockwave.update(deltaTime)
        );
        
        // Trail-Effekt aktualisieren
        this.trailEffect.update(deltaTime);
        
        // Sterne aktualisieren
        if (this.starField) {
            this.starField.update(deltaTime);
        }

        // Big Bang aktualisieren
        if (this.bigBangEffect) {
            if (!this.bigBangEffect.update(deltaTime)) {
                this.bigBangEffect = null; // Big Bang beendet
            }
        }
    }

    draw(ctx) {
        // Sterne zeichnen (Hintergrund)
        if (this.starField) {
            this.starField.draw(ctx);
        }
        
        // Trail-Effekte zeichnen
        this.trailEffect.draw(ctx);
        
        // Shockwaves zeichnen
        this.shockwaves.forEach(shockwave => shockwave.draw(ctx));
        
        // Explosionen zeichnen
        this.explosions.forEach(explosion => explosion.draw(ctx));

        // Big Bang zeichnen (oberste Schicht)
        if (this.bigBangEffect) {
            this.bigBangEffect.draw(ctx);
        }
    }

    addTrail(objectId, position, color) {
        this.trailEffect.addTrail(objectId, position, color);
    }

    clear() {
        this.explosions = [];
        this.shockwaves = [];
        this.trailEffect.clear();
        this.bigBangEffect = null;
    }

    isBigBangActive() {
        return this.bigBangEffect !== null;
    }

    getBigBangScale() {
        return this.bigBangEffect ? this.bigBangEffect.getScale() : 1.0;
    }

    getBigBangFormableObjects() {
        return this.bigBangEffect ? this.bigBangEffect.getFormableObjects() : [];
    }
} 