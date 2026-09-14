# 🫀 CardioTwin AI — Precision Cardiovascular Risk Prediction & Digital Twin Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0+-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000.svg?logo=express)](https://expressjs.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-3.5_Flash_&_3.1_Live-8E75B2.svg?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CardioTwin AI** is a clinical-grade cardiology decision-support and patient empowerment platform. It unifies explainable machine learning models (XGBoost classifiers, SHAP game-theoretic feature attributions, and K-Means cohort clustering), interactive myocardial anatomy digital twins, multidimensional cardiovascular disease comorbidity risk maps, and multimodal conversational AI (powered by Google Gemini 3.5 and low-latency Gemini 3.1 Live Audio WebSockets).

---

## 🌟 Executive Overview

CardioTwin AI bridges the gap between raw clinical biomarkers and actionable cardiovascular health insights for two distinct stakeholder personas:

1. **Everyday Citizens & Patients (Citizen Mode)**: Jargon-free, intuitive heart health evaluations, interactive risk gauges, lifestyle what-if simulations, and multilingual localization in **English**, **ಕನ್ನಡ (Kannada)**, and **हिन्दी (Hindi)**.
2. **Cardiologists & Specialists (Doctor Mode)**: Comprehensive clinical analytics, anomaly detection (Isolation Forest), multi-disease prognosis timelines, game-theoretic SHAP force plots, survival curve estimates, dynamic cohort clustering, and professional EHR/PDF clinical report generation.

---

## 🚀 Core Features & Architectural Capabilities

### 1. 🫀 Explainable Machine Learning & Risk Quantification
* **Multi-Disease Risk Classifier**: Evaluates aggregate 10-year CVD, Coronary Artery Disease (CAD), Stroke, Heart Failure (HF), and Arrhythmia probabilities based on physiological biomarkers (blood pressure, lipid profile, HbA1c, resting heart rate, BMI, ECG patterns, and lifestyle factors).
* **Game-Theoretic SHAP Attributions**: Computes local and global Shapley values to pinpoint the exact contribution of each clinical metric to the patient's risk trajectory.
* **Interactive "What-If" Counterfactual Engine**: Empowers clinicians and patients to simulate lifestyle or therapeutic interventions (e.g., reducing systolic BP by 15 mmHg, smoking cessation, or statin therapy) and witness simulated risk reductions in real time.
* **Phenotype Cohort Spatial Clustering**: Utilizes multidimensional Euclidean distance modeling to benchmark patient phenotypes against calibrated reference cohorts (e.g., *Healthy Active Athlete*, *Metabolic Syndrome*, *Severe Hypertensive*).

### 2. 🩺 Interactive 3D/Vector Myocardial Digital Twin
* **Anatomical SVG Engine**: A morphing vector heart model reflecting physiological pathologies (left ventricular hypertrophy, coronary atheroma plaque deposition, arrhythmias, and aortic dilation).
* **Diagnostic Anatomical Hotspots**: Interactive inspection points positioned across key cardiac regions (Aortic Arch, Left/Right Ventricles, Left/Right Atria, Coronary Arteries) that deliver localized anatomical context and clinical implications on hover.

### 3. 🌐 Graph-Based Cardiovascular Comorbidity Risk Map
* **Multi-Condition Network Graph**: Renders interconnected cardiovascular and metabolic diseases (Hypertension, CAD, Stroke, Type 2 Diabetes, CKD, Atrial Fibrillation, Peripheral Artery Disease).
* **Dynamic Node Sizing & Edge Weighting**: Highlights cross-organ disease progression vectors and relative transmission risks customized to the patient's clinical profile.

### 4. 📚 Comprehensive Cardiovascular Disease Library
* **Clinical Knowledge Base**: In-depth medical reference manuals for major cardiovascular pathologies covering pathophysiology, diagnostic criteria, clinical presentation, and evidence-based therapeutic guidelines (AHA/ACC and ESC aligned).

### 5. 🤖 Multimodal AI Clinical Consult (Gemini Suite)
* **Intelligent Clinical Dialogue**: Multi-turn clinical cardiology chat powered by Google's `gemini-2.5-flash` model with dedicated medical advisor system instructions.
* **Google Search Grounding**: Real-time retrieval of contemporary peer-reviewed clinical guidelines, trials, and epidemiological consensus with direct source citations.
* **Voice-to-Text Clinical Dictation**: Seamless audio recording and transcription of medical inquiries.
* **Real-time Gemini Live Voice API**: Low-latency bidirectional audio streaming via WebSockets (`gemini-2.5-flash` Live API at 16kHz PCM input / 24kHz PCM output) for conversational clinical discussions.

### 6. 📄 Clinical EHR Export & Multi-Run Benchmarking
* **Formal Medical Report Generator**: Formats comprehensive diagnostic findings into print-ready clinical summaries with risk matrices, biomarker alerts, and management suggestions.
* **Multi-Run Session History Dock**: Allows specialists to store, compare, and toggle between iterative diagnostic runs across different intervention scenarios.

---

## 🛠️ Technology Stack & System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CardioTwin AI Architecture                      │
└────────────────────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│     Client-Side UI (React 18)   │         │     Backend Server (Node.js)    │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ • Vite + TypeScript             │         │ • Express 4.x REST API          │
│ • Tailwind CSS 4.0              │◄───────►│ • WebSocket (`ws`) Audio Bridge │
│ • Framer Motion (`motion`)      │ HTTP/WS │ • @google/genai SDK Integration │
│ • Lucide React Iconography      │         │ • Secure Environment Key Proxy  │
│ • Recharts / D3.js Visualizers  │         │ • Bundled with esbuild (CJS)    │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

| Layer | Technologies / Libraries |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Design** | Tailwind CSS 4.0, Plus Jakarta Sans, Outfit, JetBrains Mono |
| **Animation & Motion** | `motion/react` |
| **Iconography** | Lucide React |
| **Backend & Ingress** | Express 4.x, Node.js, `ws` (WebSockets) |
| **AI / Large Language Models** | Google GenAI SDK (`@google/genai`), Gemini 2.5 Flash, Gemini Live API |
| **Build & Bundler** | Vite (Client SPA), `esbuild` (Server CJS Bundle), `tsx` (Dev Execution) |

---

## 📂 Project Directory Structure

```
├── server.ts                       # Express backend, REST endpoints & Gemini Live WebSocket gateway
├── package.json                    # Project dependencies, build scripts, and metadata
├── vite.config.ts                  # Vite build and development configuration
├── tsconfig.json                   # TypeScript compiler configuration
├── index.html                      # HTML entrypoint with preconnected typography
├── metadata.json                   # AI Studio platform configuration
├── .env.example                    # Template for required environment variables
├── src/
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Top-level workspace coordinator, routing & session state
│   ├── index.css                   # Global styles & Tailwind layers
│   ├── types.ts                    # Global TypeScript interfaces for patient records & model schemas
│   ├── i18n.ts                     # Multilingual localization dictionaries (EN, KN, HI)
│   ├── data/
│   │   ├── cvdLibraryData.ts       # Cardiology disease monographs & guideline repository
│   │   └── defaultPatients.ts      # Calibrated clinical archetype sample presets
│   └── components/
│       ├── LandingView.tsx                 # Hero showcase, value propositions & phenotype launchers
│       ├── CommonManView.tsx               # Citizen mode health check, simple gauges & advice
│       ├── DashboardView.tsx               # Clinical specialist analytics, SHAP & risk gauges
│       ├── PatientForm.tsx                 # Comprehensive clinical input form with anomaly validator
│       ├── AIClinicChatView.tsx            # Multi-turn Gemini AI chat with Search Grounding & Live API
│       ├── CardiovascularRiskMapView.tsx   # Interactive comorbidity disease graph visualizer
│       ├── CvdLibraryView.tsx              # Medical disease library and clinical encyclopedia
│       ├── HeartAnatomyVisualizer.tsx      # Morphing vector heart SVG with interactive hotspots
│       ├── ArchitectureView.tsx            # System pipeline & mathematical model architecture
│       ├── ClinicalReportExport.tsx        # Printable EHR clinical document exporter
│       ├── SurvivalTimeline.tsx            # Longitudinal Kaplan-Meier style survival forecast
│       └── PanelManagement.tsx             # Multi-run session comparison panel
```

---

## ⚡ Getting Started

### Prerequisites
* **Node.js**: Version 18.0.0 or later
* **npm**: Version 9.0.0 or later
* **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cardiotwin-ai.git
   cd cardiotwin-ai
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```
   To run the production build:
   ```bash
   npm run start
   ```

---

## 🔒 Security & Privacy Practices

* **Zero Client-Side API Key Exposure**: All calls to the Gemini API and external endpoints are proxied through the server-side Express backend. No secret credentials are sent to the client browser.
* **Transient In-Memory Processing**: Patient biomarkers and clinical simulations are processed locally in state memory during the session without unconsented database storage.
* **Clinical Disclaimer**: CardioTwin AI is an investigational decision-support software designed for educational, research, and advisory exploration. It does not replace professional medical judgment, in-person clinical diagnosis, or emergency healthcare services.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
