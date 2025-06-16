class SpaceSimulation {
    constructor() {
        this.canvas = document.getElementById('spaceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.physicsEngine = new PhysicsEngine();
        this.effectsManager = new EffectsManager();
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.isRunning = false;
        
        // Kamera-System für Universum-Skalierung
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1.0,
            targetZoom: 1.0,
            minZoom: 0.1,
            maxZoom: 2.0
        };
        
        this.setupCanvas();
        this.setupControls();
        this.setupStarField();
        this.initializeScene();
        this.start();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Maus-Events für Objekt-Hinzufügung mit Richtung
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Variablen für Richtungssteuerung
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        if (this.effectsManager.starField) {
            this.effectsManager.starField.resize(this.canvas.width, this.canvas.height);
        }
    }

    setupStarField() {
        const starField = new StarField(this.canvas);
        this.effectsManager.setStarField(starField);
    }

    setupControls() {
        // Button Event Listeners
        document.getElementById('addPlanet').addEventListener('click', () => {
            this.addRandomObject('planet');
        });

        document.getElementById('addAsteroid').addEventListener('click', () => {
            this.addRandomObject('asteroid');
        });

        document.getElementById('addBlackhole').addEventListener('click', () => {
            this.addRandomObject('blackhole');
        });

        document.getElementById('bigBang').addEventListener('click', () => {
            this.triggerBigBang();
        });

        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });

        // Slider Event Listeners
        const gravitySlider = document.getElementById('gravity');
        const speedSlider = document.getElementById('speed');
        
        gravitySlider.addEventListener('input', (e) => {
            this.physicsEngine.gravity = parseFloat(e.target.value);
            document.getElementById('gravityValue').textContent = e.target.value;
        });

        speedSlider.addEventListener('input', (e) => {
            this.physicsEngine.timeScale = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value;
        });
    }

    initializeScene() {
        // Sonne im Zentrum mit viel größerer Masse
        const sun = new SpaceObject(
            this.canvas.width / 2,
            this.canvas.height / 2,
            30,
            5000,  // Viel größere Masse für stärkere Anziehung
            '#ffaa00',
            'star'
        );
        // Sonne kann sich jetzt bewegen (leichte Anfangsgeschwindigkeit)
        sun.velocity = new Vector2D((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
        this.physicsEngine.addObject(sun);

        // Ein paar Planeten hinzufügen
        this.addRandomObject('planet');
        this.addRandomObject('planet');
        this.addRandomObject('asteroid');
        this.addRandomObject('asteroid');
        this.addRandomObject('asteroid');
    }

    addRandomObject(type = 'planet') {
        const margin = 100;
        const x = margin + Math.random() * (this.canvas.width - 2 * margin);
        const y = margin + Math.random() * (this.canvas.height - 2 * margin);
        
        let radius, mass, color;
        
        // Skin-basierte Farben verwenden, falls verfügbar
        const skinData = this.skinSystem?.getCurrentSkinData();
        
        if (type === 'planet') {
            radius = 15 + Math.random() * 25;
            mass = radius * 2;
            const planetColors = skinData?.colors?.planet || ['#4a90e2', '#e24a4a', '#4ae24a', '#e2e24a', '#e24ae2', '#4ae2e2'];
            color = planetColors[Math.floor(Math.random() * planetColors.length)];
        } else if (type === 'asteroid') {
            radius = 5 + Math.random() * 15;
            mass = radius;
            const asteroidColors = skinData?.colors?.asteroid || ['#8e8e8e', '#6e6e6e', '#ae6e4e', '#9e7e5e'];
            color = asteroidColors[Math.floor(Math.random() * asteroidColors.length)];
        } else if (type === 'blackhole') {
            radius = 25 + Math.random() * 20;
            mass = radius * 800; // Noch höhere Masse für extreme Gravitation
            color = skinData?.colors?.blackhole || '#000000';
        }

        const object = new SpaceObject(x, y, radius, mass, color, type);
        
        // Schwarze Löcher bewegen sich nicht, andere Objekte bekommen Geschwindigkeit
        if (type !== 'blackhole') {
            // Stärkere zufällige Anfangsgeschwindigkeit für mehr Dynamik
            const speed = 50 + Math.random() * 100;
            const angle = Math.random() * Math.PI * 2;
            object.velocity = new Vector2D(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
        } else {
            object.velocity = new Vector2D(0, 0); // Schwarze Löcher sind stationär
        }

        this.physicsEngine.addObject(object);
    }

    triggerBigBang() {
        // Bestätigung für Big Bang
        if (!confirm('🌌 ULTIMATIVER BIG BANG 💥\n\nZwei massive schwarze Löcher werden aus großer Entfernung spiralförmig kollidieren!\nDie Animation dauert ~10 Sekunden bis zur Kollision.\n\n💰 BONUS: +25 Kosmische Münzen beim Start!\n\nMöchten Sie fortfahren?')) {
            return;
        }
        
        // Big Bang Bonus vergeben
        if (this.skinSystem) {
            this.skinSystem.earnCoinsFromGameplay('bigbang');
        }

        // Alles zurücksetzen
        this.physicsEngine.clear();
        this.effectsManager.clear();

        // Big Bang Zentrum
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Zwei massive schwarze Löcher von sehr weiter Entfernung
        const startDistance = 800; // Viel weiter weg
        const obj1 = new SpaceObject(
            centerX - startDistance, 
            centerY, 
            35, 
            12000, 
            '#000000', 
            'blackhole'
        );
        const obj2 = new SpaceObject(
            centerX + startDistance, 
            centerY, 
            35, 
            12000, 
            '#000000', 
            'blackhole'
        );
        
        // Langsamere Spiralbahn für längere Animation
        const orbitalSpeed = 60; // Reduziert für langsamere Bewegung
        obj1.velocity = new Vector2D(0, orbitalSpeed);
        obj2.velocity = new Vector2D(0, -orbitalSpeed);
        
        // Schwächere Spiralkraft für langsamere Annäherung
        const spiralForce = 15; // Viel schwächer für längere Animation
        const direction1 = obj2.position.subtract(obj1.position).normalize();
        const direction2 = obj1.position.subtract(obj2.position).normalize();
        
        obj1.velocity = obj1.velocity.add(direction1.multiply(spiralForce));
        obj2.velocity = obj2.velocity.add(direction2.multiply(spiralForce));
        
        // Temporär zur Physik hinzufügen für die Kollision
        this.physicsEngine.addObject(obj1);
        this.physicsEngine.addObject(obj2);
        
        // Big Bang mit Kollisionsobjekten starten
        this.effectsManager.createBigBang(centerX, centerY, this.canvas, obj1, obj2);
        
        // Viel später entfernen - nach längerer Kollisionssequenz
        setTimeout(() => {
            this.physicsEngine.objects = this.physicsEngine.objects.filter(
                obj => obj !== obj1 && obj !== obj2
            );
        }, 8000); // 8 Sekunden statt 2
        
        console.log('🌌 FERNKOLLISIONS-BIG BANG GESTARTET! 🕳️💫🕳️');
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.dragStart = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        this.isDragging = true;
        this.canvas.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            this.dragEnd = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    }

    handleMouseUp(e) {
        if (this.isDragging && this.dragStart && this.dragEnd) {
            // Planet mit Richtung und Geschwindigkeit hinzufügen
            const radius = 10 + Math.random() * 20;
            const mass = radius * 2;
            const colors = ['#4a90e2', '#e24a4a', '#4ae24a', '#e2e24a', '#e24ae2', '#4ae2e2'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const object = new SpaceObject(this.dragStart.x, this.dragStart.y, radius, mass, color, 'planet');
            
            // Geschwindigkeit basierend auf Mausbewegung berechnen
            const velocityScale = 3; // Verstärkungsfaktor
            const deltaX = (this.dragEnd.x - this.dragStart.x) * velocityScale;
            const deltaY = (this.dragEnd.y - this.dragStart.y) * velocityScale;
            
            object.velocity = new Vector2D(deltaX, deltaY);
            this.physicsEngine.addObject(object);
        }
        
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.canvas.style.cursor = 'crosshair';
    }

    update(deltaTime) {
        // Kamera-System aktualisieren
        this.updateCamera(deltaTime);
        
        // Gravitation nach Galaxienbildung reduzieren
        let currentGravity = this.physicsEngine.gravity;
        if (this.effectsManager.isBigBangActive()) {
            const bigBangEffect = this.effectsManager.bigBangEffect;
            if (bigBangEffect && bigBangEffect.phase === 'galaxy_birth') {
                // Gravitation stark reduzieren nach Galaxienbildung
                currentGravity = this.physicsEngine.gravity * 0.1; // 10% der normalen Gravitation
            } else if (bigBangEffect && (bigBangEffect.phase === 'formation' || bigBangEffect.phase === 'cooling')) {
                // Gravitation leicht reduzieren während Formation
                currentGravity = this.physicsEngine.gravity * 0.5; // 50% der normalen Gravitation
            }
        }
        
        // Physik mit angepasster Gravitation aktualisieren
        const originalGravity = this.physicsEngine.gravity;
        this.physicsEngine.gravity = currentGravity;
        const result = this.physicsEngine.update(deltaTime);
        this.physicsEngine.gravity = originalGravity; // Zurücksetzen für UI-Anzeige
        
        // Münz-Belohnungen für Ereignisse vergeben
        if (this.skinSystem) {
            if (result.collision) {
                this.skinSystem.earnCoinsFromGameplay('collision');
            }
            if (result.swallowed && result.swallowed.length > 0) {
                result.swallowed.forEach(() => {
                    this.skinSystem.earnCoinsFromGameplay('blackhole');
                });
            }
            if (result.burned && result.burned.length > 0) {
                result.burned.forEach(() => {
                    this.skinSystem.earnCoinsFromGameplay('rare_event');
                });
            }
        }

        // Bei Kollision Explosion erstellen
        if (result.collision) {
            const collisionPoint = result.obj1.position.add(result.obj2.position).divide(2);
            const explosionSize = (result.obj1.radius + result.obj2.radius) / 2;
            this.effectsManager.createExplosion(
                collisionPoint.x, 
                collisionPoint.y, 
                explosionSize
            );
        }

        // Bei verschluckten Objekten Sog-Effekte erstellen
        if (result.swallowed && result.swallowed.length > 0) {
            result.swallowed.forEach(({ obj, blackhole }) => {
                // Sog-Explosion am Objekt
                this.effectsManager.createExplosion(
                    obj.position.x, 
                    obj.position.y, 
                    obj.radius * 2,
                    '#8b00ff' // Lila Explosion für schwarzes Loch
                );
                
                // Wachstums-Explosion am schwarzen Loch
                this.effectsManager.createExplosion(
                    blackhole.position.x,
                    blackhole.position.y,
                    blackhole.radius * 1.5,
                    '#4b0082' // Dunkleres Lila für Wachstum
                );
                
                // Spezialeffekt für Sterne
                if (obj.type === 'star') {
                    // Zusätzliche spektakuläre Explosion
                    setTimeout(() => {
                        this.effectsManager.createExplosion(
                            blackhole.position.x,
                            blackhole.position.y,
                            blackhole.radius * 2,
                            '#ffaa00' // Gold für verschluckte Sterne
                        );
                    }, 200);
                }
            });
        }

        // Bei verbrannten Objekten Verbrennungseffekte erstellen
        if (result.burned && result.burned.length > 0) {
            result.burned.forEach(({ obj, type }) => {
                if (type === 'vaporized') {
                    // Sofortige Verdampfung - große weiße Explosion
                    this.effectsManager.createExplosion(
                        obj.position.x,
                        obj.position.y,
                        obj.radius * 3,
                        '#ffffff'
                    );
                } else {
                    // Langsame Verbrennung - orange/rote Explosion
                    this.effectsManager.createExplosion(
                        obj.position.x,
                        obj.position.y,
                        obj.radius * 2,
                        '#ff4500'
                    );
                }
            });
        }

        // Trail-Effekte für alle Objekte hinzufügen
        this.physicsEngine.objects.forEach((obj, index) => {
            this.effectsManager.addTrail(index, obj.position, obj.color);
        });

        // Effekte aktualisieren
        this.effectsManager.update(deltaTime);

        // Big Bang Objektbildung prüfen
        if (this.effectsManager.isBigBangActive()) {
            const formableObjects = this.effectsManager.getBigBangFormableObjects();
            formableObjects.forEach(objData => {
                const colors = {
                    'asteroid': ['#8e8e8e', '#6e6e6e', '#ae6e4e'],
                    'planet': ['#4a90e2', '#e24a4a', '#4ae24a', '#e2e24a'],
                    'star': '#ffaa00'
                };
                
                const color = Array.isArray(colors[objData.type]) 
                    ? colors[objData.type][Math.floor(Math.random() * colors[objData.type].length)]
                    : colors[objData.type];

                const newObject = new SpaceObject(
                    objData.x,
                    objData.y,
                    objData.radius,
                    objData.mass,
                    color,
                    objData.type
                );
                
                newObject.velocity = objData.velocity;
                
                // Spezielle Markierung für Galaxienmitglieder
                if (objData.galaxyMember) {
                    newObject.galaxyMember = true;
                    newObject.galaxyType = objData.galaxyType;
                    newObject.galacticCenter = objData.galacticCenter || false;
                }
                
                this.physicsEngine.addObject(newObject);

                // Entstehungseffekt
                this.effectsManager.createExplosion(
                    objData.x,
                    objData.y,
                    objData.radius,
                    color
                );

                // Partikel entfernen
                objData.particles.forEach(particle => {
                    particle.life = 0;
                });
            });
        }

        // Universum-Grenze erweitern während Big Bang
        const universeSize = this.effectsManager.isBigBangActive() ? 3000 : 1000;
        this.physicsEngine.objects = this.physicsEngine.objects.filter(obj => {
            if (obj.isOffScreen(this.canvas)) {
                const distance = Math.sqrt(
                    Math.pow(obj.position.x - this.canvas.width/2, 2) + 
                    Math.pow(obj.position.y - this.canvas.height/2, 2)
                );
                return distance < universeSize;
            }
            return true;
        });
    }

    updateCamera(deltaTime) {
        // Zoom während Big Bang anpassen
        if (this.effectsManager.isBigBangActive()) {
            const bigBangScale = this.effectsManager.getBigBangScale();
            if (bigBangScale) {
                this.camera.targetZoom = bigBangScale;
            }
        } else {
            this.camera.targetZoom = 1.0;
        }
        
        // Sanfte Zoom-Transition
        const zoomDiff = this.camera.targetZoom - this.camera.zoom;
        this.camera.zoom += zoomDiff * deltaTime * 0.5;
        
        // Zoom-Grenzen einhalten
        this.camera.zoom = Math.max(this.camera.minZoom, 
                          Math.min(this.camera.maxZoom, this.camera.zoom));
    }

    render() {
        // Canvas leeren
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Kamera-Transformation anwenden
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        
        // Effekte zeichnen (Hintergrund)
        this.effectsManager.draw(this.ctx);
        
        // Objekte zeichnen
        this.physicsEngine.objects.forEach(obj => {
            this.drawSpaceObject(obj);
            
            // Verbrennungspartikel zeichnen
            if (obj.burnParticles && obj.burnParticles.length > 0) {
                obj.drawBurnParticles(this.ctx, obj.position.x, obj.position.y);
            }
        });
        
        this.ctx.restore();
        
        // Richtungslinie zeichnen (im Screen-Space)
        this.drawDirectionLine();
        
        // UI-Informationen aktualisieren (im Screen-Space)
        this.updateUI();
    }

    drawSpaceObject(obj) {
        this.ctx.save();
        
        // Glow-Effekt für bestimmte Objekte
        if (obj.type === 'star') {
            GlowEffect.drawGlow(this.ctx, obj.position.x, obj.position.y, obj.radius, '#ffaa00');
        }
        
        this.ctx.translate(obj.position.x, obj.position.y);
        this.ctx.rotate(obj.rotation);
        
        // Objekt-spezifisches Rendering
        if (obj.type === 'asteroid') {
            this.drawAsteroid(obj);
        } else if (obj.type === 'star') {
            this.drawStar(obj);
        } else if (obj.type === 'blackhole') {
            this.drawBlackhole(obj);
        } else {
            this.drawPlanet(obj);
        }
        
        this.ctx.restore();
    }

    drawPlanet(obj) {
        // Hauptkörper
        const gradient = this.ctx.createRadialGradient(
            -obj.radius * 0.3, -obj.radius * 0.3, 0,
            0, 0, obj.radius
        );
        gradient.addColorStop(0, this.lightenColor(obj.color, 40));
        gradient.addColorStop(1, obj.color);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Atmosphäre
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = this.lightenColor(obj.color, 60);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obj.radius + 2, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawStar(obj) {
        // Kern
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, obj.radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.2, '#ffff00');
        gradient.addColorStop(0.7, '#ffaa00');
        gradient.addColorStop(1, '#ff6600');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sonnenflecken
        for (let i = 0; i < 5; i++) {
            const angle = (obj.rotation + i * 2) * 2;
            const x = Math.cos(angle) * obj.radius * 0.7;
            const y = Math.sin(angle) * obj.radius * 0.7;
            
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#cc4400';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }

    drawAsteroid(obj) {
        if (!obj.shape) return;
        
        this.ctx.beginPath();
        obj.shape.forEach((point, index) => {
            const x = point.x * obj.radius;
            const y = point.y * obj.radius;
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.closePath();
        
        // Gradient für 3D-Effekt
        const gradient = this.ctx.createLinearGradient(
            -obj.radius, -obj.radius, obj.radius, obj.radius
        );
        gradient.addColorStop(0, this.lightenColor(obj.color, 30));
        gradient.addColorStop(1, this.darkenColor(obj.color, 30));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = this.darkenColor(obj.color, 50);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    drawBlackhole(obj) {
        // Akkretionsscheibe zeichnen
        if (obj.accretionDisk) {
            obj.accretionDisk.forEach(particle => {
                const x = Math.cos(particle.angle) * particle.distance;
                const y = Math.sin(particle.angle) * particle.distance;
                
                this.ctx.save();
                this.ctx.globalAlpha = 0.7;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            });
        }

        // Event Horizont (schwach sichtbar)
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;
        this.ctx.strokeStyle = '#8b00ff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obj.eventHorizon, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();

        // Schwarzes Loch selbst - völlig schwarz
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, obj.radius);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.7, '#000000');
        gradient.addColorStop(0.9, '#1a1a1a');
        gradient.addColorStop(1, '#4a4a4a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Gravitationslinse-Effekt (Ring um schwarzes Loch)
        this.ctx.save();
        this.ctx.globalAlpha = 0.6;
        this.ctx.strokeStyle = '#8b00ff';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#8b00ff';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, obj.radius + 5, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();

        // Innerer Glow
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        const innerGlow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, obj.radius * 1.5);
        innerGlow.addColorStop(0, 'rgba(139, 0, 255, 0.1)');
        innerGlow.addColorStop(1, 'rgba(139, 0, 255, 0)');
        this.ctx.fillStyle = innerGlow;
        this.ctx.fillRect(-obj.radius * 1.5, -obj.radius * 1.5, obj.radius * 3, obj.radius * 3);
        this.ctx.restore();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }

    drawDirectionLine() {
        if (this.isDragging && this.dragStart && this.dragEnd) {
            this.ctx.save();
            
            // Linie von Start zu aktueller Mausposition
            this.ctx.strokeStyle = '#00d4ff';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.globalAlpha = 0.8;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
            this.ctx.lineTo(this.dragEnd.x, this.dragEnd.y);
            this.ctx.stroke();
            
            // Pfeilspitze
            const angle = Math.atan2(this.dragEnd.y - this.dragStart.y, this.dragEnd.x - this.dragStart.x);
            const arrowLength = 15;
            const arrowAngle = 0.5;
            
            this.ctx.setLineDash([]);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.dragEnd.x, this.dragEnd.y);
            this.ctx.lineTo(
                this.dragEnd.x - arrowLength * Math.cos(angle - arrowAngle),
                this.dragEnd.y - arrowLength * Math.sin(angle - arrowAngle)
            );
            this.ctx.moveTo(this.dragEnd.x, this.dragEnd.y);
            this.ctx.lineTo(
                this.dragEnd.x - arrowLength * Math.cos(angle + arrowAngle),
                this.dragEnd.y - arrowLength * Math.sin(angle + arrowAngle)
            );
            this.ctx.stroke();
            
            // Vorschau-Planet
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(this.dragStart.x, this.dragStart.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#00d4ff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }

    updateUI() {
        // FPS anzeigen
        document.getElementById('fps').textContent = Math.round(this.fps);
        
        // Objekt-Statistiken
        const objects = this.physicsEngine.objects;
        const planets = objects.filter(obj => obj.type === 'planet').length;
        const stars = objects.filter(obj => obj.type === 'star').length;
        const asteroids = objects.filter(obj => obj.type === 'asteroid').length;
        const blackholes = objects.filter(obj => obj.type === 'blackhole').length;
        
        document.getElementById('planetCount').textContent = planets;
        document.getElementById('starCount').textContent = stars;
        document.getElementById('asteroidCount').textContent = asteroids;
        document.getElementById('blackholeCount').textContent = blackholes;
        document.getElementById('totalObjects').textContent = objects.length;
        
        // Kollisions-Counter
        document.getElementById('collisionCount').textContent = this.physicsEngine.collisionCount;
        document.getElementById('swallowedCount').textContent = this.physicsEngine.swallowedCount;
        document.getElementById('burnedCount').textContent = this.physicsEngine.burnedCount;
        
        // Big Bang Status und Gravitationsanzeige
        if (this.effectsManager.isBigBangActive()) {
            const bigBangEffect = this.effectsManager.bigBangEffect;
            const phase = bigBangEffect.phase;
            const age = Math.round(bigBangEffect.age);
            const maxAge = bigBangEffect.maxAge;
            
            let gravityStatus = "Normal";
            let gravityColor = "#fff";
            
            if (phase === 'galaxy_birth') {
                gravityStatus = "Stark reduziert (10%)";
                gravityColor = "#ffaa00";
            } else if (phase === 'formation' || phase === 'cooling') {
                gravityStatus = "Reduziert (50%)";
                gravityColor = "#ffd700";
            }
            
            document.getElementById('bigBangStatus').innerHTML = 
                `<strong>Big Bang aktiv:</strong><br/>
                 Phase: ${phase}<br/>
                 Zeit: ${age}s / ${maxAge}s<br/>
                 <span style="color: ${gravityColor}">Gravitation: ${gravityStatus}</span>`;
        } else {
            document.getElementById('bigBangStatus').innerHTML = '<strong>Normaler Modus</strong><br/>Gravitation: Normal';
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // FPS berechnen
        this.frameCount++;
        this.fpsTime += deltaTime;
        if (this.fpsTime >= 1) {
            this.fps = this.frameCount / this.fpsTime;
            this.frameCount = 0;
            this.fpsTime = 0;
        }
        
        // Update und Render
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    stop() {
        this.isRunning = false;
    }

    reset() {
        this.physicsEngine.clear();
        this.effectsManager.clear();
        this.initializeScene();
    }
}

// Simulation starten wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const simulation = new SpaceSimulation();
    
    // Skin-System initialisieren
    skinSystem = new SkinSystem(simulation);
    
    // Skin-System in die Simulation integrieren
    simulation.skinSystem = skinSystem;
    
    // Anfangs-Skin anwenden
    skinSystem.applySkinToSimulation();
}); 