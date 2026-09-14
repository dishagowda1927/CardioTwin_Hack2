export type Language = "en" | "kn" | "hi";

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" }
];

export const translations = {
  en: {
    // Header & Nav
    appName: "CardioTwin AI",
    tagline: "Digital Cardiovascular Engine",
    online: "Online",
    modelOnline: "Model Online",
    citizenMode: "Citizen",
    doctorMode: "Doctor",
    switchToDoctor: "Switch to Doctor Mode",
    switchToCitizen: "Switch to Citizen Mode",
    askHeartAi: "Ask Heart AI",
    navHome: "Home",
    navMyHeart: "My Heart Health",
    navClinicalInput: "Clinical Input",
    navDashboard: "AI Dashboard",
    navCvdLibrary: "Heart Guide & Library",
    navRiskMap: "Cardiovascular Risk Map",
    navAiChat: "AI Consult Chat",
    navEhrProtocols: "EHR & FHIR",
    navArchitecture: "Architecture",
    navTechStack: "Tech Stack",

    // Landing
    heroBadge: "Decision-Support Intelligence Platform",
    heroTitle: "🫀 CardioTwin AI",
    heroSubTagline: "Personalized. Explainable. Interactive Cardiovascular Risk Intelligence.",
    heroSubtitle: "CardioTwin AI predicts personalized cardiovascular risk, explains the factors behind the prediction, and simulates how hypothetical changes in selected inputs affect the model's estimated risk.",
    btnCitizenCheck: "Citizen Heart Check (Simple)",
    btnDoctorEngine: "Doctor / Specialist Engine",
    btnExploreFeatures: "Explore Features",
    valPropShap: "Explainable SHAP AI",
    valPropSim: "What-If Simulator",
    valPropMap: "Multi-CVD Risk Map",
    ecgActive: "ECG ACTIVE",
    anomalyDetection: "ANOMALY DETECTION",
    safeMetric: "ISOLATION FOREST SAFE",
    xgbClassifier: "XGBOOST CLASSIFIER",
    rocAucMetric: "ROC-AUC 0.941",
    xaiEngine: "EXPLAINABLE AI ENGINE",
    shapCalibrated: "SHAP CALIBRATED",
    demoCasesHeading: "⚡ Explore Clinical Patient Phenotypes",
    demoCasesSub: "CardioTwin AI identifies similar profiles and predicts tailored cardiovascular outcomes. Choose one of our pre-calibrated sample cases below to load the full explainable model dashboard instantly.",
    caseHighRiskBadge: "🔴 HIGH CLINICAL RISK",
    caseHighTitle: "Case A: Complex Metabolic Risk",
    caseHighDesc: "54 y/o active smoker with elevated systolic blood pressure (152 mmHg), high cholesterol (258 mg/dL), and a sedentary lifestyle.",
    caseLowRiskBadge: "🟢 LOW CLINICAL RISK",
    caseLowTitle: "Case B: Highly Fit Athlete",
    caseLowDesc: "34 y/o highly active female with optimal resting blood pressure (112 mmHg), low cholesterol (160 mg/dL), and excellent BMI.",
    caseDiabetesBadge: "🟡 DIABETES & CARDIO CO-RISK",
    caseDiabetesTitle: "Case C: Metabolic Syndrome",
    caseDiabetesDesc: "48 y/o with diagnosed diabetes, elevated fasting glucose, moderate blood pressure (138 mmHg), and family cardiovascular history.",
    launchDashboard: "Launch Dashboard",

    // Common Man View
    commonManBadge: "Everyday Citizen & Patient Mode",
    commonManTitle: "My Heart Health Guide 🫀",
    commonManSubtitle: "No confusing medical jargon or complex charts. Just clear answers, your estimated Heart Age, and simple everyday steps to stay healthy.",
    
    // Quick Presets & Name
    citizenNameLabel: "Citizen / Full Name",
    citizenNamePlaceholder: "e.g., Rajesh Kumar",
    quickPresetsTitle: "Quick Profile Presets",
    presetYoung: "Young & Active (28 yrs)",
    presetMiddle: "Middle Age Routine (48 yrs)",
    presetSenior: "Senior Heart Check (68 yrs)",
    presetReset: "Reset All",
    
    // Quick Heart Check
    quickCheckTitle: "Quick Heart Check",
    quickCheckSubtitle: "Answer a few simple everyday questions.",
    unitFtLbs: "Using Ft / Lbs",
    unitCmKg: "Using Cm / Kg",
    
    qAge: "1. Your Age",
    qSex: "Biological Sex",
    male: "Male",
    female: "Female",
    
    qHeightWeight: "2. Height & Body Weight",
    height: "Height",
    weight: "Weight",
    feet: "Feet",
    inches: "Inches",
    pounds: "Pounds (lbs)",
    calculatedBmi: "Calculated BMI",
    
    bmiUnderweight: "Underweight",
    bmiHealthy: "Healthy Weight",
    bmiOverweight: "Slightly Overweight",
    bmiHigher: "Higher Weight Range",
    
    qBp: "3. Blood Pressure (Top / Bottom number)",
    bpNormal: "Normal (120/80)",
    bpHigh: "High (140+)",
    bpExact: "I have exact numbers",
    bpTop: "Top Number (Systolic)",
    bpBottom: "Bottom Number (Diastolic)",

    qCholGlucose: "4. Blood Fat & Sugar Levels",
    cholesterolLabel: "Total Cholesterol (Blood Fat)",
    glucoseLabel: "Blood Sugar (Glucose)",
    cholNormal: "Normal (< 200)",
    cholBorderline: "Borderline (200-239)",
    cholHigh: "High (240+)",
    glucoseNormal: "Normal (70-99)",
    glucosePre: "Pre-Diabetes (100-125)",
    glucoseHigh: "High / Diabetes (126+)",
    
    qHabits: "5. Daily Habits",
    smokeQuestion: "Do you smoke cigarettes or tobacco?",
    smokeSub: "Includes regular vaping or smoking.",
    yes: "Yes",
    no: "No",
    activityQuestion: "How active are you in a typical week?",
    actSedentary: "Rarely / Sitting",
    actModerate: "Moderate Walk",
    actActive: "Active / Sports",
    
    qMedical: "6. Medical Background",
    medDiabetes: "Diagnosed with Diabetes or High Blood Sugar",
    medFamily: "Parents or Siblings had heart attack / stroke before age 60",
    medBp: "Taking Blood Pressure or Cholesterol Medication",
    
    btnCheckHeart: "Check My Heart Health Score",
    btnCalculating: "Calculating Your Heart Score...",

    // Tabs
    tabHeartScore: "Heart Score & Age",
    tabPathology: "Body Metrics Explained",
    tabActionPlan: "3-Step Action Plan",
    tabDoctorQuestions: "Questions for Doctor",
    tabFaqMyths: "Heart Myths & FAQs",

    // Results & Heart Age
    tenYearRisk: "10-Year Heart Risk",
    riskLow: "Low Risk (0-20%)",
    riskMod: "Moderate (20-50%)",
    riskHigh: "Elevated (50%+)",
    
    heartAgeTitle: "Your Estimated Heart Age",
    heartAgeSubtitle: "How old your cardiovascular system behaves compared to your actual birthday.",
    yourActualAge: "Your Actual Age",
    estimatedHeartAge: "Estimated Heart Age",
    yearsOld: "years old",
    heartAgeOlderMsg: "Your heart is acting {diff} years older than your actual age. Doing the simple steps below can bring it right back down!",
    heartAgeYoungerMsg: "Great news! Your estimated heart age matches or is younger than your chronological age.",
    
    // Simulator
    simTitle: "\"What If I Change My Routine?\" Simulator",
    simSubtitle: "Check how simple habit improvements immediately lower your risk.",
    simWalk: "Walk 30 minutes every day 🚶",
    simWalkSub: "Improves circulation and lowers resting pulse.",
    simQuitSmoke: "Quit Smoking Tobacco 🚭",
    simQuitSmokeSub: "Immediate reduction in arterial inflammation.",
    simDiet: "Cut Processed Salt & Eat Fresh Veggies 🥗",
    simDietSub: "Helps maintain smooth blood pressure levels.",
    projectedRisk: "Projected New Risk",
    potentialDrop: "Potential Risk Drop!",
    lifeBenefit: "Life Benefit",
    bringsAgeDown: "Brings Heart Age down to ~{age} yrs",

    // Action plan
    actionPlanTitle: "Your 3-Step Daily Heart Action Plan",
    actionPlanSubtitle: "Practical, realistic steps you can start doing today without buying expensive equipment.",
    step1Title: "Move for 30 Minutes (Even in 10-min bursts)",
    step1Desc: "You don't need intense gym workouts. A brisk morning walk, taking the stairs, or doing garden work for 30 minutes a day trains your heart muscle and brings resting pulse down.",
    step2Title: "The \"Half-Plate Veggie\" Rule & Salt Watch",
    step2Desc: "Try filling half of your lunch or dinner plate with colorful vegetables or salads before rice/bread. Also, skip extra table salt and packaged chips to give your blood vessels an instant break.",
    step3Title: "Check Your Blood Pressure Once a Month",
    step3Desc: "High blood pressure is called a \"silent condition\" because you can feel completely fine while it works against your arteries. Stop by any pharmacy or use a simple home monitor once a month.",
    emergencyAlertTitle: "When to Call Emergency Services (108 / 911 / Local EMS)",
    emergencyAlertDesc: "Seek immediate medical care if you experience: sudden heavy chest pressure/tightness, pain radiating to your left arm or jaw, unexplained cold sweats, or sudden difficulty breathing.",

    // Doctor Questions
    docQuestionsTitle: "Questions for Your Next Doctor Visit",
    docQuestionsSubtitle: "Take this cheat sheet to your clinic so your doctor can give you personalized medical care.",
    docQ1: "What is my target healthy Blood Pressure range for my age?",
    docQ2: "When was my last lipid panel (cholesterol) test, and should we recheck it?",
    docQ3: "Are there any prescription adjustments or supplements recommended for my heart?",
    docQ4: "Is it safe for me to start brisk jogging or higher-intensity exercise?",
    docQ5: "How does my family medical history affect my long-term cardiovascular risks?",

    // Myths & FAQs
    mythsTitle: "Heart Health Myths vs. Facts",
    mythsSubtitle: "Clear the confusion with scientifically verified cardiac facts.",
    myth1: "MYTH: \"I feel completely healthy and energetic, so my blood pressure must be fine.\"",
    fact1: "FACT: High blood pressure often has zero symptoms until it damages vessels. Always check it regularly with a cuff.",
    myth2: "MYTH: \"Heart trouble only happens to elderly people.\"",
    fact2: "FACT: Plaque buildup begins early in adult life. Healthy diet and movement in your 20s, 30s, and 40s protect your future.",
    myth3: "MYTH: \"I take heart medication, so I can eat whatever junk food I want.\"",
    fact3: "FACT: Medications manage risk but cannot undo the continuous oxidative stress and inflammation from heavy ultra-processed foods.",

    // Voice assistant
    voiceTitle: "Spoken Heart Summary",
    voiceSubtitle: "Listen in Everyday Plain English",
    listenTts: "Listen (TTS)",
    pauseTts: "Pause TTS",
    resumeTts: "Resume",

    // Risk details headlines
    riskLowHead: "Your heart appears to be in great shape!",
    riskLowDesc: "Your risk of serious heart troubles over the next 10 years is very low. Keep up your healthy lifestyle routines!",
    riskModHead: "Your heart has some areas we can easily improve.",
    riskModDesc: "A few factors like blood pressure, weight, or activity are putting mild stress on your heart. Simple everyday habit changes can protect you.",
    riskHighHead: "Your heart needs attention and care.",
    riskHighDesc: "Multiple risk factors are increasing the workload on your cardiovascular system. Taking action now with your doctor can prevent future emergencies."
  },

  kn: {
    // Header & Nav
    appName: "ಕಾರ್ಡಿಯೋಟ್ವಿನ್ ಎಐ (CardioTwin AI)",
    tagline: "ಡಿಜಿಟಲ್ ಹೃದಯ ಆರೋಗ್ಯ ಇಂಜಿನ್",
    online: "ಆನ್‌ಲೈನ್",
    modelOnline: "ಮಾದರಿ ಆನ್‌ಲೈನ್",
    citizenMode: "ನಾಗರಿಕ",
    doctorMode: "ವೈದ್ಯರು",
    switchToDoctor: "ವೈದ್ಯರ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸಿ",
    switchToCitizen: "ನಾಗರಿಕ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸಿ",
    askHeartAi: "ಹೃದಯ AI ಅನ್ನು ಕೇಳಿ",
    navHome: "ಮುಖಪುಟ",
    navMyHeart: "ನನ್ನ ಹೃದಯ ಆರೋಗ್ಯ",
    navClinicalInput: "ವೈದ್ಯಕೀಯ ಇನ್ಪುಟ್",
    navDashboard: "AI ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    navCvdLibrary: "ಹೃದಯ ಮಾರ್ಗದರ್ಶಿ & ಗ್ರಂಥಾಲಯ",
    navRiskMap: "ಹೃದಯ ಅಪಾಯ ನಕ್ಷೆ",
    navAiChat: "AI ಸಮಾಲೋಚನೆ ಚಾಟ್",
    navArchitecture: "ಆರ್ಕಿಟೆಕ್ಚರ್",
    navTechStack: "ತಂತ್ರಜ್ಞಾನ ಮಾಹಿತಿ",

    // Landing
    heroBadge: "ನಿರ್ಧಾರ-ಬೆಂಬಲ ಇಂಟೆಲಿಜೆನ್ಸ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
    heroTitle: "🫀 ಕಾರ್ಡಿಯೋಟ್ವಿನ್ AI (CardioTwin)",
    heroSubTagline: "ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ. ವಿವರಣಾತ್ಮಕ. ಸಂವಾದಾತ್ಮಕ ಹೃದಯ ಅಪಾಯ ಇಂಟೆಲಿಜೆನ್ಸ್.",
    heroSubtitle: "ಕಾರ್ಡಿಯೋಟ್ವಿನ್ AI ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹೃದಯ ರೋಗದ ಅಪಾಯವನ್ನು ಮುನ್ಸೂಚಿಸುತ್ತದೆ, ಪ್ರಮುಖ ಕಾರಣಗಳನ್ನು ವಿವರಿಸುತ್ತದೆ ಮತ್ತು ಜೀವನಶೈಲಿ ಬದಲಾವಣೆಗಳಿಂದ ಅಪಾಯ ಹೇಗೆ ಕಡಿಮೆಯಾಗುತ್ತದೆ ಎಂಬುದನ್ನು ಸಿಮ್ಯುಲೇಟ್ ಮಾಡುತ್ತದೆ.",
    btnCitizenCheck: "ನಾಗರಿಕ ಹೃದಯ ತಪಾಸಣೆ (ಸುಲಭ)",
    btnDoctorEngine: "ವೈದ್ಯರು / ತಜ್ಞರ ಇಂಜಿನ್",
    btnExploreFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    valPropShap: "ವಿವರಣಾತ್ಮಕ SHAP AI",
    valPropSim: "ಜೀವನಶೈಲಿ ಸಿಮ್ಯುಲೇಟರ್",
    valPropMap: "ಬಹು-CVD ಅಪಾಯ ನಕ್ಷೆ",
    ecgActive: "ECG ಸಕ್ರಿಯವಾಗಿದೆ",
    anomalyDetection: "ಅಸಹಜತೆ ಪತ್ತೆ",
    safeMetric: "ಐಸೋಲೇಶನ್ ಫಾರೆಸ್ಟ್ ಸುರಕ್ಷಿತ",
    xgbClassifier: "XGBOOST ವರ್ಗೀಕರಣ",
    rocAucMetric: "ROC-AUC 0.941",
    xaiEngine: "ವಿವರಣಾತ್ಮಕ AI ಇಂಜಿನ್",
    shapCalibrated: "SHAP ಮಾಪನಾಂಕ ನಿರ್ಣಯ",
    demoCasesHeading: "⚡ ಕ್ಲಿನಿಕಲ್ ರೋಗಿಗಳ ಮಾದರಿಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    demoCasesSub: "ಕಾರ್ಡಿಯೋಟ್ವಿನ್ AI ಒಂದೇ ರೀತಿಯ ಪ್ರೊಫೈಲ್‌ಗಳನ್ನು ಗುರುತಿಸುತ್ತದೆ ಮತ್ತು ನಿಖರ ಫಲಿತಾಂಶಗಳನ್ನು ನೀಡುತ್ತದೆ. ವಿವರಣಾತ್ಮಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲು ಕೆಳಗಿನ ಮಾದರಿ ಕೇಸ್‌ಗಳನ್ನು ಆರಿಸಿ.",
    caseHighRiskBadge: "🔴 ಅಧಿಕ ಕ್ಲಿನಿಕಲ್ ಅಪಾಯ",
    caseHighTitle: "ಕೇಸ್ A: ಸಂಕೀರ್ಣ ಮೆಟಾಬಾಲಿಕ್ ಅಪಾಯ",
    caseHighDesc: "54 ವರ್ಷದ ಸಕ್ರಿಯ ಧೂಮಪಾನಿ, ಅಧಿಕ ಸಿಸ್ಟೊಲಿಕ್ ರಕ್ತದೊತ್ತಡ (152 mmHg), ಹೆಚ್ಚಿನ ಕೊಲೆಸ್ಟ್ರಾಲ್ (258 mg/dL).",
    caseLowRiskBadge: "🟢 ಕಡಿಮೆ ಕ್ಲಿನಿಕಲ್ ಅಪಾಯ",
    caseLowTitle: "ಕೇಸ್ B: ಅತ್ಯಂತ ಸದೃಢ ಕ್ರೀಡಾಪಟು",
    caseLowDesc: "34 ವರ್ಷದ ಸಕ್ರಿಯ ಮಹಿಳೆ, ಅತ್ಯುತ್ತಮ ವಿಶ್ರಾಂತಿ ರಕ್ತದೊತ್ತಡ (112 mmHg), ಕಡಿಮೆ ಕೊಲೆಸ್ಟ್ರಾಲ್ (160 mg/dL).",
    caseDiabetesBadge: "🟡 ಮಧುಮೇಹ & ಹೃದಯ ಅಪಾಯ",
    caseDiabetesTitle: "ಕೇಸ್ C: ಮೆಟಾಬಾಲಿಕ್ ಸಿಂಡ್ರೋಮ್",
    caseDiabetesDesc: "48 ವರ್ಷದ ಮಧುಮೇಹ ರೋಗಿ, ಅಧಿಕ ರಕ್ತದ ಸಕ್ಕರೆ, ಮಧ್ಯಮ ರಕ್ತದೊತ್ತಡ (138 mmHg) ಮತ್ತು ಕೌಟುಂಬಿಕ ಹಿನ್ನೆಲೆ.",
    launchDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",

    // Common Man View
    commonManBadge: "ಸಾಮಾನ್ಯ ನಾಗರಿಕ ಮತ್ತು ರೋಗಿ ಮೋಡ್",
    commonManTitle: "ನನ್ನ ಹೃದಯ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶಿ 🫀",
    commonManSubtitle: "ಗೊಂದಲಮಯ ವೈದ್ಯಕೀಯ ಪದಗಳಿಲ್ಲ, ಸಂಕೀರ್ಣ ಚಾರ್ಟ್‌ಗಳಿಲ್ಲ. ಸ್ಪಷ್ಟ ಉತ್ತರಗಳು, ನಿಮ್ಮ ಅಂದಾಜು ಹೃದಯದ ವಯಸ್ಸು (Heart Age) ಮತ್ತು ಆರೋಗ್ಯವಾಗಿರಲು ಸರಳ ದೈನಂದಿನ ಹಂತಗಳು.",
    
    // Quick Presets & Name
    citizenNameLabel: "ನಾಗರಿಕರ / ಪೂರ್ಣ ಹೆಸರು",
    citizenNamePlaceholder: "ಉದಾಹರಣೆಗೆ: ರಾಜೇಶ್ ಕುಮಾರ್",
    quickPresetsTitle: "ತ್ವರಿತ ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆಗಳು",
    presetYoung: "ಯುವ & ಸಕ್ರಿಯ (28 ವರ್ಷ)",
    presetMiddle: "ಮಧ್ಯವಯಸ್ಸಿನ ದಿನಚರಿ (48 ವರ್ಷ)",
    presetSenior: "ಹಿರಿಯ ನಾಗರಿಕರ ತಪಾಸಣೆ (68 ವರ್ಷ)",
    presetReset: "ಎಲ್ಲವನ್ನೂ ಮರುಹೊಂದಿಸಿ",
    
    // Quick Heart Check
    quickCheckTitle: "ತ್ವರಿತ ಹೃದಯ ತಪಾಸಣೆ",
    quickCheckSubtitle: "ಕೆಲವು ಸರಳ ದೈನಂದಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.",
    unitFtLbs: "ಅಡಿ / ಪೌಂಡ್ ಬಳಕೆ",
    unitCmKg: "ಸೆಂ.ಮೀ / ಕೆ.ಜಿ ಬಳಕೆ",
    
    qAge: "1. ನಿಮ್ಮ ವಯಸ್ಸು",
    qSex: "ಲಿಂಗ",
    male: "ಪುರುಷ",
    female: "ಮಹಿಳೆ",
    
    qHeightWeight: "2. ಎತ್ತರ & ದೇಹದ ತೂಕ",
    height: "ಎತ್ತರ",
    weight: "ತೂಕ",
    feet: "ಅಡಿ",
    inches: "ಇಂಚು",
    pounds: "ಪೌಂಡ್ (lbs)",
    calculatedBmi: "ಲೆಕ್ಕಹಾಕಿದ BMI",
    
    bmiUnderweight: "ಕಡಿಮೆ ತೂಕ",
    bmiHealthy: "ಆರೋಗ್ಯಕರ ತೂಕ",
    bmiOverweight: "ಸ್ವಲ್ಪ ಹೆಚ್ಚು ತೂಕ",
    bmiHigher: "ಅಧಿಕ ತೂಕದ ಶ್ರೇಣಿ",
    
    qBp: "3. ರಕ್ತದೊತ್ತಡ (ಮೇಲಿನ / ಕೆಳಗಿನ ಸಂಖ್ಯೆ)",
    bpNormal: "ಸಾಮಾನ್ಯ (120/80)",
    bpHigh: "ಹೆಚ್ಚು (140+)",
    bpExact: "ನನ್ನ ಬಳಿ ನಿಖರ ಸಂಖ್ಯೆಗಳಿವೆ",
    bpTop: "ಮೇಲಿನ ಸಂಖ್ಯೆ (ಸಿಸ್ಟೊಲಿಕ್)",
    bpBottom: "ಕೆಳಗಿನ ಸಂಖ್ಯೆ (ಡಯಾಸ್ಟೊಲಿಕ್)",

    qCholGlucose: "4. ರಕ್ತದ ಕೊಬ್ಬು ಮತ್ತು ಸಕ್ಕರೆ ಮಟ್ಟ",
    cholesterolLabel: "ಒಟ್ಟು ಕೊಲೆಸ್ಟ್ರಾಲ್ (ರಕ್ತದ ಕೊಬ್ಬು)",
    glucoseLabel: "ರಕ್ತದ ಸಕ್ಕರೆ (ಗ್ಲೂಕೋಸ್)",
    cholNormal: "ಸಾಮಾನ್ಯ (< 200)",
    cholBorderline: "ಮಧ್ಯಮ (200-239)",
    cholHigh: "ಹೆಚ್ಚು (240+)",
    glucoseNormal: "ಸಾಮಾನ್ಯ (70-99)",
    glucosePre: "ಪೂರ್ವ ಮಧುಮೇಹ (100-125)",
    glucoseHigh: "ಅಧಿಕ / ಮಧುಮೇಹ (126+)",
    
    qHabits: "5. ದೈನಂದಿನ ಅಭ್ಯಾಸಗಳು",
    smokeQuestion: "ನೀವು ಸಿಗರೇಟ್ ಅಥವಾ ತಂಬಾಕು ಸೇದುತ್ತೀರಾ?",
    smokeSub: "ನಿಯಮಿತ ಧೂಮಪಾನ ಅಥವಾ ವೇಪಿಂಗ್ ಒಳಗೊಂಡಿದೆ.",
    yes: "ಹೌದು",
    no: "ಇಲ್ಲ",
    activityQuestion: "ಸಾಮಾನ್ಯ ವಾರದಲ್ಲಿ ನಿಮ್ಮ ದೈಹಿಕ ಚಟುವಟಿಕೆ ಎಷ್ಟು?",
    actSedentary: "ಅಪರೂಪ / ಕುಳಿತುಕೊಳ್ಳುವುದು",
    actModerate: "ಮಧ್ಯಮ ನಡಿಗೆ",
    actActive: "ಸಕ್ರಿಯ / ಕ್ರೀಡೆ",
    
    qMedical: "6. ವೈದ್ಯಕೀಯ ಹಿನ್ನೆಲೆ",
    medDiabetes: "ಮಧುಮೇಹ ಅಥವಾ ಅಧಿಕ ರಕ್ತದ ಸಕ್ಕರೆ ರೋಗನಿರ್ಣಯ",
    medFamily: "ತಂದೆ-ತಾಯಿ ಅಥವಾ ಒಡಹುಟ್ಟಿದವರಿಗೆ 60 ವರ್ಷಕ್ಕಿಂತ ಮುಂಚೆ ಹೃದಯಾಘಾತ / ಪಾರ್ಶ್ವವಾಯು",
    medBp: "ರಕ್ತದೊತ್ತಡ ಅಥವಾ ಕೊಲೆಸ್ಟ್ರಾಲ್ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಾ",
    
    btnCheckHeart: "ನನ್ನ ಹೃದಯ ಆರೋಗ್ಯ ಸ್ಕೋರ್ ಪರಿಶೀಲಿಸಿ",
    btnCalculating: "ನಿಮ್ಮ ಹೃದಯ ಸ್ಕೋರ್ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...",

    // Tabs
    tabHeartScore: "ಹೃದಯ ಸ್ಕೋರ್ & ವಯಸ್ಸು",
    tabPathology: "ದೇಹದ ಮೆಟ್ರಿಕ್ಸ್ ವಿವರಣೆ",
    tabActionPlan: "3-ಹಂತದ ಕ್ರಿಯಾ ಯೋಜನೆ",
    tabDoctorQuestions: "ವೈದ್ಯರಿಗೆ ಕೇಳಬೇಕಾದ ಪ್ರಶ್ನೆಗಳು",
    tabFaqMyths: "ಹೃದಯದ ತಪ್ಪು ಕಲ್ಪನೆಗಳು & ಸತ್ಯಗಳು",

    // Results & Heart Age
    tenYearRisk: "10-ವರ್ಷದ ಹೃದಯ ಅಪಾಯ",
    riskLow: "ಕಡಿಮೆ ಅಪಾಯ (0-20%)",
    riskMod: "ಮಧ್ಯಮ ಅಪಾಯ (20-50%)",
    riskHigh: "ಹೆಚ್ಚಿನ ಅಪಾಯ (50%+)",
    
    heartAgeTitle: "ನಿಮ್ಮ ಅಂದಾಜು ಹೃದಯದ ವಯಸ್ಸು",
    heartAgeSubtitle: "ನಿಮ್ಮ ನೈಜ ವಯಸ್ಸಿಗೆ ಹೋಲಿಸಿದರೆ ನಿಮ್ಮ ಹೃದಯದ ರಕ್ತನಾಳ ವ್ಯವಸ್ಥೆ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.",
    yourActualAge: "ನಿಮ್ಮ ನಿಜವಾದ ವಯಸ್ಸು",
    estimatedHeartAge: "ಅಂದಾಜು ಹೃದಯದ ವಯಸ್ಸು",
    yearsOld: "ವರ್ಷಗಳು",
    heartAgeOlderMsg: "ನಿಮ್ಮ ಹೃದಯವು ನಿಮ್ಮ ನೈಜ ವಯಸ್ಸಿಗಿಂತ {diff} ವರ್ಷ ಹಳೆಯದಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ. ಕೆಳಗಿನ ಸರಳ ಹಂತಗಳನ್ನು ಅನುಸರಿಸುವ ಮೂಲಕ ಅದನ್ನು ಸರಿಪಡಿಸಬಹುದು!",
    heartAgeYoungerMsg: "ಉತ್ತಮ ಸುದ್ದಿ! ನಿಮ್ಮ ಅಂದಾಜು ಹೃದಯದ ವಯಸ್ಸು ನಿಮ್ಮ ನೈಜ ವಯಸ್ಸಿಗೆ ಸಮನಾಗಿದೆ ಅಥವಾ ಕಿರಿಯದಾಗಿದೆ.",
    
    // Simulator
    simTitle: "\"ನನ್ನ ಅಭ್ಯಾಸಗಳನ್ನು ಬದಲಾಯಿಸಿದರೆ ಏನಾಗುತ್ತದೆ?\" ಸಿಮ್ಯುಲೇಟರ್",
    simSubtitle: "ಸರಳ ಅಭ್ಯಾಸ ಸುಧಾರಣೆಗಳು ನಿಮ್ಮ ಅಪಾಯವನ್ನು ತಕ್ಷಣ ಹೇಗೆ ಕಡಿಮೆ ಮಾಡುತ್ತವೆ ಎಂಬುದನ್ನು ಪರಿಶೀಲಿಸಿ.",
    simWalk: "ಪ್ರತಿದಿನ 30 ನಿಮಿಷ ನಡೆಯಿರಿ 🚶",
    simWalkSub: "ರಕ್ತಪರಿಚಲನೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ ಮತ್ತು ನಾಡಿಮಿಡಿತವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.",
    simQuitSmoke: "ತಂಬಾಕು ಧೂಮಪಾನ ತ್ಯಜಿಸಿ 🚭",
    simQuitSmokeSub: "ರಕ್ತನಾಳಗಳ ಉರಿಯೂತವನ್ನು ತಕ್ಷಣ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.",
    simDiet: "ಸಂಸ್ಕರಿಸಿದ ಉಪ್ಪು ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ತಾಜಾ ತರಕಾರಿ ತಿನ್ನಿ 🥗",
    simDietSub: "ರಕ್ತದೊತ್ತಡವನ್ನು ಸಮತೋಲನದಲ್ಲಿಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    projectedRisk: "ನಿರೀಕ್ಷಿತ ಹೊಸ ಅಪಾಯ",
    potentialDrop: "ಸಂಭಾವ್ಯ ಅಪಾಯ ಇಳಿಕೆ!",
    lifeBenefit: "ಜೀವನದ ಲಾಭ",
    bringsAgeDown: "ಹೃದಯದ ವಯಸ್ಸನ್ನು ~{age} ವರ್ಷಗಳಿಗೆ ಇಳಿಸುತ್ತದೆ",

    // Action plan
    actionPlanTitle: "ನಿಮ್ಮ 3-ಹಂತದ ದೈನಂದಿನ ಹೃದಯ ಕ್ರಿಯಾ ಯೋಜನೆ",
    actionPlanSubtitle: "ದುಬಾರಿ ಉಪಕರಣಗಳಿಲ್ಲದೆ ನೀವು ಇಂದಿನಿಂದಲೇ ಪ್ರಾರಂಭಿಸಬಹುದಾದ ವಾಸ್ತವಿಕ ಹಂತಗಳು.",
    step1Title: "30 ನಿಮಿಷಗಳ ಕಾಲ ಚಲಿಸಿ (10 ನಿಮಿಷಗಳ ವಿರಾಮಗಳಲ್ಲೂ ಮಾಡಬಹುದು)",
    step1Desc: "ನಿಮಗೆ ಕಠಿಣ ಜಿಮ್ ವರ್ಕೌಟ್ ಅಗತ್ಯವಿಲ್ಲ. ದಿನಕ್ಕೆ 30 ನಿಮಿಷಗಳ ಚುರುಕಾದ ಮುಂಜಾನೆಯ ನಡಿಗೆ, ಮೆಟ್ಟಿಲುಗಳನ್ನು ಹತ್ತುವುದು ನಿಮ್ಮ ಹೃದಯದ ಸ್ನಾಯುವನ್ನು ಬಲಪಡಿಸುತ್ತದೆ.",
    step2Title: "\"ಅರ್ಧ-ಪ್ಲೇಟ್ ತರಕಾರಿ\" ನಿಯಮ ಮತ್ತು ಉಪ್ಪಿನ ನಿಯಂತ್ರಣ",
    step2Desc: "ಅನ್ನ ಅಥವಾ ರೊಟ್ಟಿಯ ಮೊದಲು ನಿಮ್ಮ ಊಟದ ತಟ್ಟೆಯ ಅರ್ಧಭಾಗವನ್ನು ವರ್ಣರಂಜಿತ ತರಕಾರಿಗಳು ಅಥವಾ ಸಲಾಡ್‌ನಿಂದ ತುಂಬಲು ಪ್ರಯತ್ನಿಸಿ. ಮೇಲಿನಿಂದ ಉಪ್ಪು ಹಾಕುವುದನ್ನು ತಪ್ಪಿಸಿ.",
    step3Title: "ತಿಂಗಳಿಗೊಮ್ಮೆ ನಿಮ್ಮ ರಕ್ತದೊತ್ತಡವನ್ನು ಪರೀಕ್ಷಿಸಿ",
    step3Desc: "ಅಧಿಕ ರಕ್ತದೊತ್ತಡವನ್ನು \"ಮೌನ ಕೊಲೆಗಾರ\" ಎಂದು ಕರೆಯಲಾಗುತ್ತದೆ ಏಕೆಂದರೆ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲದೆ ಅದು ರಕ್ತನಾಳಗಳಿಗೆ ಹಾನಿ ಮಾಡುತ್ತದೆ. ತಿಂಗಳಿಗೊಮ್ಮೆ ಪರೀಕ್ಷಿಸಿಕೊಳ್ಳಿ.",
    emergencyAlertTitle: "ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಯಾವಾಗ ಕರೆ ಮಾಡಬೇಕು (108 / ಆಸ್ಪತ್ರೆ)",
    emergencyAlertDesc: "ಎದೆಯಲ್ಲಿ ಹಠಾತ್ ಭಾರ ಅಥವಾ ಬಿಗಿತ, ಎಡಗೈ ಅಥವಾ ದವಡೆಗೆ ಹರಡುವ ನೋವು, ತಣ್ಣನೆಯ ಬೆವರು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಕಂಡುಬಂದರೆ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.",

    // Doctor Questions
    docQuestionsTitle: "ನಿಮ್ಮ ಮುಂದಿನ ವೈದ್ಯರ ಭೇಟಿಗೆ ಪ್ರಶ್ನೆಗಳು",
    docQuestionsSubtitle: "ನಿಮ್ಮ ವೈದ್ಯರ ಬಳಿಗೆ ಈ ಪ್ರಶ್ನೆಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಹೋಗಿ ಸ್ಪಷ್ಟ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    docQ1: "ನನ್ನ ವಯಸ್ಸಿಗೆ ಸೂಕ್ತವಾದ ಆರೋಗ್ಯಕರ ರಕ್ತದೊತ್ತಡದ ಗುರಿ ಏನು?",
    docQ2: "ನನ್ನ ಕೊಲೆಸ್ಟ್ರಾಲ್ (ಲಿಪಿಡ್ ಪ್ರೊಫೈಲ್) ಪರೀಕ್ಷೆಯನ್ನು ಯಾವಾಗ ಮಾಡಿಸಬೇಕು?",
    docQ3: "ನನ್ನ ಹೃದಯದ ರಕ್ಷಣೆಗೆ ಯಾವುದೇ ಔಷಧಿ ಅಥವಾ ಪೂರಕಗಳ ಅಗತ್ಯವಿದೆಯೇ?",
    docQ4: "ನಾನು ವೇಗದ ಜಾಗಿಂಗ್ ಅಥವಾ ವ್ಯಾಯಾಮ ಪ್ರಾರಂಭಿಸುವುದು ಸುರಕ್ಷಿತವೇ?",
    docQ5: "ನನ್ನ ಕುಟುಂಬದ ಹೃದಯ ರೋಗದ ಇತಿಹಾಸವು ನನ್ನ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ?",

    // Myths & FAQs
    mythsTitle: "ಹೃದಯ ಆರೋಗ್ಯದ ತಪ್ಪು ಕಲ್ಪನೆಗಳು vs ವಾಸ್ತವಗಳು",
    mythsSubtitle: "ವೈಜ್ಞಾನಿಕವಾಗಿ ದೃಢೀಕರಿಸಿದ ಸತ್ಯಗಳೊಂದಿಗೆ ಗೊಂದಲವನ್ನು ನಿವಾರಿಸಿ.",
    myth1: "ತಪ್ಪು ಕಲ್ಪನೆ: \"ನನಗೆ ತುಂಬಾ ಹುರುಪಿದೆ ಮತ್ತು ಆರೋಗ್ಯವಾಗಿದ್ದೇನೆ, ಆದ್ದರಿಂದ ರಕ್ತದೊತ್ತಡ ಸರಿಯಾಗಿರಬೇಕು.\"",
    fact1: "ವಾಸ್ತವ: ಅಧಿಕ ರಕ್ತದೊತ್ತಡವು ರಕ್ತನಾಳಗಳನ್ನು ಹಾನಿ ಮಾಡುವವರೆಗೆ ಯಾವುದೇ ಲಕ್ಷಣಗಳನ್ನು ತೋರಿಸುವುದಿಲ್ಲ. ನಿಯಮಿತವಾಗಿ ಪರೀಕ್ಷಿಸಿ.",
    myth2: "ತಪ್ಪು ಕಲ್ಪನೆ: \"ಹೃದಯ ತೊಂದರೆಗಳು ವೃದ್ಧರಿಗೆ ಮಾತ್ರ ಬರುತ್ತವೆ.\"",
    fact2: "ವಾಸ್ತವ: ರಕ್ತನಾಳಗಳಲ್ಲಿ ಕೊಬ್ಬು ಶೇಖರಣೆ ಯುವ ವಯಸ್ಸಿನಲ್ಲೇ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ. 20-40ರ ಹರೆಯದ ಉತ್ತಮ ಆಹಾರ ನಿಮ್ಮ ಭವಿಷ್ಯವನ್ನು ಕಾಪಾಡುತ್ತದೆ.",
    myth3: "ತಪ್ಪು ಕಲ್ಪನೆ: \"ನಾನು ಹೃದಯದ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ, ಆದ್ದರಿಂದ ಏನು ಬೇಕಾದರೂ ತಿನ್ನಬಹುದು.\"",
    fact3: "ವಾಸ್ತವ: ಔಷಧಿಗಳು ರಕ್ಷಣೆ ನೀಡುತ್ತವೆ ಆದರೆ ಅತಿಯಾದ ಎಣ್ಣೆ, ಉಪ್ಪು ಮತ್ತು ಸಂಸ್ಕರಿಸಿದ ಆಹಾರದ ಹಾನಿಯನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತಡೆಯಲಾರವು.",

    // Voice assistant
    voiceTitle: "ಧ್ವನಿ ರೂಪದ ಹೃದಯ ಸಾರಾಂಶ",
    voiceSubtitle: "ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಆಲಿಸಿ",
    listenTts: "ಆಲಿಸಿ (TTS)",
    pauseTts: "ವಿರಾಮಗೊಳಿಸಿ",
    resumeTts: "ಪುನರಾರಂಭಿಸಿ",

    // Risk details headlines
    riskLowHead: "ನಿಮ್ಮ ಹೃದಯ ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದೆ!",
    riskLowDesc: "ಮುಂದಿನ 10 ವರ್ಷಗಳಲ್ಲಿ ಗಂಭೀರ ಹೃದಯ ತೊಂದರೆಗಳ ಅಪಾಯವು ತುಂಬಾ ಕಡಿಮೆಯಾಗಿದೆ. ನಿಮ್ಮ ಆರೋಗ್ಯಕರ ಜೀವನಶೈಲಿಯನ್ನು ಮುಂದುವರಿಸಿ!",
    riskModHead: "ನಿಮ್ಮ ಹೃದಯದ ಆರೋಗ್ಯದಲ್ಲಿ ಸುಧಾರಣೆಗೆ ಅವಕಾಶವಿದೆ.",
    riskModDesc: "ರಕ್ತದೊತ್ತಡ ಅಥವಾ ತೂಕದಂತಹ ಕೆಲವು ಅಂಶಗಳು ಹೃದಯದ ಮೇಲೆ ಒತ್ತಡವನ್ನುಂಟುಮಾಡುತ್ತಿವೆ. ಸರಳ ದೈನಂದಿನ ಬದಲಾವಣೆಗಳು ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತವೆ.",
    riskHighHead: "ನಿಮ್ಮ ಹೃದಯಕ್ಕೆ ಹೆಚ್ಚಿನ ಗಮನ ಮತ್ತು ಆರೈಕೆ ಅಗತ್ಯವಿದೆ.",
    riskHighDesc: "ಹಲವಾರು ಅಪಾಯದ ಅಂಶಗಳು ನಿಮ್ಮ ಹೃದಯದ ಕೆಲಸದ ಹೊರೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತಿವೆ. ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ."
  },

  hi: {
    // Header & Nav
    appName: "कार्डियोट्विन एआई (CardioTwin AI)",
    tagline: "डिजिटल कार्डियोवास्कुलर इंजन",
    online: "ऑनलाइन",
    modelOnline: "मॉडल ऑनलाइन",
    citizenMode: "नागरिक",
    doctorMode: "चिकित्सक",
    switchToDoctor: "डॉक्टर मोड पर जाएं",
    switchToCitizen: "नागरिक मोड पर जाएं",
    askHeartAi: "हार्ट AI से पूछें",
    navHome: "होम",
    navMyHeart: "मेरा हृदय स्वास्थ्य",
    navClinicalInput: "क्लिनिकल इनपुट",
    navDashboard: "AI डैशबोर्ड",
    navCvdLibrary: "हृदय गाइड एवं लाइब्रेरी",
    navRiskMap: "कार्डियोवास्कुलर रिस्क मैप",
    navAiChat: "AI कंसल्ट चैट",
    navArchitecture: "आर्किटेक्चर",
    navTechStack: "तकनीकी स्टैक",

    // Landing
    heroBadge: "निर्णय-समर्थन इंटेलिजेंस प्लेटफॉर्म",
    heroTitle: "🫀 कार्डियोट्विन AI (CardioTwin)",
    heroSubTagline: "व्यक्तिगत. व्याख्यात्मक. इंटरैक्टिव कार्डियोवास्कुलर रिस्क इंटेलिजेंस।",
    heroSubtitle: "कार्डियोट्विन AI आपके व्यक्तिगत हृदय रोग जोखिम का पूर्वानुमान लगाता है, मुख्य कारणों को समझाता है और जीवनशैली में बदलाव से जोखिम कैसे कम होता है यह सिमुलेट करता है।",
    btnCitizenCheck: "नागरिक हृदय जांच (सरल)",
    btnDoctorEngine: "डॉक्टर / विशेषज्ञ इंजन",
    btnExploreFeatures: "सुविधाएं देखें",
    valPropShap: "व्याख्यात्मक SHAP AI",
    valPropSim: "जीवनशैली सिमुलेटर",
    valPropMap: "मल्टी-CVD जोखिम मानचित्र",
    ecgActive: "ECG सक्रिय है",
    anomalyDetection: "विसंगति का पता लगाना",
    safeMetric: "आइसोलेशन फॉरेस्ट सुरक्षित",
    xgbClassifier: "XGBOOST क्लासिफायर",
    rocAucMetric: "ROC-AUC 0.941",
    xaiEngine: "व्याख्यात्मक AI इंजन",
    shapCalibrated: "SHAP कैलिब्रेटेड",
    demoCasesHeading: "⚡ क्लिनिकल रोगी फेनोटाइप का अन्वेषण करें",
    demoCasesSub: "कार्डियोट्विन AI समान प्रोफाइल की पहचान करता है और सटीक परिणाम देता है। पूरा व्याख्यात्मक डैशबोर्ड लोड करने के लिए नीचे दिए गए उदाहरण केस चुनें।",
    caseHighRiskBadge: "🔴 उच्च क्लिनिकल जोखिम",
    caseHighTitle: "केस A: जटिल मेटाबोलिक जोखिम",
    caseHighDesc: "54 वर्षीय सक्रिय धूम्रपान करने वाले, बढ़ा हुआ सिस्टोलिक रक्तचाप (152 mmHg), उच्च कोलेस्ट्रॉल (258 mg/dL)।",
    caseLowRiskBadge: "🟢 कम क्लिनिकल जोखिम",
    caseLowTitle: "केस B: अत्यंत फिट एथलीट",
    caseLowDesc: "34 वर्षीय सक्रिय महिला, इष्टतम रक्तचाप (112 mmHg), कम कोलेस्ट्रॉल (160 mg/dL)।",
    caseDiabetesBadge: "🟡 डायबिटीज एवं हृदय सह-जोखिम",
    caseDiabetesTitle: "केस C: मेटाबोलिक सिंड्रोम",
    caseDiabetesDesc: "48 वर्षीय मधुमेह रोगी, बढ़ा हुआ फास्टिंग ग्लूकोज, मध्यम रक्तचाप (138 mmHg) और पारिवारिक इतिहास।",
    launchDashboard: "डैशबोर्ड लॉन्च करें",

    // Common Man View
    commonManBadge: "आम नागरिक और मरीज मोड",
    commonManTitle: "मेरा हृदय स्वास्थ्य गाइड 🫀",
    commonManSubtitle: "कोई जटिल मेडिकल शब्दावली या भारी चार्ट नहीं। केवल स्पष्ट उत्तर, आपकी अनुमानित हृदय आयु (Heart Age) और स्वस्थ रहने के आसान दैनिक उपाय।",
    
    // Quick Presets & Name
    citizenNameLabel: "नागरिक / पूरा नाम",
    citizenNamePlaceholder: "उदा., राजेश कुमार",
    quickPresetsTitle: "त्वरित प्रोफाइल चयन",
    presetYoung: "युवा एवं सक्रिय (28 वर्ष)",
    presetMiddle: "मध्यम आयु दिनचर्या (48 वर्ष)",
    presetSenior: "वरिष्ठ नागरिक जांच (68 वर्ष)",
    presetReset: "सब कुछ रीसेट करें",
    
    // Quick Heart Check
    quickCheckTitle: "त्वरित हृदय जांच",
    quickCheckSubtitle: "कुछ सरल दैनिक प्रश्नों के उत्तर दें।",
    unitFtLbs: "फीट / पाउंड का उपयोग",
    unitCmKg: "सेमी / किग्रा का उपयोग",
    
    qAge: "1. आपकी आयु",
    qSex: "लिंग",
    male: "पुरुष",
    female: "महिला",
    
    qHeightWeight: "2. ऊंचाई एवं वजन",
    height: "ऊंचाई",
    weight: "वजन",
    feet: "फीट",
    inches: "इंच",
    pounds: "पाउंड (lbs)",
    calculatedBmi: "गणना किया गया BMI",
    
    bmiUnderweight: "कम वजन",
    bmiHealthy: "स्वस्थ वजन",
    bmiOverweight: "हल्का अधिक वजन",
    bmiHigher: "उच्च वजन सीमा",
    
    qBp: "3. रक्तचाप (ऊपर / नीचे की संख्या)",
    bpNormal: "सामान्य (120/80)",
    bpHigh: "उच्च (140+)",
    bpExact: "मेरे पास सटीक संख्या है",
    bpTop: "ऊपर की संख्या (सिस्टोलिक)",
    bpBottom: "नीचे की संख्या (डायस्टोलिक)",

    qCholGlucose: "4. रक्त वसा एवं शर्करा स्तर",
    cholesterolLabel: "कुल कोलेस्ट्रॉल (रक्त वसा)",
    glucoseLabel: "रक्त शर्करा (ग्लूकोज)",
    cholNormal: "सामान्य (< 200)",
    cholBorderline: "मध्यम (200-239)",
    cholHigh: "उच्च (240+)",
    glucoseNormal: "सामान्य (70-99)",
    glucosePre: "प्री-डायबिटीज (100-125)",
    glucoseHigh: "उच्च / डायबिटीज (126+)",
    
    qHabits: "5. दैनिक आदतें",
    smokeQuestion: "क्या आप सिगरेट या तंबाकू का सेवन करते हैं?",
    smokeSub: "नियमित धूम्रपान या वेपिंग शामिल है।",
    yes: "हाँ",
    no: "नहीं",
    activityQuestion: "एक सामान्य सप्ताह में आप कितने सक्रिय रहते हैं?",
    actSedentary: "कम / बैठे रहना",
    actModerate: "मध्यम पैदल चलना",
    actActive: "सक्रिय / खेलकूद",
    
    qMedical: "6. मेडिकल पृष्ठभूमि",
    medDiabetes: "डायबिटीज या उच्च रक्त शर्करा का निदान",
    medFamily: "माता-पिता या भाई-बहन को 60 वर्ष से पहले दिल का दौरा / स्ट्रोक",
    medBp: "रक्तचाप या कोलेस्ट्रॉल की दवा ले रहे हैं",
    
    btnCheckHeart: "मेरा हृदय स्वास्थ्य स्कोर जांचें",
    btnCalculating: "हृदय स्कोर की गणना की जा रही है...",

    // Tabs
    tabHeartScore: "हार्ट स्कोर एवं आयु",
    tabPathology: "शरीर मेट्रिक्स स्पष्टीकरण",
    tabActionPlan: "3-चरणीय कार्य योजना",
    tabDoctorQuestions: "डॉक्टर से पूछने योग्य प्रश्न",
    tabFaqMyths: "हृदय संबंधी भ्रम और तथ्य",

    // Results & Heart Age
    tenYearRisk: "10-वर्षीय हृदय जोखिम",
    riskLow: "कम जोखिम (0-20%)",
    riskMod: "मध्यम जोखिम (20-50%)",
    riskHigh: "उच्च जोखिम (50%+)",
    
    heartAgeTitle: "आपकी अनुमानित हृदय आयु",
    heartAgeSubtitle: "आपकी वास्तविक उम्र की तुलना में आपका कार्डियोवास्कुलर सिस्टम कैसे काम कर रहा है।",
    yourActualAge: "आपकी वास्तविक आयु",
    estimatedHeartAge: "अनुमानित हृदय आयु",
    yearsOld: "वर्ष",
    heartAgeOlderMsg: "आपका दिल आपकी वास्तविक उम्र से {diff} वर्ष अधिक पुराना व्यवहार कर रहा है। नीचे दिए गए आसान कदमों से इसे घटाया जा सकता है!",
    heartAgeYoungerMsg: "बधाई हो! आपकी अनुमानित हृदय आयु आपकी वास्तविक आयु के बराबर या उससे कम है।",
    
    // Simulator
    simTitle: "\"अगर मैं आदतें बदलूं तो क्या होगा?\" सिमुलेटर",
    simSubtitle: "देखें कि आसान दैनिक सुधार आपके जोखिम को तुरंत कैसे कम करते हैं।",
    simWalk: "रोज 30 मिनट टहलें 🚶",
    simWalkSub: "रक्त संचार में सुधार करता है और पल्स को सामान्य रखता है।",
    simQuitSmoke: "तंबाकू धूम्रपान छोड़ें 🚭",
    simQuitSmokeSub: "धमनियों की सूजन को तुरंत कम करता है।",
    simDiet: "नमक कम करें और ताजी हरी सब्जियां खाएं 🥗",
    simDietSub: "रक्तचाप को नियंत्रित रखने में मदद करता है।",
    projectedRisk: "अनुमानित नया जोखिम",
    potentialDrop: "संभावित जोखिम में गिरावट!",
    lifeBenefit: "जीवन लाभ",
    bringsAgeDown: "हृदय आयु को ~{age} वर्ष तक कम करता है",

    // Action plan
    actionPlanTitle: "आपकी 3-चरणीय दैनिक हृदय कार्य योजना",
    actionPlanSubtitle: "व्यावहारिक कदम जिन्हें आप बिना किसी महंगे उपकरण के आज से ही शुरू कर सकते हैं।",
    step1Title: "30 मिनट चलें (10-10 मिनट के अंतराल में भी कर सकते हैं)",
    step1Desc: "आपको भारी जिम कसरत की आवश्यकता नहीं है। रोजाना 30 मिनट तेज सुबह की सैर या सीढ़ियां चढ़ना आपकी हृदय की मांसपेशियों को मजबूत करता है।",
    step2Title: "\"आधी प्लेट हरी सब्जी\" नियम और नमक पर नियंत्रण",
    step2Desc: "रोटी या चावल से पहले अपनी खाने की थाली का आधा हिस्सा ताजी सब्जियों या सलाद से भरें। ऊपर से अतिरिक्त नमक न डालें।",
    step3Title: "महीने में एक बार अपना रक्तचाप अवश्य जांचें",
    step3Desc: "हाई बीपी को \"साइलेंट किलर\" कहा जाता है क्योंकि बिना किसी लक्षण के यह नसों को नुकसान पहुंचाता है। महीने में एक बार जांच कराएं।",
    emergencyAlertTitle: "आपातकालीन सेवाओं को कब कॉल करें (108 / अस्पताल)",
    emergencyAlertDesc: "यदि आपको सीने में अचानक भारी दबाव, बाएं हाथ या जबड़े में दर्द, ठंडा पसीना या सांस लेने में अचानक तकलीफ हो, तो तुरंत नजदीकी अस्पताल जाएं।",

    // Doctor Questions
    docQuestionsTitle: "अपनी अगली डॉक्टर मुलाकात के लिए प्रश्न",
    docQuestionsSubtitle: "अपने क्लिनिक में इन प्रश्नों को ले जाएं ताकि डॉक्टर आपको सही परामर्श दे सकें।",
    docQ1: "मेरी उम्र के अनुसार मेरा सही ब्लड प्रेशर लक्ष्य क्या होना चाहिए?",
    docQ2: "मेरा आखिरी लिपिड प्रोफाइल (कोलेस्ट्रॉल) टेस्ट कब हुआ था और क्या दोबारा जांच करानी चाहिए?",
    docQ3: "क्या मेरे दिल की सुरक्षा के लिए कोई विशेष दवा या सप्लीमेंट की सलाह है?",
    docQ4: "क्या मेरे लिए तेज दौड़ना या भारी व्यायाम शुरू करना सुरक्षित है?",
    docQ5: "मेरे पारिवारिक मेडिकल इतिहास का मेरे लंबे समय के जोखिम पर क्या असर है?",

    // Myths & FAQs
    mythsTitle: "हृदय स्वास्थ्य के भ्रम बनाम सच्चाई",
    mythsSubtitle: "वैज्ञानिक रूप से प्रमाणित तथ्यों से भ्रम दूर करें।",
    myth1: "भ्रम: \"मैं पूरी तरह स्वस्थ और ऊर्जावान महसूस करता हूँ, इसलिए मेरा ब्लड प्रेशर ठीक होगा।\"",
    fact1: "सच्चाई: उच्च रक्तचाप के अक्सर कोई लक्षण नहीं होते जब तक कि यह धमनियों को नुकसान न पहुंचा दे। नियमित जांच जरूरी है।",
    myth2: "भ्रम: \"हृदय रोग केवल बुजुर्ग लोगों को ही होता है।\"",
    fact2: "सच्चाई: धमनियों में रुकावट युवावस्था से ही शुरू हो सकती है। 20-40 की उम्र में अच्छा खान-पान आपके भविष्य की रक्षा करता है।",
    myth3: "भ्रम: \"मैं दिल की दवा ले रहा हूँ, इसलिए मैं कुछ भी तला-भुना खा सकता हूँ।\"",
    fact3: "सच्चाई: दवाएं जोखिम कम करती हैं लेकिन अत्यधिक नमक और जंक फूड के नुकसान की पूरी भरपाई नहीं कर सकतीं।",

    // Voice assistant
    voiceTitle: "ध्वनि हृदय सारांश",
    voiceSubtitle: "सरल हिंदी में सुनें",
    listenTts: "सुनें (TTS)",
    pauseTts: "रोकें",
    resumeTts: "जारी रखें",

    // Risk details headlines
    riskLowHead: "आपका दिल बेहतरीन स्थिति में है!",
    riskLowDesc: "अगले 10 वर्षों में गंभीर हृदय समस्याओं का जोखिम बहुत कम है। अपनी स्वस्थ जीवनशैली जारी रखें!",
    riskModHead: "आपके हृदय स्वास्थ्य में सुधार की गुंजाइश है।",
    riskModDesc: "ब्लड प्रेशर या वजन जैसे कुछ कारक दिल पर हल्का दबाव डाल रहे हैं। साधारण दैनिक बदलाव आपकी रक्षा कर सकते हैं।",
    riskHighHead: "आपके दिल को विशेष देखभाल की आवश्यकता है।",
    riskHighDesc: "कई जोखिम कारक आपके दिल पर काम का बोझ बढ़ा रहे हैं। डॉक्टर से परामर्श करके तुरंत कदम उठाएं।"
  }
};

export function getVoiceLangCode(lang: Language): string {
  switch (lang) {
    case "kn":
      return "kn-IN";
    case "hi":
      return "hi-IN";
    case "en":
    default:
      return "en-US";
  }
}
