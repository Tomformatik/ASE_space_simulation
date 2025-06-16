// ===================== PREMIUM SKIN SYSTEM =====================

class SkinSystem {
    constructor(simulation) {
        this.simulation = simulation;
        this.coins = parseInt(localStorage.getItem('cosmicCoins') || '100');
        this.ownedSkins = JSON.parse(localStorage.getItem('ownedSkins') || '["standard"]');
        this.currentSkin = localStorage.getItem('currentSkin') || 'standard';
        this.lastDailyBonus = localStorage.getItem('lastDailyBonus') || '0';
        
        // Münz-Benachrichtigungssystem
        this.notificationsEnabled = localStorage.getItem('coinNotifications') !== 'false';
        this.coinQueue = [];
        this.isProcessingCoins = false;
        this.coinMultiplier = 1;
        this.activeBoosters = JSON.parse(localStorage.getItem('activeBoosters') || '[]');
        
        this.initializeSkins();
        this.setupEventListeners();
        this.updateUI();
    }

    initializeSkins() {
        this.skins = {
            // ========== THEMEN ==========
            themes: {
                standard: {
                    name: "Standard",
                    description: "Das klassische Weltraum-Design",
                    price: 0,
                    rarity: "common",
                    owned: true,
                    colors: {
                        planet: ['#4a90e2', '#e24a4a', '#4ae24a', '#e2e24a', '#e24ae2', '#4ae2e2'],
                        star: '#ffaa00',
                        asteroid: ['#8e8e8e', '#6e6e6e', '#ae6e4e', '#9e7e5e'],
                        blackhole: '#000000',
                        background: '#0a0a0a'
                    }
                },
                neon: {
                    name: "🌈 Neon Dreams",
                    description: "Leuchtende Cyber-Planeten mit Neon-Effekten",
                    price: 150,
                    rarity: "uncommon",
                    colors: {
                        planet: ['#ff073a', '#39ff14', '#00d4ff', '#ff8c00', '#da70d6', '#ffff00'],
                        star: '#ff1493',
                        asteroid: ['#7f00ff', '#ff4500', '#00ffff', '#ff69b4'],
                        blackhole: '#4b0082',
                        background: '#0f0f23'
                    },
                    glowEffect: true
                },
                vintage: {
                    name: "📻 Retro Space",
                    description: "Vintage 70er Jahre Sci-Fi Ästhetik",
                    price: 200,
                    rarity: "rare",
                    colors: {
                        planet: ['#8b4513', '#daa520', '#cd853f', '#d2691e', '#bc8f8f', '#f4a460'],
                        star: '#ffd700',
                        asteroid: ['#696969', '#708090', '#778899', '#2f4f4f'],
                        blackhole: '#191970',
                        background: '#2f1b14'
                    },
                    vintage: true
                },
                crystal: {
                    name: "💎 Kristall-Galaxie",
                    description: "Durchsichtige Kristall-Planeten mit Prisma-Effekten",
                    price: 350,
                    rarity: "epic",
                    colors: {
                        planet: ['#87ceeb', '#dda0dd', '#98fb98', '#f0e68c', '#ffa07a', '#40e0d0'],
                        star: '#ffb6c1',
                        asteroid: ['#c0c0c0', '#e6e6fa', '#f0f8ff', '#fff8dc'],
                        blackhole: '#483d8b',
                        background: '#0e0e1a'
                    },
                    crystalEffect: true
                },
                matrix: {
                    name: "🔢 Matrix Code",
                    description: "Grüne Matrix-Planeten mit digitalen Regen-Effekten",
                    price: 280,
                    rarity: "rare",
                    colors: {
                        planet: ['#00ff00', '#00cc00', '#008800', '#00ff88', '#88ff00', '#00ffcc'],
                        star: '#00ff00',
                        asteroid: ['#004400', '#006600', '#008800', '#00aa00'],
                        blackhole: '#001100',
                        background: '#000800'
                    },
                    matrixEffect: true
                },
                fire: {
                    name: "🔥 Feuer-Nebel",
                    description: "Brennende Planeten mit lodernden Flammen-Effekten",
                    price: 320,
                    rarity: "epic",
                    colors: {
                        planet: ['#ff4500', '#ff6347', '#ff8c00', '#ffa500', '#ff1493', '#dc143c'],
                        star: '#ffff00',
                        asteroid: ['#8b0000', '#a0522d', '#cd853f', '#d2691e'],
                        blackhole: '#800000',
                        background: '#0a0300'
                    },
                    fireEffect: true
                },
                ice: {
                    name: "❄️ Eis-Kristall",
                    description: "Gefrorene Welten mit Schneesturm-Partikeln",
                    price: 290,
                    rarity: "rare",
                    colors: {
                        planet: ['#b0e0e6', '#afeeee', '#e0ffff', '#f0f8ff', '#ffffff', '#87ceeb'],
                        star: '#ffffff',
                        asteroid: ['#708090', '#778899', '#b0c4de', '#dcdcdc'],
                        blackhole: '#191970',
                        background: '#000811'
                    },
                    iceEffect: true
                },
                toxic: {
                    name: "☢️ Toxische Zone",
                    description: "Radioaktive Planeten mit Giftwolken",
                    price: 380,
                    rarity: "epic",
                    colors: {
                        planet: ['#32cd32', '#7fff00', '#adff2f', '#9acd32', '#98fb98', '#00ff7f'],
                        star: '#ffff00',
                        asteroid: ['#556b2f', '#6b8e23', '#808000', '#9acd32'],
                        blackhole: '#2f4f2f',
                        background: '#0a0f0a'
                    },
                    toxicEffect: true
                },
                steampunk: {
                    name: "⚙️ Steampunk-Ära",
                    description: "Mechanische Planeten mit Zahnrädern und Dampf",
                    price: 420,
                    rarity: "epic",
                    colors: {
                        planet: ['#cd853f', '#d2691e', '#bc8f8f', '#a0522d', '#8b4513', '#daa520'],
                        star: '#ffd700',
                        asteroid: ['#696969', '#708090', '#2f4f4f', '#4682b4'],
                        blackhole: '#2f2f2f',
                        background: '#1a1a0a'
                    },
                    steampunkEffect: true
                }
            },

            // ========== EFFEKTE ==========
            effects: {
                trails: {
                    name: "💫 Sternen-Schweife",
                    description: "Alle Objekte hinterlassen magische Schweife",
                    price: 100,
                    rarity: "common",
                    effect: "trails"
                },
                particles: {
                    name: "✨ Partikel-Aura",
                    description: "Kontinuierliche Partikel um alle Objekte",
                    price: 180,
                    rarity: "uncommon",
                    effect: "particles"
                },
                lightning: {
                    name: "⚡ Plasma-Blitze",
                    description: "Elektrische Entladungen zwischen Objekten",
                    price: 280,
                    rarity: "rare",
                    effect: "lightning"
                },
                aurora: {
                    name: "🌌 Aurora-Felder",
                    description: "Nordlicht-ähnliche Energiefelder",
                    price: 400,
                    rarity: "epic",
                    effect: "aurora"
                },
                disco: {
                    name: "🕺 Disco-Fever",
                    description: "Blinkende Planeten mit Regenbogen-Stroboskop",
                    price: 250,
                    rarity: "rare",
                    effect: "disco"
                },
                magnetic: {
                    name: "🧲 Magnetfeld",
                    description: "Magnetische Kraftlinien zwischen allen Objekten",
                    price: 320,
                    rarity: "epic",
                    effect: "magnetic"
                },
                ghost: {
                    name: "👻 Geister-Hauch",
                    description: "Planeten verblassen und erscheinen geisterhaft",
                    price: 300,
                    rarity: "rare",
                    effect: "ghost"
                },
                time: {
                    name: "⏰ Zeitverzerrung",
                    description: "Zeit-Risse und chronale Verwerfungen",
                    price: 450,
                    rarity: "epic",
                    effect: "time"
                },
                psychedelic: {
                    name: "🌈 Psychedelisch",
                    description: "Kaleidoskop-Farben und Wirbel-Effekte",
                    price: 380,
                    rarity: "epic",
                    effect: "psychedelic"
                }
            },

            // ========== PREMIUM ==========
            premium: {
                galaxy: {
                    name: "👑 Galaktischer Kaiser",
                    description: "Goldene Planeten mit Königsaura",
                    price: 500,
                    rarity: "legendary",
                    colors: {
                        planet: ['#ffd700', '#ffb347', '#daa520', '#b8860b', '#cd853f', '#f4a460'],
                        star: '#fff700',
                        asteroid: ['#daa520', '#b8860b', '#cd853f', '#d2691e'],
                        blackhole: '#8b4513',
                        background: '#1a1a0e'
                    },
                    crownEffect: true
                },
                void: {
                    name: "🖤 Void Destroyer",
                    description: "Dunkle Materie mit Anti-Gravitationseffekten",
                    price: 750,
                    rarity: "legendary",
                    colors: {
                        planet: ['#2f2f2f', '#4a4a4a', '#696969', '#808080', '#a9a9a9', '#c0c0c0'],
                        star: '#444444',
                        asteroid: ['#1c1c1c', '#2f2f2f', '#434343', '#575757'],
                        blackhole: '#000000',
                        background: '#000000'
                    },
                    voidEffect: true
                },
                dragon: {
                    name: "🐉 Drachenfeuer",
                    description: "Feuerspeiende Drachen umkreisen deine Planeten",
                    price: 650,
                    rarity: "legendary",
                    colors: {
                        planet: ['#ff4500', '#ff6347', '#ffd700', '#ff8c00', '#dc143c', '#b22222'],
                        star: '#ffff00',
                        asteroid: ['#8b0000', '#a0522d', '#cd853f', '#d2691e'],
                        blackhole: '#8b0000',
                        background: '#0f0000'
                    },
                    dragonEffect: true
                },
                angel: {
                    name: "👼 Himmlisch",
                    description: "Engelsschwingen und heilige Auren",
                    price: 600,
                    rarity: "legendary",
                    colors: {
                        planet: ['#ffffff', '#f0f8ff', '#fffacd', '#fff8dc', '#faebd7', '#f5f5dc'],
                        star: '#ffffff',
                        asteroid: ['#dcdcdc', '#d3d3d3', '#c0c0c0', '#b0c4de'],
                        blackhole: '#483d8b',
                        background: '#000822'
                    },
                    angelEffect: true
                },
                cyberpunk: {
                    name: "🌃 Cyberpunk 2177",
                    description: "Futuristische Neon-Metropolen im Weltraum",
                    price: 800,
                    rarity: "legendary",
                    colors: {
                        planet: ['#ff0080', '#00ffff', '#ffff00', '#ff8000', '#8000ff', '#00ff80'],
                        star: '#ffffff',
                        asteroid: ['#800080', '#008080', '#808000', '#ff4500'],
                        blackhole: '#000080',
                        background: '#000033'
                    },
                    cyberpunkEffect: true
                }
            },

            // ========== LIMITIERTE NFT-SKINS ==========
            nft: {
                cosmic: {
                    name: "🔮 Kosmischer Genesis",
                    description: "Limitiert: Nur 100 Stück! Regenbogen-Planeten mit Hologramm-Effekt",
                    price: 1000,
                    rarity: "mythic",
                    limited: 100,
                    owned: 23, // Bereits verkauft
                    colors: {
                        planet: ['hsl(0,100%,50%)', 'hsl(60,100%,50%)', 'hsl(120,100%,50%)', 'hsl(180,100%,50%)', 'hsl(240,100%,50%)', 'hsl(300,100%,50%)'],
                        star: 'hsl(45,100%,60%)',
                        asteroid: ['hsl(270,50%,40%)', 'hsl(330,50%,40%)', 'hsl(30,50%,40%)', 'hsl(90,50%,40%)'],
                        blackhole: 'hsl(0,0%,10%)',
                        background: '#050510'
                    },
                    hologramEffect: true,
                    rainbowRotation: true
                },
                quantum: {
                    name: "⚛️ Quantum Flux",
                    description: "Limitiert: Nur 50 Stück! Planeten phasen zwischen Dimensionen",
                    price: 1500,
                    rarity: "mythic",
                    limited: 50,
                    owned: 8,
                    colors: {
                        planet: ['rgba(255,100,255,0.8)', 'rgba(100,255,255,0.8)', 'rgba(255,255,100,0.8)', 'rgba(255,100,100,0.8)', 'rgba(100,255,100,0.8)', 'rgba(100,100,255,0.8)'],
                        star: 'rgba(255,255,255,0.9)',
                        asteroid: ['rgba(128,128,255,0.7)', 'rgba(255,128,128,0.7)', 'rgba(128,255,128,0.7)', 'rgba(255,255,128,0.7)'],
                        blackhole: 'rgba(50,0,50,0.9)',
                        background: '#000008'
                    },
                    quantumEffect: true,
                    phaseShift: true
                },
                godmode: {
                    name: "⚡ Gott-Modus",
                    description: "Limitiert: Nur 25 Stück! Kontrolle über Raum und Zeit",
                    price: 2000,
                    rarity: "mythic",
                    limited: 25,
                    owned: 3,
                    colors: {
                        planet: ['#ffffff', '#ffd700', '#ff69b4', '#00bfff', '#32cd32', '#ff4500'],
                        star: '#ffffff',
                        asteroid: ['#daa520', '#ff6347', '#40e0d0', '#9370db'],
                        blackhole: '#000000',
                        background: '#000000'
                    },
                    godmodeEffect: true,
                    omnipotent: true
                },
                universe: {
                    name: "🌌 Universum-Schöpfer",
                    description: "Limitiert: Nur 10 Stück! Erschaffe Mini-Universen",
                    price: 5000,
                    rarity: "mythic",
                    limited: 10,
                    owned: 1,
                    colors: {
                        planet: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
                        star: '#ffffff',
                        asteroid: ['#ff4500', '#ffd700', '#32cd32', '#00bfff', '#8a2be2', '#ff1493'],
                        blackhole: '#000000',
                        background: '#000000'
                    },
                    universeEffect: true,
                    reality: true
                }
            },

            // ========== BOOSTER & UPGRADES ==========
            boosters: {
                coinmultiplier: {
                    name: "💰 Münz-Multiplikator x2",
                    description: "Verdopple alle Münz-Belohnungen für 30 Minuten",
                    price: 200,
                    rarity: "uncommon",
                    type: "booster",
                    duration: 30 * 60 * 1000, // 30 Minuten
                    effect: "2x coins"
                },
                speedboost: {
                    name: "⚡ Turbo-Modus",
                    description: "Alle Simulationen laufen 2x schneller für 15 Minuten",
                    price: 150,
                    rarity: "common",
                    type: "booster",
                    duration: 15 * 60 * 1000,
                    effect: "2x speed"
                },
                gravitycontrol: {
                    name: "🌌 Gravitations-Kontrolle",
                    description: "Freie Gravitationseinstellung für 1 Stunde",
                    price: 300,
                    rarity: "rare",
                    type: "booster",
                    duration: 60 * 60 * 1000,
                    effect: "gravity control"
                },
                bigbangbonus: {
                    name: "💥 Big Bang Bonus",
                    description: "Nächster Big Bang gibt 5x Münzen",
                    price: 400,
                    rarity: "epic",
                    type: "booster",
                    uses: 1,
                    effect: "5x bigbang"
                },
                autoplanet: {
                    name: "🪐 Auto-Planet-Generator",
                    description: "Erstellt automatisch alle 10 Sekunden einen neuen Planeten für 10 Minuten",
                    price: 250,
                    rarity: "rare",
                    type: "booster",
                    duration: 10 * 60 * 1000,
                    effect: "auto planets"
                },
                megablackhole: {
                    name: "🕳️ Mega-Schwarzes-Loch",
                    description: "Erstelle ein super-massives schwarzes Loch",
                    price: 500,
                    rarity: "legendary",
                    type: "booster",
                    uses: 1,
                    effect: "mega blackhole"
                }
            }
        };
    }

    setupEventListeners() {
        // Skin Shop öffnen
        document.getElementById('skinShop').addEventListener('click', () => {
            this.openSkinShop();
        });

        // Modal schließen
        document.querySelector('.close').addEventListener('click', () => {
            this.closeSkinShop();
        });

        // Kategorien wechseln
        document.querySelectorAll('.skin-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Münzen verdienen
        document.getElementById('watchAd').addEventListener('click', () => {
            this.watchAd();
        });

        document.getElementById('dailyBonus').addEventListener('click', () => {
            this.claimDailyBonus();
        });

        // Außerhalb des Modals klicken = schließen
        document.getElementById('skinShopModal').addEventListener('click', (e) => {
            if (e.target.id === 'skinShopModal') {
                this.closeSkinShop();
            }
        });

        // Benachrichtigungen ein/ausschalten
        document.getElementById('toggleNotifications').addEventListener('click', () => {
            this.toggleNotifications();
        });
    }

    openSkinShop() {
        document.getElementById('skinShopModal').style.display = 'block';
        this.renderSkins('themes');
    }

    closeSkinShop() {
        document.getElementById('skinShopModal').style.display = 'none';
    }

    switchCategory(category) {
        // Kategorie-Buttons aktualisieren
        document.querySelectorAll('.skin-category').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.renderSkins(category);
    }

    renderSkins(category) {
        const grid = document.getElementById('skinGrid');
        grid.innerHTML = '';
        
        const skins = this.skins[category];
        
        Object.keys(skins).forEach(skinId => {
            const skin = skins[skinId];
            const isOwned = this.ownedSkins.includes(skinId);
            const isEquipped = this.currentSkin === skinId;
            
            const skinElement = document.createElement('div');
            skinElement.className = `skin-item rarity-${skin.rarity}`;
            if (isOwned) skinElement.classList.add('owned');
            if (isEquipped) skinElement.classList.add('equipped');
            
            let buttonHTML = '';
            
            // Spezielle Behandlung für Booster
            if (category === 'boosters') {
                if (skin.uses && skin.uses > 0) {
                    buttonHTML = `<button class="skin-button buy" onclick="skinSystem.buyBooster('${skinId}')">Verwenden</button>`;
                } else if (skin.duration) {
                    buttonHTML = `<button class="skin-button buy" onclick="skinSystem.buyBooster('${skinId}')">Aktivieren</button>`;
                }
            } else {
                if (isEquipped) {
                    buttonHTML = '<button class="skin-button equipped">✓ Ausgerüstet</button>';
                } else if (isOwned) {
                    buttonHTML = `<button class="skin-button equip" onclick="skinSystem.equipSkin('${skinId}')">Ausrüsten</button>`;
                } else {
                    buttonHTML = `<button class="skin-button buy" onclick="skinSystem.buySkin('${skinId}', '${category}')">Kaufen</button>`;
                }
            }

            let limitedInfo = '';
            if (skin.limited) {
                limitedInfo = `<div style="color: #ff6b6b; font-size: 0.8em; margin-bottom: 10px;">
                    Limitiert: ${skin.owned}/${skin.limited} verkauft
                </div>`;
            }

            // Spezielle Info für Booster
            let boosterInfo = '';
            if (category === 'boosters') {
                if (skin.duration) {
                    const minutes = Math.floor(skin.duration / 60000);
                    boosterInfo = `<div style="color: #00bfff; font-size: 0.8em; margin-bottom: 10px;">
                        Dauer: ${minutes} Minuten
                    </div>`;
                } else if (skin.uses) {
                    boosterInfo = `<div style="color: #00bfff; font-size: 0.8em; margin-bottom: 10px;">
                        Einmalig verwendbar
                    </div>`;
                }
            }

            skinElement.innerHTML = `
                <div class="skin-preview" style="background: ${this.generatePreview(skin)}"></div>
                <div class="skin-name">${skin.name}</div>
                <div class="skin-description">${skin.description}</div>
                ${limitedInfo}
                ${boosterInfo}
                <div class="skin-price ${skin.price === 0 ? 'coins' : (skin.rarity === 'mythic' ? 'nft' : 'coins')}">
                    ${skin.price === 0 ? 'Kostenlos' : `💰 ${skin.price} Münzen`}
                </div>
                ${buttonHTML}
            `;
            
            grid.appendChild(skinElement);
        });
    }

    generatePreview(skin) {
        if (skin.colors) {
            const colors = skin.colors.planet || ['#4a90e2'];
            return `linear-gradient(45deg, ${colors.slice(0, 3).join(', ')})`;
        }
        return '#333';
    }

    buySkin(skinId, category) {
        const skin = this.skins[category][skinId];
        
        if (this.coins >= skin.price) {
            // Prüfen ob limitiert und noch verfügbar
            if (skin.limited && skin.owned >= skin.limited) {
                alert('😢 Dieser limitierte Skin ist bereits ausverkauft!');
                return;
            }

            this.coins -= skin.price;
            this.ownedSkins.push(skinId);
            
            // Limitierte Anzahl erhöhen
            if (skin.limited) {
                skin.owned++;
            }
            
            this.saveData();
            this.updateUI();
            this.renderSkins(category);
            
            // Coole Kaufanimation
            this.showPurchaseAnimation(skin.name);
        } else {
            alert(`💸 Nicht genügend Münzen! Du brauchst ${skin.price - this.coins} mehr Münzen.`);
        }
    }

    equipSkin(skinId) {
        this.currentSkin = skinId;
        this.saveData();
        this.updateUI();
        this.applySkinToSimulation();
        
        // Ausrüstungs-Animation
        this.showEquipAnimation();
        
        // Modal schließen und neu rendern
        const currentCategory = document.querySelector('.skin-category.active').dataset.category;
        this.renderSkins(currentCategory);
    }

    applySkinToSimulation() {
        // Aktuellen Skin auf die Simulation anwenden
        const skinData = this.getCurrentSkinData();
        if (skinData && this.simulation) {
            this.simulation.activeSkin = skinData;
            // Alle bestehenden Objekte aktualisieren
            this.simulation.physicsEngine.objects.forEach(obj => {
                this.updateObjectAppearance(obj, skinData);
            });
        }
    }

    getCurrentSkinData() {
        // Durch alle Kategorien suchen
        for (let category in this.skins) {
            if (this.skins[category][this.currentSkin]) {
                return this.skins[category][this.currentSkin];
            }
        }
        return this.skins.themes.standard;
    }

    updateObjectAppearance(obj, skinData) {
        if (!skinData.colors) return;
        
        switch (obj.type) {
            case 'planet':
                const planetColors = skinData.colors.planet;
                obj.color = planetColors[Math.floor(Math.random() * planetColors.length)];
                break;
            case 'star':
                obj.color = skinData.colors.star;
                break;
            case 'asteroid':
                const asteroidColors = skinData.colors.asteroid;
                obj.color = asteroidColors[Math.floor(Math.random() * asteroidColors.length)];
                break;
            case 'blackhole':
                obj.color = skinData.colors.blackhole;
                break;
        }
    }

    watchAd() {
        // Simuliere Werbung schauen
        const messages = [
            "🎬 Werbung für Cosmic Cola abgespielt...",
            "📺 Galaktische Burger Werbung geschaut...",
            "🛍️ Interstellare Shopping-Mall Anzeige...",
            "🚀 Raumschiff-Versicherung Werbung..."
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        alert(message + "\n\n💰 +50 Münzen erhalten!");
        
        this.addCoins(50);
    }

    claimDailyBonus() {
        const today = new Date().toDateString();
        const lastBonus = new Date(parseInt(this.lastDailyBonus) || 0).toDateString();
        
        if (today !== lastBonus) {
            const bonus = 75 + Math.floor(Math.random() * 50); // 75-125 Münzen
            this.addCoins(bonus);
            this.lastDailyBonus = Date.now().toString();
            this.saveData();
            
            alert(`🎁 Täglicher Bonus erhalten!\n💰 +${bonus} Kosmische Münzen!`);
        } else {
            alert('⏰ Du hast heute bereits deinen täglichen Bonus abgeholt!\nKomm morgen wieder zurück!');
        }
    }

    addCoins(amount) {
        this.coins += amount;
        this.saveData();
        this.updateUI();
        
        // Münz-Animation
        const coinDisplay = document.getElementById('coinCount');
        coinDisplay.classList.add('coin-earn');
        setTimeout(() => {
            coinDisplay.classList.remove('coin-earn');
        }, 500);
    }

    showPurchaseAnimation(skinName) {
        // Erstelle temporäres Element für Animation
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: purchaseAnimation 2s ease-out forwards;
        `;
        
        notification.innerHTML = `✨ ${skinName} gekauft! ✨`;
        document.body.appendChild(notification);
        
        // CSS für Animation hinzufügen
        const style = document.createElement('style');
        style.textContent = `
            @keyframes purchaseAnimation {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1) translateY(-50px); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }, 2000);
    }

    showEquipAnimation() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.5s ease-out;
        `;
        message.innerHTML = '⚡ Skin ausgerüstet!';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOut 0.5s ease-in forwards';
            setTimeout(() => document.body.removeChild(message), 500);
        }, 2000);
    }



    saveData() {
        localStorage.setItem('cosmicCoins', this.coins.toString());
        localStorage.setItem('ownedSkins', JSON.stringify(this.ownedSkins));
        localStorage.setItem('currentSkin', this.currentSkin);
        localStorage.setItem('lastDailyBonus', this.lastDailyBonus);
    }

    // Methode für die Simulation, um Münzen zu verdienen
    earnCoinsFromGameplay(reason) {
        const earnings = {
            collision: 5,
            blackhole: 10,
            bigbang: 25,
            rare_event: 15
        };
        
        let amount = earnings[reason] || 1;
        amount = Math.floor(amount * this.coinMultiplier); // Booster-Multiplikator anwenden
        
        this.addCoins(amount);
        
        // Münzen zur Warteschlange hinzufügen statt sofortige Benachrichtigung
        this.queueCoinNotification(reason, amount);
    }

    // Intelligente Münz-Benachrichtigungen
    queueCoinNotification(reason, amount) {
        if (!this.notificationsEnabled) return;
        
        this.coinQueue.push({ reason, amount, timestamp: Date.now() });
        
        if (!this.isProcessingCoins) {
            this.processCoinQueue();
        }
    }

    processCoinQueue() {
        this.isProcessingCoins = true;
        
        setTimeout(() => {
            if (this.coinQueue.length === 0) {
                this.isProcessingCoins = false;
                return;
            }
            
            // Gruppiere ähnliche Ereignisse der letzten 2 Sekunden
            const now = Date.now();
            const recentCoins = this.coinQueue.filter(coin => now - coin.timestamp < 2000);
            const groupedCoins = {};
            let totalAmount = 0;
            
            recentCoins.forEach(coin => {
                if (!groupedCoins[coin.reason]) {
                    groupedCoins[coin.reason] = { count: 0, amount: 0 };
                }
                groupedCoins[coin.reason].count++;
                groupedCoins[coin.reason].amount += coin.amount;
                totalAmount += coin.amount;
            });
            
            // Zeige gruppierte Benachrichtigung
            this.showGroupedCoinNotification(groupedCoins, totalAmount);
            
            // Entferne verarbeitete Münzen aus der Warteschlange
            this.coinQueue = this.coinQueue.filter(coin => now - coin.timestamp >= 2000);
            
            // Verarbeite weiter nach kurzer Pause
            setTimeout(() => this.processCoinQueue(), 1000);
        }, 500);
    }

    showGroupedCoinNotification(groupedCoins, totalAmount) {
        const reasons = Object.keys(groupedCoins);
        if (reasons.length === 0) return;
        
        const messages = {
            collision: '💥 Kollisionen',
            blackhole: '🕳️ Schwarze Löcher',
            bigbang: '💥 Big Bang',
            rare_event: '⭐ Seltene Ereignisse'
        };
        
        let notificationText = '';
        if (reasons.length === 1) {
            const reason = reasons[0];
            const data = groupedCoins[reason];
            if (data.count > 1) {
                notificationText = `${messages[reason]}: ${data.count}x = +${data.amount} Münzen`;
            } else {
                notificationText = `${messages[reason]}: +${data.amount} Münzen`;
            }
        } else {
            notificationText = `💰 Mehrere Ereignisse: +${totalAmount} Münzen`;
        }
        
        this.showSmartNotification(notificationText);
    }

    showSmartNotification(text) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 237, 78, 0.95));
            color: #1a1a2e;
            padding: 12px 18px;
            border-radius: 12px;
            font-weight: bold;
            z-index: 1000;
            animation: smartCoinNotification 4s ease-out forwards;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
            border: 2px solid rgba(255, 215, 0, 0.6);
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        notification.innerHTML = text;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 4000);
    }

    toggleNotifications() {
        this.notificationsEnabled = !this.notificationsEnabled;
        localStorage.setItem('coinNotifications', this.notificationsEnabled.toString());
        
        const button = document.getElementById('toggleNotifications');
        button.textContent = this.notificationsEnabled ? '🔔' : '🔕';
        button.title = this.notificationsEnabled ? 
            'Münz-Benachrichtigungen ausschalten' : 'Münz-Benachrichtigungen einschalten';
        
        // Kurze Bestätigung
        const message = this.notificationsEnabled ? 
            '🔔 Münz-Benachrichtigungen aktiviert' : '🔕 Münz-Benachrichtigungen deaktiviert';
        this.showSmartNotification(message);
    }

    buyBooster(boosterId) {
        const booster = this.skins.boosters[boosterId];
        
        if (this.coins >= booster.price) {
            this.coins -= booster.price;
            
            // Booster aktivieren
            this.activateBooster(booster, boosterId);
            
            this.saveData();
            this.updateUI();
            
            this.showPurchaseAnimation(`${booster.name} aktiviert!`);
        } else {
            alert(`💸 Nicht genügend Münzen! Du brauchst ${booster.price - this.coins} mehr Münzen.`);
        }
    }

    activateBooster(booster, boosterId) {
        const activeBooster = {
            id: boosterId,
            effect: booster.effect,
            startTime: Date.now(),
            duration: booster.duration || 0,
            uses: booster.uses || 0
        };
        
        this.activeBoosters.push(activeBooster);
        
        // Sofortige Effekte anwenden
        switch (booster.effect) {
            case '2x coins':
                this.coinMultiplier = 2;
                break;
            case '2x speed':
                if (this.simulation) {
                    this.simulation.physicsEngine.timeScale = 2;
                }
                break;
            case 'mega blackhole':
                this.createMegaBlackhole();
                break;
        }
        
        localStorage.setItem('activeBoosters', JSON.stringify(this.activeBoosters));
    }

    createMegaBlackhole() {
        if (!this.simulation) return;
        
        const canvas = this.simulation.canvas;
        const megaBlackhole = new SpaceObject(
            canvas.width / 2,
            canvas.height / 2,
            80, // Riesiger Radius
            50000, // Extreme Masse
            '#000000',
            'blackhole'
        );
        
        this.simulation.physicsEngine.addObject(megaBlackhole);
        this.showSmartNotification('🕳️ MEGA-SCHWARZES-LOCH erschaffen!');
    }

    updateUI() {
        document.getElementById('coinCount').textContent = this.coins;
        document.getElementById('currentSkinName').textContent = 
            this.getCurrentSkinData()?.name || 'Standard';
        
        // Benachrichtigungs-Toggle-Button aktualisieren
        const toggleButton = document.getElementById('toggleNotifications');
        if (toggleButton) {
            toggleButton.textContent = this.notificationsEnabled ? '🔔' : '🔕';
            toggleButton.title = this.notificationsEnabled ? 
                'Münz-Benachrichtigungen ausschalten' : 'Münz-Benachrichtigungen einschalten';
        }
    }
}

// Globale Variable für das Skin-System
let skinSystem; 