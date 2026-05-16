# 🌿 PlantLens: Ayurvedic Herb Identification

PlantLens is a comprehensive platform designed to identify plants and herbs instantly, with a special focus on **Ayurvedic medicinal properties**, local Indian names, and general plant care. 

This project consists of two seamlessly integrated clients:
1. **📱 PlantLens Mobile** — A React Native (Expo) mobile application.
2. **🌐 PlantLens Web** — A Python Flask web application.

---

## ✨ Features

### Mobile App (React Native / Expo)
- **Point & Snap**: Use your device's camera to identify plants on the go.
- **Gallery Upload**: Select images from your camera roll.
- **Plant Insights**: View common names, scientific names, and identification confidence scores.
- **Care Instructions**: Get watering and sunlight requirements, and toxicity warnings.
- **Local Scan History**: Save your scans locally on your device for offline viewing.

### Web App (Python / Flask)
- **Drag & Drop**: Easily upload plant images via a clean web interface.
- **Webcam Support**: Capture images directly from your browser.
- **Ayurvedic Focus**: Identifies plants and displays curated Ayurvedic benefits, dosha effects, and traditional uses.
- **Local Names**: Fetches local and regional names (Hindi, Tamil, Telugu, etc.) via Wikidata.
- **Session History**: Keeps track of your recent scans during your browsing session.

---

## 🛠️ Technology Stack

| Feature | Mobile App | Web App |
| :--- | :--- | :--- |
| **Framework** | Expo Go (React Native) | Flask (Python 3.11+) |
| **Styling/UI** | React Native Paper (Material Design 3) | TailwindCSS + Vanilla JS |
| **Identification API** | PlantNet API | PlantNet API |
| **Care/Toxicity API**| Perenual API | Perenual API |
| **Details/Names API**| - | Wikipedia API (SPARQL) |
| **Storage** | AsyncStorage (Local) | Flask Session (Server-side) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for the mobile app)
- [Python 3.11+](https://www.python.org/) (for the web app)
- [Expo Go App](https://expo.dev/client) installed on your iOS/Android device
- API Keys:
  - [PlantNet API Key](https://my.plantnet.org/) (Free)
  - [Perenual API Key](https://perenual.com/) (Free)

---

### 1. Setting up the Mobile App

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure API Keys:**
   Update `services/plantnetService.ts` and `services/perenualService.ts` with your respective API keys.
4. **Start the Expo server:**
   ```bash
   npx expo start
   ```
5. **Run the app:**
   Scan the QR code shown in the terminal with your phone's camera (iOS) or the Expo Go app (Android).

---

### 2. Setting up the Web App

1. **Navigate to the web directory:**
   ```bash
   cd web
   ```
2. **Create a virtual environment and activate it:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables:**
   Create a `.env` file in the `web` directory and add your API keys:
   ```ini
   PLANTNET_API_KEY=your_plantnet_api_key
   PERENUAL_API_KEY=your_perenual_api_key
   SECRET_KEY=your_random_secret_key
   ```
5. **Run the Flask application:**
   ```bash
   python app.py
   ```
6. **Open in browser:**
   Visit `http://localhost:5000` to access the web app.

---

## 📚 Data Sources

- **PlantNet API**: Primary engine for botanical identification from images.
- **Wikipedia / Wikidata API**: Used in the web app to fetch rich descriptions and regional translations of plant names.
- **Perenual API**: Provides plant toxicity data.
- **Curated Ayurveda Database**: A custom local dataset (`web/data/ayurveda_plants.json`) mapping scientific names to traditional Ayurvedic medicinal uses.

---

## 📄 License
[MIT License](LICENSE)