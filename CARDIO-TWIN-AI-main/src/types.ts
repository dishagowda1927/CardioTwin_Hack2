export interface PatientData {
  name?: string;
  age: number;
  sex: "male" | "female";
  height: number;
  weight: number;
  bmi?: number;
  systolicBP: number;
  diastolicBP: number;
  cholesterol: number;
  glucose: number;
  restingHR: number;
  smoking: boolean;
  physicalActivity: number; // 0, 1, 2
  diabetes: boolean;
  prevHeartDisease: boolean;
  hypertensionHistory: boolean;
  familyHistoryScore: number; // 0-10 score capturing inherited risk
  medicationAdherence: number; // 0-100 percentage of adherence
  
  // Optional pre-loaded case context metadata to enhance models
  selectedCaseName?: string;
  selectedCohortName?: string;
  caseDescription?: string;
  caseNotes?: string;
}

export interface ShapValue {
  feature: string;
  displayName: string;
  shapValue: number;
  impact: "increases" | "reduces" | "neutral";
  isModifiable: boolean;
}

export interface ShapData {
  baseRate: number;
  shapValues: ShapValue[];
  riskIncreasing: ShapValue[];
  riskReducing: ShapValue[];
  summary: string;
}

export interface DataQuality {
  score: number;
  anomalies: string[];
  status: string;
}

export interface ModelPrediction {
  name: string;
  prediction: number;
}

export interface ClusterInfo {
  assignedCluster: {
    id: number;
    name: string;
    description: string;
  };
  patientCoordinates: { x: number; y: number };
  allCentroids: { id: number; name: string; x: number; y: number; isCentroid: boolean }[];
}

export interface MultiCvdModule {
  id: string;
  name: string;
  probability: number;
  confidence: string;
  status: string;
  topContributors: string[];
  note?: string;
}

export interface CounterfactualScenario {
  id: string;
  label: string;
  description: string;
  risk: number;
  diff: number;
  modifications: string[];
}

export interface PredictionResult {
  patientData: PatientData & { bmi: number };
  overallRisk: number;
  riskCategory: string;
  modelConfidence: string;
  dataQuality: DataQuality;
  modelsComparison: ModelPrediction[];
  shap: ShapData;
  cluster: ClusterInfo;
  multiCvd: MultiCvdModule[];
  counterfactuals: CounterfactualScenario[];
  timestamp: string;
}

export interface LabReportExtractedBiomarker {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "critical";
  clinicalNote?: string;
}

export interface LabReportScanResult {
  reportTitle: string;
  patientName?: string;
  reportDate?: string;
  laboratoryName?: string;
  confidenceScore: number;
  extractedPatientData: PatientData;
  biomarkers: LabReportExtractedBiomarker[];
  keyFindings: string[];
  clinicalSummary: string;
  laymanSummary: string;
  recommendations?: string[];
  rawOcrSnippet?: string;
}
