import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Activity, Heart, Shield, Sparkles, ChevronLeft, ChevronRight, CheckCircle, Info, RefreshCw, BookOpen, ChevronDown, ChevronUp, AlertCircle, Mic, MicOff, HelpCircle, X, FileCheck, FileText, Upload, Scan } from "lucide-react";
import { PatientData, DataQuality } from "../types";
import { CLINICAL_COHORTS } from "../data/clinicalCohorts";
import LabReportScanner from "./LabReportScanner";

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  isLoading: boolean;
  initialData?: PatientData;
}

// Custom hook to provide real-time visual feedback based on input state and validation logic
function useFieldValidationFeedback(formData: PatientData, validationErrors: Record<string, string>) {
  return (name: keyof PatientData) => {
    const error = validationErrors[name];
    const value = formData[name];
    const isDirty = value !== undefined && value !== "" && value !== null;

    if (error) {
      return {
        inputClass: "border-red-500 bg-red-50/10 focus:ring-red-500 focus:border-red-500 text-red-950 pr-10",
        labelClass: "text-red-600",
        icon: "error" as const
      };
    } else if (isDirty) {
      return {
        inputClass: "border-emerald-500 bg-emerald-50/10 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 pr-10",
        labelClass: "text-emerald-700",
        icon: "success" as const
      };
    }
    return {
      inputClass: "border-slate-200 bg-white focus:ring-rose-500 focus:border-rose-500 text-slate-800",
      labelClass: "text-slate-700",
      icon: null
    };
  };
}

const DEFAULT_PATIENT: PatientData = {
  age: 45,
  sex: "male",
  height: 175,
  weight: 78,
  systolicBP: 125,
  diastolicBP: 80,
  cholesterol: 190,
  glucose: 90,
  restingHR: 70,
  smoking: false,
  physicalActivity: 1, // 0: sedentary, 1: moderate, 2: highly active
  diabetes: false,
  prevHeartDisease: false,
  hypertensionHistory: false,
  familyHistoryScore: 3,
  medicationAdherence: 80
};

// Converts spoken numbers or phrases into numeric values
function parseSpokenNumber(text: string): number | null {
  const clean = text.trim().toLowerCase().replace(/[-]/g, " ");
  
  // Extract digits first if they are there
  const digitMatch = clean.match(/\d+/);
  if (digitMatch) {
    return parseInt(digitMatch[0], 10);
  }

  // Dictionary for single numbers
  const ones: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19
  };

  const tens: Record<string, number> = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
  };

  if (ones[clean] !== undefined) return ones[clean];
  if (tens[clean] !== undefined) return tens[clean];

  const parts = clean.split(/\s+/);
  if (parts.length === 2) {
    const tenPart = tens[parts[0]];
    const onePart = ones[parts[1]];
    if (tenPart !== undefined && onePart !== undefined) {
      return tenPart + onePart;
    }
  }

  if (clean.includes("hundred")) {
    const hundredIndex = parts.indexOf("hundred");
    if (hundredIndex > 0) {
      const multiplier = ones[parts[hundredIndex - 1]];
      if (multiplier !== undefined) {
        let sum = multiplier * 100;
        const restParts = parts.slice(hundredIndex + 1);
        if (restParts.length === 1) {
          const val = ones[restParts[0]] || tens[restParts[0]];
          if (val !== undefined) sum += val;
        } else if (restParts.length === 2) {
          const tVal = tens[restParts[0]];
          const oVal = ones[restParts[1]];
          if (tVal !== undefined && oVal !== undefined) sum += tVal + oVal;
        }
        return sum;
      }
    }
  }

  return null;
}

export default function PatientForm({ onSubmit, isLoading, initialData }: PatientFormProps) {
  const [step, setStep] = useState(1);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [formData, setFormData] = useState<PatientData>(initialData || DEFAULT_PATIENT);
  const [bmi, setBmi] = useState<number>(25.5);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedCohortId, setSelectedCohortId] = useState("cad");
  const [selectedCaseName, setSelectedCaseName] = useState<string | null>(null);
  const [isPresetLibraryOpen, setIsPresetLibraryOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isInlineScannerOpen, setIsInlineScannerOpen] = useState(false);

  const handleApplyLabReportData = (extracted: PatientData, runImmediately: boolean = false) => {
    setFormData(prev => ({
      ...prev,
      ...extracted,
      selectedCaseName: extracted.selectedCaseName || "Lab Report OCR Ingestion",
      selectedCohortName: extracted.selectedCohortName || "Medical Diagnostic Panel",
      caseDescription: extracted.caseDescription || "Extracted from uploaded medical laboratory report.",
      caseNotes: extracted.caseNotes || `Total Chol: ${extracted.cholesterol} mg/dL, Glucose: ${extracted.glucose} mg/dL, BP: ${extracted.systolicBP}/${extracted.diastolicBP} mmHg`
    }));
    setSelectedCaseName(extracted.selectedCaseName || "Lab Report Ingestion");
    setValidationErrors({});
    setIsScannerOpen(false);
    setIsInlineScannerOpen(false);
    setStep(1);

    if (runImmediately) {
      setTimeout(() => {
        onSubmit(extracted);
      }, 200);
    }
  };

  // Web Speech API Voice States
  const [activeSpeechField, setActiveSpeechField] = useState<string | null>(null);
  const [globalSpeechActive, setGlobalSpeechActive] = useState(false);
  const [globalSpeechTranscript, setGlobalSpeechTranscript] = useState("");
  const [isParsingSpeech, setIsParsingSpeech] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Initialize real-time validation visual feedback hook
  const getFieldFeedback = useFieldValidationFeedback(formData, validationErrors);

  const startFieldSpeech = (fieldName: keyof PatientData) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Web Speech API is not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setActiveSpeechField(fieldName);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log(`Speech result for ${fieldName}:`, transcript);
        const parsedNum = parseSpokenNumber(transcript);
        if (parsedNum !== null) {
          setFormData(prev => ({ ...prev, [fieldName]: parsedNum }));
          setValidationErrors(prev => {
            const copy = { ...prev };
            delete copy[fieldName];
            return copy;
          });
        } else {
          const cleanTranscript = transcript.trim().toLowerCase();
          if (fieldName === "sex") {
            if (cleanTranscript.includes("female") || cleanTranscript.includes("women") || cleanTranscript.includes("girl")) {
              setManualField("sex", "female");
            } else if (cleanTranscript.includes("male") || cleanTranscript.includes("man") || cleanTranscript.includes("boy")) {
              setManualField("sex", "male");
            }
          } else {
            setSpeechError(`Could not extract numeric value from: "${transcript}"`);
          }
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech error:", e);
        if (e.error === "not-allowed") {
          setSpeechError("Microphone access was blocked by the browser. Please allow microphone permissions or open the application in a standalone tab to dictate securely.");
        } else {
          setSpeechError(`Speech recognition failed: ${e.error}`);
        }
        setActiveSpeechField(null);
      };

      rec.onend = () => {
        setActiveSpeechField(null);
      };

      rec.start();
    } catch (err: any) {
      console.error("Speech init failed:", err);
      setSpeechError("Could not start speech recognition.");
      setActiveSpeechField(null);
    }
  };

  const startGlobalSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Web Speech API is not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setGlobalSpeechActive(true);
        setGlobalSpeechTranscript("");
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (currentTranscript) {
          setGlobalSpeechTranscript(prev => (prev + " " + currentTranscript).trim());
        }
      };

      rec.onerror = (e: any) => {
        console.error("Global speech error:", e);
        if (e.error === "not-allowed") {
          setSpeechError("Microphone access was blocked by the browser. Please allow microphone permissions or open the application in a standalone tab to dictate securely.");
        } else {
          setSpeechError(`Speech error: ${e.error}`);
        }
        setGlobalSpeechActive(false);
      };

      rec.onend = () => {
        setGlobalSpeechActive(false);
      };

      (window as any)._globalRecognitionInstance = rec;
      rec.start();
    } catch (err) {
      console.error("Global Speech init failed:", err);
      setSpeechError("Could not start global dictation.");
      setGlobalSpeechActive(false);
    }
  };

  const stopGlobalSpeech = () => {
    const rec = (window as any)._globalRecognitionInstance;
    if (rec) {
      rec.stop();
    }
    setGlobalSpeechActive(false);
  };

  const parseGlobalSpeechNotes = async () => {
    if (!globalSpeechTranscript) {
      setSpeechError("Please dictate some notes first.");
      return;
    }

    setIsParsingSpeech(true);
    setSpeechError(null);

    try {
      const response = await fetch("/api/parse-clinical-dictation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: globalSpeechTranscript })
      });

      if (!response.ok) {
        throw new Error("Failed to parse dictation notes.");
      }

      const parsedData = await response.json();
      console.log("Parsed structured patient data:", parsedData);

      setFormData(prev => ({
        ...prev,
        ...parsedData,
        selectedCaseName: "Voice Dictated Profile",
        selectedCohortName: "Speech Transcription Ingestion",
        caseDescription: "Populated automatically via browser Web Speech API transcription + Gemini AI parsing.",
        caseNotes: globalSpeechTranscript
      }));

      setValidationErrors({});
    } catch (err: any) {
      console.error("AI notes parsing failed:", err);
      setSpeechError("Failed to structure notes using Gemini. Please try again.");
    } finally {
      setIsParsingSpeech(false);
    }
  };

  // Sync initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Live BMI calculation
  useEffect(() => {
    if (formData.weight > 0 && formData.height > 0) {
      const heightM = formData.height / 100;
      const calculated = parseFloat((formData.weight / (heightM * heightM)).toFixed(1));
      setBmi(calculated);
    }
  }, [formData.weight, formData.height]);

  // Single source of truth for validation errors (synchronous)
  const getValidationError = (name: string, value: any): string => {
    let error = "";
    if (name === "age") {
      if (value === "" || value === undefined || value === null) error = "Age is required.";
      else if (value < 1 || value > 120) error = "Age must be between 1 and 120.";
    } else if (name === "height") {
      if (value === "" || value === undefined || value === null) error = "Height is required.";
      else if (value < 50 || value > 250) error = "Height must be between 50 and 250 cm.";
    } else if (name === "weight") {
      if (value === "" || value === undefined || value === null) error = "Weight is required.";
      else if (value < 10 || value > 350) error = "Weight must be between 10 and 350 kg.";
    } else if (name === "systolicBP") {
      if (value === "" || value === undefined || value === null) error = "Systolic BP is required.";
      else if (value < 50 || value > 260) error = "Systolic BP must be between 50 and 260 mmHg.";
    } else if (name === "diastolicBP") {
      if (value === "" || value === undefined || value === null) error = "Diastolic BP is required.";
      else if (value < 30 || value > 160) error = "Diastolic BP must be between 30 and 160 mmHg.";
    } else if (name === "cholesterol") {
      if (value === "" || value === undefined || value === null) error = "Cholesterol is required.";
      else if (value < 50 || value > 600) error = "Cholesterol must be between 50 and 600 mg/dL.";
    } else if (name === "glucose") {
      if (value === "" || value === undefined || value === null) error = "Glucose is required.";
      else if (value < 30 || value > 500) error = "Glucose must be between 30 and 500 mg/dL.";
    } else if (name === "restingHR") {
      if (value === "" || value === undefined || value === null) error = "Resting HR is required.";
      else if (value < 30 || value > 220) error = "Resting HR must be between 30 and 220 bpm.";
    } else if (name === "familyHistoryScore") {
      if (value === "" || value === undefined || value === null) error = "Family History Score is required.";
      else if (value < 0 || value > 10) error = "Family History Score must be between 0 and 10.";
    } else if (name === "medicationAdherence") {
      if (value === "" || value === undefined || value === null) error = "Medication Adherence is required.";
      else if (value < 0 || value > 100) error = "Medication Adherence must be between 0% and 100%.";
    }
    return error;
  };

  // Real-time range validation
  const validateField = (name: string, value: any) => {
    const error = getValidationError(name, value);
    setValidationErrors(prev => {
      const updated = { ...prev };
      if (error) {
        updated[name] = error;
      } else {
        delete updated[name];
      }
      return updated;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      finalValue = value === "" ? "" : parseFloat(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    validateField(name, finalValue);
  };

  const setManualField = (name: keyof PatientData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleNext = () => {
    // Validate current step's fields before advancing
    const errorsExist = Object.keys(validationErrors).length > 0;
    if (!errorsExist) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields synchronously to avoid stale async state bugs
    const localErrors: Record<string, string> = {};
    const keys = Object.keys(formData) as Array<keyof PatientData>;
    keys.forEach(key => {
      const err = getValidationError(key, formData[key]);
      if (err) {
        localErrors[key] = err;
      }
    });

    // Also check blood pressure consistency
    if (formData.systolicBP > 0 && formData.diastolicBP > 0 && formData.systolicBP <= formData.diastolicBP) {
      localErrors["systolicBP"] = "Systolic pressure must strictly exceed Diastolic pressure.";
    }

    if (Object.keys(localErrors).length > 0) {
      setValidationErrors(localErrors);
      
      // Auto-focus or jump to the step with the first error
      const firstErrorField = Object.keys(localErrors)[0];
      if (["age", "sex", "height", "weight"].includes(firstErrorField)) {
        setStep(1);
      } else if (["systolicBP", "diastolicBP", "restingHR"].includes(firstErrorField)) {
        setStep(2);
      } else if (["cholesterol", "glucose"].includes(firstErrorField)) {
        setStep(3);
      } else {
        setStep(4);
      }
    } else {
      onSubmit(formData);
    }
  };

  // Prevent Enter key in form fields from accidentally submitting the entire form
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const stepsInfo = [
    { num: 1, title: "Demographics", icon: User, desc: "Basic Patient Bioinfo" },
    { num: 2, title: "Vitallometrics", icon: Heart, desc: "Blood Pressure & Heart Rate" },
    { num: 3, title: "Biochemistry", icon: Activity, desc: "Cholesterol & Metabolic State" },
    { num: 4, title: "Clinical History", icon: Shield, desc: "Comorbidities & Habits" }
  ];

  return (
    <div id="patient-form-container" className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden mt-6">
      {/* Progress Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <Sparkles className="w-5 h-5 text-rose-600 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">CVD Intelligent Risk Classifier</h2>
            <p className="text-slate-500 text-sm font-medium">Please input accurate medical clinical parameters for the decision-support engine.</p>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 gap-2 relative">
          {stepsInfo.map(s => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div 
                key={s.num} 
                onClick={() => !isLoading && setStep(s.num)}
                className={`cursor-pointer transition-all p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
                  isActive 
                    ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/10" 
                    : isCompleted 
                    ? "bg-rose-50 border-rose-100 text-rose-700 font-semibold"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-500"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-white" : isCompleted ? "text-rose-600" : "text-slate-400"}`} />
                <span className="text-xs font-bold block sm:hidden">Step {s.num}</span>
                <span className="text-xs font-bold hidden sm:block">{s.title}</span>
                <span className="text-[10px] opacity-75 hidden sm:block">{s.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} className="p-8 space-y-8">
        
        {/* Multimodal Lab Report Scanner (PDF & Image OCR) */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden border border-rose-500/30">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl text-white shadow-lg shadow-rose-500/30 ring-2 ring-white/10 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Medical OCR & Vision AI
                  </span>
                  <span className="text-[10px] text-slate-300 font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                    Accepts PDF, JPG, PNG & Phone Snapshots
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Scan Patient Lab Report & Blood Work
                </h3>
                <p className="text-xs text-slate-300 font-normal max-w-xl">
                  Upload a lab report PDF or picture of lipid profiles, HbA1c, or hospital vitals. Gemini automatically reads the numbers and populates all 16 clinical parameters.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsInlineScannerOpen(!isInlineScannerOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  isInlineScannerOpen 
                    ? "bg-white text-slate-900 border-white shadow-md" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                }`}
              >
                <Scan className="w-4 h-4 text-rose-400" />
                <span>{isInlineScannerOpen ? "Hide Scanner Panel" : "Quick Inline Scanner"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-rose-500/30 transition-all cursor-pointer active:scale-98"
              >
                <Upload className="w-4 h-4" />
                <span>Open Full Scanner Desk</span>
              </button>
            </div>
          </div>

          {/* Inline Scanner Accordion */}
          <AnimatePresence>
            {isInlineScannerOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <LabReportScanner 
                  onApplyData={handleApplyLabReportData}
                  onClose={() => setIsInlineScannerOpen(false)}
                  theme="doctor"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clinical Cohort Library */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm transition-all">
          <button
            type="button"
            onClick={() => setIsPresetLibraryOpen(!isPresetLibraryOpen)}
            className="w-full flex items-center justify-between p-4 bg-slate-100/50 hover:bg-slate-100 transition-colors text-left border-b border-slate-200/60"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-rose-600 block">Pre-calibrated Clinical Cohorts</span>
                <h3 className="font-extrabold text-slate-800 text-sm">35 Diagnostic Presets Library</h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedCaseName && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 animate-pulse">
                  Active: {selectedCaseName}
                </span>
              )}
              {isPresetLibraryOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
          </button>

          <AnimatePresence>
            {isPresetLibraryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-5 space-y-4"
              >
                <p className="text-slate-500 text-xs leading-relaxed">
                  Select a clinical cohort below, then click any of the 5 reference profiles to immediately pre-populate all 16 biochemical, vitallometric, and history parameters.
                </p>

                {/* Cohort Tabs */}
                <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
                  {CLINICAL_COHORTS.map(cohort => (
                    <button
                      key={cohort.id}
                      type="button"
                      onClick={() => setSelectedCohortId(cohort.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedCohortId === cohort.id
                          ? "bg-rose-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cohort.title.split("(")[0].trim()}
                    </button>
                  ))}
                </div>

                {/* Active Cohort Case List */}
                {CLINICAL_COHORTS.map(cohort => {
                  if (cohort.id !== selectedCohortId) return null;
                  return (
                    <div key={cohort.id} className="space-y-3">
                      <div className="text-[11px] font-medium text-slate-400 italic">
                        {cohort.description}
                      </div>
                      <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {cohort.cases.map(c => {
                          const isCurrentlySelected = selectedCaseName === c.name;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  age: c.age,
                                  sex: c.sex,
                                  height: c.height,
                                  weight: c.weight,
                                  systolicBP: c.systolicBP,
                                  diastolicBP: c.diastolicBP,
                                  cholesterol: c.cholesterol,
                                  glucose: c.glucose,
                                  restingHR: c.restingHR,
                                  smoking: c.smoking,
                                  physicalActivity: c.physicalActivity,
                                  diabetes: c.diabetes,
                                  prevHeartDisease: c.prevHeartDisease,
                                  hypertensionHistory: c.hypertensionHistory,
                                  familyHistoryScore: c.familyHistoryScore,
                                  medicationAdherence: c.medicationAdherence,
                                  selectedCaseName: c.name,
                                  selectedCohortName: cohort.title,
                                  caseDescription: c.description,
                                  caseNotes: c.notes
                                });
                                setSelectedCaseName(c.name);
                                setValidationErrors({});
                                setStep(1); // Return to first step so they see demographics
                              }}
                              className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between h-full group ${
                                isCurrentlySelected
                                  ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20"
                                  : "bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50/10"
                              }`}
                            >
                              <div>
                                <h4 className={`text-xs font-extrabold ${isCurrentlySelected ? "text-rose-700" : "text-slate-800 group-hover:text-rose-600"}`}>
                                  {c.name}
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-3 leading-normal font-normal">
                                  {c.description}
                                </p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-slate-100 w-full flex items-center justify-between text-[9px] font-bold text-slate-400">
                                <span>Age: {c.age}</span>
                                <span className="uppercase text-rose-500 group-hover:underline">Load Case →</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clinician's AI Voice Dictation Desk */}
        <div className="bg-gradient-to-br from-rose-50/50 to-indigo-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500 text-white rounded-xl shadow-sm shadow-rose-500/10">
                <Mic className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Clinician AI Dictation Desk</h3>
                <p className="text-slate-500 text-[11px] font-normal">Dictate continuous patient records naturally and let Gemini auto-fill the form.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowVoiceHelp(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-98"
                title="View Supported Voice Commands Guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Voice Guide</span>
              </button>

              {!globalSpeechActive ? (
                <button
                  type="button"
                  onClick={startGlobalSpeech}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-98"
                >
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span>Start Dictation</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopGlobalSpeech}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-98 animate-pulse"
                >
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Stop & Lock Notes</span>
                </button>
              )}

              {globalSpeechTranscript && (
                <button
                  type="button"
                  onClick={parseGlobalSpeechNotes}
                  disabled={isParsingSpeech}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  {isParsingSpeech ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isParsingSpeech ? "AI Parsing..." : "Auto-Fill Form"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Transcript Box */}
          {(globalSpeechTranscript || globalSpeechActive) && (
            <div className="relative border border-slate-200/80 rounded-xl bg-white p-3 shadow-inner">
              <span className="absolute top-1 right-2.5 text-[8.5px] uppercase font-bold tracking-widest text-slate-400">
                {globalSpeechActive ? "🔴 Transcribing Live" : "📋 Recorded Notes"}
              </span>
              <textarea
                value={globalSpeechTranscript}
                onChange={(e) => setGlobalSpeechTranscript(e.target.value)}
                placeholder="Talk naturally: 'The patient is 54 years old male, weighs 82 kg, blood pressure is 135 over 82...'"
                className="w-full text-xs text-slate-700 bg-transparent resize-none border-none outline-none font-medium leading-relaxed h-16 pt-2"
              />
            </div>
          )}

          {speechError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-medium text-red-700 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <span>{speechError}</span>
            </div>
          )}
        </div>

        {/* STEP 1: Basic Demographics */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Citizen / Patient Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Patient / Citizen Full Name</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    name="name"
                    id="input-name"
                    placeholder="e.g., Rajesh Kumar / Jane Doe"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium text-slate-800 bg-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("age").labelClass}`}>Age (Years)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      name="age"
                      id="input-age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-semibold ${getFieldFeedback("age").inputClass}`}
                      min="1"
                      max="120"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {getFieldFeedback("age").icon === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {getFieldFeedback("age").icon === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("age")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "age"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Age"
                  >
                    {activeSpeechField === "age" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.age && <p className="text-red-500 text-xs font-medium">{validationErrors.age}</p>}
              </div>

              {/* Sex */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 font-semibold">Biological Sex</label>
                <div className="flex items-center gap-2">
                  <div className="grid grid-cols-2 gap-3 flex-grow">
                    <button
                      type="button"
                      onClick={() => setManualField("sex", "male")}
                      className={`py-3 px-4 border rounded-xl font-semibold transition-all text-sm ${
                        formData.sex === "male" 
                          ? "bg-rose-50 border-rose-500 text-rose-700 font-bold shadow-sm" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualField("sex", "female")}
                      className={`py-3 px-4 border rounded-xl font-semibold transition-all text-sm ${
                        formData.sex === "female" 
                          ? "bg-rose-50 border-rose-500 text-rose-700 font-bold shadow-sm" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("sex")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "sex"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Sex (Say Male or Female)"
                  >
                    {activeSpeechField === "sex" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("height").labelClass}`}>Height (cm)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      name="height"
                      id="input-height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-semibold ${getFieldFeedback("height").inputClass}`}
                      min="50"
                      max="250"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {getFieldFeedback("height").icon === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {getFieldFeedback("height").icon === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("height")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "height"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Height"
                  >
                    {activeSpeechField === "height" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.height && <p className="text-red-500 text-xs font-medium">{validationErrors.height}</p>}
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("weight").labelClass}`}>Weight (kg)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      name="weight"
                      id="input-weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-semibold ${getFieldFeedback("weight").inputClass}`}
                      min="10"
                      max="350"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {getFieldFeedback("weight").icon === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {getFieldFeedback("weight").icon === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("weight")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "weight"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Weight"
                  >
                    {activeSpeechField === "weight" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.weight && <p className="text-red-500 text-xs font-medium">{validationErrors.weight}</p>}
              </div>
            </div>

            {/* Real-time calculated BMI Display */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg text-white font-extrabold text-sm ${
                  bmi >= 30 ? "bg-red-500" : bmi >= 25 ? "bg-amber-500" : bmi >= 18.5 ? "bg-teal-500" : "bg-rose-500"
                }`}>
                  {bmi}
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Calculated BMI Metrics</h4>
                  <p className="text-xs text-slate-500">Auto-updated based on height and weight inputs.</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                bmi >= 30 
                  ? "bg-red-50 text-red-700 border border-red-100" 
                  : bmi >= 25 
                  ? "bg-amber-50 text-amber-700 border border-amber-100" 
                  : bmi >= 18.5 
                  ? "bg-teal-50 text-teal-700 border border-teal-100"
                  : "bg-blue-50 text-blue-700"
              }`}>
                {bmi >= 30 ? "Obese Range" : bmi >= 25 ? "Overweight" : bmi >= 18.5 ? "Optimal Range" : "Underweight"}
              </span>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Cardiovascular Parameters */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Systolic BP */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("systolicBP").labelClass}`}>Systolic Blood Pressure (mmHg)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      name="systolicBP"
                      id="input-systolic"
                      value={formData.systolicBP}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-semibold ${getFieldFeedback("systolicBP").inputClass}`}
                      min="50"
                      max="260"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {getFieldFeedback("systolicBP").icon === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {getFieldFeedback("systolicBP").icon === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("systolicBP")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "systolicBP"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Systolic BP"
                  >
                    {activeSpeechField === "systolicBP" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.systolicBP && <p className="text-red-500 text-xs font-medium">{validationErrors.systolicBP}</p>}
                <p className="text-[10px] text-slate-400">Pressure when heart beats (Target: &lt;120 mmHg)</p>
              </div>

              {/* Diastolic BP */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("diastolicBP").labelClass}`}>Diastolic Blood Pressure (mmHg)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      name="diastolicBP"
                      id="input-diastolic"
                      value={formData.diastolicBP}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-semibold ${getFieldFeedback("diastolicBP").inputClass}`}
                      min="30"
                      max="160"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {getFieldFeedback("diastolicBP").icon === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {getFieldFeedback("diastolicBP").icon === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("diastolicBP")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "diastolicBP"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Diastolic BP"
                  >
                    {activeSpeechField === "diastolicBP" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.diastolicBP && <p className="text-red-500 text-xs font-medium">{validationErrors.diastolicBP}</p>}
                <p className="text-[10px] text-slate-400">Pressure between heartbeats (Target: &lt;80 mmHg)</p>
              </div>

              {/* Resting Heart Rate */}
              <div className="space-y-2 md:col-span-2">
                <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("restingHR").labelClass}`}>Resting Heart Rate (BPM)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      name="restingHR"
                      id="input-resting-hr"
                      value={formData.restingHR}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-semibold ${getFieldFeedback("restingHR").inputClass}`}
                      min="30"
                      max="220"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {getFieldFeedback("restingHR").icon === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {getFieldFeedback("restingHR").icon === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("restingHR")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "restingHR"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Resting Heart Rate"
                  >
                    {activeSpeechField === "restingHR" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.restingHR && <p className="text-red-500 text-xs font-medium">{validationErrors.restingHR}</p>}
                <p className="text-[10px] text-slate-400">Beats per minute while resting (Optimal: 60-80 bpm)</p>
              </div>
            </div>

            {/* Systolic vs Diastolic logical alert */}
            {formData.systolicBP > 0 && formData.diastolicBP > 0 && formData.systolicBP <= formData.diastolicBP && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span><strong>Clinical Inconsistency:</strong> Systolic pressure must strictly exceed Diastolic pressure.</span>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3: Biochemistry */}
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cholesterol */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("cholesterol").labelClass}`}>Total Serum Cholesterol (mg/dL)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      name="cholesterol"
                      id="input-cholesterol"
                      value={formData.cholesterol}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-semibold ${getFieldFeedback("cholesterol").inputClass}`}
                      min="50"
                      max="600"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {getFieldFeedback("cholesterol").icon === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {getFieldFeedback("cholesterol").icon === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("cholesterol")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "cholesterol"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Total Cholesterol"
                  >
                    {activeSpeechField === "cholesterol" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.cholesterol && <p className="text-red-500 text-xs font-medium">{validationErrors.cholesterol}</p>}
                <p className="text-[10px] text-slate-400">Total fat content in the bloodstream (Optimal: &lt;200 mg/dL)</p>
              </div>

              {/* Glucose Level */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("glucose").labelClass}`}>Blood Glucose Level (mg/dL)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      name="glucose"
                      id="input-glucose"
                      value={formData.glucose}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all font-semibold ${getFieldFeedback("glucose").inputClass}`}
                      min="30"
                      max="500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {getFieldFeedback("glucose").icon === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {getFieldFeedback("glucose").icon === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startFieldSpeech("glucose")}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      activeSpeechField === "glucose"
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
                    }`}
                    title="Dictate Blood Glucose"
                  >
                    {activeSpeechField === "glucose" ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {validationErrors.glucose && <p className="text-red-500 text-xs font-medium">{validationErrors.glucose}</p>}
                <p className="text-[10px] text-slate-400">Serum glucose (Fasting normal: 70-99 mg/dL)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Lifestyle & Clinical History */}
        {step === 4 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Lifestyle Parameters */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2">Lifestyle Characteristics</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Physical Activity Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Weekly Physical Activity</label>
                  <select
                    name="physicalActivity"
                    id="input-activity"
                    value={formData.physicalActivity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-800 bg-white font-semibold"
                  >
                    <option value={0}>Sedentary / Highly Inactive</option>
                    <option value={1}>Moderate (90-150 mins cardio/week)</option>
                    <option value={2}>High (150+ mins intensive/week)</option>
                  </select>
                </div>

                {/* Smoking status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Tobacco Consumption</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setManualField("smoking", false)}
                      className={`py-3 px-4 border rounded-xl font-semibold transition-all text-sm ${
                        !formData.smoking 
                          ? "bg-teal-50 border-teal-500 text-teal-700 font-bold shadow-sm" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Non-Smoker
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualField("smoking", true)}
                      className={`py-3 px-4 border rounded-xl font-semibold transition-all text-sm ${
                        formData.smoking 
                          ? "bg-red-50 border-red-500 text-red-700 font-bold shadow-sm" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Active Smoker
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Comorbidities */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2">Diagnosed Clinical History</h3>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Diabetes */}
                <label className={`cursor-pointer border rounded-xl p-4 flex flex-col justify-between h-24 hover:bg-slate-50 transition-all ${
                  formData.diabetes 
                    ? "bg-rose-50 border-rose-200 text-rose-700" 
                    : "bg-white border-slate-200 text-slate-500"
                }`}>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-bold">Diabetes</span>
                    <input
                      type="checkbox"
                      name="diabetes"
                      id="checkbox-diabetes"
                      checked={formData.diabetes}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                    />
                  </div>
                  <span className="text-[10px] leading-tight">Elevated fasting blood sugar background.</span>
                </label>

                {/* Pre-existing heart disease */}
                <label className={`cursor-pointer border rounded-xl p-4 flex flex-col justify-between h-24 hover:bg-slate-50 transition-all ${
                  formData.prevHeartDisease 
                    ? "bg-rose-50 border-rose-200 text-rose-700" 
                    : "bg-white border-slate-200 text-slate-500"
                }`}>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-bold">Heart Disease</span>
                    <input
                      type="checkbox"
                      name="prevHeartDisease"
                      id="checkbox-prev-cvd"
                      checked={formData.prevHeartDisease}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                    />
                  </div>
                  <span className="text-[10px] leading-tight">History of cardiac issues, angina, blockages.</span>
                </label>

                {/* Hypertension history */}
                <label className={`cursor-pointer border rounded-xl p-4 flex flex-col justify-between h-24 hover:bg-slate-50 transition-all ${
                  formData.hypertensionHistory 
                    ? "bg-rose-50 border-rose-200 text-rose-700" 
                    : "bg-white border-slate-200 text-slate-500"
                }`}>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-bold">Hypertension</span>
                    <input
                      type="checkbox"
                      name="hypertensionHistory"
                      id="checkbox-hypertension"
                      checked={formData.hypertensionHistory}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                    />
                  </div>
                  <span className="text-[10px] leading-tight">History of diagnosed chronic high BP.</span>
                </label>
              </div>
            </div>

            {/* Inherited Risk & Treatment Compliance */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-2">Inherited Risk & Treatment Adherence</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Family History Score */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("familyHistoryScore").labelClass}`}>Family History Score (0-10)</label>
                    <span className={`text-xs font-bold transition-colors ${getFieldFeedback("familyHistoryScore").labelClass}`}>Score: {formData.familyHistoryScore || 0}/10</span>
                  </div>
                  <input
                    type="range"
                    name="familyHistoryScore"
                    id="input-family-history"
                    min="0"
                    max="10"
                    step="1"
                    value={formData.familyHistoryScore || 0}
                    onChange={handleInputChange}
                    className="w-full accent-rose-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0: No CVD family history</span>
                    <span>5: Moderate history</span>
                    <span>10: Multiple early CVD cases</span>
                  </div>
                  {validationErrors.familyHistoryScore && <p className="text-red-500 text-xs font-medium">{validationErrors.familyHistoryScore}</p>}
                </div>

                {/* Medication Adherence */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className={`block text-sm font-semibold transition-colors ${getFieldFeedback("medicationAdherence").labelClass}`}>Medication Adherence (%)</label>
                    <span className={`text-xs font-bold transition-colors ${getFieldFeedback("medicationAdherence").labelClass}`}>{formData.medicationAdherence || 0}% Adherence</span>
                  </div>
                  <input
                    type="range"
                    name="medicationAdherence"
                    id="input-med-adherence"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.medicationAdherence || 0}
                    onChange={handleInputChange}
                    className="w-full accent-rose-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0%: Never complies</span>
                    <span>100%: Perfect compliance</span>
                  </div>
                  {validationErrors.medicationAdherence && <p className="text-red-500 text-xs font-medium">{validationErrors.medicationAdherence}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-colors text-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={Object.keys(validationErrors).length > 0}
                className={`inline-flex items-center gap-1 px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-950 transition-all text-sm cursor-pointer ${
                  Object.keys(validationErrors).length > 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="btn-submit-risk-analysis"
                disabled={isLoading || Object.keys(validationErrors).length > 0}
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/10 transition-all text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing ML Models...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Run AI Risk Analysis
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </form>

      {/* Clinician AI Dictation Guide Modal */}
      <AnimatePresence>
        {showVoiceHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-500 to-indigo-600 p-6 text-white flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-extrabold tracking-tight">AI Voice Assistant Dictation Manual</h3>
                  </div>
                  <p className="text-rose-100 text-xs font-normal">Use natural physician vocabulary to populate patient parameters instantly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVoiceHelp(false)}
                  className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                
                {/* Visual workflow steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-rose-600">Method 1: Field Micro-Dictation</span>
                    <p className="text-slate-600 text-xs font-normal">
                      Click the microphone next to any single field, wait for the pulse, and say just the value (e.g. <span className="font-semibold text-slate-800">"seventy five"</span> or <span className="font-semibold text-slate-800">"yes"</span>).
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600">Method 2: Continuous Dictation</span>
                    <p className="text-slate-600 text-xs font-normal">
                      Click <span className="font-semibold text-slate-800">"Start Dictation"</span> in the desk, talk naturally about several parameters, then click <span className="font-semibold text-slate-800">"Auto-Fill Form"</span>.
                    </p>
                  </div>
                </div>

                {/* Categories & Examples */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Supported Voice Macros & Formats</h4>
                  
                  <div className="space-y-3">
                    {/* Category 1 */}
                    <div className="border border-slate-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase">Demographics</span>
                        <span className="text-slate-400 text-xs font-normal">• Age, height, weight, sex</span>
                      </div>
                      <div className="grid gap-1">
                        <p className="text-slate-500 text-xs font-normal">
                          <strong className="text-slate-700">Recommended Phrase:</strong> "The patient is a 65 year old female, height is 162 centimeters, weight is 68 kilograms."
                        </p>
                      </div>
                    </div>

                    {/* Category 2 */}
                    <div className="border border-slate-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase">Vitallometrics & Hemodynamics</span>
                        <span className="text-slate-400 text-xs font-normal">• BP, heart rate</span>
                      </div>
                      <div className="grid gap-1">
                        <p className="text-slate-500 text-xs font-normal">
                          <strong className="text-slate-700">Recommended Phrase:</strong> "Blood pressure is 135 over 85. Resting heart rate is 72 beats per minute."
                        </p>
                      </div>
                    </div>

                    {/* Category 3 */}
                    <div className="border border-slate-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase">Lab Biomarkers</span>
                        <span className="text-slate-400 text-xs font-normal">• Cholesterol, glucose</span>
                      </div>
                      <div className="grid gap-1">
                        <p className="text-slate-500 text-xs font-normal">
                          <strong className="text-slate-700">Recommended Phrase:</strong> "Total cholesterol level is 210, fasting glucose is 105."
                        </p>
                      </div>
                    </div>

                    {/* Category 4 */}
                    <div className="border border-slate-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase">History & Comorbidities</span>
                        <span className="text-slate-400 text-xs font-normal">• Smoking, diabetes, compliance, family history</span>
                      </div>
                      <div className="grid gap-1">
                        <p className="text-slate-500 text-xs font-normal">
                          <strong className="text-slate-700">Recommended Phrase:</strong> "The patient is a smoker, has diabetes, compliance with medication is 95 percent, and family history score is 6."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practical Tips */}
                <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl flex gap-2">
                  <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase text-amber-800">Clinician Dictation Tip</span>
                    <p className="text-slate-600 text-xs font-normal">
                      The AI parser utilizes state-of-the-art semantic parsing. You don't need to speak in exact keys — describe the patient's record naturally just as you would dictating into an EHR chart.
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowVoiceHelp(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* Lab Report Scanner Modal Dialog */}
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[92vh] flex flex-col"
            >
              <LabReportScanner
                onApplyData={handleApplyLabReportData}
                onClose={() => setIsScannerOpen(false)}
                isModal={true}
                theme="doctor"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
