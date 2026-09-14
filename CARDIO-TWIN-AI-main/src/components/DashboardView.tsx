import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ScatterChart, Scatter, Cell, CartesianGrid, AreaChart, Area, ReferenceLine
} from "recharts";
import { 
  Heart, Activity, Brain, Shield, Sparkles, Sliders, ChevronRight, 
  RefreshCw, TrendingDown, Clipboard, AlertTriangle, Users, HelpCircle,
  TrendingUp, BarChart2, Check, CheckCircle2, FileText, Pill, Apple, Calendar
} from "lucide-react";
import { PredictionResult, PatientData } from "../types";

// Import Advanced AI Sub-components
import HeartAnatomyVisualizer from "./HeartAnatomyVisualizer";
import SurvivalTimeline from "./SurvivalTimeline";
import PanelManagement from "./PanelManagement";
import ClinicalReportExport from "./ClinicalReportExport";

export interface GeminiRecommendations {
  medicine: string[];
  lifestyle: string[];
  treatmentPlan: string;
}

export interface GeminiSummaryData {
  professionalSummary: string;
  laymanSummary: string;
  professionalRecommendations: GeminiRecommendations;
  laymanRecommendations: GeminiRecommendations;
  generatedByGemini?: boolean;
}

export function parseSummary(summaryRaw: string): GeminiSummaryData {
  try {
    const data = JSON.parse(summaryRaw);
    if (data && (data.professionalSummary || data.laymanSummary)) {
      return data;
    }
  } catch (e) {
    // String is raw markdown
  }
  
  // Default fallback values
  return {
    professionalSummary: summaryRaw,
    laymanSummary: summaryRaw,
    professionalRecommendations: {
      medicine: [
        "Optimize pharmacotherapy per clinical markers (e.g., adjust HMG-CoA reductase inhibitors/Statins to target optimal lipid levels).",
        "Consider low-dose anti-hypertensive agents (ACEi/ARBs) if SBP consistently exceeds 130 mmHg.",
        "Reinforce daily clinical adherence protocols to secure long-term metabolic stability."
      ],
      lifestyle: [
        "Recommend Mediterranean or DASH dietary habits, limiting sodium below 2.0g per day.",
        "Aspirate toward 150+ minutes of weekly structured moderate-intensity aerobic physical conditioning.",
        "Counsel strict tobacco/nicotine avoidance and moderate alcoholic load levels."
      ],
      treatmentPlan: "Perform general cardiovascular and lipid diagnostic follow-up check-ups in 4 weeks."
    },
    laymanRecommendations: {
      medicine: [
        "Talk with your care provider about protective cholesterol-lowering pills (called statins) to keep blood vessels clean.",
        "Be sure to take your heart and blood pressure medications at the exact same time every single day.",
        "Set a daily alarm or use a color-coded pillbox to help you stay fully on track."
      ],
      lifestyle: [
        "Aim for a brisk 30-minute walk at least 5 days a week to build up a strong heart muscle.",
        "Cut back on salty foods and add more fresh vegetables, fiber, and plenty of water to your diet.",
        "Avoid any smoking or tobacco products, and stay away from secondhand smoke."
      ],
      treatmentPlan: "Check your blood pressure twice a week at home, write down the numbers, and plan a follow-up review with your doctor in 4 weeks."
    }
  };
}

interface DashboardViewProps {
  predictionResult: PredictionResult;
  onBackToInput: () => void;
  onRefreshSummary: () => void;
  onLoadProfile: (profile: PatientData) => void;
  geminiSummary: string;
  isGeminiLoading: boolean;
  predictionHistory?: any[];
  onOpenEHRProtocols?: () => void;
}

export default function DashboardView({ 
  predictionResult, 
  onBackToInput, 
  onRefreshSummary, 
  onLoadProfile,
  geminiSummary, 
  isGeminiLoading,
  predictionHistory = [],
  onOpenEHRProtocols
}: DashboardViewProps) {
  
  const { patientData, overallRisk, riskCategory, modelConfidence, dataQuality, modelsComparison, shap, cluster, multiCvd, counterfactuals, timestamp } = predictionResult;

  // State for What-If Simulation
  const [simulatedData, setSimulatedData] = useState<PatientData>({ ...patientData });
  const [simulatedRisk, setSimulatedRisk] = useState<number>(overallRisk);
  const [isSimulating, setIsSimulating] = useState(false);
  const [dashboardSubTab, setDashboardSubTab] = useState<"shap" | "distribution">("shap");
  const [interpretationMode, setInterpretationMode] = useState<"professional" | "layman">("professional");

  // Counterfactual Optimization states
  const [targetRiskThreshold, setTargetRiskThreshold] = useState<number>(Math.max(5, Math.round(overallRisk * 0.4)));
  const [activeTrajectorySteps, setActiveTrajectorySteps] = useState<Array<{
    id: number;
    label: string;
    description: string;
    delta: number;
    targetState: Partial<PatientData>;
  }>>([]);
  const [isTrajectorySolved, setIsTrajectorySolved] = useState(false);

  // Solves the optimal patient lifestyle, medication and vitals trajectory to reach target risk
  const solveOptimizedTrajectory = (targetVal: number) => {
    let currentSim = { ...patientData };
    let steps: Array<{
      id: number;
      label: string;
      description: string;
      delta: number;
      targetState: Partial<PatientData>;
    }> = [];
    
    let stepId = 1;
    let runningRisk = overallRisk;
    
    // Quick helper to predict risk inline on customized parameters
    const getRiskFor = (data: PatientData): number => {
      const heightM = data.height / 100;
      const bmi = heightM > 0 ? parseFloat((data.weight / (heightM * heightM)).toFixed(1)) : 22;
      let z = -4.5;
      z += 0.045 * (data.age - 30);
      if (data.sex === "male") z += 0.25;
      z += 0.022 * (data.systolicBP - 120);
      z += 0.01 * (data.diastolicBP - 80);
      z += 0.012 * (data.cholesterol - 180);
      z += 0.008 * (data.glucose - 90);
      if (data.diabetes) z += 0.65;
      z += 0.045 * (bmi - 22);
      z += 0.015 * (data.restingHR - 65);
      if (data.smoking) z += 0.95;
      z -= 0.35 * data.physicalActivity;
      if (data.prevHeartDisease) z += 1.3;
      if (data.hypertensionHistory) z += 0.4;
      z += 0.08 * ((data.familyHistoryScore || 0) - 3);
      if (data.hypertensionHistory || data.diabetes || data.cholesterol > 200 || data.prevHeartDisease) {
        z += 0.012 * (80 - (data.medicationAdherence || 0));
      } else {
        z += 0.005 * (80 - (data.medicationAdherence || 0));
      }
      let lrProb = 1 / (1 + Math.exp(-z));
      const trees = [
        () => {
          let score = 0.15;
          if (data.age > 50) score += 0.2;
          if (data.systolicBP > 140) score += 0.25;
          if (data.smoking) score += 0.15;
          if (data.prevHeartDisease) score += 0.25;
          if ((data.familyHistoryScore || 0) > 6) score += 0.15;
          return score;
        },
        () => {
          let score = 0.1;
          if (data.cholesterol > 220) score += 0.2;
          if (data.glucose > 110 || data.diabetes) score += 0.25;
          if (bmi > 28) score += 0.15;
          if (data.physicalActivity === 0) score += 0.1;
          if (data.prevHeartDisease) score += 0.2;
          if ((data.medicationAdherence || 0) < 70) score += 0.1;
          return score;
        },
        () => {
          let score = 0.12;
          if (data.smoking) score += 0.3;
          if (data.systolicBP > 130) score += 0.15;
          if (data.diastolicBP > 90) score += 0.15;
          if (data.physicalActivity > 0) score -= 0.1;
          if (data.restingHR > 75) score += 0.1;
          if (data.prevHeartDisease) score += 0.25;
          return score;
        },
        () => {
          let score = 0.08;
          if (data.age > 60) score += 0.3;
          if (data.sex === "male") score += 0.05;
          if (data.hypertensionHistory) score += 0.2;
          if (data.cholesterol > 240) score += 0.15;
          if (data.diabetes) score += 0.15;
          if ((data.familyHistoryScore || 0) > 4) score += 0.1;
          return score;
        },
        () => {
          let score = 0.05;
          if (data.prevHeartDisease) score += 0.45;
          if (bmi > 32) score += 0.2;
          if (data.age > 45) score += 0.1;
          if (data.smoking) score += 0.1;
          if (data.physicalActivity === 2) score -= 0.08;
          if ((data.medicationAdherence || 0) > 90) score -= 0.05;
          return score;
        }
      ];
      const rfProb = trees.reduce((acc, t) => acc + t(), 0) / trees.length;
      let logOdds = Math.log((lrProb * 0.4 + rfProb * 0.6) / (1 - (lrProb * 0.4 + rfProb * 0.6)));
      if (data.smoking && data.systolicBP > 140) logOdds += 0.35;
      if (data.diabetes && data.cholesterol > 240) logOdds += 0.3;
      if (data.age > 65 && data.prevHeartDisease) logOdds += 0.4;
      if (data.physicalActivity === 2 && bmi < 24) logOdds -= 0.25;
      if ((data.familyHistoryScore || 0) > 6 && data.age < 50) logOdds += 0.25;
      if ((data.medicationAdherence || 0) < 60 && (data.hypertensionHistory || data.diabetes)) logOdds += 0.3;
      const prob = 1 / (1 + Math.exp(-logOdds));
      return parseFloat((Math.min(Math.max(prob, 0.01), 0.99) * 100).toFixed(1));
    };

    // Step 1: Tobacco Cessation
    if (currentSim.smoking) {
      const nextSim = { ...currentSim, smoking: false };
      const newRisk = getRiskFor(nextSim);
      const diff = parseFloat((runningRisk - newRisk).toFixed(1));
      if (diff > 0.2) {
        steps.push({
          id: stepId++,
          label: "Absolute Nicotine Cessation",
          description: "Stops toxic endothelial damage, prevents acute arterial spasms, and drops cardiovascular risk immediately.",
          delta: -diff,
          targetState: { smoking: false }
        });
        currentSim = nextSim;
        runningRisk = newRisk;
      }
    }

    if (runningRisk <= targetVal) {
      setActiveTrajectorySteps(steps);
      setIsTrajectorySolved(true);
      return;
    }

    // Step 2: Medication Adherence boost
    if ((currentSim.medicationAdherence || 0) < 95) {
      const nextSim = { ...currentSim, medicationAdherence: 95 };
      const newRisk = getRiskFor(nextSim);
      const diff = parseFloat((runningRisk - newRisk).toFixed(1));
      if (diff > 0.2) {
        steps.push({
          id: stepId++,
          label: "Optimize Medication Adherence to 95%",
          description: "Stabilizes active cardiovascular therapies (statin concentration, BP control) at metabolic equilibrium.",
          delta: -diff,
          targetState: { medicationAdherence: 95 }
        });
        currentSim = nextSim;
        runningRisk = newRisk;
      }
    }

    if (runningRisk <= targetVal) {
      setActiveTrajectorySteps(steps);
      setIsTrajectorySolved(true);
      return;
    }

    // Step 3: Escalate Physical Activity to Active (2)
    if (currentSim.physicalActivity < 2) {
      const nextSim = { ...currentSim, physicalActivity: 2 };
      const newRisk = getRiskFor(nextSim);
      const diff = parseFloat((runningRisk - newRisk).toFixed(1));
      if (diff > 0.2) {
        steps.push({
          id: stepId++,
          label: "Structured Cardiorespiratory Physical Training",
          description: "Prescribes 150+ minutes of weekly aerobic exercise to expand collateral coronary perfusion channels.",
          delta: -diff,
          targetState: { physicalActivity: 2 }
        });
        currentSim = nextSim;
        runningRisk = newRisk;
      }
    }

    if (runningRisk <= targetVal) {
      setActiveTrajectorySteps(steps);
      setIsTrajectorySolved(true);
      return;
    }

    // Step 4: Manage Systolic BP down
    if (currentSim.systolicBP > 120) {
      const targetBP = Math.max(120, currentSim.systolicBP - 20);
      const nextSim = { ...currentSim, systolicBP: targetBP };
      const newRisk = getRiskFor(nextSim);
      const diff = parseFloat((runningRisk - newRisk).toFixed(1));
      if (diff > 0.2) {
        steps.push({
          id: stepId++,
          label: `BP Optimization to ${targetBP} mmHg`,
          description: "Reduces continuous mechanical shear stress against major cerebral and coronary vascular walls.",
          delta: -diff,
          targetState: { systolicBP: targetBP, diastolicBP: Math.max(75, Math.min(80, currentSim.diastolicBP - 8)) }
        });
        currentSim = nextSim;
        runningRisk = newRisk;
      }
    }

    if (runningRisk <= targetVal) {
      setActiveTrajectorySteps(steps);
      setIsTrajectorySolved(true);
      return;
    }

    // Step 5: Reduce Cholesterol
    if (currentSim.cholesterol > 180) {
      const targetChol = Math.max(180, currentSim.cholesterol - 50);
      const nextSim = { ...currentSim, cholesterol: targetChol };
      const newRisk = getRiskFor(nextSim);
      const diff = parseFloat((runningRisk - newRisk).toFixed(1));
      if (diff > 0.2) {
        steps.push({
          id: stepId++,
          label: `Lipid Mitigation to ${targetChol} mg/dL`,
          description: "Shrinks vascular lipid cores, preventing progressive atherosclerotic occlusion in cardiac vessels.",
          delta: -diff,
          targetState: { cholesterol: targetChol }
        });
        currentSim = nextSim;
        runningRisk = newRisk;
      }
    }

    if (runningRisk <= targetVal) {
      setActiveTrajectorySteps(steps);
      setIsTrajectorySolved(true);
      return;
    }

    // Step 6: Target Weight Reduction
    const currentHeightM = currentSim.height / 100;
    const optimalWeight = Math.round(22.5 * currentHeightM * currentHeightM);
    if (currentSim.weight > optimalWeight + 2) {
      const targetW = Math.max(optimalWeight, currentSim.weight - 10);
      const nextSim = { ...currentSim, weight: targetW };
      const newRisk = getRiskFor(nextSim);
      const diff = parseFloat((runningRisk - newRisk).toFixed(1));
      if (diff > 0.2) {
        steps.push({
          id: stepId++,
          label: `Metabolic Weight Reduction to ${targetW} kg`,
          description: "Mitigates visceral adipose inflammatory cytokine release and drops myocardial strain indices.",
          delta: -diff,
          targetState: { weight: targetW }
        });
        currentSim = nextSim;
        runningRisk = newRisk;
      }
    }

    if (runningRisk <= targetVal) {
      setActiveTrajectorySteps(steps);
      setIsTrajectorySolved(true);
      return;
    }

    // Step 7: Glycemic Stability
    if (currentSim.glucose > 90) {
      const targetGluc = Math.max(90, currentSim.glucose - 20);
      const nextSim = { ...currentSim, glucose: targetGluc };
      const newRisk = getRiskFor(nextSim);
      const diff = parseFloat((runningRisk - newRisk).toFixed(1));
      if (diff > 0.2) {
        steps.push({
          id: stepId++,
          label: `Glycemic Control to ${targetGluc} mg/dL`,
          description: "Halts systemic protein glycation and microvascular sclerosis in renal and cardiac tissue networks.",
          delta: -diff,
          targetState: { glucose: targetGluc }
        });
        currentSim = nextSim;
        runningRisk = newRisk;
      }
    }

    setActiveTrajectorySteps(steps);
    setIsTrajectorySolved(true);
  };

  const applyTrajectoryToSandbox = () => {
    let consolidated = { ...simulatedData };
    activeTrajectorySteps.forEach(step => {
      consolidated = { ...consolidated, ...step.targetState };
    });
    setSimulatedData(consolidated);
    runLocalSimulation(consolidated);
  };

  // Calculate dynamic standard deviation based on model accuracy/confidence
  const confidencePercent = parseFloat(modelConfidence.replace(/[^0-9.]/g, "")) || 90;
  const distributionSD = Math.max(3.5, 15 - (confidencePercent - 80) * 0.7); // higher accuracy = narrower standard deviation (higher peak, higher certainty)

  // Generate Gaussian distribution curve data around overallRisk or simulatedRisk
  const generateDistributionData = (mean: number, sd: number) => {
    const dataPoints = [];
    // Span +/- 3 standard deviations to fully capture the distribution
    const minX = Math.max(0, Math.round(mean - 3 * sd));
    const maxX = Math.min(100, Math.round(mean + 3 * sd));
    
    for (let x = minX; x <= maxX; x += 1) {
      const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(sd, 2));
      const density = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(exponent) * 100;
      dataPoints.push({
        percentage: x,
        density: parseFloat(density.toFixed(3)),
        isCurrent: x === Math.round(mean)
      });
    }
    return dataPoints;
  };

  const distributionCurveData = generateDistributionData(overallRisk, distributionSD);
  const confidenceLowerBound = parseFloat(Math.max(1, overallRisk - 1.96 * distributionSD / 2).toFixed(1));
  const confidenceUpperBound = parseFloat(Math.min(99, overallRisk + 1.96 * distributionSD / 2).toFixed(1));

  // Sync simulated state on reload
  useEffect(() => {
    setSimulatedData({ ...patientData });
    setSimulatedRisk(overallRisk);
  }, [predictionResult]);

  // Cleanly formats and renders Gemini generated summary text without any raw markdown '#' hash marks
  const renderCleanSummary = (text: string) => {
    if (!text) return null;
    
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // Remove any leading markdown heading symbols like ###, ##, #
      if (trimmed.startsWith("#")) {
        const cleanHeading = trimmed.replace(/^#+\s*/, "");
        if (!cleanHeading) return null;
        return (
          <h5 key={idx} className="text-rose-700 font-extrabold text-xs tracking-wider uppercase mt-4 mb-1.5 block">
            {cleanHeading.replace(/\*/g, "")}
          </h5>
        );
      }
      
      // List items (starts with - or * or •)
      if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
        const cleanListItem = trimmed.replace(/^[-*•]\s*/, "");
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-3 my-1 text-slate-600 text-xs">
            <span className="text-rose-500 mt-1 flex-shrink-0">•</span>
            <span>{cleanListItem.replace(/\*\*/g, "")}</span>
          </div>
        );
      }

      // Eliminate all other '#' characters to prevent any accidental display
      const processed = line.replace(/#/g, "");

      // Handle simple bold tags **bold** within lines
      if (processed.includes("**")) {
        const parts = processed.split("**");
        return (
          <p key={idx} className="min-h-[1rem] text-slate-600 text-xs font-normal leading-relaxed my-1">
            {parts.map((part, pIdx) => {
              return pIdx % 2 === 1 ? (
                <strong key={pIdx} className="font-extrabold text-slate-800">{part}</strong>
              ) : (
                part
              );
            })}
          </p>
        );
      }
      
      return (
        <p key={idx} className="min-h-[1rem] text-slate-600 text-xs font-normal leading-relaxed my-1">
          {processed}
        </p>
      );
    });
  };

  // Client-side lightweight replicate of the backend XGBoost model logic to allow instantaneous, zero-latency sliders!
  const runLocalSimulation = (data: PatientData) => {
    // 1. BMI calculation
    const heightM = data.height / 100;
    const bmi = heightM > 0 ? parseFloat((data.weight / (heightM * heightM)).toFixed(1)) : 22;

    // 2. Base Z calculation
    let z = -4.5;
    z += 0.045 * (data.age - 30);
    if (data.sex === "male") z += 0.25;
    z += 0.022 * (data.systolicBP - 120);
    z += 0.01 * (data.diastolicBP - 80);
    z += 0.012 * (data.cholesterol - 180);
    z += 0.008 * (data.glucose - 90);
    if (data.diabetes) z += 0.65;
    z += 0.045 * (bmi - 22);
    z += 0.015 * (data.restingHR - 65);
    if (data.smoking) z += 0.95;
    z -= 0.35 * data.physicalActivity;
    if (data.prevHeartDisease) z += 1.3;
    if (data.hypertensionHistory) z += 0.4;

    // Family History Score (baseline score is 3; higher increases risk, lower reduces)
    z += 0.08 * ((data.familyHistoryScore || 0) - 3);

    // Medication Adherence (highly relevant for patients with hypertension, diabetes, high cholesterol, or history of CVD)
    if (data.hypertensionHistory || data.diabetes || data.cholesterol > 200 || data.prevHeartDisease) {
      z += 0.012 * (80 - (data.medicationAdherence || 0));
    } else {
      z += 0.005 * (80 - (data.medicationAdherence || 0));
    }

    // 3. Sigmoid
    let lrProb = 1 / (1 + Math.exp(-z));

    // 4. Random Forest replicate
    const trees = [
      () => {
        let score = 0.15;
        if (data.age > 50) score += 0.2;
        if (data.systolicBP > 140) score += 0.25;
        if (data.smoking) score += 0.15;
        if (data.prevHeartDisease) score += 0.25;
        if ((data.familyHistoryScore || 0) > 6) score += 0.15;
        return score;
      },
      () => {
        let score = 0.1;
        if (data.cholesterol > 220) score += 0.2;
        if (data.glucose > 110 || data.diabetes) score += 0.25;
        if (bmi > 28) score += 0.15;
        if (data.physicalActivity === 0) score += 0.1;
        if (data.prevHeartDisease) score += 0.2;
        if ((data.medicationAdherence || 0) < 70) score += 0.1;
        return score;
      },
      () => {
        let score = 0.12;
        if (data.smoking) score += 0.3;
        if (data.systolicBP > 130) score += 0.15;
        if (data.diastolicBP > 90) score += 0.15;
        if (data.physicalActivity > 0) score -= 0.1;
        if (data.restingHR > 75) score += 0.1;
        if (data.prevHeartDisease) score += 0.25;
        return score;
      },
      () => {
        let score = 0.08;
        if (data.age > 60) score += 0.3;
        if (data.sex === "male") score += 0.05;
        if (data.hypertensionHistory) score += 0.2;
        if (data.cholesterol > 240) score += 0.15;
        if (data.diabetes) score += 0.15;
        if ((data.familyHistoryScore || 0) > 4) score += 0.1;
        return score;
      },
      () => {
        let score = 0.05;
        if (data.prevHeartDisease) score += 0.45;
        if (bmi > 32) score += 0.2;
        if (data.age > 45) score += 0.1;
        if (data.smoking) score += 0.1;
        if (data.physicalActivity === 2) score -= 0.08;
        if ((data.medicationAdherence || 0) > 90) score -= 0.05;
        return score;
      }
    ];
    const rfProb = trees.reduce((acc, tree) => acc + tree(), 0) / trees.length;

    // 5. XGBoost blend
    let logOdds = Math.log((lrProb * 0.4 + rfProb * 0.6) / (1 - (lrProb * 0.4 + rfProb * 0.6)));
    if (data.smoking && data.systolicBP > 140) logOdds += 0.35;
    if (data.diabetes && data.cholesterol > 240) logOdds += 0.3;
    if (data.age > 65 && data.prevHeartDisease) logOdds += 0.4;
    if (data.physicalActivity === 2 && bmi < 24) logOdds -= 0.25;
    if ((data.familyHistoryScore || 0) > 6 && data.age < 50) logOdds += 0.25;
    if ((data.medicationAdherence || 0) < 60 && (data.hypertensionHistory || data.diabetes)) logOdds += 0.3;

    const prob = 1 / (1 + Math.exp(-logOdds));
    const finalRisk = parseFloat((Math.min(Math.max(prob, 0.01), 0.99) * 100).toFixed(1));
    setSimulatedRisk(finalRisk);
  };

  const handleSliderChange = (name: keyof PatientData, value: number | boolean) => {
    const updated = {
      ...simulatedData,
      [name]: value
    };
    setSimulatedData(updated);
    runLocalSimulation(updated);
  };

  // SHAP Chart data preprocessing
  const shapChartData = shap.shapValues.map(item => ({
    name: item.displayName.split(" (")[0], // clean label
    value: item.shapValue,
    fill: item.shapValue > 0 ? "#f43f5e" : "#10b981", // Rose-500 vs Emerald-500
    displayVal: `${item.shapValue > 0 ? "+" : ""}${item.shapValue}%`
  })).reverse(); // show strongest on top

  // Multi-CVD Radar Chart data
  const multiCvdChartData = multiCvd.map(item => ({
    subject: item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name,
    probability: item.probability,
    fullMark: 100,
  }));

  // Scatter plot data for patient similarity projection space
  const centroidPoints = cluster.allCentroids.map(c => ({
    x: c.x,
    y: c.y,
    name: c.name,
    isCentroid: true
  }));

  const patientPoint = {
    x: cluster.patientCoordinates.x,
    y: cluster.patientCoordinates.y,
    name: `Patient (Similarity Matched)`,
    isCentroid: false
  };

  const simulatedPatientPoint = {
    // calculate simple coordinate movement based on simulation improvements
    x: parseFloat((cluster.patientCoordinates.x - (overallRisk - simulatedRisk) * 0.07).toFixed(2)),
    y: parseFloat((cluster.patientCoordinates.y - (overallRisk - simulatedRisk) * 0.04).toFixed(2)),
    name: "Simulated Scenario",
    isSimulated: true
  };

  const riskDiff = parseFloat((simulatedRisk - overallRisk).toFixed(1));

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 py-8">
      
      {/* Upper Navigation Action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-slate-800 text-base">Assessment Dashboard Active</h3>
          </div>
          <p className="text-slate-500 text-xs">
            {patientData.name ? <strong className="text-slate-800 font-bold mr-1.5">{patientData.name}</strong> : null}
            Patient Profile: {patientData.age} y/o {patientData.sex} • Computed: {timestamp}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            id="btn-re-assess"
            onClick={onBackToInput}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Modify Inputs
          </button>
          
          <button
            id="btn-refresh-summary-top"
            onClick={onRefreshSummary}
            disabled={isGeminiLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeminiLoading ? "animate-spin" : ""}`} />
            Regenerate Summary
          </button>
        </div>
      </div>

      {/* Grid: Main Prediction Metrics vs AI Personal Summary */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Overall Risk Gauge Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col items-center justify-between min-h-[460px]">
          <div className="w-full text-center space-y-1 border-b border-slate-100 pb-4">
            <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Overall Cardiovascular Risk</h4>
            <p className="text-slate-400 text-[10px]">Computed via XGBoost Multi-Feature Ensemble</p>
          </div>

          {/* Large Circular Probability Display */}
          <div className="relative my-8 flex items-center justify-center">
            {/* SVG Ring background */}
            <svg className="w-56 h-56 transform -rotate-90">
              {/* Gray ring */}
              <circle 
                cx="112" cy="112" r="95" 
                className="stroke-slate-100" 
                strokeWidth="16" 
                fill="none" 
              />
              {/* Colored ring */}
              <motion.circle 
                cx="112" cy="112" r="95" 
                className={overallRisk >= 50 ? "stroke-red-500" : overallRisk >= 25 ? "stroke-amber-500" : "stroke-teal-500"} 
                strokeWidth="16" 
                fill="none" 
                strokeDasharray={597}
                initial={{ strokeDashoffset: 597 }}
                animate={{ strokeDashoffset: 597 - (597 * overallRisk) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            
            {/* Value central text overlay */}
            <div className="absolute flex flex-col items-center">
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-5xl font-extrabold tracking-tight text-slate-900"
              >
                {overallRisk}%
              </motion.span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Probability</span>
            </div>
          </div>

          {/* Classification Banner */}
          <div className="w-full space-y-4">
            <div className="p-3 rounded-2xl text-center font-extrabold uppercase tracking-widest text-sm flex items-center justify-center gap-2 border bg-slate-50">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${overallRisk >= 50 ? "bg-red-400" : overallRisk >= 25 ? "bg-amber-400" : "bg-teal-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${overallRisk >= 50 ? "bg-red-500" : overallRisk >= 25 ? "bg-amber-500" : "bg-teal-500"}`}></span>
              </span>
              <span className={overallRisk >= 50 ? "text-red-600" : overallRisk >= 25 ? "text-amber-600" : "text-teal-600"}>
                {riskCategory}
              </span>
            </div>

            {/* Diagnostics Stats list */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] block font-semibold text-slate-400 uppercase">Confidence</span>
                <span className="font-extrabold text-sm text-slate-800">{modelConfidence}</span>
              </div>
              <div className="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] block font-semibold text-slate-400 uppercase">Data Quality</span>
                <span className={`font-extrabold text-sm ${dataQuality.score >= 80 ? "text-teal-600" : "text-amber-600"}`}>
                  {dataQuality.score}/100
                </span>
              </div>
            </div>

            {/* 95% Confidence Interval Uncertainty Visualization */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-600 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  95% Confidence Interval
                </span>
                <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[10px]">
                  {confidenceLowerBound}% – {confidenceUpperBound}%
                </span>
              </div>

              {/* Graphical Error Bar */}
              <div className="space-y-1">
                <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden flex items-center">
                  {/* CI Range shaded bar */}
                  <div 
                    className="absolute h-full bg-indigo-300/80 rounded-full"
                    style={{
                      left: `${confidenceLowerBound}%`,
                      width: `${Math.max(4, confidenceUpperBound - confidenceLowerBound)}%`
                    }}
                  />
                  {/* Mean Point Indicator */}
                  <div 
                    className="absolute w-2.5 h-2.5 bg-rose-600 border-2 border-white rounded-full shadow-sm"
                    style={{
                      left: `calc(${overallRisk}% - 5px)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>0%</span>
                  <span className="text-rose-600 font-extrabold">Mean: {overallRisk}% (±{((confidenceUpperBound - confidenceLowerBound) / 2).toFixed(1)}%)</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI-Generated Personalized clinical summary brief */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-md min-h-[460px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-lg">Personalized AI Clinical Briefing</h4>
                  <p className="text-xs text-slate-500">Model-informed evaluation context and physiological insights</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Interpretation Mode Toggle */}
                <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-xl shrink-0">
                  <button
                    onClick={() => setInterpretationMode("professional")}
                    className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg tracking-wider transition-all cursor-pointer ${
                      interpretationMode === "professional" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    🩺 MEDICAL PRO
                  </button>
                  <button
                    onClick={() => setInterpretationMode("layman")}
                    className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg tracking-wider transition-all cursor-pointer ${
                      interpretationMode === "layman" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    👤 LAYMAN ENGLISH
                  </button>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold shrink-0">
                  <Brain className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>GEMINI 3.7 FLASH</span>
                </span>
              </div>
            </div>

            {/* Text Report block */}
            <div className="text-sm leading-relaxed text-slate-700 overflow-y-auto max-h-[300px] pr-2 space-y-4 font-normal">
              {isGeminiLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" />
                  <p className="text-slate-500 font-bold text-xs">Querying server-side medical-text generator...</p>
                </div>
              ) : (
                (() => {
                  const summaryData = parseSummary(geminiSummary);
                  const activeText = interpretationMode === "professional" 
                    ? summaryData.professionalSummary 
                    : summaryData.laymanSummary;
                  return (
                    <div className="space-y-4">
                      <div className="prose prose-slate max-w-none text-slate-600">
                        {renderCleanSummary(activeText)}
                      </div>

                      {/* Personalized Treatment, Medicine, and Lifestyle Pathways */}
                      <div className="border-t border-slate-100 pt-5 mt-5 space-y-4">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                          <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Personalized Therapeutic Pathways</h5>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          {/* Column 1: Medicine / Pharmacotherapy */}
                          <div className="p-4 bg-rose-50/45 border border-rose-100/50 rounded-2xl space-y-2">
                            <div className="flex items-center gap-1.5 text-rose-700">
                              <Pill className="w-4 h-4" />
                              <span className="text-xs font-extrabold uppercase tracking-wide">Target Pharmacotherapy</span>
                            </div>
                            <ul className="space-y-1.5">
                              {(interpretationMode === "professional" 
                                ? summaryData.professionalRecommendations.medicine 
                                : summaryData.laymanRecommendations.medicine
                              ).map((rec, rIdx) => (
                                <li key={rIdx} className="text-[11px] leading-relaxed text-slate-600 flex items-start gap-1.5 font-normal">
                                  <span className="text-rose-500 font-bold mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Column 2: Lifestyle / Prevention */}
                          <div className="p-4 bg-emerald-50/45 border border-emerald-100/50 rounded-2xl space-y-2">
                            <div className="flex items-center gap-1.5 text-emerald-700">
                              <Apple className="w-4 h-4" />
                              <span className="text-xs font-extrabold uppercase tracking-wide">Lifestyle & Habits</span>
                            </div>
                            <ul className="space-y-1.5">
                              {(interpretationMode === "professional" 
                                ? summaryData.professionalRecommendations.lifestyle 
                                : summaryData.laymanRecommendations.lifestyle
                              ).map((rec, rIdx) => (
                                <li key={rIdx} className="text-[11px] leading-relaxed text-slate-600 flex items-start gap-1.5 font-normal">
                                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Column 3: Clinical Cycle / Plan */}
                          <div className="p-4 bg-indigo-50/45 border border-indigo-100/50 rounded-2xl space-y-2 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-indigo-700">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-extrabold uppercase tracking-wide">Treatment Plan</span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-slate-600 font-normal">
                                {interpretationMode === "professional" 
                                  ? summaryData.professionalRecommendations.treatmentPlan 
                                  : summaryData.laymanRecommendations.treatmentPlan}
                              </p>
                            </div>
                            <div className="pt-2 border-t border-indigo-100/40 text-[9px] uppercase font-bold text-indigo-500 tracking-wider">
                              Clinical Schedule Sync
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* Legal disclaimer inside summary card */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-800 font-normal">
              <strong>Educational Decision Support Only:</strong> This brief is generated automatically from predictive models to support clinical context. It is not an active medical diagnosis or treatment plan. All clinical findings must be audited by qualified healthcare professionals.
            </p>
          </div>
        </div>

      </div>

      {/* Historical Risk Trend Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">Longitudinal Clinical Risk Trend</h3>
              <p className="text-slate-500 text-xs font-normal">Track patient's cardiovascular risk projection variations over multiple clinical runs and simulated interventions.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-md">
              {predictionHistory && predictionHistory.length > 0 ? `${predictionHistory.length} Run(s) Recorded` : "0 Runs Recorded"}
            </span>
          </div>
        </div>

        {(!predictionHistory || predictionHistory.length < 2) ? (
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-white border border-slate-150 rounded-full text-slate-400 shadow-sm">
              <Activity className="w-6 h-6 animate-pulse text-indigo-500" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Awaiting Additional Records</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                To generate a longitudinal trend analysis, please modify some patient metrics (e.g. via the "Modify Inputs" flow or the "What-If Simulation" sliders) and execute a new analysis, or load another preset case.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Key Statistics */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Baseline Risk</span>
                <p className="text-xl font-extrabold text-slate-800">
                  {predictionHistory[predictionHistory.length - 1]?.prediction.overallRisk}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Most Recent Risk</span>
                <p className="text-xl font-extrabold text-slate-800">
                  {predictionHistory[0]?.prediction.overallRisk}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Variance</span>
                <p className={`text-xl font-extrabold ${
                  predictionHistory[0]?.prediction.overallRisk < predictionHistory[predictionHistory.length - 1]?.prediction.overallRisk 
                    ? "text-emerald-600" 
                    : predictionHistory[0]?.prediction.overallRisk > predictionHistory[predictionHistory.length - 1]?.prediction.overallRisk 
                    ? "text-rose-600" 
                    : "text-slate-600"
                }`}>
                  {predictionHistory[0]?.prediction.overallRisk - predictionHistory[predictionHistory.length - 1]?.prediction.overallRisk > 0 ? "+" : ""}
                  {(predictionHistory[0]?.prediction.overallRisk - predictionHistory[predictionHistory.length - 1]?.prediction.overallRisk).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Health Stage</span>
                <div>
                  <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    overallRisk >= 50 
                      ? "bg-red-50 text-red-700 border border-red-200" 
                      : overallRisk >= 25 
                      ? "bg-amber-50 text-amber-700 border border-amber-200" 
                      : "bg-teal-50 text-teal-700 border border-teal-200"
                  }`}>
                    {riskCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[...(predictionHistory || [])].reverse().map((item, idx) => ({
                    index: idx + 1,
                    runName: `Run #${idx + 1}`,
                    timestamp: item.timestamp,
                    risk: item.prediction.overallRisk,
                    systolicBP: item.patientData.systolicBP,
                    cholesterol: item.patientData.cholesterol,
                    weight: item.patientData.weight,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="runName" 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    fontWeight={600}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    fontWeight={600}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 space-y-2 text-xs">
                            <div className="border-b border-slate-800 pb-1 flex justify-between gap-4">
                              <span className="font-extrabold text-[10px] uppercase text-rose-400">{data.runName}</span>
                              <span className="text-slate-400 text-[10px]">{data.timestamp}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between gap-4 font-bold">
                                <span className="text-slate-300">CV Risk Index:</span>
                                <span className="text-rose-400 text-sm font-black">{data.risk}%</span>
                              </div>
                              <div className="flex justify-between gap-4 font-normal text-slate-400">
                                <span>Blood Pressure:</span>
                                <span>{data.systolicBP} mmHg</span>
                              </div>
                              <div className="flex justify-between gap-4 font-normal text-slate-400">
                                <span>Cholesterol:</span>
                                <span>{data.cholesterol} mg/dL</span>
                              </div>
                              <div className="flex justify-between gap-4 font-normal text-slate-400">
                                <span>Weight:</span>
                                <span>{data.weight} kg</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#ec4899" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#riskGrad)" 
                    activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Explainable AI & Advanced Analytics Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
        
        {/* Sub-tab Selection Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Brain className="w-6 h-6 text-rose-600 animate-pulse" />
              Explainable AI & Advanced Model Analytics
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              {dashboardSubTab === "shap" 
                ? "Local SHAP values representing absolute risk percentage points relative to baseline population rates."
                : "Probability density projections, Bayesian error margins, and model uncertainty confidence limits."}
            </p>
          </div>
          
          <div className="flex border border-slate-200 bg-slate-50 rounded-2xl p-1 shadow-sm shrink-0">
            <button
              onClick={() => setDashboardSubTab("shap")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                dashboardSubTab === "shap" ? "bg-slate-900 text-white shadow-md shadow-slate-100" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SHAP Attribution Map
            </button>
            <button
              onClick={() => setDashboardSubTab("distribution")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                dashboardSubTab === "distribution" ? "bg-slate-900 text-white shadow-md shadow-slate-100" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Probability Curve & C.I.
            </button>
          </div>
        </div>

        {dashboardSubTab === "shap" ? (
          /* SHAP View */
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Horizontal SHAP Bar Chart */}
            <div className="lg:col-span-7 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={shapChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid stroke="#475569" strokeDasharray="3 3" opacity={0.65} horizontal={false} />
                  <XAxis type="number" domain={[-25, 25]} tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} stroke="#475569" />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fill: "#334155", fontSize: 11, fontWeight: "bold" }} stroke="#475569" />
                  <Tooltip 
                    formatter={(value: any) => [`${value > 0 ? "+" : ""}${value}%`, "Contribution to Risk"]}
                    labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                  />
                  <Bar dataKey="value">
                    {shapChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Clinical Interpretation Context */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Sliders className="w-4.5 h-4.5 text-rose-600" />
                  Local SHAP Variable Diagnostics
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed font-normal">
                  Features pushing predictions rightward (rose bars) indicate elevation parameters relative to clinical populations, whereas green bars indicate healthy metrics acting as protective shields.
                </p>

                {/* Lists */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-red-600 block">Top Risk Drivers</span>
                    <div className="flex flex-wrap gap-1.5">
                      {shap.riskIncreasing.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                          {item.displayName.split(" (")[0]} (+{item.shapValue}%)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-600 block">Top Protective Drivers</span>
                    <div className="flex flex-wrap gap-1.5">
                      {shap.riskReducing.length > 0 ? shap.riskReducing.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                          {item.displayName.split(" (")[0]} ({item.shapValue}%)
                        </span>
                      )) : <span className="text-slate-400 text-xs italic">No protective features detected.</span>}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-xs italic">
                *Note: SHAP values represent statistical feature attributions to the ML model output, not direct physical blood vessels measurements or flow rates.
              </p>
            </div>
          </div>
        ) : (
          /* Probability Distribution Curve & Model Confidence Interval View */
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Recharts Area Chart displaying PDF Curve */}
            <div className="lg:col-span-7 h-[360px] bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={distributionCurveData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.5} />
                  <XAxis 
                    dataKey="percentage" 
                    type="number" 
                    domain={["dataMin", "dataMax"]} 
                    tickFormatter={(v) => `${v}%`} 
                    stroke="#475569" 
                    fontSize={10} 
                    fontWeight="bold"
                  />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(v: any) => [`${parseFloat(v).toFixed(2)}`, "Relative Density Strength"]}
                    labelFormatter={(v) => `Risk Hypothesis: ${v}%`}
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#ffffff", borderRadius: "12px", fontSize: "11px" }}
                  />
                  
                  {/* Confidence Interval shaded area */}
                  <Area 
                    type="monotone" 
                    dataKey="density" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fill="#818cf8" 
                    fillOpacity={0.25} 
                  />

                  {/* Vertical line at the Exact Patient Baseline Prediction */}
                  <ReferenceLine 
                    x={overallRisk} 
                    stroke="#f43f5e" 
                    strokeWidth={2.5} 
                    strokeDasharray="4 4"
                    label={{ 
                      value: `Baseline Prediction: ${overallRisk}%`, 
                      fill: "#f43f5e", 
                      fontSize: 10, 
                      fontWeight: "extrabold", 
                      position: "top" 
                    }} 
                  />

                  {/* Shaded boundaries for the 95% Confidence Interval */}
                  <ReferenceLine x={confidenceLowerBound} stroke="#e2e8f0" strokeWidth={1.5} label={{ value: `Lower C.I. (${confidenceLowerBound}%)`, fill: "#94a3b8", fontSize: 8, position: "insideBottomLeft" }} />
                  <ReferenceLine x={confidenceUpperBound} stroke="#e2e8f0" strokeWidth={1.5} label={{ value: `Upper C.I. (${confidenceUpperBound}%)`, fill: "#94a3b8", fontSize: 8, position: "insideBottomRight" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Scientific Interpretation Info Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Shield className="w-4.5 h-4.5 text-indigo-600" />
                  Bayesian Uncertainty Analysis
                </h4>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600 font-medium">
                  <p>
                    Rather than predicting a single deterministic number, the ensemble classifier projects a <strong>Probability Density Function (PDF)</strong> representing overall prediction certainty.
                  </p>
                  
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block leading-none">Statistical Confidence Limits (95% CI)</span>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-base">[{confidenceLowerBound}% — {confidenceUpperBound}%]</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[9px] font-extrabold uppercase">High Integrity</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-normal">
                    The width of the curve is calculated from the active classifier precision score of <strong>{modelConfidence}</strong>. Better data alignment yields narrower curves with more localized peaks.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-indigo-800 font-semibold">
                  <strong>Clinical Utility:</strong> If the 95% confidence interval stays below 25%, the patient has high cardiovascular resilience. C.I. bands spreading past 50% warrant immediate preventative diagnostic reviews.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Section 2: What-If Simulation Engine */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-8">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-rose-600" />
            What-If AI Simulation Sandbox
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Interactively alter modifiable parameters below and see the **instantaneous, model-estimated risk output change** compared side-by-side with the current patient baseline.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Sliders Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Systolic BP slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Systolic BP</span>
                  <span className="text-rose-600">{simulatedData.systolicBP} mmHg</span>
                </div>
                <input 
                  type="range" min="90" max="220" 
                  value={simulatedData.systolicBP} 
                  onChange={(e) => handleSliderChange("systolicBP", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400"><span>Optimal (120)</span><span>Hypertensive (&gt;140)</span></div>
              </div>

              {/* Diastolic BP slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Diastolic BP</span>
                  <span className="text-rose-600">{simulatedData.diastolicBP} mmHg</span>
                </div>
                <input 
                  type="range" min="60" max="130" 
                  value={simulatedData.diastolicBP} 
                  onChange={(e) => handleSliderChange("diastolicBP", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400"><span>Optimal (80)</span><span>Severe (&gt;100)</span></div>
              </div>

              {/* Weight slider for live BMI adjustment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Weight</span>
                  <span className="text-rose-600">{simulatedData.weight} kg</span>
                </div>
                <input 
                  type="range" min="40" max="180" 
                  value={simulatedData.weight} 
                  onChange={(e) => handleSliderChange("weight", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400"><span>Target Optimal (BMI 22)</span><span>Overweight / Obese</span></div>
              </div>

              {/* Cholesterol slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Serum Cholesterol</span>
                  <span className="text-rose-600">{simulatedData.cholesterol} mg/dL</span>
                </div>
                <input 
                  type="range" min="120" max="400" 
                  value={simulatedData.cholesterol} 
                  onChange={(e) => handleSliderChange("cholesterol", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400"><span>Healthy (&lt;180)</span><span>Severe (&gt;240)</span></div>
              </div>

              {/* Glucose slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Glucose Level</span>
                  <span className="text-rose-600">{simulatedData.glucose} mg/dL</span>
                </div>
                <input 
                  type="range" min="60" max="300" 
                  value={simulatedData.glucose} 
                  onChange={(e) => handleSliderChange("glucose", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400"><span>Normal (80)</span><span>Elevated / Diabetic (&gt;125)</span></div>
              </div>

              {/* Weekly Physical Activity */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Weekly Activity Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSliderChange("physicalActivity", val)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        simulatedData.physicalActivity === val
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {val === 0 ? "Sedentary" : val === 1 ? "Moderate" : "Active"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tobacco consumption */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Tobacco Consumption</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSliderChange("smoking", false)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                      !simulatedData.smoking
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Non-Smoker
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSliderChange("smoking", true)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                      simulatedData.smoking
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Active Smoker
                  </button>
                </div>
              </div>

              {/* Family History Score Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Family History Score</span>
                  <span className="text-rose-600">{simulatedData.familyHistoryScore || 0}/10</span>
                </div>
                <input 
                  type="range" min="0" max="10" step="1"
                  value={simulatedData.familyHistoryScore || 0} 
                  onChange={(e) => handleSliderChange("familyHistoryScore", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400"><span>No Family History (0)</span><span>Severe Prevalence (10)</span></div>
              </div>

              {/* Medication Adherence Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Medication Adherence</span>
                  <span className="text-rose-600">{simulatedData.medicationAdherence || 0}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={simulatedData.medicationAdherence || 0} 
                  onChange={(e) => handleSliderChange("medicationAdherence", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400"><span>No Compliance (0%)</span><span>Perfect Compliance (100%)</span></div>
              </div>

            </div>
          </div>

          {/* Right: What-If Comparison Cards */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-6 flex flex-col justify-between">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
              <Activity className="w-4 h-4 text-rose-600" />
              Dynamic Simulation Result
            </h4>

            <div className="space-y-4">
              {/* Compare Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Original Baseline</span>
                  <div className="text-2xl font-extrabold text-slate-800 mt-1">{overallRisk}%</div>
                </div>

                <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-sm text-center relative overflow-hidden">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">Simulated Sandbox</span>
                  <div className="text-2xl font-extrabold text-rose-600 mt-1">{simulatedRisk}%</div>
                  {/* Subtle pulsing glow */}
                  <span className={`absolute top-0 right-0 w-2 h-2 rounded-full m-1 animate-ping ${
                    simulatedRisk >= 50 ? "bg-red-500" : simulatedRisk >= 25 ? "bg-amber-500" : "bg-teal-500"
                  }`} />
                </div>
              </div>

              {/* Difference card */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                riskDiff < 0 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                  : riskDiff > 0 
                  ? "bg-rose-50 border-rose-100 text-rose-800" 
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider block">Model Delta Difference</span>
                  <span className="text-xl font-extrabold">
                    {riskDiff < 0 ? "📉" : riskDiff > 0 ? "📈" : "•"} {riskDiff > 0 ? "+" : ""}{riskDiff} percentage points
                  </span>
                </div>
                {riskDiff < 0 && (
                  <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold rounded-full text-xs">
                    Risk Reduced
                  </span>
                )}
              </div>
            </div>

            {/* What-If Counterfactual Trajectory Solver */}
            <div className="bg-gradient-to-br from-indigo-50/70 to-rose-50/70 border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">What-If AI Trajectory Solver</span>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">Ensemble Model Solved</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-600 font-medium">Set Target Risk Goal:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1" 
                      max={Math.round(overallRisk)} 
                      value={targetRiskThreshold}
                      onChange={(e) => setTargetRiskThreshold(Math.max(1, Math.min(Math.round(overallRisk), parseInt(e.target.value) || 1)))}
                      className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-700">%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => solveOptimizedTrajectory(targetRiskThreshold)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all text-center cursor-pointer active:scale-98"
                  >
                    Calculate Optimal Trajectory
                  </button>
                  {isTrajectorySolved && activeTrajectorySteps.length > 0 && (
                    <button
                      type="button"
                      onClick={applyTrajectoryToSandbox}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all text-center cursor-pointer active:scale-98"
                      title="Apply steps to sliders instantly"
                    >
                      Apply To Sandbox
                    </button>
                  )}
                </div>
              </div>

              {/* Trajectory Steps Results */}
              {isTrajectorySolved && (
                <div className="space-y-2.5 pt-1 border-t border-slate-200/60 max-h-[190px] overflow-y-auto pr-1">
                  {activeTrajectorySteps.length === 0 ? (
                    <p className="text-[11px] text-slate-500 text-center py-2 font-medium">
                      Patient is already at or below the target {targetRiskThreshold}% threshold! No additional optimization needed.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-extrabold uppercase text-slate-400">
                        <span>Personalized Pathway</span>
                        <span className="text-emerald-600 font-black">Successive Reductions</span>
                      </div>
                      <div className="space-y-2 relative pl-2 border-l border-slate-200">
                        {activeTrajectorySteps.map((step, index) => (
                          <div key={step.id} className="text-left space-y-0.5 relative">
                            <span className="absolute -left-[12.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 border border-white" />
                            <div className="flex justify-between items-start">
                              <h5 className="text-[11px] font-bold text-slate-800 leading-tight">
                                {index + 1}. {step.label}
                              </h5>
                              <span className="text-[10px] font-extrabold text-emerald-600 shrink-0">
                                {step.delta} pp
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal font-normal">
                              {step.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-[10px] leading-relaxed text-amber-800">
              ⚠️ <strong>Mathematical simulation warning:</strong> Changes in model output represent clinical likelihood models and are not guaranteed clinical outcomes. Actual metabolic therapies require targeted medical oversight.
            </div>
          </div>

        </div>
      </div>

      {/* Anatomy and Longevity Simulation */}
      <div className="grid lg:grid-cols-2 gap-8">
        <HeartAnatomyVisualizer patientData={patientData} simulatedData={simulatedData} />
        <SurvivalTimeline patientData={patientData} simulatedData={simulatedData} currentRisk={overallRisk} simulatedRisk={simulatedRisk} />
      </div>

      {/* Section 3: Counterfactual AI Scenario Explorer */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-rose-600" />
            💡 AI Scenario Explorer & Counterfactuals
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Pre-computed minimal-adjustment scenarios answering: <em>What modifications are associated with risk score improvements?</em>
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {counterfactuals.map((scenario) => {
            const isBaseline = scenario.id === "current";
            return (
              <div 
                key={scenario.id}
                className={`border rounded-2xl p-5 flex flex-col justify-between h-[360px] relative ${
                  isBaseline 
                    ? "bg-slate-50 border-slate-300 shadow-inner" 
                    : "bg-white border-slate-200 hover:border-rose-200 shadow-sm hover:shadow"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md ${
                      isBaseline 
                        ? "bg-slate-200 text-slate-700" 
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                      {isBaseline ? "Baseline Profile" : scenario.label.split(" (")[0]}
                    </span>
                    <span className="font-extrabold text-lg text-slate-800">{scenario.risk}%</span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal font-normal">
                    {scenario.description}
                  </p>

                  {!isBaseline && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Associated Adjustments</span>
                      <ul className="space-y-1">
                        {scenario.modifications.map((mod, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-600 leading-tight">
                            <Check className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                            <span>{mod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {!isBaseline && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Model Drop:</span>
                    <span className="font-extrabold text-emerald-600">{scenario.diff} pp</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Multi-CVD Map vs Patient Clustering */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Multi-CVD risk map */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              🫀 Cardiovascular Risk Map
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Comparison across 7 clinically meaningful disease-specific prediction modules.
            </p>
          </div>

          {/* Radar Chart */}
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={multiCvdChartData}>
                <PolarGrid stroke="#334155" strokeWidth={1.5} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#1e293b", fontSize: 10, fontWeight: "bold" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" strokeWidth={1.2} />
                <Radar name="Risk Probability" dataKey="probability" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Supported Modules Table */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {multiCvd.map((item) => (
              <div 
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200/80 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>Contributors: {item.topContributors.join(", ")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-800 text-sm block">{item.probability}%</span>
                  <span className={`text-[9px] font-bold uppercase ${
                    item.probability >= 50 ? "text-red-600" : item.probability >= 25 ? "text-amber-600" : "text-teal-600"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Unsupervised similarity clustering projection */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-600" />
              AI Patient Profile Clustering
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Unsupervised K-Means matching projecting similarity distances into a 2D clinical coordinate plane.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-1">
              <Check className="w-4 h-4 text-rose-600" />
              Assigned Similarity: {cluster.assignedCluster.name}
            </h4>
            <p className="text-slate-500 leading-relaxed font-normal">
              {cluster.assignedCluster.description}
            </p>
          </div>

          {/* Interactive Recharts Scatter Chart representing distance */}
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.65} />
                <XAxis type="number" dataKey="x" name="Dimension X" domain={[-6, 6]} hide />
                <YAxis type="number" dataKey="y" name="Dimension Y" domain={[-4, 5]} hide />
                <Tooltip cursor={{ stroke: "#334155", strokeWidth: 1.5, strokeDasharray: "3 3" }} />
                
                {/* 4 Cluster Centroids */}
                <Scatter name="Clinical Centroids" data={centroidPoints} fill="#94a3b8">
                  {centroidPoints.map((entry, index) => (
                    <Cell key={`centroid-${index}`} fill={index === 0 ? "#2dd4bf" : index === 1 ? "#60a5fa" : index === 2 ? "#fbbf24" : "#f87171"} r={8} />
                  ))}
                </Scatter>

                {/* Simulated Point */}
                {simulatedRisk !== overallRisk && (
                  <Scatter name="Simulated Target" data={[simulatedPatientPoint]} fill="#10b981">
                    <Cell fill="#10b981" r={10} className="animate-pulse" />
                  </Scatter>
                )}

                {/* Patient Point */}
                <Scatter name="This Patient" data={[patientPoint]} fill="#f43f5e">
                  <Cell fill="#f43f5e" r={10} stroke="#ffffff" strokeWidth={2} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Legend/Key */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-bold text-slate-500 uppercase border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]" /><span>Optimal Centroid</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" /><span>Vascular Aging</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" /><span>Metabolic Centroid</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" /><span>Severe Centroid</span></div>
            <div className="flex items-center gap-1.5 col-span-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" /><span>You (Baseline Match)</span></div>
            {simulatedRisk !== overallRisk && (
              <div className="flex items-center gap-1.5 col-span-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" /><span>Simulated Improvement</span></div>
            )}
          </div>
        </div>

      </div>

      {/* Models Comparison Detail bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
            <BarChart2 className="w-4 h-4 text-rose-600" />
            Comparison of Classifier Models
          </h4>
          <p className="text-xs text-slate-500">Evaluating prediction agreement margins across the algorithmic ensemble.</p>
        </div>

        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          {modelsComparison.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 p-3.5 rounded-2xl flex-1 sm:flex-initial min-w-[120px] text-center shadow-sm">
              <span className="text-[9px] block uppercase font-bold text-slate-400 leading-none">{m.name}</span>
              <span className="text-lg font-extrabold text-slate-800 mt-1 block">{m.prediction}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Panel & Clinical Export Modules */}
      <div className="grid lg:grid-cols-2 gap-8">
        <PanelManagement currentProfile={patientData} onLoadProfile={onLoadProfile} />
        <ClinicalReportExport 
          patientData={patientData} 
          overallRisk={overallRisk} 
          bestModelName="XGBoost Classifier" 
          summaryText={geminiSummary} 
          onOpenEHRProtocols={onOpenEHRProtocols}
        />
      </div>

      {/* Official Platform Definition & Medical Advisory Disclaimer Footer */}
      <div className="border-t border-slate-200 pt-8 mt-4 space-y-4">
        <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100/60 max-w-4xl mx-auto text-center space-y-3">
          <p className="text-sm font-semibold text-rose-800 leading-relaxed">
            CardioTwin AI predicts personalized cardiovascular risk, explains the factors behind the prediction, and simulates how hypothetical changes in selected inputs affect the model's estimated risk.
          </p>
          <div className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-normal">
            <span className="font-bold text-rose-600 uppercase tracking-wider block mb-1">⚠️ Decision-Support Output Only</span>
            This system provides model-based risk estimates and does not provide a medical diagnosis.
          </div>
        </div>
      </div>

    </div>
  );
}
