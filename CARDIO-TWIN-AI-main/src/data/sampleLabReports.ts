import { LabReportScanResult } from "../types";

export interface SampleLabReportPreset {
  id: string;
  name: string;
  category: "Lipid & Metabolic" | "Cardiovascular & HTN" | "Optimal Wellness";
  tag: string;
  riskLevel: "High" | "Moderate" | "Low";
  previewSnippet: string;
  result: LabReportScanResult;
}

export const SAMPLE_LAB_REPORTS: SampleLabReportPreset[] = [
  {
    id: "sample-high-lipid",
    name: "Metabolic Disruption & Severe Dyslipidemia Panel",
    category: "Lipid & Metabolic",
    tag: "🔴 High CVD Risk",
    riskLevel: "High",
    previewSnippet: "54M • Total Chol: 264 mg/dL • LDL: 182 mg/dL • Fasting Glucose: 138 mg/dL • BP: 154/92 mmHg • Smoker",
    result: {
      reportTitle: "Advanced Cardiovascular & Lipid Biomarker Assessment",
      patientName: "Robert M. (Age 54, Male)",
      reportDate: "Oct 14, 2024",
      laboratoryName: "Metropolitan Clinical Laboratories & Diagnostics",
      confidenceScore: 97,
      extractedPatientData: {
        age: 54,
        sex: "male",
        height: 178,
        weight: 88,
        systolicBP: 154,
        diastolicBP: 92,
        cholesterol: 264,
        glucose: 138,
        restingHR: 82,
        smoking: true,
        physicalActivity: 0,
        diabetes: true,
        prevHeartDisease: false,
        hypertensionHistory: true,
        familyHistoryScore: 8,
        medicationAdherence: 65,
        selectedCaseName: "Lab Scan: Severe Dyslipidemia & HTN",
        selectedCohortName: "Metabolic Syndrome & Mixed Dyslipidemia",
        caseDescription: "Extracted from comprehensive metabolic & lipid clinical laboratory report.",
        caseNotes: "Severe atherogenic dyslipidemia (LDL 182 mg/dL), Stage 2 HTN (154/92), and impaired fasting glucose (138 mg/dL)."
      },
      biomarkers: [
        { name: "Total Cholesterol", value: 264, unit: "mg/dL", referenceRange: "< 200 mg/dL", status: "high", clinicalNote: "Severe hypercholesterolemia" },
        { name: "LDL Cholesterol", value: 182, unit: "mg/dL", referenceRange: "< 100 mg/dL", status: "critical", clinicalNote: "High atherogenic cardiovascular burden" },
        { name: "HDL Cholesterol", value: 36, unit: "mg/dL", referenceRange: "> 40 mg/dL", status: "low", clinicalNote: "Reduced protective anti-atherogenic capacity" },
        { name: "Serum Triglycerides", value: 245, unit: "mg/dL", referenceRange: "< 150 mg/dL", status: "high", clinicalNote: "Elevated triglyceride-rich lipoproteins" },
        { name: "Fasting Blood Sugar", value: 138, unit: "mg/dL", referenceRange: "70 - 99 mg/dL", status: "high", clinicalNote: "Impaired fasting glycemia / diabetes range" },
        { name: "HbA1c", value: 7.1, unit: "%", referenceRange: "< 5.7%", status: "high", clinicalNote: "Uncontrolled glycemic baseline" },
        { name: "Resting Blood Pressure", value: "154 / 92", unit: "mmHg", referenceRange: "< 120/80 mmHg", status: "high", clinicalNote: "Stage 2 Essential Hypertension" },
        { name: "Resting Pulse", value: 82, unit: "bpm", referenceRange: "60 - 100 bpm", status: "normal", clinicalNote: "Resting sympathetic overdrive" },
        { name: "Serum Creatinine", value: 1.15, unit: "mg/dL", referenceRange: "0.7 - 1.3 mg/dL", status: "normal", clinicalNote: "Renal filtration within acceptable limits" },
        { name: "hs-CRP (High-Sens. C-Reactive)", value: 4.2, unit: "mg/L", referenceRange: "< 1.0 mg/L", status: "high", clinicalNote: "High systemic vascular inflammatory index" }
      ],
      keyFindings: [
        "Atherogenic Dyslipidemia: LDL-C 182 mg/dL and HDL-C 36 mg/dL significantly increase plaque progression rate.",
        "Stage 2 Hypertension: 154/92 mmHg imposes heavy left ventricular afterload.",
        "Diabetic Glycemic State: Fasting glucose 138 mg/dL with HbA1c 7.1%.",
        "Vascular Inflammation: Elevated hs-CRP of 4.2 mg/L indicates active arterial inflammation."
      ],
      clinicalSummary: "Laboratory profile confirms active metabolic syndrome with severe atherogenic dyslipidemia, poorly controlled hypertension, and hyperglycemia. Patient is at high risk for premature atherosclerotic cardiovascular events. Urgent dual-target lipid and blood pressure pharmacological intervention indicated.",
      laymanSummary: "This lab report shows that your cholesterol (264) and LDL 'bad' cholesterol (182) are in the high-risk range, your blood sugar is elevated, and your blood pressure is high. These factors combine to increase plaque buildup in your arteries. Working closely with your doctor to take prescribed medicines and making heart-friendly food swaps will help protect your heart.",
      recommendations: [
        "Initiate high-intensity statin therapy (e.g. Atorvastatin 40mg or Rosuvastatin 20mg).",
        "Dual anti-hypertensive regimen to achieve systolic target < 130 mmHg.",
        "Strict lifestyle intervention: Mediterranean diet, sodium restriction (< 2g/day), and smoking cessation counseling."
      ]
    }
  },
  {
    id: "sample-moderate-htn",
    name: "Hypertension & Borderline Metabolic Follow-up",
    category: "Cardiovascular & HTN",
    tag: "🟡 Moderate CVD Risk",
    riskLevel: "Moderate",
    previewSnippet: "61F • Total Chol: 215 mg/dL • LDL: 134 mg/dL • Glucose: 104 mg/dL • BP: 138/84 mmHg • Non-smoker",
    result: {
      reportTitle: "Cardiovascular Risk & Chemistry Screen",
      patientName: "Elena S. (Age 61, Female)",
      reportDate: "Nov 02, 2024",
      laboratoryName: "Apex Health Diagnostics & Imaging",
      confidenceScore: 95,
      extractedPatientData: {
        age: 61,
        sex: "female",
        height: 164,
        weight: 69,
        systolicBP: 138,
        diastolicBP: 84,
        cholesterol: 215,
        glucose: 104,
        restingHR: 72,
        smoking: false,
        physicalActivity: 1,
        diabetes: false,
        prevHeartDisease: false,
        hypertensionHistory: true,
        familyHistoryScore: 4,
        medicationAdherence: 80,
        selectedCaseName: "Lab Scan: Borderline HTN & Dyslipidemia",
        selectedCohortName: "Borderline Metabolic & Stage 1 HTN",
        caseDescription: "Extracted from routine outpatient health check laboratory report.",
        caseNotes: "Moderate hypercholesterolemia (215 mg/dL), borderline fasting glucose (104 mg/dL), and Stage 1 systolic hypertension (138/84 mmHg)."
      },
      biomarkers: [
        { name: "Total Cholesterol", value: 215, unit: "mg/dL", referenceRange: "< 200 mg/dL", status: "high", clinicalNote: "Borderline elevated serum cholesterol" },
        { name: "LDL Cholesterol", value: 134, unit: "mg/dL", referenceRange: "< 100 mg/dL", status: "high", clinicalNote: "Above primary prevention guideline target" },
        { name: "HDL Cholesterol", value: 52, unit: "mg/dL", referenceRange: "> 50 mg/dL", status: "normal", clinicalNote: "Adequate protective HDL fraction" },
        { name: "Serum Triglycerides", value: 145, unit: "mg/dL", referenceRange: "< 150 mg/dL", status: "normal", clinicalNote: "Within optimal reference interval" },
        { name: "Fasting Blood Sugar", value: 104, unit: "mg/dL", referenceRange: "70 - 99 mg/dL", status: "high", clinicalNote: "Impaired fasting glucose threshold" },
        { name: "Resting Blood Pressure", value: "138 / 84", unit: "mmHg", referenceRange: "< 120/80 mmHg", status: "high", clinicalNote: "Stage 1 Systolic Hypertension" },
        { name: "Resting Pulse", value: 72, unit: "bpm", referenceRange: "60 - 100 bpm", status: "normal", clinicalNote: "Normal sinus rate" },
        { name: "Estimated GFR", value: 92, unit: "mL/min/1.73m²", referenceRange: "> 60 mL/min", status: "normal", clinicalNote: "Preserved renal clearance" }
      ],
      keyFindings: [
        "Mild-to-Moderate Dyslipidemia: LDL 134 mg/dL with healthy HDL 52 mg/dL.",
        "Stage 1 Systolic Hypertension: 138/84 mmHg requires monitoring and therapeutic target optimization.",
        "Borderline Fasting Glucose: 104 mg/dL indicates pre-diabetic metabolic drift."
      ],
      clinicalSummary: "Laboratory profile indicates moderate 10-year cardiovascular risk driven predominantly by age, Stage 1 systolic hypertension, and mildly elevated LDL. Favorable HDL levels provide some protective offset. Lifestyle modifications combined with moderate lipid-lowering therapy are recommended.",
      laymanSummary: "Your lab results show that your heart is in a moderate risk zone. Your blood pressure (138/84) and cholesterol (215) are a little above target, but your protective 'good' HDL cholesterol is healthy. Simple daily walking and reducing salt can make a big difference in keeping your heart healthy.",
      recommendations: [
        "Moderate-intensity statin consideration (e.g. Pravastatin 20mg or Atorvastatin 10mg).",
        "Target 150 minutes of weekly moderate aerobic activity (e.g. brisk walking).",
        "DASH dietary pattern to lower systolic BP below 125 mmHg."
      ]
    }
  },
  {
    id: "sample-optimal-low",
    name: "Cardiovascular Wellness & Athlete Profile",
    category: "Optimal Wellness",
    tag: "🟢 Low CVD Risk",
    riskLevel: "Low",
    previewSnippet: "32M • Total Chol: 162 mg/dL • LDL: 84 mg/dL • Glucose: 86 mg/dL • BP: 114/72 mmHg • Highly Active",
    result: {
      reportTitle: "Executive Wellness & Cardiovascular Biomarker Screen",
      patientName: "David K. (Age 32, Male)",
      reportDate: "Jan 18, 2025",
      laboratoryName: "BioVanguard Preventive Health Institute",
      confidenceScore: 99,
      extractedPatientData: {
        age: 32,
        sex: "male",
        height: 182,
        weight: 76,
        systolicBP: 114,
        diastolicBP: 72,
        cholesterol: 162,
        glucose: 86,
        restingHR: 58,
        smoking: false,
        physicalActivity: 2,
        diabetes: false,
        prevHeartDisease: false,
        hypertensionHistory: false,
        familyHistoryScore: 1,
        medicationAdherence: 100,
        selectedCaseName: "Lab Scan: Optimal Athletic Profile",
        selectedCohortName: "Optimal Cardiovascular & Aerobic Wellness",
        caseDescription: "Extracted from annual executive health screening report.",
        caseNotes: "Ideal lipid distribution (Total Chol 162 mg/dL, LDL 84 mg/dL, HDL 62 mg/dL) with optimal resting BP (114/72 mmHg) and bradycardia of fitness (58 bpm)."
      },
      biomarkers: [
        { name: "Total Cholesterol", value: 162, unit: "mg/dL", referenceRange: "< 200 mg/dL", status: "normal", clinicalNote: "Optimal serum lipid profile" },
        { name: "LDL Cholesterol", value: 84, unit: "mg/dL", referenceRange: "< 100 mg/dL", status: "normal", clinicalNote: "Well below primary prevention thresholds" },
        { name: "HDL Cholesterol", value: 62, unit: "mg/dL", referenceRange: "> 40 mg/dL", status: "normal", clinicalNote: "Robust cardioprotective HDL level" },
        { name: "Serum Triglycerides", value: 80, unit: "mg/dL", referenceRange: "< 150 mg/dL", status: "normal", clinicalNote: "Optimal metabolic clearance" },
        { name: "Fasting Blood Sugar", value: 86, unit: "mg/dL", referenceRange: "70 - 99 mg/dL", status: "normal", clinicalNote: "Excellent insulin sensitivity" },
        { name: "HbA1c", value: 5.1, unit: "%", referenceRange: "< 5.7%", status: "normal", clinicalNote: "Ideal euglycemic state" },
        { name: "Resting Blood Pressure", value: "114 / 72", unit: "mmHg", referenceRange: "< 120/80 mmHg", status: "normal", clinicalNote: "Ideal resting hemodynamic baseline" },
        { name: "Resting Heart Rate", value: 58, unit: "bpm", referenceRange: "60 - 100 bpm", status: "normal", clinicalNote: "Athletic resting bradycardia" },
        { name: "hs-CRP", value: 0.4, unit: "mg/L", referenceRange: "< 1.0 mg/L", status: "normal", clinicalNote: "Extremely low vascular inflammatory risk" }
      ],
      keyFindings: [
        "Optimal Lipid Panel: LDL 84 mg/dL with high protective HDL 62 mg/dL.",
        "Excellent Hemodynamics: 114/72 mmHg resting BP with athletic resting heart rate (58 bpm).",
        "Euglycemic Metabolic Baseline: Fasting glucose 86 mg/dL with HbA1c 5.1%."
      ],
      clinicalSummary: "Laboratory assessment reveals exemplary cardiovascular and metabolic health metrics. All lipid, glycemic, and hemodynamic biomarkers sit firmly within optimal reference intervals. Minimal 10-year cardiovascular disease risk.",
      laymanSummary: "Congratulations! Your lab report shows excellent heart health. Your cholesterol, blood sugar, and blood pressure numbers are all in the ideal green zone. Your daily exercise and healthy lifestyle habits are doing a fantastic job protecting your heart.",
      recommendations: [
        "Continue current high-volume aerobic and resistance training routines.",
        "Maintain balanced nutrient-dense Mediterranean diet.",
        "Routine preventative follow-up in 12-24 months."
      ]
    }
  }
];
