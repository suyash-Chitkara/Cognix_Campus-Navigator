# 🧭 Cognix v2.0 — Advanced Campus Digital Twin
## Project Title
Cognix: Smart Campus Navigator

## 👥 Team Details
### 👑 Team Leader
* **Somya Bhatt** (2210990861)
### 💡 Project Leads
* **Suyash Sharma** (2210991000)
* **Kundan Tamsoy** (2210991827)
* **Abu Ezaan Anjum** (2210991174)
### 🛠️ Team Members
* **Somya Bhatt** (2210990861)
* **Suyash Sharma** (2210991000)
* **Kundan Tamsoy** (2210991827)
* **Abu Ezaan Anjum** (2210991174)

**Project Type:** Copyrighte 

**🌍 Live Demo: [https://cognix-campus-navigatorupdate.vercel.app/](https://cognix-campus-navigatorupdate.vercel.app/)**

Cognix is an AI-powered, real-time Smart Campus Navigation System tailored for Chitkara University. It transforms the standard campus map into a fully interactive **Digital Twin**, featuring Dijkstra-powered intelligent routing, an NLP-based chatbot assistant, live GPS tracking, and real-time atmospheric & traffic simulations.

## ✨ Key Features

- 🗺️ **Interactive Campus Map**: Built with Leaflet, featuring responsive 2D mapping and an immersive 3D "Drone View" perspective.
- 🤖 **AI Chatbot Assistant**: Custom NLP engine to understand complex spatial queries (e.g., *"How do I walk from the Library to Turing Block?"* or *"Where is the nearest cafeteria?"*).
- 🎙️ **Voice Recognition (Mic)**: Hands-free interactions using the Web Speech API to talk directly to the chatbot.
- 🛣️ **Smart Navigation**: Custom Dijkstra algorithm implementation providing the shortest walking paths, distance in meters, and precise estimated arrival times.
- 📍 **Live GPS Tracking**: Real-time user location tracking with campus boundary detection, accuracy radius, and auto-re-centering.
- 🔥 **Heatmap & Traffic Simulation**: Visualizations for crowd density and simulated foot traffic bottlenecks around campus hotspots.
- 🌦️ **Atmospheric Engine**: Dynamic UI themes that synchronize with the real-world time of day.
- 🚨 **Emergency SOS**: Quick access to campus security, medical emergencies, and anti-ragging helplines.

## 🛠️ Technology Stack

**Frontend:**
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS v3 (Custom Design System, Glassmorphism UI)
- **Mapping**: React-Leaflet, Leaflet.js, Leaflet.heat
- **Icons**: Lucide React

**Backend:**
- **Framework**: Node.js & Express.js
- **Algorithms**: Custom intent parsing (Levenshtein distance) and graph-based routing algorithms.
- **Architecture**: Serverless-ready for scalable deployments.

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if not already cloned)
   ```bash
   git clone <your-repo-url>
   cd cognix
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Project

Start both the client and server locally.

**Start the Backend API (Port 5000):**
```bash
cd server
npm run dev
```

**Start the Frontend Client (Port 3000):**
```bash
cd client
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to explore the Digital Twin.

## 🌐 Deployment (Vercel)

This monorepo is fully optimized for one-click deployment on Vercel using serverless functions.

1. Push your code to GitHub and import the repository into Vercel.
2. **Crucial Settings**: Ensure the **Root Directory** is left empty (`./`). Do *not* set it to `client`.
3. Vercel will automatically read the `vercel.json` file in the root directory. This handles:
   - Building the React app (`client/dist`).
   - Wrapping the Express backend routes into Serverless Functions (`api/`).
   - Bundling the necessary JSON graph data.
4. Click **Deploy**. Your frontend and API will automatically be hosted together on a single URL!

## 📂 Project Structure

```text
cognix/
├── api/                  # Vercel Serverless Function entry points
├── client/               # React Vite Frontend App
│   ├── public/           # Static assets, PWA manifest, service workers
│   └── src/              # React components, custom hooks, global styles
├── server/               # Express API Backend
│   ├── data/             # JSON databases (campus graph, building metadata)
│   ├── routes/           # Express API endpoints
│   └── services/         # Core business logic (NLP engine, Dijkstra routing)
└── vercel.json           # Vercel deployment configuration & API rewrites
```

```


# 🧭 Cognix v2.0 — Advanced Campus Digital Twin

**🌍 Live Demo: [https://cognix-campus-navigatorupdate.vercel.app/](https://cognix-campus-navigatorupdate.vercel.app/)**

Cognix is an AI-powered, real-time Smart Campus Navigation System tailored for Chitkara University. It transforms the standard campus map into a fully interactive **Digital Twin**, featuring Dijkstra-powered intelligent routing, an NLP-based chatbot assistant, live GPS tracking, and real-time atmospheric & traffic simulations.

## ✨ Key Features

- 🗺️ **Interactive Campus Map**: Built with Leaflet, featuring responsive 2D mapping and an immersive 3D "Drone View" perspective.
- 🤖 **AI Chatbot Assistant**: Custom NLP engine to understand complex spatial queries (e.g., *"How do I walk from the Library to Turing Block?"* or *"Where is the nearest cafeteria?"*).
- 🎙️ **Voice Recognition (Mic)**: Hands-free interactions using the Web Speech API to talk directly to the chatbot.
- 🛣️ **Smart Navigation**: Custom Dijkstra algorithm implementation providing the shortest walking paths, distance in meters, and precise estimated arrival times.
- 📍 **Live GPS Tracking**: Real-time user location tracking with campus boundary detection, accuracy radius, and auto-re-centering.
- 🔥 **Heatmap & Traffic Simulation**: Visualizations for crowd density and simulated foot traffic bottlenecks around campus hotspots.
- 🌦️ **Atmospheric Engine**: Dynamic UI themes that synchronize with the real-world time of day.
- 🚨 **Emergency SOS**: Quick access to campus security, medical emergencies, and anti-ragging helplines.

## 🛠️ Technology Stack

**Frontend:**
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS v3 (Custom Design System, Glassmorphism UI)
- **Mapping**: React-Leaflet, Leaflet.js, Leaflet.heat
- **Icons**: Lucide React

**Backend:**
- **Framework**: Node.js & Express.js
- **Algorithms**: Custom intent parsing (Levenshtein distance) and graph-based routing algorithms.
- **Architecture**: Serverless-ready for scalable deployments.

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if not already cloned)
   ```bash
   git clone <your-repo-url>
   cd cognix
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Project

Start both the client and server locally.

**Start the Backend API (Port 5000):**
```bash
cd server
npm run dev
```

**Start the Frontend Client (Port 3000):**
```bash
cd client
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to explore the Digital Twin.

## 🌐 Deployment (Vercel)

This monorepo is fully optimized for one-click deployment on Vercel using serverless functions.

1. Push your code to GitHub and import the repository into Vercel.
2. **Crucial Settings**: Ensure the **Root Directory** is left empty (`./`). Do *not* set it to `client`.
3. Vercel will automatically read the `vercel.json` file in the root directory. This handles:
   - Building the React app (`client/dist`).
   - Wrapping the Express backend routes into Serverless Functions (`api/`).
   - Bundling the necessary JSON graph data.
4. Click **Deploy**. Your frontend and API will automatically be hosted together on a single URL!

## 📂 Project Structure

```text
cognix/
├── api/                  # Vercel Serverless Function entry points
├── client/               # React Vite Frontend App
│   ├── public/           # Static assets, PWA manifest, service workers
│   └── src/              # React components, custom hooks, global styles
├── server/               # Express API Backend
│   ├── data/             # JSON databases (campus graph, building metadata)
│   ├── routes/           # Express API endpoints
│   └── services/         # Core business logic (NLP engine, Dijkstra routing)
└── vercel.json           # Vercel deployment configuration & API rewrites
```
