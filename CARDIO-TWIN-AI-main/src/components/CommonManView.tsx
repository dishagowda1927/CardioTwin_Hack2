import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Activity, Shield, Sparkles, ArrowRight, CheckCircle2, AlertCircle, 
  HelpCircle, Volume2, User, Flame, TrendingDown, Clock, Info, Apple, 
  Footprints, Stethoscope, ChevronRight, RotateCcw, Award, Check, Phone, 
  Lightbulb, AlertTriangle, Sliders, Play, Smile, Frown, Meh, Globe,
  FileCheck, Upload, Scan, Camera, BookOpen, Plus, Minus, Zap, Droplet
} from "lucide-react";
import { PatientData, PredictionResult } from "../types";
import { Language, LANGUAGES, translations } from "../i18n";
import LabReportScanner from "./LabReportScanner";

interface CommonManViewProps {
  initialPatientData?: PatientData;
  predictionResult?: PredictionResult | null;
  onExecuteAnalysis: (data: PatientData) => Promise<void>;
  onSwitchToSpecialistMode: () => void;
  isLoading: boolean;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function CommonManView({
  initialPatientData,
  predictionResult,
  onExecuteAnalysis,
  onSwitchToSpecialistMode,
  isLoading,
  language = "en",
  onLanguageChange
}: CommonManViewProps) {
  const t = translations[language] || translations.en;

  // Citizen Name State
  const [citizenName, setCitizenName] = useState<string>(initialPatientData?.name || "");

  // Input form state (with friendly defaults)
  const [age, setAge] = useState<number>(initialPatientData?.age || 45);
  const [sex, setSex] = useState<"male" | "female">(initialPatientData?.sex || "male");
  
  // Unit toggle for height/weight
  const [useImperial, setUseImperial] = useState<boolean>(false);
  const [feet, setFeet] = useState<number>(5);
  const [inches, setInches] = useState<number>(8);
  const [weightLbs, setWeightLbs] = useState<number>(165);

  const [heightCm, setHeightCm] = useState<number>(initialPatientData?.height || 172);
  const [weightKg, setWeightKg] = useState<number>(initialPatientData?.weight || 75);

  // Blood Pressure: either exact or friendly estimate
  const [bpKnown, setBpKnown] = useState<"normal" | "stage1" | "stage2" | "known">("known");
  const [systolicBP, setSystolicBP] = useState<number>(initialPatientData?.systolicBP || 120);
  const [diastolicBP, setDiastolicBP] = useState<number>(initialPatientData?.diastolicBP || 80);

  // Cholesterol: either exact or friendly estimate
  const [cholKnown, setCholKnown] = useState<"normal" | "borderline" | "high" | "known">("normal");
  const [cholesterol, setCholesterol] = useState<number>(initialPatientData?.cholesterol || 190);

  // Glucose / Blood Sugar: either exact or friendly estimate
  const [glucoseKnown, setGlucoseKnown] = useState<"normal" | "pre" | "high" | "known">("normal");
  const [glucose, setGlucose] = useState<number>(initialPatientData?.glucose || 90);

  // Lifestyle habits
  const [smoking, setSmoking] = useState<boolean>(initialPatientData?.smoking || false);
  const [activityLevel, setActivityLevel] = useState<number>(initialPatientData?.physicalActivity ?? 1);
  const [hasDiabetes, setHasDiabetes] = useState<boolean>(initialPatientData?.diabetes || false);
  const [familyHeartTrouble, setFamilyHeartTrouble] = useState<boolean>((initialPatientData?.familyHistoryScore || 0) > 4);
  const [takingBpMeds, setTakingBpMeds] = useState<boolean>(initialPatientData?.hypertensionHistory || false);

  // What-If Simulation in Common Man view
  const [simWalkingGoal, setSimWalkingGoal] = useState<boolean>(false);
  const [simQuitSmoking, setSimQuitSmoking] = useState<boolean>(false);
  const [simHealthyDiet, setSimHealthyDiet] = useState<boolean>(false);
  const [simBPMeds, setSimBPMeds] = useState<boolean>(false);

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<"report" | "pathology_guide" | "action_plan" | "faq_myths" | "doctor_questions">("report");
  const [isLabScannerOpen, setIsLabScannerOpen] = useState<boolean>(false);

  // Quick Preset Profiles for immediate hassle-free loading
  const applyPresetProfile = (type: "young" | "middle" | "senior" | "reset") => {
    if (type === "young") {
      setAge(28);
      setSex("male");
      setHeightCm(175);
      setWeightKg(68);
      setBpKnown("normal");
      setSystolicBP(115);
      setDiastolicBP(75);
      setCholKnown("normal");
      setCholesterol(170);
      setGlucoseKnown("normal");
      setGlucose(85);
      setSmoking(false);
      setActivityLevel(2);
      setHasDiabetes(false);
      setFamilyHeartTrouble(false);
      setTakingBpMeds(false);
    } else if (type === "middle") {
      setAge(48);
      setSex("male");
      setHeightCm(172);
      setWeightKg(78);
      setBpKnown("stage1");
      setSystolicBP(132);
      setDiastolicBP(85);
      setCholKnown("borderline");
      setCholesterol(210);
      setGlucoseKnown("pre");
      setGlucose(105);
      setSmoking(false);
      setActivityLevel(1);
      setHasDiabetes(false);
      setFamilyHeartTrouble(true);
      setTakingBpMeds(false);
    } else if (type === "senior") {
      setAge(68);
      setSex("female");
      setHeightCm(162);
      setWeightKg(70);
      setBpKnown("stage2");
      setSystolicBP(148);
      setDiastolicBP(88);
      setCholKnown("high");
      setCholesterol(238);
      setGlucoseKnown("high");
      setGlucose(128);
      setSmoking(false);
      setActivityLevel(0);
      setHasDiabetes(true);
      setFamilyHeartTrouble(true);
      setTakingBpMeds(true);
    } else {
      setAge(45);
      setSex("male");
      setHeightCm(170);
      setWeightKg(72);
      setBpKnown("normal");
      setSystolicBP(120);
      setDiastolicBP(80);
      setCholKnown("normal");
      setCholesterol(190);
      setGlucoseKnown("normal");
      setGlucose(90);
      setSmoking(false);
      setActivityLevel(1);
      setHasDiabetes(false);
      setFamilyHeartTrouble(false);
      setTakingBpMeds(false);
    }
  };

  const handleApplyCitizenLabReport = async (extracted: PatientData, runImmediately: boolean = true) => {
    if (extracted.name) setCitizenName(extracted.name);
    if (extracted.age) setAge(extracted.age);
    if (extracted.sex) setSex(extracted.sex);
    if (extracted.height) setHeightCm(extracted.height);
    if (extracted.weight) setWeightKg(extracted.weight);
    if (extracted.systolicBP) {
      setSystolicBP(extracted.systolicBP);
      setBpKnown("known");
    }
    if (extracted.diastolicBP) setDiastolicBP(extracted.diastolicBP);
    if (extracted.cholesterol) {
      setCholesterol(extracted.cholesterol);
      setCholKnown("known");
    }
    if (extracted.glucose) {
      setGlucose(extracted.glucose);
      setGlucoseKnown("known");
    }
    if (extracted.smoking !== undefined) setSmoking(extracted.smoking);
    if (extracted.physicalActivity !== undefined) setActivityLevel(extracted.physicalActivity);
    if (extracted.diabetes !== undefined) setHasDiabetes(extracted.diabetes);
    if (extracted.hypertensionHistory !== undefined) setTakingBpMeds(extracted.hypertensionHistory);
    if (extracted.familyHistoryScore !== undefined) setFamilyHeartTrouble(extracted.familyHistoryScore > 4);

    setIsLabScannerOpen(false);

    if (runImmediately) {
      await onExecuteAnalysis(extracted);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  // Sync metric/imperial values
  useEffect(() => {
    if (useImperial) {
      const totalInches = (heightCm / 2.54);
      setFeet(Math.floor(totalInches / 12));
      setInches(Math.round(totalInches % 12));
      setWeightLbs(Math.round(weightKg * 2.20462));
    }
  }, [useImperial]);

  const handleImperialHeightChange = (ft: number, inc: number) => {
    setFeet(ft);
    setInches(inc);
    const cm = Math.round((ft * 12 + inc) * 2.54);
    setHeightCm(cm);
  };

  const handleImperialWeightChange = (lbs: number) => {
    setWeightLbs(lbs);
    const kg = Math.round(lbs / 2.20462);
    setWeightKg(kg);
  };

  // Auto calculate BMI
  const heightMeters = (heightCm || 170) / 100;
  const bmi = parseFloat(((weightKg || 70) / (heightMeters * heightMeters)).toFixed(1));
  const getBmiCategory = (b: number) => {
    if (b < 18.5) return { label: "Underweight", color: "text-amber-600 bg-amber-50" };
    if (b < 24.9) return { label: "Healthy Weight", color: "text-emerald-600 bg-emerald-50" };
    if (b < 29.9) return { label: "Slightly Overweight", color: "text-amber-600 bg-amber-50" };
    return { label: "Higher Weight Range", color: "text-rose-600 bg-rose-50" };
  };

  // Submit form for calculation
  const handleCheckMyHeart = async () => {
    let finalSystolic = systolicBP;
    let finalDiastolic = diastolicBP;
    if (bpKnown === "normal") { finalSystolic = 118; finalDiastolic = 76; }
    else if (bpKnown === "stage1") { finalSystolic = 135; finalDiastolic = 86; }
    else if (bpKnown === "stage2") { finalSystolic = 152; finalDiastolic = 94; }

    let finalChol = cholesterol;
    if (cholKnown === "normal") finalChol = 175;
    else if (cholKnown === "borderline") finalChol = 215;
    else if (cholKnown === "high") finalChol = 250;

    let finalGlucose = glucose;
    if (glucoseKnown === "normal") finalGlucose = 88;
    else if (glucoseKnown === "pre") finalGlucose = 112;
    else if (glucoseKnown === "high") finalGlucose = 138;

    const patientPayload: PatientData = {
      name: citizenName.trim() || undefined,
      age,
      sex,
      height: heightCm,
      weight: weightKg,
      systolicBP: finalSystolic,
      diastolicBP: finalDiastolic,
      cholesterol: finalChol,
      glucose: hasDiabetes ? Math.max(finalGlucose, 140) : finalGlucose,
      restingHR: activityLevel === 2 ? 62 : activityLevel === 1 ? 72 : 82,
      smoking,
      physicalActivity: activityLevel,
      diabetes: hasDiabetes,
      prevHeartDisease: false,
      hypertensionHistory: takingBpMeds,
      familyHistoryScore: familyHeartTrouble ? 7 : 2,
      medicationAdherence: 85
    };

    await onExecuteAnalysis(patientPayload);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Calculated Heart Risk
  const currentRisk = predictionResult?.overallRisk ?? 18;
  
  // Calculate estimated Heart Age
  const calculateHeartAge = () => {
    let delta = 0;
    if (currentRisk > 50) delta += 10;
    else if (currentRisk > 30) delta += 6;
    else if (currentRisk > 20) delta += 3;
    else if (currentRisk < 10) delta -= 4;

    if (smoking) delta += 5;
    if (systolicBP > 140) delta += 4;
    if (bmi > 30) delta += 3;
    if (activityLevel === 2) delta -= 3;
    if (hasDiabetes) delta += 5;

    return Math.max(18, age + delta);
  };

  const heartAge = calculateHeartAge();
  const heartAgeDifference = heartAge - age;

  // Calculate simulated risk with everyday lifestyle changes
  const calculateSimulatedRisk = () => {
    let risk = currentRisk;
    if (simWalkingGoal) risk = Math.max(3, risk * 0.82);
    if (simQuitSmoking && smoking) risk = Math.max(3, risk * 0.75);
    if (simHealthyDiet) risk = Math.max(3, risk * 0.88);
    if (simBPMeds && systolicBP > 130) risk = Math.max(3, risk * 0.80);
    return Math.round(risk);
  };

  const simulatedRisk = calculateSimulatedRisk();
  const riskReduction = currentRisk - simulatedRisk;

  // Plain English Risk Level Breakdown
  const getRiskDetails = (risk: number) => {
    if (risk < 15) {
      return {
        level: t.riskLow,
        badgeColor: "bg-emerald-500 text-white",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
        bgLight: "bg-emerald-50/70",
        icon: Smile,
        headline: t.riskLowHead,
        description: t.riskLowDesc,
        actionTip: language === "kn" 
          ? "ಹಣ್ಣು, ತರಕಾರಿ ಸೇವನೆ ಮತ್ತು ದೈನಂದಿನ ನಡಿಗೆಯನ್ನು ಮುಂದುವರಿಸಿ." 
          : language === "hi" 
          ? "ताजी सब्जियां, फल खाएं और रोजाना टहलना जारी रखें।" 
          : "Continue eating plenty of vegetables, fruits, and walking daily."
      };
    } else if (risk < 30) {
      return {
        level: t.riskMod,
        badgeColor: "bg-amber-500 text-white",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        bgLight: "bg-amber-50/70",
        icon: Meh,
        headline: t.riskModHead,
        description: t.riskModDesc,
        actionTip: language === "kn" 
          ? "ದಿನಕ್ಕೆ 25-30 ನಿಮಿಷ ನಡೆಯುವುದು ಮತ್ತು ಉಪ್ಪು ಕಡಿಮೆ ಮಾಡುವುದು ಈ ಸ್ಕೋರ್ ಅನ್ನು ಗಣನೀಯವಾಗಿ ತಗ್ಗಿಸುತ್ತದೆ." 
          : language === "hi" 
          ? "रोज 25-30 मिनट टहलने और नमक कम करने से यह स्कोर तेजी से घट सकता है।" 
          : "Walking 25-30 minutes most days and reducing salty foods can lower this score significantly."
      };
    } else {
      return {
        level: t.riskHigh,
        badgeColor: "bg-rose-500 text-white",
        textColor: "text-rose-700",
        borderColor: "border-rose-200",
        bgLight: "bg-rose-50/70",
        icon: Frown,
        headline: t.riskHighHead,
        description: t.riskHighDesc,
        actionTip: language === "kn" 
          ? "ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಕೊಲೆಸ್ಟ್ರಾಲ್ ತಪಾಸಣೆಗೆ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಲು ನಾವು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ." 
          : language === "hi" 
          ? "ब्लड प्रेशर और कोलेस्ट्रॉल की जांच के लिए डॉक्टर से मिलने की सलाह दी जाती है।" 
          : "We recommend scheduling a routine checkup with your family physician to review blood pressure and cholesterol."
      };
    }
  };

  const riskDetails = getRiskDetails(currentRisk);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Mode Banner & Welcome Header */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-50">
              <Sparkles className="w-3.5 h-3.5" />
              {t.commonManBadge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {citizenName ? `${citizenName}'s Heart Health Check` : t.commonManTitle}
            </h1>
            <p className="text-rose-100 text-sm sm:text-base font-medium leading-relaxed">
              {t.commonManSubtitle}
            </p>
          </div>

          {/* Actions & Language Switcher */}
          <div className="flex flex-col items-stretch md:items-end gap-3">
            {/* Language Selector Bar */}
            {onLanguageChange && (
              <div 
                id="commonman-language-switcher"
                className="inline-flex items-center bg-black/25 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-sm"
              >
                <div className="flex items-center gap-1 pl-2.5 pr-1.5 text-rose-100 text-xs font-bold">
                  <Globe className="w-3.5 h-3.5 text-white" />
                  <span>Language:</span>
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    id={`commonman-lang-${lang.code}`}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      language === lang.code
                        ? "bg-white text-rose-900 shadow-md font-black"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Switch to Doctor / Specialist Mode button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                id="btn-switch-specialist-mode"
                onClick={onSwitchToSpecialistMode}
                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-50 font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Stethoscope className="w-4 h-4 text-rose-600" />
                <span>{t.switchToDoctor}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Form (Simple Heart Check), Right Side Results */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Easy Question Wizard (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Heart className="w-5 h-5 fill-rose-500/20" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">{t.quickCheckTitle}</h3>
                  <p className="text-slate-400 text-xs font-normal">{t.quickCheckSubtitle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {/* Unit Toggle */}
                <button
                  type="button"
                  id="btn-unit-toggle"
                  onClick={() => setUseImperial(!useImperial)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  {useImperial ? t.unitFtLbs : t.unitCmKg}
                </button>
              </div>
            </div>

            {/* Quick Profile Presets Bar for Instant Ease of Access */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t.quickPresetsTitle || "Quick Presets"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  id="preset-young"
                  onClick={() => applyPresetProfile("young")}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all cursor-pointer text-slate-700 hover:border-slate-300"
                >
                  <span className="block text-xs font-bold leading-tight">🏃 28y Active</span>
                </button>
                <button
                  type="button"
                  id="preset-middle"
                  onClick={() => applyPresetProfile("middle")}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all cursor-pointer text-slate-700 hover:border-slate-300"
                >
                  <span className="block text-xs font-bold leading-tight">👔 48y Routine</span>
                </button>
                <button
                  type="button"
                  id="preset-senior"
                  onClick={() => applyPresetProfile("senior")}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all cursor-pointer text-slate-700 hover:border-slate-300"
                >
                  <span className="block text-xs font-bold leading-tight">👴 68y Senior</span>
                </button>
                <button
                  type="button"
                  id="preset-reset"
                  onClick={() => applyPresetProfile("reset")}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all cursor-pointer text-slate-500 hover:text-slate-700"
                >
                  <span className="block text-xs font-bold leading-tight">🔄 Reset</span>
                </button>
              </div>
            </div>

            {/* Quick Lab Report / Blood Test Scanner Callout */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white shadow-sm relative overflow-hidden border border-rose-500/30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/30 border border-rose-400/40 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4 text-rose-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Have a Lab Report / Blood Test?</h4>
                    <p className="text-[10px] text-slate-300">Scan PDF or photo to auto-fill</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-scan-report-citizen"
                  onClick={() => setIsLabScannerOpen(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Citizen Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{t.citizenNameLabel || "Full Name (Citizen / Patient)"}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="input-citizen-name"
                    placeholder={t.citizenNamePlaceholder || "e.g. Ramesh Patel / Sarah Jenkins"}
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Question 1: Age & Sex */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">{t.qAge}</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAge(prev => Math.max(18, prev - 1))}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold text-rose-600 px-1">{age}y</span>
                      <button
                        type="button"
                        onClick={() => setAge(prev => Math.min(95, prev + 1))}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="95"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">{t.qSex}</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      id="btn-sex-male"
                      onClick={() => setSex("male")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sex === "male" 
                          ? "bg-slate-900 text-white shadow-sm" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {t.male}
                    </button>
                    <button
                      type="button"
                      id="btn-sex-female"
                      onClick={() => setSex("female")}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sex === "female" 
                          ? "bg-rose-600 text-white shadow-sm" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {t.female}
                    </button>
                  </div>
                </div>
              </div>

              {/* Question 2: Height & Weight */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">{t.qHeightWeight}</label>
                
                {useImperial ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">{t.feet}</span>
                      <select
                        value={feet}
                        onChange={(e) => handleImperialHeightChange(parseInt(e.target.value), inches)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        {[4, 5, 6, 7].map(f => <option key={f} value={f}>{f} ft</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">{t.inches}</span>
                      <select
                        value={inches}
                        onChange={(e) => handleImperialHeightChange(feet, parseInt(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <option key={i} value={i}>{i} in</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">{t.pounds}</span>
                      <input
                        type="number"
                        min="70"
                        max="400"
                        value={weightLbs}
                        onChange={(e) => handleImperialWeightChange(parseInt(e.target.value) || 150)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>{t.height}:</span>
                        <span className="text-indigo-600">{heightCm} cm</span>
                      </div>
                      <input
                        type="range"
                        min="130"
                        max="210"
                        value={heightCm}
                        onChange={(e) => setHeightCm(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>{t.weight}:</span>
                        <span className="text-indigo-600">{weightKg} kg</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="160"
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* BMI indicator */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <span className="font-bold text-slate-600">{t.calculatedBmi}: {bmi}</span>
                  <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${getBmiCategory(bmi).color}`}>
                    {bmi < 18.5 ? t.bmiUnderweight : bmi < 24.9 ? t.bmiHealthy : bmi < 29.9 ? t.bmiOverweight : t.bmiHigher}
                  </span>
                </div>
              </div>

              {/* Question 3: Blood Pressure */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">{t.qBp}</label>
                  <span className="text-[10px] text-slate-400 font-medium">Top / Bottom pressure</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center">
                  <button
                    type="button"
                    onClick={() => { setBpKnown("normal"); setSystolicBP(118); setDiastolicBP(76); }}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      bpKnown === "normal" 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    120/80 (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBpKnown("stage1"); setSystolicBP(135); setDiastolicBP(86); }}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      bpKnown === "stage1" 
                        ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    135/85 (Elevated)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBpKnown("stage2"); setSystolicBP(152); setDiastolicBP(94); }}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      bpKnown === "stage2" 
                        ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    150+ (High)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBpKnown("known")}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      bpKnown === "known" 
                        ? "bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {bpKnown === "known" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-1">
                        <span>{t.bpTop}:</span>
                        <span className="text-rose-600">{systolicBP} mmHg</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="200"
                        value={systolicBP}
                        onChange={(e) => setSystolicBP(parseInt(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-1">
                        <span>{t.bpBottom}:</span>
                        <span className="text-rose-600">{diastolicBP} mmHg</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="130"
                        value={diastolicBP}
                        onChange={(e) => setDiastolicBP(parseInt(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Question 4: Cholesterol */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">Total Cholesterol</label>
                  <span className="text-[10px] text-slate-400 font-medium">Blood fat level</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center">
                  <button
                    type="button"
                    onClick={() => { setCholKnown("normal"); setCholesterol(175); }}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      cholKnown === "normal" 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    &lt; 200 (Good)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCholKnown("borderline"); setCholesterol(215); }}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      cholKnown === "borderline" 
                        ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    200-239
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCholKnown("high"); setCholesterol(250); }}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      cholKnown === "high" 
                        ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    240+ (High)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCholKnown("known")}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      cholKnown === "known" 
                        ? "bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {cholKnown === "known" && (
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-1">
                      <span>Total Cholesterol:</span>
                      <span className="text-amber-600">{cholesterol} mg/dL</span>
                    </div>
                    <input
                      type="range"
                      min="120"
                      max="350"
                      value={cholesterol}
                      onChange={(e) => setCholesterol(parseInt(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Question 5: Smoking & Exercise */}
              <div className="space-y-3 pt-1">
                <label className="text-xs font-bold text-slate-700 block">{t.qHabits}</label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 block">{t.smokeQuestion}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{t.smokeSub}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSmoking(false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !smoking ? "bg-emerald-600 text-white" : "bg-white border text-slate-600"
                        }`}
                      >
                        {t.no}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSmoking(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          smoking ? "bg-rose-600 text-white" : "bg-white border text-slate-600"
                        }`}
                      >
                        {t.yes}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 block">{t.activityQuestion}</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setActivityLevel(0)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left space-y-0.5 cursor-pointer ${
                          activityLevel === 0 ? "bg-amber-50 border-amber-500 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="block text-sm">🛋️</span>
                        <span className="block font-black text-[11px]">{t.actSedentary}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityLevel(1)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left space-y-0.5 cursor-pointer ${
                          activityLevel === 1 ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="block text-sm">🚶</span>
                        <span className="block font-black text-[11px]">{t.actModerate}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityLevel(2)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-left space-y-0.5 cursor-pointer ${
                          activityLevel === 2 ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="block text-sm">🏃</span>
                        <span className="block font-black text-[11px]">{t.actActive}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 6: Health Background Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 block">{t.qMedical}</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasDiabetes}
                      onChange={(e) => setHasDiabetes(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded accent-rose-600"
                    />
                    <span className="text-xs font-semibold text-slate-700">{t.medDiabetes}</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={familyHeartTrouble}
                      onChange={(e) => setFamilyHeartTrouble(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded accent-rose-600"
                    />
                    <span className="text-xs font-semibold text-slate-700">{t.medFamily}</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={takingBpMeds}
                      onChange={(e) => setTakingBpMeds(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded accent-rose-600"
                    />
                    <span className="text-xs font-semibold text-slate-700">{t.medBp}</span>
                  </label>
                </div>
              </div>

              {/* Main Submit Action */}
              <button
                type="button"
                id="btn-calculate-citizen-risk"
                onClick={handleCheckMyHeart}
                disabled={isLoading}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>{t.btnCalculating}</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{t.btnCheckHeart}</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* Right Column: Everyday Citizen Report, Heart Age, Action Plan & Pathology Guide (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
            <button
              id="subtab-heart-score"
              onClick={() => setActiveSubTab("report")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "report" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.tabHeartScore}</span>
            </button>
            <button
              id="subtab-pathology-guide"
              onClick={() => setActiveSubTab("pathology_guide")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "pathology_guide" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pathology Guide</span>
            </button>
            <button
              id="subtab-action-plan"
              onClick={() => setActiveSubTab("action_plan")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "action_plan" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.tabActionPlan}</span>
            </button>
            <button
              id="subtab-doctor-questions"
              onClick={() => setActiveSubTab("doctor_questions")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "doctor_questions" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.tabDoctorQuestions}</span>
            </button>
            <button
              id="subtab-faq-myths"
              onClick={() => setActiveSubTab("faq_myths")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "faq_myths" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.tabFaqMyths}</span>
            </button>
          </div>

          {/* TAB 1: Heart Score & Heart Age */}
          {activeSubTab === "report" && (
            <div className="space-y-6">
              
              {/* Primary Score & Traffic Light Card */}
              <div className={`p-6 sm:p-7 rounded-3xl border ${riskDetails.borderColor} ${riskDetails.bgLight} space-y-5 shadow-sm`}>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${riskDetails.badgeColor}`}>
                      {riskDetails.level}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                      {citizenName ? `${citizenName}'s ${riskDetails.headline}` : riskDetails.headline}
                    </h2>
                  </div>

                  <div className="text-right sm:text-right bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.tenYearRisk}</span>
                    <span className="text-3xl font-black text-slate-900">{currentRisk}%</span>
                  </div>
                </div>

                {/* Visual Traffic Light Bar */}
                <div className="space-y-1.5">
                  <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex relative">
                    <div className="w-[20%] bg-emerald-400 h-full" title="Low Risk Zone (0-20%)" />
                    <div className="w-[30%] bg-amber-400 h-full" title="Moderate Risk Zone (20-50%)" />
                    <div className="w-[50%] bg-rose-500 h-full" title="Elevated Risk Zone (50-100%)" />

                    {/* Indicator pin */}
                    <div 
                      className="absolute top-0 bottom-0 w-3 bg-slate-900 rounded-full border-2 border-white shadow-md transform -translate-x-1.5 transition-all duration-500"
                      style={{ left: `${Math.min(98, Math.max(2, currentRisk))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span className="text-emerald-700">🟢 {t.riskLow}</span>
                    <span className="text-amber-700">🟡 {t.riskMod}</span>
                    <span className="text-rose-700">🔴 {t.riskHigh}</span>
                  </div>
                </div>

                <p className="text-slate-700 text-sm font-medium leading-relaxed">
                  {riskDetails.description}
                </p>
              </div>

              {/* Heart Age Comparison Block */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{t.heartAgeTitle}</h3>
                    <p className="text-slate-400 text-xs font-normal">{t.heartAgeSubtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1 text-center sm:text-left">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.yourActualAge}</span>
                    <p className="text-3xl font-black text-slate-800">{age} <span className="text-sm font-bold text-slate-500">{t.yearsOld}</span></p>
                  </div>

                  <div className={`p-4 rounded-2xl space-y-1 text-center sm:text-left border ${
                    heartAgeDifference > 0 ? "bg-rose-50 border-rose-100 text-rose-900" : "bg-emerald-50 border-emerald-100 text-emerald-900"
                  }`}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">{t.estimatedHeartAge}</span>
                    <p className="text-3xl font-black">
                      {heartAge} <span className="text-sm font-bold opacity-80">{t.yearsOld}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {heartAgeDifference > 0 ? (
                    <span>{t.heartAgeOlderMsg.replace("{diff}", String(heartAgeDifference))}</span>
                  ) : (
                    <span>{t.heartAgeYoungerMsg}</span>
                  )}
                </div>
              </div>

              {/* Interactive "What Happens If I Change..." Simulation for Everyday Citizens */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{t.simTitle}</h3>
                      <p className="text-slate-400 text-xs font-normal">{t.simSubtitle}</p>
                    </div>
                  </div>

                  {riskReduction > 0 && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full">
                      -{riskReduction}% Risk Drop
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSimWalkingGoal(!simWalkingGoal)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      simWalkingGoal ? "bg-teal-50 border-teal-500 shadow-xs" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Footprints className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-700">{t.simWalk}</span>
                    </div>
                    {simWalkingGoal && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimQuitSmoking(!simQuitSmoking)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      simQuitSmoking ? "bg-emerald-50 border-emerald-500 shadow-xs" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700">{t.simQuitSmoke}</span>
                    </div>
                    {simQuitSmoking && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimHealthyDiet(!simHealthyDiet)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      simHealthyDiet ? "bg-amber-50 border-amber-500 shadow-xs" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Apple className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-700">{t.simDiet}</span>
                    </div>
                    {simHealthyDiet && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimBPMeds(!simBPMeds)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      simBPMeds ? "bg-indigo-50 border-indigo-500 shadow-xs" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-700">{t.medBp}</span>
                    </div>
                    {simBPMeds && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Predicted Improved Risk</span>
                    <span className="text-2xl font-black text-emerald-400">{simulatedRisk}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-300 block">
                      {riskReduction > 0 ? `You save ${riskReduction}% of your cardiac risk!` : "Toggle habits above to see improvement"}
                    </span>
                    <span className="text-[10px] text-slate-400">Small daily habits yield profound long-term protection</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Pathology & Body Metrics Explained (Simple Terminology) */}
          {activeSubTab === "pathology_guide" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-extrabold text-slate-900 text-lg">Pathology & Body Metrics Explained</h3>
                </div>
                <p className="text-slate-500 text-xs font-normal">
                  Simple, jargon-free explanations of your laboratory test numbers and what they mean for your heart.
                </p>
              </div>

              <div className="grid gap-4">
                
                {/* 1. Blood Pressure */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-black">🩸</span>
                      <h4 className="font-extrabold text-slate-800 text-sm">Blood Pressure (Systolic & Diastolic)</h4>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                      Target: &lt; 120/80 mmHg
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    <strong>What it is:</strong> The force of blood pushing against the walls of your arteries.
                    <br />
                    • <strong>Top Number (Systolic):</strong> Pressure when your heart squeezes and pumps blood out.
                    <br />
                    • <strong>Bottom Number (Diastolic):</strong> Pressure inside arteries when your heart relaxes between beats.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] font-bold">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                      🟢 120/80 (Healthy)
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                      🟡 130-139 (Elevated)
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                      🔴 140+ (High / Strained)
                    </div>
                  </div>
                </div>

                {/* 2. Cholesterol */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-black">🧈</span>
                      <h4 className="font-extrabold text-slate-800 text-sm">Total Cholesterol (Blood Fats)</h4>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                      Target: &lt; 200 mg/dL
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    <strong>What it is:</strong> A waxy, fat-like substance found in your blood cells. When levels are too high, excess cholesterol sticks to the artery walls, creating plaque deposits that narrow blood flow to the heart muscle.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] font-bold">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                      🟢 &lt; 200 mg/dL (Optimal)
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                      🟡 200-239 (Borderline)
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                      🔴 240+ (Elevated)
                    </div>
                  </div>
                </div>

                {/* 3. Fasting Glucose */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-teal-100 text-teal-700 rounded-lg text-xs font-black">🍬</span>
                      <h4 className="font-extrabold text-slate-800 text-sm">Fasting Blood Sugar (Glucose)</h4>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                      Target: 70-99 mg/dL
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    <strong>What it is:</strong> The amount of sugar circulating in your blood after not eating overnight. High sugar levels can damage blood vessel lining and stiffen arteries, doubling cardiac risk.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] font-bold">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                      🟢 70-99 mg/dL (Normal)
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                      🟡 100-125 (Pre-diabetes)
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                      🔴 126+ (High Blood Sugar)
                    </div>
                  </div>
                </div>

                {/* 4. Body Mass Index (BMI) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black">⚖️</span>
                      <h4 className="font-extrabold text-slate-800 text-sm">Body Mass Index (BMI)</h4>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                      Target: 18.5 - 24.9
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    <strong>What it is:</strong> A simple ratio of your body weight to height. Carrying excess weight increases the mechanical workload on your heart to circulate oxygen-rich blood.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] font-bold">
                    <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                      🟢 18.5 - 24.9 (Healthy)
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                      🟡 25.0 - 29.9 (Overweight)
                    </div>
                    <div className="p-2 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                      🔴 30.0+ (Higher Workload)
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Personalized Action Plan */}
          {activeSubTab === "action_plan" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">{t.actionPlanTitle}</h3>
                <p className="text-slate-500 text-xs font-normal">{t.actionPlanSubtitle}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                    <Footprints className="w-4 h-4" />
                    <span>{t.step1Title}</span>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed">{t.step1Desc}</p>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
                    <Apple className="w-4 h-4" />
                    <span>{t.step2Title}</span>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed">{t.step2Desc}</p>
                </div>

                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-xs">
                    <Shield className="w-4 h-4" />
                    <span>{t.step3Title}</span>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed">{t.step3Desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Questions to Ask Your Doctor */}
          {activeSubTab === "doctor_questions" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">{t.docQuestionsTitle}</h3>
                <p className="text-slate-500 text-xs font-normal">{t.docQuestionsSubtitle}</p>
              </div>

              <div className="space-y-3">
                {[
                  t.docQ1,
                  t.docQ2,
                  t.docQ3,
                  t.docQ4,
                  t.docQ5
                ].map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                    <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black flex-shrink-0 mt-0.5">
                      Q{idx + 1}
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Heart Myths & FAQs */}
          {activeSubTab === "faq_myths" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-lg">{t.mythsTitle}</h3>
                <p className="text-slate-500 text-xs font-normal">{t.mythsSubtitle}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded">
                      {language === "kn" ? "ತಪ್ಪು ಕಲ್ಪನೆ" : language === "hi" ? "भ्रम" : "Myth"}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800">{t.myth1}</h4>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed pl-1">
                    <strong>{language === "kn" ? "ವಾಸ್ತವ:" : language === "hi" ? "सच्चाई:" : "Fact:"}</strong> {t.fact1}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded">
                      {language === "kn" ? "ತಪ್ಪು ಕಲ್ಪನೆ" : language === "hi" ? "भ्रम" : "Myth"}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800">{t.myth2}</h4>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed pl-1">
                    <strong>{language === "kn" ? "ವಾಸ್ತವ:" : language === "hi" ? "सच्चाई:" : "Fact:"}</strong> {t.fact2}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded">
                      {language === "kn" ? "ತಪ್ಪು ಕಲ್ಪನೆ" : language === "hi" ? "भ्रम" : "Myth"}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800">{t.myth3}</h4>
                  </div>
                  <p className="text-slate-600 text-xs font-normal leading-relaxed pl-1">
                    <strong>{language === "kn" ? "ವಾಸ್ತವ:" : language === "hi" ? "सच्चाई:" : "Fact:"}</strong> {t.fact3}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Lab Report Scanner Modal for Citizens */}
      <AnimatePresence>
        {isLabScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[92vh] flex flex-col"
            >
              <LabReportScanner
                onApplyData={handleApplyCitizenLabReport}
                onClose={() => setIsLabScannerOpen(false)}
                isModal={true}
                theme="citizen"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
