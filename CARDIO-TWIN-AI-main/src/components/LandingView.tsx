import { motion } from "motion/react";
import { Heart, Activity, Brain, Shield, ArrowRight, Sparkles, CheckCircle, Database, User, Stethoscope, Globe } from "lucide-react";
import { PatientData } from "../types";
import { Language, LANGUAGES, translations } from "../i18n";

interface LandingViewProps {
  onStartAssessment: () => void;
  onStartCommonManMode?: () => void;
  onLoadSample: (type: "high" | "low" | "diabetes") => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function LandingView({ 
  onStartAssessment, 
  onStartCommonManMode, 
  onLoadSample,
  language = "en",
  onLanguageChange
}: LandingViewProps) {
  const t = translations[language] || translations.en;
  return (
    <div id="landing-container" className="relative overflow-hidden bg-slate-50 min-h-screen text-slate-800">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Floating Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10">
        {/* Banner & Language Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider animate-fade-in"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            {t.heroBadge}
          </motion.div>

          {onLanguageChange && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center bg-white/90 backdrop-blur-xs p-1 rounded-full border border-slate-200 shadow-xs"
            >
              <div className="flex items-center gap-1 pl-2 pr-1 text-slate-500 text-xs font-bold">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Language:</span>
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  id={`landing-lang-${lang.code}`}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    language === lang.code
                      ? "bg-indigo-600 text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight"
            >
              {t.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-semibold text-slate-700"
            >
              {t.heroSubTagline || "Personalized. Explainable. Interactive Cardiovascular Risk Intelligence."}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-medium"
            >
              {t.heroSubtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3.5 pt-4"
            >
              <button
                id="btn-start-citizen"
                onClick={onStartCommonManMode || onStartAssessment}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl shadow-xl shadow-rose-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>{t.btnCitizenCheck}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-start-risk"
                onClick={onStartAssessment}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-rose-400" />
                <span>{t.btnDoctorEngine}</span>
              </button>

              <button
                id="btn-explore-samples"
                onClick={() => {
                  const section = document.getElementById("demo-cases-section");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all shadow-xs hover:border-slate-300 text-sm cursor-pointer"
              >
                <span>{t.btnExploreFeatures}</span>
              </button>
            </motion.div>

            {/* Quick value props */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/80"
            >
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span>{t.valPropShap}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span>{t.valPropSim}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm col-span-2 sm:col-span-1">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span>{t.valPropMap}</span>
              </div>
            </motion.div>
          </div>

          {/* Cardiovascular Visualization Side */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
              className="w-full max-w-[400px] relative bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-rose-100/30"
            >
              {/* Pulse ECG wave animation */}
              <div className="absolute top-4 right-4 flex items-center gap-2 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5 animate-pulse text-teal-600" />
                <span>{t.ecgActive}</span>
              </div>

              {/* Heart and ECG Animation */}
              <div className="flex flex-col items-center justify-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.08, 1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="p-6 bg-red-50 rounded-full mb-6 border border-red-100 shadow-inner"
                >
                  <Heart className="w-20 h-20 text-red-500 fill-red-500" />
                </motion.div>

                {/* Simulated ECG Plot */}
                <div className="w-full h-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative flex items-center mb-6">
                  <svg viewBox="0 0 400 100" className="w-full h-full text-teal-500 stroke-2 fill-none">
                    <path d="M 0 50 L 50 50 L 70 50 L 80 20 L 95 85 L 110 50 L 130 50 L 200 50 L 220 50 L 230 10 L 245 90 L 260 50 L 280 50 L 350 50 L 370 50 L 380 20 L 395 85 L 400 50" className="ecg-path" />
                  </svg>
                  {/* Sweep scan indicator */}
                  <div className="absolute inset-y-0 right-0 left-0 bg-gradient-to-r from-transparent to-white/40 animate-sweep" />
                </div>

                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span>{t.anomalyDetection}</span>
                    <span className="font-semibold text-teal-600">{t.safeMetric}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span>{t.xgbClassifier}</span>
                    <span className="font-semibold text-rose-600">{t.rocAucMetric}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{t.xaiEngine}</span>
                    <span className="font-semibold text-rose-600">{t.shapCalibrated}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Explore AI Features (Demo cases) Section */}
        <div id="demo-cases-section" className="mt-32 pt-16 border-t border-slate-200">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {t.demoCasesHeading}
            </h2>
            <p className="text-slate-600 text-lg">
              {t.demoCasesSub}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Case 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white border border-slate-200/80 hover:border-rose-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 text-xs font-semibold">{t.caseHighRiskBadge}</span>
                  <Database className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{t.caseHighTitle}</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {t.caseHighDesc}
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Systolic BP:</span> <span className="font-semibold text-slate-700">152 mmHg</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Cholesterol:</span> <span className="font-semibold text-slate-700">258 mg/dL</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Smoking Status:</span> <span className="font-semibold text-red-600">Active Smoker</span></div>
                </div>
              </div>
              <button
                id="btn-load-high-risk"
                onClick={() => onLoadSample("high")}
                className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-rose-50 text-rose-600 font-semibold rounded-lg border border-slate-200 hover:border-rose-100 transition-colors text-sm cursor-pointer"
              >
                {t.launchDashboard} ({t.caseHighRiskBadge})
              </button>
            </motion.div>

            {/* Case 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white border border-slate-200/80 hover:border-teal-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-700 text-xs font-semibold">{t.caseLowRiskBadge}</span>
                  <Database className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{t.caseLowTitle}</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {t.caseLowDesc}
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Systolic BP:</span> <span className="font-semibold text-slate-700">112 mmHg</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Cholesterol:</span> <span className="font-semibold text-slate-700">160 mg/dL</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Smoking Status:</span> <span className="font-semibold text-teal-600">Non-Smoker</span></div>
                </div>
              </div>
              <button
                id="btn-load-low-risk"
                onClick={() => onLoadSample("low")}
                className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-teal-50 text-teal-600 font-semibold rounded-lg border border-slate-200 hover:border-teal-100 transition-colors text-sm cursor-pointer"
              >
                {t.launchDashboard} ({t.caseLowRiskBadge})
              </button>
            </motion.div>

            {/* Case 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white border border-slate-200/80 hover:border-orange-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-orange-50 text-orange-700 text-xs font-semibold">{t.caseDiabetesBadge}</span>
                  <Database className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{t.caseDiabetesTitle}</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {t.caseDiabetesDesc}
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Diabetes Status:</span> <span className="font-semibold text-slate-700">Clinical Diabetes</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Glucose:</span> <span className="font-semibold text-slate-700">145 mg/dL</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Systolic BP:</span> <span className="font-semibold text-slate-700">144 mmHg</span></div>
                </div>
              </div>
              <button
                id="btn-load-diabetes-risk"
                onClick={() => onLoadSample("diabetes")}
                className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-orange-50 text-orange-600 font-semibold rounded-lg border border-slate-200 hover:border-orange-100 transition-colors text-sm cursor-pointer"
              >
                {t.launchDashboard} ({t.caseDiabetesBadge})
              </button>
            </motion.div>
          </div>
        </div>

        {/* Strict Medical Disclaimer at the bottom of the Landing Page */}
        <div className="mt-20 p-5 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-center text-xs sm:text-sm max-w-4xl mx-auto shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-1.5 font-bold">
            <Shield className="w-4.5 h-4.5 text-amber-600" />
            <span>CLINICAL DECISION-SUPPORT NOTICE</span>
          </div>
          <p>
            This platform provides AI-generated decision-support predictions and educational insights only. It is not a medical diagnosis or substitute for professional healthcare advice. Always consult with a qualified medical professional for diagnosis or treatment plans.
          </p>
        </div>
      </div>
    </div>
  );
}
