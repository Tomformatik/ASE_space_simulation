# 🚀 Weltraum-Simulation

Eine interaktive JavaScript-basierte Weltraum-Simulation mit realistischer Physik, die Planeten, Asteroiden, Sterne und schwarze Löcher in einem dynamischen Universum simuliert.

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Installation](#-installation)
- [Bedienung](#-bedienung)
- [Technologie](#-technologie)
- [Physik-Engine](#-physik-engine)
- [Skin-System](#-skin-system)
- [Gameplay-Features](#-gameplay-features)
- [Dateistruktur](#-dateistruktur)
- [Browser-Kompatibilität](#-browser-kompatibilität)
- [Entwicklung](#-entwicklung)

## ✨ Features

### 🌌 Physik-Simulation
- **Realistische Gravitation**: Newtonsche Gravitationsgesetze zwischen allen Objekten
- **Kollisionserkennung**: Objekte können miteinander kollidieren und fusionieren
- **Dynamische Orbits**: Planeten können stabile Umlaufbahnen um Sterne bilden
- **Schwarze Löcher**: Extreme Gravitation, die andere Objekte verschluckt

### 🎮 Interaktive Steuerung
- **Maus-Steuerung**: Ziehen Sie mit der Maus, um Objekte mit Richtung und Geschwindigkeit zu platzieren
- **Echtzeit-Parameter**: Anpassung von Gravitation und Simulationsgeschwindigkeit
- **Big Bang Modus**: Spektakuläre Kollision zweier schwarzer Löcher
- **Reset-Funktion**: Simulation jederzeit zurücksetzen

### 🎨 Premium Skin-System
- **Kosmische Münzen**: Sammeln Sie Währung durch Gameplay-Ereignisse
- **Themen-Skins**: Verschiedene visuelle Stile für das Universum
- **Premium-Inhalte**: Exklusive Skins und Effekte
- **Limitierte NFT-Skins**: Seltene und einzigartige Designs
- **Booster**: Temporäre Gameplay-Verbesserungen

### 📊 Statistiken & Monitoring
- **Echtzeit-FPS**: Performance-Überwachung
- **Objektzähler**: Anzahl aller Himmelskörper-Typen
- **Ereignis-Tracking**: Kollisionen, verschluckte und verbrannte Objekte
- **System-Status**: Informationen über Big Bang Modus

## 🛠 Installation

1. **Repository klonen oder herunterladen**
   ```bash
   git clone https://github.com/Tomformatik/ASE_space_simulation
   cd ASE_space_simulation
   ```

2. **Webserver starten** (empfohlen für beste Performance)
   ```bash
   # Mit Python 3
   python -m http.server 8000
   
   # Mit Node.js (wenn verfügbar)
   npx serve .
   
   # Mit PHP (falls installiert)
   php -S localhost:8000
   ```

3. **Browser öffnen**
   - Navigieren Sie zu `http://localhost:8000`
   - Oder öffnen Sie `index.html` direkt im Browser

## 🎯 Bedienung

### Objekte hinzufügen
- **Planet hinzufügen**: Klicken Sie auf "Planet hinzufügen" oder ziehen Sie mit der Maus für gerichtete Platzierung
- **Asteroid hinzufügen**: Fügen Sie kleinere Objekte mit geringerer Masse hinzu
- **Schwarzes Loch**: Erstellen Sie massive Objekte mit extremer Anziehungskraft
- **Big Bang**: Startet eine spektakuläre Kollision zweier schwarzer Löcher

### Steuerungsparameter
- **Gravitation**: Stellen Sie die Stärke der Gravitationskraft ein (0.0 - 5.0)
- **Geschwindigkeit**: Kontrollieren Sie die Simulationsgeschwindigkeit (0.1 - 3.0)

### Maus-Interaktion
1. **Einfacher Klick**: Platziert Objekt mit zufälliger Geschwindigkeit
2. **Ziehen**: Mauszeiger gedrückt halten und ziehen für präzise Richtung und Geschwindigkeit
3. **Loslassen**: Objekt wird mit der gewählten Geschwindigkeit erstellt

### Skin-Shop
- **Münzen verdienen**: Durch Gameplay-Ereignisse, Werbung schauen oder tägliche Boni
- **Skins kaufen**: Verschiedene Kategorien von Themes bis Premium-Inhalten
- **Themen wechseln**: Verändert das visuelle Erscheinungsbild des gesamten Universums

## 🔧 Technologie

### Frontend-Technologien
- **HTML5 Canvas**: Hochperformante 2D-Grafik-Rendering
- **Vanilla JavaScript**: Keine Frameworks für maximale Performance
- **CSS3**: Moderne UI mit Animationen und Responsive Design
- **ES6+ Features**: Moderne JavaScript-Syntax und -Features

### Architektur
- **Modulares Design**: Getrennte Dateien für verschiedene Funktionalitäten
- **Objekt-orientierte Programmierung**: Klassen für SpaceObject, PhysicsEngine, etc.
- **Event-driven**: Benutzerinteraktionen und Animations-Loops
- **Canvas-basiertes Rendering**: Direktes Pixel-Manipulation für beste Performance

## 🧮 Physik-Engine

### Implementierte Physik-Gesetze
- **Newtonsche Gravitation**: F = G × (m₁ × m₂) / r²
- **Kollisionserkennung**: Kreis-zu-Kreis-Kollision
- **Impulserhaltung**: Realistische Kollisions-Physik
- **Integrations-Algorithmus**: Euler-Integration für Bewegungsberechnung

### Objekttypen
- **Planeten**: Mittlere Masse, können Monde haben
- **Sterne**: Hohe Masse, zentrale Gravitationsquellen
- **Asteroiden**: Geringe Masse, schnelle Bewegung
- **Schwarze Löcher**: Extreme Masse, verschlingen andere Objekte

## 🎨 Skin-System

### Kategorien
1. **🌌 Themen**: Grundlegende Farbschemata
2. **💫 Effekte**: Visuelle Verbesserungen und Partikel
3. **👑 Premium**: Exklusive, hochwertige Designs
4. **🔮 Limitiert**: Seltene NFT-ähnliche Skins
5. **⚡ Booster**: Temporäre Gameplay-Boni

### Münz-System
- **Kollisionen**: +5 Münzen pro Ereignis
- **Big Bang**: +25 Münzen beim Start
- **Täglicher Bonus**: Regelmäßige Belohnungen
- **Werbung**: +50 Münzen pro Video

## 🎮 Gameplay-Features

### Big Bang Modus
- Zwei massive schwarze Löcher starten in großer Entfernung
- Spiralförmige Annäherung über 10 Sekunden
- Spektakuläre Kollision und Fusionseffekte
- Bonus-Münzen für das Auslösen

### Automatische Ereignisse
- **Kollisionen**: Objekte fusionieren bei Berührung
- **Orbital-Dynamik**: Stabile Umlaufbahnen entstehen natürlich
- **Verschlingung**: Schwarze Löcher ziehen Objekte an
- **Verbrennung**: Objekte können in Sternen verglühen

## 📁 Dateistruktur

```
ASE_space_simulation/
├── index.html          # Haupt-HTML-Datei mit UI
├── simulation.js       # Hauptsimulations-Klasse und Game Loop
├── physics.js          # Physik-Engine und SpaceObject-Klassen
├── effects.js          # Visuelle Effekte und Partikel-Systeme
├── skins.js           # Skin-System und Shop-Logik
├── styles.css         # Styling und Layout
├── .gitignore         # Git-Konfiguration
└── README.md          # Diese Datei
```

### Kern-Klassen
- **SpaceSimulation**: Hauptklasse, koordiniert alle Systeme
- **PhysicsEngine**: Physikalische Berechnungen und Kollisionen
- **SpaceObject**: Individuelle Himmelskörper mit Eigenschaften
- **EffectsManager**: Visuelle Effekte und Partikel
- **SkinSystem**: Shop und Customization-Features

## 🌐 Browser-Kompatibilität

### Unterstützte Browser
- ✅ **Chrome 90+** (Empfohlen)
- ✅ **Firefox 88+**
- ✅ **Safari 14+**
- ✅ **Edge 90+**

### Erforderliche Features
- HTML5 Canvas Support
- ES6 Classes und Arrow Functions
- CSS Grid und Flexbox
- Local Storage (für Skin-Saves)

## 🔬 Entwicklung

### Lokale Entwicklung
1. Dateien in einem lokalen Webserver bereitstellen
2. Browser-Entwicklertools für Debugging nutzen
3. Performance mit Canvas-Profiling überwachen

### Anpassungen
- **Physik-Parameter**: Ändern Sie Konstanten in `physics.js`
- **Visuelle Styles**: Bearbeiten Sie `styles.css` oder Skin-Definitionen
- **Neue Objekttypen**: Erweitern Sie die SpaceObject-Klasse
- **UI-Elemente**: Modifizieren Sie `index.html` und entsprechende JavaScript-Handler

### Performance-Optimierung
- Canvas-Rendering optimiert für 60 FPS
- Effiziente Kollisionserkennung mit räumlicher Partitionierung
- Garbage Collection-freundliche Objekt-Pools
- Adaptive Qualitätseinstellungen basierend auf Performance

---

## 🎉 Viel Spaß beim Erkunden des Universums!

Erstellen Sie Ihr eigenes Sonnensystem, experimentieren Sie mit Gravitationseffekten, oder lösen Sie einen spektakulären Big Bang aus. Die Physik-Simulation bietet endlose Möglichkeiten für kosmische Experimente!

### 🎯 Tipps für Anfänger
1. Beginnen Sie mit einem Stern in der Mitte
2. Fügen Sie Planeten mit unterschiedlichen Abständen hinzu
3. Experimentieren Sie mit der Maus-Richtungssteuerung
4. Beobachten Sie, wie sich natürliche Orbits bilden
5. Sammeln Sie Münzen und probieren Sie verschiedene Skins aus

**Genießen Sie Ihre Reise durch die Unendlichkeit des Weltraums!** 🌌✨ 
