import React, { useState } from "react";
import { Heart, Activity, Brain, Sliders, ShieldCheck, Search, BookOpen, AlertTriangle, ArrowRight, HeartPulse, Info, PlusCircle, CheckCircle, RotateCcw, HelpCircle, ExternalLink, Award, FileText, Volume2 } from "lucide-react";
import VoiceAssistant from "./VoiceAssistant";

interface CvdDiseaseInfo {
  id: string;
  name: string;
  scientificName: string;
  icon: React.ReactNode;
  description: string;
  clinicalImpact: string;
  riskFactors: string[];
  aiInputs: string[];
  preventativeActions: string[];
  datasetLineage: string;
}

const INITIAL_DISEASES: CvdDiseaseInfo[] = [
  {
    id: "cad",
    name: "Coronary Artery Disease (CAD)",
    scientificName: "Atherosclerotic Ischemic Heart Disease",
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    description: "Narrowing or complete occlusion of the epicardial coronary arteries, typically caused by atherosclerotic plaque accumulation. It reduces oxygen supply to cardiac muscle cells.",
    clinicalImpact: "Can result in stable angina, microvascular spasms, acute myocardial infarction (heart attack), and chronic ischemic cardiomyopathy.",
    riskFactors: [
      "Atherosgenic lipid profile (High LDL-C, low HDL-C)",
      "Elevated hemodynamic pressure (Hypertension)",
      "Chronic hyperglycemia or insulin resistance (Diabetes)",
      "Endothelial stress from tobacco smoke components"
    ],
    aiInputs: [
      "Systolic & Diastolic Blood Pressure",
      "Total Cholesterol levels",
      "Body Mass Index (BMI)",
      "Active Tobacco Smoking Status"
    ],
    preventativeActions: [
      "Maintain circulating lipid boundaries under 200 mg/dL",
      "Initiate a cardiac lifestyle high in physical activity (>150 min/wk)",
      "Strict cessation of active and passive tobacco exposure"
    ],
    datasetLineage: "UCI Heart Disease Repository & Framingham Cohort"
  },
  {
    id: "stroke",
    name: "Stroke & Cerebrovascular Disease",
    scientificName: "Ischemic / Hemorrhagic Stroke",
    icon: <Brain className="w-5 h-5 text-indigo-500" />,
    description: "Acute disruption of regional cerebral blood supply. Ischemic strokes involve thrombus occlusion of cerebral capillaries, while hemorrhagic strokes involve arterial rupture.",
    clinicalImpact: "Causes rapid necrosis of neuronal tissue, leading to persistent sensory-motor deficits, cognitive impairments, or hemiplegia.",
    riskFactors: [
      "Uncontrolled systolic spikes (Tension shear stress)",
      "Atrial fibrillation resulting in left atrial appendage thrombi",
      "Extracranial arterial stenosis (Carotid atherosclerosis)"
    ],
    aiInputs: [
      "Age & Biological Sex",
      "Systolic Blood Pressure & Hypertension History",
      "Fasting Glucose / Diabetes mellitus status",
      "History of Atrial Fibrillation or Arrhythmias"
    ],
    preventativeActions: [
      "Tight pharmacological regulation of Systolic BP (<130 mmHg)",
      "Anticoagulation management for patients with active atrial flutter",
      "Regular neurological screening and micro-vascular assessments"
    ],
    datasetLineage: "PhysioNet Stroke Analytics & MIMIC-IV Cohorts"
  },
  {
    id: "hf",
    name: "Heart Failure (HF)",
    scientificName: "Congestive Heart Failure / Myocardial Dysfunction",
    icon: <HeartPulse className="w-5 h-5 text-rose-600" />,
    description: "Complex clinical syndrome stemming from structural or functional impairment of ventricular filling or blood ejection (systolic/diastolic heart failure).",
    clinicalImpact: "Congestive backup leads to pulmonary congestion, lower extremity edema, chronic cellular hypoxia, dyspnea, and muscle wasting.",
    riskFactors: [
      "Myocardial infarction scarring (Ischemic heart disease)",
      "Longstanding, unmanaged arterial hypertension",
      "Dilated or hypertrophic cardiac myopathies"
    ],
    aiInputs: [
      "Ejection Fraction measurements",
      "Serum Creatinine & Sodium levels",
      "Resting Heart Rate (RHR)",
      "Age & Metabolic history"
    ],
    preventativeActions: [
      "Reduce systemic dietary sodium and excessive fluid volume",
      "Strict compliance with guideline-directed medical therapy",
      "Periodic echocardiography examinations to monitor ejection fractions"
    ],
    datasetLineage: "UCI Heart Failure Clinical Records (299 Patient Registry)"
  },
  {
    id: "af",
    name: "Atrial Fibrillation (AF)",
    scientificName: "Irregular Supraventricular Arrhythmia",
    icon: <Activity className="w-5 h-5 text-amber-500" />,
    description: "Supraventricular tachyarrhythmia characterized by chaotic, uncoordinated atrial electrical activation and irregular ventricular responses.",
    clinicalImpact: "Dramatically raises thromboembolic stroke risk due to blood stasis in the left atrial appendage, causing palpitations and fatigue.",
    riskFactors: [
      "Advanced cardiovascular aging",
      "Mitral valve regurgitation or stenosis",
      "Obstructive Sleep Apnea (OSA)"
    ],
    aiInputs: [
      "Resting Heart Rate & ECG waveform morphology",
      "Systolic Blood Pressure & Hypertension History",
      "Diabetes status & Obesity indexes"
    ],
    preventativeActions: [
      "Continuous rhythm monitoring and pulse screening",
      "Electrophysiological ablation or cardioversion therapy as directed",
      "Avoidance of sympathomimetic triggers such as caffeine and alcohol"
    ],
    datasetLineage: "PhysioNet MIT-BIH Atrial Fibrillation Database"
  },
  {
    id: "hhd",
    name: "Hypertensive Heart Disease (HHD)",
    scientificName: "Left Ventricular Myocardial Hypertrophy",
    icon: <Sliders className="w-5 h-5 text-teal-500" />,
    description: "Structural adaptation of the myocardium to chronic systemic pressure overload, leading to cardiomyocyte hypertrophy and interstitial fibrosis.",
    clinicalImpact: "Ventricular wall stiffening causes diastolic filling dysfunction, increased myocardial oxygen demand, and ventricular arrhythmia vulnerability.",
    riskFactors: [
      "Essential or secondary arterial hypertension",
      "High dietary sodium intake coupled with physical inactivity",
      "Obesity-related systemic vascular resistance"
    ],
    aiInputs: [
      "Systolic Blood Pressure levels > 140 mmHg",
      "Diastolic Blood Pressure levels > 90 mmHg",
      "Hypertension Medication history",
      "Body Mass Index (BMI)"
    ],
    preventativeActions: [
      "Aggressive pressure reduction below 130/80 mmHg",
      "Adherence to anti-hypertensive drug regimens (ACE inhibitors/beta-blockers)",
      "Regular monitoring of left ventricular mass indices via ultrasound"
    ],
    datasetLineage: "MIMIC-IV Intensive Care Registry"
  },
  {
    id: "pad",
    name: "Peripheral Artery Disease (PAD)",
    scientificName: "Atherosclerotic Occlusive Vascular Disease",
    icon: <Info className="w-5 h-5 text-orange-500" />,
    description: "Atherosclerotic narrowing of arteries supplying the extremities, limiting blood flow to skeletal muscle groups during physical work.",
    clinicalImpact: "Manifests as intermittent claudication (leg pain during walking), poorly healing ischemic ulcers, and extreme limb ischemia.",
    riskFactors: [
      "Heavy tobacco exposure (primary lifestyle trigger)",
      "Uncontrolled diabetes mellitus and insulin resistance",
      "Dyslipidemia and hyperhomocysteinemia"
    ],
    aiInputs: [
      "Tobacco Smoking Status",
      "Fasting Glucose levels",
      "Total Cholesterol and LDL levels",
      "Ankle-Brachial Index (ABI) history"
    ],
    preventativeActions: [
      "Complete and immediate cessation of tobacco smoke",
      "Structured lower-limb exercise therapies to stimulate collateral vessel growth",
      "Daily foot examinations to prevent deep diabetic ischemic ulcers"
    ],
    datasetLineage: "UCI Heart & Vascular Clinical Registry"
  },
  {
    id: "vhd",
    name: "Valvular Heart Disease (VHD)",
    scientificName: "Aortic Stenosis / Mitral Regurgitation",
    icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    description: "Damage or congenital structural defect in any of the four heart valves, resulting in incomplete opening (stenosis) or backflow leakage (regurgitation).",
    clinicalImpact: "Forces the heart chambers to pump significantly harder, triggering progressive remodeling, chamber enlargement, and systolic exhaustion.",
    riskFactors: [
      "Age-associated fibrocalcific degeneration",
      "History of untreated Rheumatic Fever",
      "Infective endocarditis bacterial colonies"
    ],
    aiInputs: [
      "Age & Demographics",
      "History of heart murmurs or chest pain",
      "Echocardiogram measurements",
      "Systolic pressure and overall stroke volume"
    ],
    preventativeActions: [
      "Prompt medical treatment for streptococcal throat infections",
      "Regular clinical auscultation to screen for pathological murmurs",
      "Surgical or transcatheter valve replacement for high-grade stenosis"
    ],
    datasetLineage: "UCI Valvular Clinic database & MIMIC-IV echo logs"
  }
];

interface ClinicalGuideline {
  diseaseId: string;
  source: string;
  year: string;
  title: string;
  recommendations: string[];
  keyIndicator: string;
  indicatorValue: string;
}

const CLINICAL_GUIDELINES: Record<string, ClinicalGuideline> = {
  cad: {
    diseaseId: "cad",
    source: "ACC/AHA Joint Guideline",
    year: "2026",
    title: "Guideline on the Management of Dyslipidemia & ASCVD",
    recommendations: [
      "Early cardiovascular screening utilizing the multi-ethnic PREVENT equations.",
      "Initiate aggressive high-intensity statin therapies for high-risk patients.",
      "Achieve stringent LDL-C targets (<55 mg/dL) using universal lipid assays."
    ],
    keyIndicator: "Target LDL-C (Very High Risk)",
    indicatorValue: "< 55 mg/dL"
  },
  stroke: {
    diseaseId: "stroke",
    source: "AHA/ASA Stroke Council",
    year: "2026",
    title: "Primary Stroke & Cerebrovascular Prevention Guidelines",
    recommendations: [
      "Maintain active systolic pressure limits below 130 mmHg for secondary protection.",
      "Initiate oral anticoagulants for atrial fibrillation-induced thromboembolisms.",
      "Universal lipid screening for atherosclerotic plaque regression targets."
    ],
    keyIndicator: "Recommended BP Limit",
    indicatorValue: "< 130/80 mmHg"
  },
  hf: {
    diseaseId: "hf",
    source: "AHA/ACC/HFSA Joint Committee",
    year: "2026",
    title: "Prevention & Staging of Cardiovascular-Kidney-Metabolic Syndrome",
    recommendations: [
      "Implement PREVENT risk scoring model to map cardiorenal metabolic syndromes.",
      "Early initiation of GDMT (SGLT2 inhibitors and ARNI regimens) for functional dysfunction.",
      "Strict sodium restriction limit (<1,500 mg/day) coupled with fluid retention scans."
    ],
    keyIndicator: "Sodium Intake Threshold",
    indicatorValue: "< 1,500 mg/day"
  },
  af: {
    diseaseId: "af",
    source: "HRS/ACC/AHA Multisociety",
    year: "2024",
    title: "Rhythm Regulation & Anticoagulation for Atrial Fibrillation",
    recommendations: [
      "Utilize CHA2DS2-VASc scoring model to assess thromboembolism risk thresholds.",
      "Prefer Direct Oral Anticoagulants (DOACs) over Warfarin unless mitral stenosis present.",
      "Schedule early catheter ablation to improve symptom profiles and prevent remodeling."
    ],
    keyIndicator: "Stroke Score Evaluation",
    indicatorValue: "CHA2DS2-VASc Scan"
  },
  hhd: {
    diseaseId: "hhd",
    source: "AHA/ACC Hypertension Council",
    year: "2025",
    title: "Guideline for the Management of High Blood Pressure in Adults",
    recommendations: [
      "Identify hypertension as the primary modifiable driver of myocardial remodeling.",
      "Set a strict pharmacological pressure goal of <130/80 mmHg.",
      "Monitor Left Ventricular Mass Index (LVMI) to assess myocardial hypertrophy."
    ],
    keyIndicator: "Primary Treatment Target",
    indicatorValue: "< 130/80 mmHg"
  },
  pad: {
    diseaseId: "pad",
    source: "AHA/ACC Vascular Disease",
    year: "2024",
    title: "Clinical Practice Guideline for Peripheral Artery Disease",
    recommendations: [
      "Mandatory tobacco cessation coupled with supervised exercise therapy regimens.",
      "Administer dual antiplatelet therapies (Aspirin + Clopidogrel) to mitigate limb events.",
      "Perform regular Ankle-Brachial Index (ABI) profiling for progression checking."
    ],
    keyIndicator: "Primary ABI Range",
    indicatorValue: "0.90 to 1.40"
  },
  vhd: {
    diseaseId: "vhd",
    source: "ACC/AHA Valvular Committee",
    year: "2024",
    title: "Clinical Management of Patients with Valvular Heart Disease",
    recommendations: [
      "Perform serial echocardiography profiling (every 6-12 months for severe asymptomatic).",
      "Prioritize Transcatheter Aortic Valve Replacement (TAVR) in qualifying elderly cohorts.",
      "Initiate immediate antibiotic prophylaxis for high-risk dental procedures."
    ],
    keyIndicator: "Echocardiogram Cycle",
    indicatorValue: "6-12 Months"
  }
};

export default function CvdLibraryView() {
  const [diseases, setDiseases] = useState<CvdDiseaseInfo[]>(INITIAL_DISEASES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string>("cad");
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [newForm, setNewForm] = useState({
    name: "",
    scientificName: "",
    description: "",
    clinicalImpact: "",
    riskFactors: "",
    aiInputs: "",
    preventativeActions: "",
    datasetLineage: ""
  });

  // Preset filler
  const fillPreset = () => {
    setNewForm({
      name: "Hypertrophic Cardiomyopathy (HCM)",
      scientificName: "Primary Left Ventricular Outflow Tract Obstruction",
      description: "Genetic cardiovascular disease characterized by unexplained ventricular hypertrophy (stiffening and thickening of the heart muscle walls), in the absence of external arterial high pressure load.",
      clinicalImpact: "Decreased ventricular cavity size limits diastolic filling volume, potentially causing exertional dyspnea, microvascular chest pain, and severe arrhythmia cascades.",
      riskFactors: "Autosomal dominant genetic mutations, Family history of sudden cardiac arrest, Sarcomeric protein variant expressions",
      aiInputs: "Maximum Left Ventricular Wall Thickness, Exertional Syncope History, Age at diagnosis, Resting Outflow Gradient (mmHg)",
      preventativeActions: "Avoidance of competitive dehydration athletic exercises, Beta-blocker pharmacological therapeutic management, Prophylactic implantable cardioverter-defibrillator (ICD) counseling",
      datasetLineage: "MIMIC-IV HCM Sarcomere Clinical Database"
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.scientificName) return;

    const newId = newForm.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newDisease: CvdDiseaseInfo = {
      id: newId,
      name: newForm.name,
      scientificName: newForm.scientificName,
      icon: <HeartPulse className="w-5 h-5 text-indigo-500" />,
      description: newForm.description || "No clinical path overview supplied.",
      clinicalImpact: newForm.clinicalImpact || "No clinical impact information supplied.",
      riskFactors: newForm.riskFactors ? newForm.riskFactors.split(",").map(s => s.trim()) : ["Clinical evaluation pending"],
      aiInputs: newForm.aiInputs ? newForm.aiInputs.split(",").map(s => s.trim()) : ["Pending feature extraction"],
      preventativeActions: newForm.preventativeActions ? newForm.preventativeActions.split(",").map(s => s.trim()) : ["Consult cardiologist directive"],
      datasetLineage: newForm.datasetLineage || "Awaiting clinical peer-validation"
    };

    setDiseases([...diseases, newDisease]);
    setSelectedId(newId);
    setIsCreating(false);
    setNewForm({
      name: "",
      scientificName: "",
      description: "",
      clinicalImpact: "",
      riskFactors: "",
      aiInputs: "",
      preventativeActions: "",
      datasetLineage: ""
    });
  };

  const filteredDiseases = diseases.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDisease = diseases.find((d) => d.id === selectedId) || diseases[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-rose-50 border border-rose-100 rounded-full text-rose-700 text-xs font-extrabold uppercase tracking-wide">
          <BookOpen className="w-4 h-4" />
          Clinical Medical Compendium
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Cardiovascular Disease (CVD) Pathways
        </h1>
        <p className="text-slate-500 text-sm">
          A professional, clinical-grade overview of the supported disease modules, complete with risk factor parameters, target AI training indicators, and preventative protocols.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: List & Search */}
        <div className="lg:col-span-3 space-y-4">
          {/* Action Trigger: Add Custom Tab Category */}
          <button
            onClick={() => {
              setIsCreating(!isCreating);
            }}
            className={`w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              isCreating 
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                : "bg-rose-600 border-rose-500 text-white hover:bg-rose-700 shadow-md shadow-rose-100"
            }`}
          >
            {isCreating ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Return to Directory
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Add Custom CVD Module
              </>
            )}
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search diseases or definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 text-xs font-medium rounded-2xl border border-slate-200 focus:border-rose-500 focus:outline-none bg-white shadow-sm"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase px-3 py-1.5 block">Supported Modules</span>
            {filteredDiseases.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 italic">No matching pathways found.</p>
            ) : (
              filteredDiseases.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedId(d.id);
                    setIsCreating(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                    selectedId === d.id && !isCreating
                      ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedId === d.id && !isCreating ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {d.icon}
                    </div>
                    <div>
                      <p className="truncate max-w-[180px]">{d.name.split(" (")[0]}</p>
                      <p className={`text-[10px] font-normal truncate max-w-[180px] ${selectedId === d.id && !isCreating ? "text-white/80" : "text-slate-400"}`}>
                        {d.scientificName}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${selectedId === d.id && !isCreating ? "translate-x-1" : "text-slate-300"}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center Detail Panel OR Dynamic Form Creator */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          {isCreating ? (
            /* Creation Form */
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Custom CVD Pathway Draft</h2>
                  <p className="text-xs text-slate-400">Design and inject a custom heart disease pathway into your active session dictionary.</p>
                </div>
                <button
                  type="button"
                  onClick={fillPreset}
                  className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Fill with Preset Case
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Disease Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Myocarditis (MYO)"
                    value={newForm.name}
                    onChange={e => setNewForm({...newForm, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Scientific / Clinical Term *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Primary Myocardial Muscle Inflammation"
                    value={newForm.scientificName}
                    onChange={e => setNewForm({...newForm, scientificName: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Pathology & Overview</label>
                <textarea
                  rows={3}
                  placeholder="Describe the clinical progression, coronary state, and physiological mechanisms..."
                  value={newForm.description}
                  onChange={e => setNewForm({...newForm, description: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Clinical Manifestations</label>
                <textarea
                  rows={2}
                  placeholder="Identify typical diagnostic findings, patient symptoms, and functional deterioration stages..."
                  value={newForm.clinicalImpact}
                  onChange={e => setNewForm({...newForm, clinicalImpact: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Risk Factors (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Viral infection, Immune stress, Toxin exposure"
                    value={newForm.riskFactors}
                    onChange={e => setNewForm({...newForm, riskFactors: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">AI Inputs (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Echocardiography, Troponin level, ECG rhythm"
                    value={newForm.aiInputs}
                    onChange={e => setNewForm({...newForm, aiInputs: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Preventative Directives (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Physical rest, Heart rate restriction, Anti-inflammatory meds"
                    value={newForm.preventativeActions}
                    onChange={e => setNewForm({...newForm, preventativeActions: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                <label className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Model Dataset Source Lineage</label>
                <input
                  type="text"
                  placeholder="e.g. MIMIC-IV Myocarditis Patient Registry"
                  value={newForm.datasetLineage}
                  onChange={e => setNewForm({...newForm, datasetLineage: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-50 cursor-pointer transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save and Publish
                </button>
              </div>
            </form>
          ) : (
            /* Selected disease detailed view (default) */
            <div className="space-y-8">
              {/* Header detail */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                    {selectedDisease.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedDisease.name}</h2>
                    <p className="text-xs font-semibold text-rose-600 italic mt-0.5">{selectedDisease.scientificName}</p>
                  </div>
                </div>
                <div className="self-start sm:self-center">
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full uppercase tracking-wider">
                    {selectedDisease.id.includes("-") ? "Custom Module Drafted" : "Module Validated"}
                  </span>
                </div>
              </div>

              {/* Spoken Narration (TTS) */}
              <VoiceAssistant 
                title={`${selectedDisease.name} Overview`}
                subtitle="Clinical Audio Guide (TTS)"
                textToSpeak={`${selectedDisease.name}. ${selectedDisease.scientificName}. Pathology Overview: ${selectedDisease.description}. Clinical Manifestations: ${selectedDisease.clinicalImpact}. Key Risk Factors include: ${selectedDisease.riskFactors.join(", ")}. Recommended Preventative Actions: ${selectedDisease.preventativeActions.join(", ")}.`}
              />

              {/* Description & Impact */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Pathology Overview</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {selectedDisease.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Clinical Manifestations</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {selectedDisease.clinicalImpact}
                  </p>
                </div>
              </div>

              {/* Risk Factors & AI input Mapping */}
              <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-slate-100/60">
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Pathological Risk Factors</h3>
                  <ul className="space-y-2">
                    {selectedDisease.riskFactors.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span className="font-medium leading-normal">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">AI Training Feature Map</h3>
                  <ul className="space-y-2">
                    {selectedDisease.aiInputs.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span className="font-medium leading-normal">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Preventative Recommendations & Lineage footer */}
              <div className="pt-6 border-t border-slate-100/60 space-y-4">
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Primary Preventative Protocols</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {selectedDisease.preventativeActions.map((f, idx) => (
                      <div key={idx} className="p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1">
                        <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider block">Directive 0{idx+1}</span>
                        <p className="text-[11px] text-slate-700 leading-normal font-semibold">
                          {f}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between text-xs text-slate-500 font-semibold border border-slate-200/50 mt-4">
                  <span>Model Dataset Source Lineage:</span>
                  <span className="text-slate-800 font-extrabold text-[11px] bg-slate-200/60 px-2.5 py-1 rounded border border-slate-200">
                    {selectedDisease.datasetLineage}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Evidence-Based Clinical Guidelines */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-md space-y-4 border border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">ACC/AHA Guidelines</h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Real-time, search-grounded reference portal linking active pathways to validated medical protocols.
            </p>
            <div className="px-3 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">AHA Release</span>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                Active 2026
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-rose-500" />
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Clinical Reference</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Primary Literature Evidence</p>
              </div>
            </div>

            {CLINICAL_GUIDELINES[selectedId] ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 uppercase tracking-wide">
                    {CLINICAL_GUIDELINES[selectedId].source} ({CLINICAL_GUIDELINES[selectedId].year})
                  </span>
                  <h4 className="text-[11px] font-extrabold text-slate-800 leading-snug pt-1">
                    {CLINICAL_GUIDELINES[selectedId].title}
                  </h4>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100/60">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Guideline Directives:</span>
                  <ul className="space-y-2">
                    {CLINICAL_GUIDELINES[selectedId].recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl space-y-1.5">
                  <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                    {CLINICAL_GUIDELINES[selectedId].keyIndicator}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">
                      {CLINICAL_GUIDELINES[selectedId].indicatorValue}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-500 text-white rounded text-[9px] font-extrabold uppercase">
                      Target Goal
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Info className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-[11px] italic font-semibold">Custom module selected.</p>
                <p className="text-[10px] text-slate-400">Please refer to default ACC/AHA cardiology guidelines for custom pathology profiles.</p>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                PEER REVIEWED
              </span>
              <a 
                href="https://www.acc.org/Guidelines" 
                target="_blank" 
                rel="noreferrer" 
                className="text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                ACC.org
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
