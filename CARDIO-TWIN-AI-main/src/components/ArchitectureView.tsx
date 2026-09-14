import { motion } from "motion/react";
import { 
  User, Shield, Clipboard, Cpu, Activity, Sliders, Database, Brain, ArrowDown, HelpCircle, Server, Code
} from "lucide-react";

export default function ArchitectureView() {
  const steps = [
    {
      id: "input",
      title: "Patient Data Input",
      icon: User,
      desc: "Structured demographic, lifestyle, and biochemical inputs.",
      details: ["Age, Sex, Height, Weight", "Blood Pressure & Resting HR", "Cholesterol, Glucose & Comorbidities"]
    },
    {
      id: "validate",
      title: "Data Validation & Preprocessing",
      icon: Shield,
      desc: "Instant biochemical range-checking and live BMI evaluation.",
      details: ["Clinical bounds check", "Metric units alignment", "Dynamic body index profiling"]
    },
    {
      id: "anomaly",
      title: "Data Quality & Anomaly Detection AI",
      icon: Database,
      desc: "Anomaly scoring checking unusual combination patterns.",
      details: ["Isolation Forest simulation", "Multivariate inconsistency checks", "Unusual clinical phenotype alerts"]
    },
    {
      id: "engine",
      title: "ML Classifiers Ensemble Engine",
      icon: Cpu,
      desc: "Evaluating multi-model cardiovascular outcomes simultaneously.",
      details: ["Logistic Regression (Baseline)", "Random Forest (Decision Trees)", "XGBoost (Best Performer - 94.1% AUC)"]
    },
    {
      id: "predict",
      title: "Personalized Risk Assessment",
      icon: Activity,
      desc: "Calibrated overall probability output mapping clinical outcomes.",
      details: ["Ensemble weighted likelihoods", "Risk categorization (High/Moderate/Low)", "Prediction calibration confidence mapping"]
    }
  ];

  const parallelBranches = [
    {
      title: "SHAP Explainable AI",
      icon: Brain,
      desc: "Individual feature importance contributions.",
      details: ["Shapley value allocations", "Sum(SHAP) + Baseline = Prediction", "Differentiating positive vs negative factors"]
    },
    {
      title: "What-If Sandbox Simulation",
      icon: Sliders,
      desc: "Real-time client-side interactive sliders.",
      details: ["Modifying variable weights", "Instantaneous risk calculations", "Visualizing before vs after delta risks"]
    },
    {
      title: "Counterfactual AI Engine",
      icon: Clipboard,
      desc: "Alternative healthy metabolic target states.",
      details: ["Scenario comparative projections", "Clinically logical modifications", "Percentage drop comparisons"]
    }
  ];

  return (
    <div id="architecture-container" className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Server className="w-3.5 h-3.5" />
          CardioTwin Pipeline Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          System Machine Learning Pipeline
        </h2>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto font-normal">
          A modular, explainable decision-support framework routing raw clinical variables into highly granular, transparent risk diagnostics.
        </p>
      </div>

      {/* Main vertical Pipeline path */}
      <div className="space-y-8 relative">
        
        {/* Draw central vertical connection line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-rose-100 hidden md:block" />

        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isEven = idx % 2 === 0;

          return (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="grid md:grid-cols-12 gap-6 items-center relative z-10"
            >
              
              {/* Left Column (Left card or empty space) */}
              <div className={`md:col-span-5 ${isEven ? "md:text-right" : "md:order-last"}`}>
                {isEven ? (
                  <div className="bg-white border border-slate-200/85 p-6 rounded-2xl shadow-sm space-y-2 hover:border-rose-100 hover:shadow-md transition-all">
                    <span className="text-[10px] uppercase font-extrabold text-rose-600 tracking-wider">Pipeline Node 0{idx + 1}</span>
                    <h4 className="font-extrabold text-slate-800 text-base">{s.title}</h4>
                    <p className="text-slate-500 text-xs font-normal leading-relaxed">{s.desc}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2 justify-start md:justify-end">
                      {s.details.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100 text-[10px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : <div className="hidden md:block" />}
              </div>

              {/* Middle Icon Node */}
              <div className="md:col-span-2 flex justify-center">
                <div className="p-4 bg-rose-500 text-white rounded-full border-4 border-slate-50 shadow-lg relative z-20">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Right Column (Right card or empty space) */}
              <div className={`md:col-span-5 ${!isEven ? "md:text-left" : ""}`}>
                {!isEven ? (
                  <div className="bg-white border border-slate-200/85 p-6 rounded-2xl shadow-sm space-y-2 hover:border-rose-100 hover:shadow-md transition-all">
                    <span className="text-[10px] uppercase font-extrabold text-rose-600 tracking-wider">Pipeline Node 0{idx + 1}</span>
                    <h4 className="font-extrabold text-slate-800 text-base">{s.title}</h4>
                    <p className="text-slate-500 text-xs font-normal leading-relaxed">{s.desc}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2 justify-start">
                      {s.details.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100 text-[10px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : <div className="hidden md:block" />}
              </div>

            </motion.div>
          );
        })}

        {/* Central Arrow pointing to parallel branch split */}
        <div className="flex justify-center pt-4">
          <div className="p-2 bg-slate-100 border border-slate-200 rounded-full animate-bounce">
            <ArrowDown className="w-5 h-5 text-rose-600" />
          </div>
        </div>

      </div>

      {/* Parallel Diagnostic AI branches */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="font-extrabold text-slate-800 text-lg">Parallel Explainability & Optimization Nodes</h3>
          <p className="text-xs text-slate-500 mt-0.5">Simultaneously computed after the core prediction is finalized.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {parallelBranches.map((pb, idx) => {
            const Icon = pb.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-100 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl w-fit">
                    <Icon className="w-5 h-5 text-rose-600" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base">{pb.title}</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed">{pb.desc}</p>
                </div>
                
                <div className="space-y-1.5 pt-4 border-t border-slate-100 mt-4">
                  {pb.details.map((d, i) => (
                    <div key={i} className="text-[10px] text-slate-600 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Machine Learning Datasets & Training Lineage */}
      <div className="space-y-6 pt-8 border-t border-slate-200">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-rose-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-rose-600" />
            Clinical Data Lineage Guide
          </div>
          <h3 className="font-extrabold text-slate-900 text-2xl tracking-tight">
            Source Datasets & Model-Training Roadmap
          </h3>
          <p className="text-slate-500 text-xs max-w-2xl mx-auto font-normal">
            Mapping our multi-CVD intelligence algorithms against validated gold-standard datasets, defining feature weights, and outline training complexities.
          </p>
        </div>

        {/* Dataset Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/60 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 pl-6">Priority</th>
                  <th className="p-4">Dataset Name</th>
                  <th className="p-4">Clinical Best Use</th>
                  <th className="p-4">Target AI Module</th>
                  <th className="p-4 pr-6 text-center">Implementation Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 font-extrabold text-xs">
                      1st
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-950">UCI Heart Disease</div>
                    <div className="text-[10px] text-slate-400 font-normal">Standard 14-parameter clinical database</div>
                  </td>
                  <td className="p-4 text-slate-500 font-normal">
                    Heart disease risk classification and baseline prediction coefficients.
                  </td>
                  <td className="p-4 font-bold text-rose-600">Core MVP Classifier</td>
                  <td className="p-4 pr-6 text-center">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 rounded-full border border-emerald-100">
                      Easy (Structured Classifier)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs">
                      2nd
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-950">UCI Heart Failure Clinical Records</div>
                    <div className="text-[10px] text-slate-400 font-normal">Longitudinal outcome events and metrics</div>
                  </td>
                  <td className="p-4 text-slate-500 font-normal">
                    Heart failure outcome forecasting, ejection fractions, and creatinine profiling.
                  </td>
                  <td className="p-4 font-bold text-rose-600">Heart Failure Model</td>
                  <td className="p-4 pr-6 text-center">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold text-amber-600 bg-amber-50 rounded-full border border-amber-100">
                      Easy–Medium (Varying Weights)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-50 text-orange-600 font-extrabold text-xs">
                      3rd
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-950">PhysioNet ECG / AF Datasets</div>
                    <div className="text-[10px] text-slate-400 font-normal">Continuous time-series electrocardial graphs</div>
                  </td>
                  <td className="p-4 text-slate-500 font-normal">
                    ECG-based Atrial Fibrillation detection and signal pattern anomalies.
                  </td>
                  <td className="p-4 font-bold text-rose-600">Atrial Fibrillation (AF)</td>
                  <td className="p-4 pr-6 text-center">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 rounded-full border border-rose-100">
                      Advanced (Deep Learning)
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 text-violet-600 font-extrabold text-xs">
                      ⭐
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-950">MIMIC-IV Hospital Database</div>
                    <div className="text-[10px] text-slate-400 font-normal">Multi-modal clinical logs and waveforms</div>
                  </td>
                  <td className="p-4 text-slate-500 font-normal">
                    Rich clinical cross-validations, multi-morbidity patterns, and comprehensive reports.
                  </td>
                  <td className="p-4 font-bold text-rose-600">Multi-CVD Unified Map</td>
                  <td className="p-4 pr-6 text-center">
                    <span className="px-2.5 py-1 text-[10px] font-extrabold text-slate-600 bg-slate-50 rounded-full border border-slate-150">
                      Advanced (Multi-Modal Orchestrator)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Multi-CVD Multi-Phase Stack Roadmap */}
        <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Brain className="w-4 h-4 text-rose-600" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Recommended Multi-Phase Roadmap</h4>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
              <div className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wide">Phase 1: Foundation</div>
              <h5 className="font-bold text-slate-800 text-xs">UCI Heart Disease</h5>
              <p className="text-[11px] text-slate-500 leading-normal font-normal">
                Core overall risk prediction + SHAP explainability + client-side What-If sandbox analysis.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
              <div className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wide">Phase 2: Outcomes</div>
              <h5 className="font-bold text-slate-800 text-xs">UCI Heart Failure</h5>
              <p className="text-[11px] text-slate-500 leading-normal font-normal">
                Structured heart-failure outcome module using cardiac Ejection Fraction profiles.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
              <div className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wide">Phase 3: Waveforms</div>
              <h5 className="font-bold text-slate-800 text-xs">PhysioNet ECG</h5>
              <p className="text-[11px] text-slate-500 leading-normal font-normal">
                Arrhythmia/Atrial Fibrillation predictions powered by time-series LSTM models.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-150 rounded-2xl space-y-2">
              <div className="text-[10px] font-extrabold text-violet-600 uppercase tracking-wide">Future: Horizon</div>
              <h5 className="font-bold text-slate-800 text-xs">MIMIC-IV Engine</h5>
              <p className="text-[11px] text-slate-500 leading-normal font-normal">
                Multi-condition ensemble maps combining lifestyle factors with historical hospital datasets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Orchestration and map output */}
      <div className="flex flex-col items-center pt-8">
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 animate-pulse text-rose-600" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Multi-CVD Risk Map Orchestration</span>
        </div>

        {/* Dynamic final report card mockup */}
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 text-base">Personalized Decision-Support Report</h4>
            <p className="text-slate-500 text-xs font-normal leading-relaxed">
              Consolidating metrics, similarity clustering projections, anomaly maps, SHAP allocations, and Gemini LLM health summaries into an interactive clinically-calibrated briefing.
            </p>
          </div>
          <div className="p-3 bg-rose-500 text-white rounded-2xl flex items-center gap-2 text-xs font-extrabold flex-shrink-0">
            <Code className="w-4 h-4 text-white" />
            <span>GEMINI INTEGRATED</span>
          </div>
        </div>
      </div>

    </div>
  );
}
