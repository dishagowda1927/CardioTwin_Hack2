import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Activity, Brain, Shield, Sparkles, Sliders, Server, Menu, X, Check, HelpCircle, Laptop, Settings, MessageSquare, User, Stethoscope, Globe, FileCode
} from "lucide-react";
import LandingView from "./components/LandingView";
import PatientForm from "./components/PatientForm";
import DashboardView from "./components/DashboardView";
import ArchitectureView from "./components/ArchitectureView";
import CvdLibraryView from "./components/CvdLibraryView";
import CardiovascularRiskMapView from "./components/CardiovascularRiskMapView";
import CommonManView from "./components/CommonManView";
import EHRProtocolsView from "./components/EHRProtocolsView";
import { PatientData, PredictionResult } from "./types";
import { Language, LANGUAGES, translations } from "./i18n";

type ViewTab = "landing" | "input" | "dashboard" | "architecture" | "stack" | "cvd_library" | "risk_map" | "common_man" | "fhir_ehr";
type UserMode = "clinical" | "common_man";

interface PredictionHistoryItem {
  id: string;
  timestamp: string;
  patientData: PatientData;
  prediction: PredictionResult;
  geminiSummary: string;
}

// Pre-calibrated clinical sample cases
const SAMPLE_CASES = {
  high: {
    age: 54,
    sex: "male" as const,
    height: 172,
    weight: 91,
    systolicBP: 152,
    diastolicBP: 94,
    cholesterol: 258,
    glucose: 118,
    restingHR: 82,
    smoking: true,
    physicalActivity: 0,
    diabetes: false,
    prevHeartDisease: false,
    hypertensionHistory: true,
    familyHistoryScore: 8,
    medicationAdherence: 60
  },
  low: {
    age: 34,
    sex: "female" as const,
    height: 168,
    weight: 56,
    systolicBP: 112,
    diastolicBP: 72,
    cholesterol: 160,
    glucose: 82,
    restingHR: 58,
    smoking: false,
    physicalActivity: 2,
    diabetes: false,
    prevHeartDisease: false,
    hypertensionHistory: false,
    familyHistoryScore: 2,
    medicationAdherence: 95
  },
  diabetes: {
    age: 61,
    sex: "female" as const,
    height: 162,
    weight: 84,
    systolicBP: 144,
    diastolicBP: 88,
    cholesterol: 224,
    glucose: 145,
    restingHR: 76,
    smoking: false,
    physicalActivity: 1,
    diabetes: true,
    prevHeartDisease: true,
    hypertensionHistory: true,
    familyHistoryScore: 6,
    medicationAdherence: 85
  }
};

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language] || translations.en;

  const [userMode, setUserMode] = useState<UserMode>("common_man");
  const [activeTab, setActiveTab] = useState<ViewTab>("landing");
  const [patientData, setPatientData] = useState<PatientData | undefined>(undefined);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [geminiSummary, setGeminiSummary] = useState<string>("");
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // local state history hook
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryItem[]>([]);

  const addToHistory = (pData: PatientData, predResult: PredictionResult, summary: string) => {
    const newItem: PredictionHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      patientData: pData,
      prediction: predResult,
      geminiSummary: summary
    };
    setPredictionHistory(prev => [newItem, ...prev]);
  };

  // Calls backend to predict risk scores, SHAP explanations, cluster similarities, etc.
  const executeAnalysis = async (data: PatientData) => {
    setIsPredicting(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const result: PredictionResult = await response.json();
      setPrediction(result);
      setPatientData(data);
      
      // Navigate to appropriate tab based on current mode
      if (userMode === "common_man") {
        setActiveTab("common_man");
      } else {
        setActiveTab("dashboard");
      }
      
      // Trigger Gemini Summary briefing generation
      await triggerGeminiSummary(result);
    } catch (err: any) {
      console.error("Clinical analysis request failed:", err);
      setErrorMessage("The AI analysis engine experienced a server latency error. Please try again.");
    } finally {
      setIsPredicting(false);
    }
  };

  // Calls server-side Gemini 3.7 flash proxy to create medical technical summaries
  const triggerGeminiSummary = async (resultData: PredictionResult) => {
    setIsGeminiLoading(true);
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientData: resultData.patientData,
          overallRisk: resultData.overallRisk,
          shap: resultData.shap,
          cluster: resultData.cluster,
          dataQuality: resultData.dataQuality
        })
      });
      if (!response.ok) {
        throw new Error("Failed to contact server-side Gemini.");
      }
      const data = await response.json();
      const stringified = JSON.stringify(data);
      setGeminiSummary(stringified);
      addToHistory(resultData.patientData, resultData, stringified);
    } catch (err) {
      console.error("Gemini summary generation failed:", err);
      const fallbackSummary = `⚠️ AI Summary Latency

We were unable to generate a real-time Gemini LLM brief due to server connection constraints. However, your mathematical XGBoost predictions, SHAP explainable factor contribution graphs, K-Means clustering positions, and counterfactual sandbox parameters remain fully functional.

Please review the data-grid below to examine the specific feature weights.`;
      setGeminiSummary(fallbackSummary);
      addToHistory(resultData.patientData, resultData, fallbackSummary);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Loads pre-calibrated patient cases directly from landing view
  const handleLoadSample = async (type: "high" | "low" | "diabetes") => {
    const data = SAMPLE_CASES[type];
    await executeAnalysis(data);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans">
      
      {/* Premium Medical Tech Navigation Header */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab("landing")} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-rose-500 rounded-lg text-white shadow-lg shadow-rose-200 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-white fill-white/10 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">CardioTwin <span className="text-rose-600 underline decoration-rose-200">AI</span></span>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide leading-none mt-0.5">HEALTHCARE INTELLIGENCE</p>
            </div>
          </div>

          {/* Desktop Tab Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("landing")}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "landing" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
              }`}
            >
              {t.navHome}
            </button>

            {userMode === "common_man" ? (
              <>
                <button
                  id="nav-common-man"
                  onClick={() => {
                    if (!patientData) setPatientData(SAMPLE_CASES.high);
                    setActiveTab("common_man");
                  }}
                  className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "common_man" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                  <span>{t.navMyHeart}</span>
                </button>
                <button
                  id="nav-cvd-library"
                  onClick={() => setActiveTab("cvd_library")}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "cvd_library" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  {t.navCvdLibrary}
                </button>
                <button
                  id="nav-cvd-risk-map"
                  onClick={() => setActiveTab("risk_map")}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "risk_map" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  {t.navRiskMap}
                </button>
              </>
            ) : (
              <>
                <button
                  id="nav-risk-assessment"
                  onClick={() => {
                    if (!patientData) setPatientData(SAMPLE_CASES.high);
                    setActiveTab("input");
                  }}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "input" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  {t.navClinicalInput}
                </button>
                {prediction && (
                  <button
                    id="nav-dashboard"
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "dashboard" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                    }`}
                  >
                    {t.navDashboard}
                  </button>
                )}
                <button
                  id="nav-cvd-library"
                  onClick={() => setActiveTab("cvd_library")}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "cvd_library" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  {t.navCvdLibrary}
                </button>
                <button
                  id="nav-cvd-risk-map"
                  onClick={() => setActiveTab("risk_map")}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "risk_map" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  {t.navRiskMap}
                </button>
                <button
                  id="nav-ehr-protocols"
                  onClick={() => setActiveTab("fhir_ehr")}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "fhir_ehr" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.navEhrProtocols || "EHR & FHIR"}</span>
                </button>
                <button
                  id="nav-pipeline-architecture"
                  onClick={() => setActiveTab("architecture")}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "architecture" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  {t.navArchitecture}
                </button>
                <button
                  id="nav-tech-stack"
                  onClick={() => setActiveTab("stack")}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "stack" ? "text-rose-600 bg-rose-50/70 border-b-2 border-rose-600 rounded-none pb-1" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 pb-1"
                  }`}
                >
                  {t.navTechStack}
                </button>
              </>
            )}
          </div>

          {/* Desktop Right action items: Mode Switcher & Status */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Mode Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button
                type="button"
                id="header-btn-citizen-mode"
                onClick={() => {
                  setUserMode("common_man");
                  if (activeTab === "input" || activeTab === "dashboard") {
                    setActiveTab("common_man");
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userMode === "common_man"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
                title="Simplified Plain-English Heart Health Guide for everyday citizens"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.citizenMode || "Citizen"}</span>
              </button>

              <button
                type="button"
                id="header-btn-doctor-mode"
                onClick={() => {
                  setUserMode("clinical");
                  if (activeTab === "common_man") {
                    setActiveTab(prediction ? "dashboard" : "input");
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userMode === "clinical"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
                title="Full clinical decision-support engine for healthcare professionals"
              >
                <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.doctorMode || "Doctor"}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 pl-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.online || "Online"}</span>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-4 flex flex-col shadow-xl"
            >
              {/* Mobile Language Switcher */}
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  Language / ಭಾಷೆ / भाषा
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        language === lang.code
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm font-black"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="leading-tight">{lang.nativeLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    setUserMode("common_man");
                    if (activeTab === "input" || activeTab === "dashboard") {
                      setActiveTab("common_man");
                    }
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    userMode === "common_man" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Citizen Mode</span>
                </button>
                <button
                  onClick={() => {
                    setUserMode("clinical");
                    if (activeTab === "common_man") {
                      setActiveTab(prediction ? "dashboard" : "input");
                    }
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    userMode === "clinical" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600"
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                  <span>Doctor Mode</span>
                </button>
              </div>

              <button
                onClick={() => { setActiveTab("landing"); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {t.navHome}
              </button>

              {userMode === "common_man" ? (
                <>
                  <button
                    onClick={() => { 
                      if (!patientData) setPatientData(SAMPLE_CASES.high);
                      setActiveTab("common_man"); 
                      setMobileMenuOpen(false); 
                    }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-rose-500/20" />
                    {t.navMyHeart}
                  </button>
                  <button
                    onClick={() => { setActiveTab("cvd_library"); setMobileMenuOpen(false); }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.navCvdLibrary}
                  </button>
                  <button
                    onClick={() => { setActiveTab("risk_map"); setMobileMenuOpen(false); }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.navRiskMap}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { 
                      if (!patientData) setPatientData(SAMPLE_CASES.high);
                      setActiveTab("input"); 
                      setMobileMenuOpen(false); 
                    }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.navClinicalInput}
                  </button>
                  {prediction && (
                    <button
                      onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                      className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      {t.navDashboard}
                    </button>
                  )}
                  <button
                    onClick={() => { setActiveTab("cvd_library"); setMobileMenuOpen(false); }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.navCvdLibrary}
                  </button>
                  <button
                    onClick={() => { setActiveTab("risk_map"); setMobileMenuOpen(false); }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.navRiskMap}
                  </button>
                  <button
                    onClick={() => { setActiveTab("ai_chat"); setMobileMenuOpen(false); }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    {t.navAiChat}
                  </button>
                  <button
                    onClick={() => { setActiveTab("fhir_ehr"); setMobileMenuOpen(false); }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <FileCode className="w-4 h-4 text-rose-500" />
                    <span>{t.navEhrProtocols || "EHR & FHIR Protocols"}</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab("architecture"); setMobileMenuOpen(false); }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.navArchitecture}
                  </button>
                  <button
                    onClick={() => { setActiveTab("stack"); setMobileMenuOpen(false); }}
                    className="py-2.5 px-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.navTechStack}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Prediction Runs History Switcher Panel */}
      {predictionHistory.length > 0 && activeTab === "dashboard" && (
        <div className="bg-slate-100 border-b border-slate-200/80 py-3.5 px-6 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500 rounded-lg text-white shadow-xs">
                <Activity className="w-4 h-4 text-white fill-white/10" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Runs Comparison History</span>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">Toggle and compare patient runs stored in this active session.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {predictionHistory.map((item, idx) => {
                const isSelected = prediction && prediction.patientData.age === item.patientData.age && prediction.patientData.systolicBP === item.patientData.systolicBP && prediction.patientData.weight === item.patientData.weight;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPrediction(item.prediction);
                      setPatientData(item.patientData);
                      setGeminiSummary(item.geminiSummary);
                    }}
                    className={`text-xs px-3.5 py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-100"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-rose-500 animate-pulse"}`} />
                    Run #{predictionHistory.length - idx} ({item.timestamp}) - {item.prediction.overallRisk}% Risk
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setPredictionHistory([]);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2.5 py-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Boundary display banner */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-6 mt-4 w-full">
          <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-sm flex items-center justify-between">
            <span className="font-semibold">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 font-bold hover:text-red-700 text-xs">Dismiss</button>
          </div>
        </div>
      )}

      {/* Main Container Views Wrapper */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* View Tab 1: Landing Page */}
          {activeTab === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingView 
                onStartAssessment={() => {
                  setUserMode("clinical");
                  if (!patientData) setPatientData(SAMPLE_CASES.high);
                  setActiveTab("input");
                }}
                onStartCommonManMode={() => {
                  setUserMode("common_man");
                  if (!patientData) setPatientData(SAMPLE_CASES.high);
                  setActiveTab("common_man");
                }}
                onLoadSample={handleLoadSample}
                language={language}
                onLanguageChange={setLanguage}
              />
            </motion.div>
          )}

          {/* View Tab: Common Man / Citizen Simplified Heart Guide */}
          {activeTab === "common_man" && (
            <motion.div
              key="common_man"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CommonManView 
                initialPatientData={patientData || SAMPLE_CASES.high}
                predictionResult={prediction}
                onExecuteAnalysis={executeAnalysis}
                onSwitchToSpecialistMode={() => {
                  setUserMode("clinical");
                  setActiveTab(prediction ? "dashboard" : "input");
                }}
                isLoading={isPredicting}
                language={language}
                onLanguageChange={setLanguage}
              />
            </motion.div>
          )}

          {/* View Tab 2: Form Input Questionnaire */}
          {activeTab === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-6 py-12"
            >
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Structured Patient Parameters</h1>
                <p className="text-slate-500 text-sm">Fill in demographics, biological metrics, and metabolic profiles to boot the ensemble model.</p>
              </div>

              <PatientForm 
                onSubmit={executeAnalysis} 
                isLoading={isPredicting}
                initialData={patientData}
              />
            </motion.div>
          )}

          {/* View Tab 3: Full AI Analytics Dashboard */}
          {activeTab === "dashboard" && prediction && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DashboardView 
                predictionResult={prediction}
                onBackToInput={() => setActiveTab("input")}
                onRefreshSummary={() => triggerGeminiSummary(prediction)}
                onLoadProfile={(profile) => {
                  setPatientData(profile);
                  executeAnalysis(profile);
                }}
                geminiSummary={geminiSummary}
                isGeminiLoading={isGeminiLoading}
                predictionHistory={predictionHistory}
                onOpenEHRProtocols={() => setActiveTab("fhir_ehr")}
              />
            </motion.div>
          )}

          {/* View Tab: EHR & FHIR Healthcare Protocols Suite */}
          {activeTab === "fhir_ehr" && (
            <motion.div
              key="fhir_ehr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-6 py-8"
            >
              <EHRProtocolsView 
                patientData={patientData || (prediction ? prediction.patientData : SAMPLE_CASES.high)}
                prediction={prediction}
                onApplyExtractedPatient={(extracted) => {
                  setPatientData(extracted);
                  executeAnalysis(extracted);
                }}
                onNavigateToDashboard={() => {
                  if (prediction) {
                    setActiveTab("dashboard");
                  } else {
                    setActiveTab("input");
                  }
                }}
              />
            </motion.div>
          )}

          {/* View Tab 4: System Architecture Schema map */}
          {activeTab === "architecture" && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ArchitectureView />
            </motion.div>
          )}

          {/* View Tab: CVD Library Information Guide */}
          {activeTab === "cvd_library" && (
            <motion.div
              key="cvd_library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CvdLibraryView />
            </motion.div>
          )}

          {/* View Tab: Cardiovascular Risk Map with GNN */}
          {activeTab === "risk_map" && (
            <motion.div
              key="risk_map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CardiovascularRiskMapView 
                prediction={prediction}
                patientData={patientData}
              />
            </motion.div>
          )}

          {/* View Tab 5: Technology Stack list */}
          {activeTab === "stack" && (
            <motion.div
              key="stack"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-6 py-16 space-y-12"
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scientific Technology Stack</h2>
                <p className="text-slate-500 text-sm">Professional algorithms, tooling libraries, and developer foundations compiling CardioTwin AI.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">Machine Learning Core</span>
                  <h4 className="font-extrabold text-slate-800 text-base">Ensemble Risk Classification</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Trained weights imitating <strong>Logistic Regression</strong>, <strong>Random Forest (Decision Trees)</strong>, and <strong>XGBoost (Extreme Gradient Boosting)</strong>. Features include probability calibration to guarantee accurate disease risk distribution.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">Explainable AI Interface</span>
                  <h4 className="font-extrabold text-slate-800 text-base">SHAP Attribution Calibrations</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    A mathematical solver calculating exact <strong>Shapley values</strong> for every variable contribution on submitted patient data profiles, ensuring baseline rate summaries equal the output risk probability perfectly.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">Unsupervised Similarities</span>
                  <h4 className="font-extrabold text-slate-800 text-base">K-Means Dimensional Projection</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Calculating distance centers relative to four preset clinical cohort cluster centroids, projecting coordinates inside a beautiful 2D projection scatter chart of high/low/metabolic risk groupings.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">Generative Healthcare Reports</span>
                  <h4 className="font-extrabold text-slate-800 text-base">Gemini 3.7 Flash LLM Layer</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">
                    Express-side API gateway routing metrics, quality audits, SHAP values, and metabolic factors into Gemini's context model, generating clean clinical-decision support summaries.
                  </p>
                </div>
              </div>

              <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto text-center">
                📊 Developed and bundled with <strong>TypeScript / React 19</strong>, <strong>Vite</strong>, <strong>Express</strong>, <strong>Tailwind CSS v4</strong>, <strong>Lucide Icons</strong>, <strong>Recharts Data Visualizations</strong>, and the <strong>@google/genai SDK</strong>.
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Modern minimal scientific footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6 text-center text-slate-400 space-y-2 mt-20">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">🫀 CardioTwin AI • Clinical Decision-Support Platform</p>
        <p className="text-[10px] leading-relaxed max-w-3xl mx-auto font-normal text-slate-400">
          Disclaimer: CardioTwin AI is a decision-support modeling tool designed strictly for research, training representation, and educational insights. It does not provide medical diagnoses, medication prescription targets, clinical plans, or emergency medical dispatch. Always consult qualified clinical specialists.
        </p>
        <p className="text-[10px] pt-4 text-slate-300">© 2026 CardioTwin AI. IEEE Code Circuit Software Track SW-02-M.</p>
      </footer>

    </div>
  );
}
