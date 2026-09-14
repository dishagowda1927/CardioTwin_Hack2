import React, { useState } from "react";
import { Heart, Activity, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PatientData } from "../types";

interface HeartAnatomyVisualizerProps {
  patientData: PatientData;
  simulatedData?: PatientData;
}

interface Hotspot {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  function: string;
  clinicalImpact: string;
}

export default function HeartAnatomyVisualizer({ patientData, simulatedData }: HeartAnatomyVisualizerProps) {
  const data = simulatedData || patientData;

  // Determine anatomical warning states based on clinical parameters
  const hasHypertrophy = data.systolicBP >= 140;
  const hasPlaque = data.cholesterol >= 240;
  const hasArrhythmia = data.restingHR >= 85 || data.selectedCohortName?.includes("Atrial Fibrillation");
  const isHypoxia = data.smoking;

  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Anatomical structures with coordinates mapped relative to the SVG view box (200x220)
  const hotspots: Hotspot[] = [
    {
      id: "aorta",
      name: "The Aorta Arch",
      x: 115,
      y: 25,
      description: "The primary vascular highway conveying pressurized, oxygenated blood from the left ventricle into systemic circulation.",
      function: "High-pressure oxygenated blood transport",
      clinicalImpact: hasHypertrophy 
        ? "⚠️ Subject to high wall stress from elevated systolic pressure, compounding risk of arterial hardening." 
        : "✅ Exhibiting normal wall shear stresses with standard pressure loading."
    },
    {
      id: "left_ventricle",
      name: "Left Ventricle (LA/LV)",
      x: 70,
      y: 130,
      description: "The thickest muscular chamber of the myocardium, generating high pressures to pump oxygenated blood throughout the body.",
      function: "Primary systemic contraction pump",
      clinicalImpact: hasHypertrophy
        ? "⚠️ Pathological hypertrophy modeling active. The myocardial wall is thickening to combat high arterial resistance."
        : "✅ Muscle thickness modeled within healthy clinical bounds."
    },
    {
      id: "right_side",
      name: "Right Atrium & Ventricle (RA/RV)",
      x: 135,
      y: 110,
      description: "Pumps oxygen-depleted venous return from the body into pulmonary arteries for re-oxygenation in the lungs.",
      function: "Deoxygenated blood collection & routing",
      clinicalImpact: isHypoxia
        ? "⚠️ Increased carbon monoxide loading from tobacco smoke is reducing systemic oxygen saturation."
        : "✅ Standard oxygen partial pressures modeled in pulmonary return."
    },
    {
      id: "coronary_arteries",
      name: "Coronary Arteries",
      x: 95,
      y: 85,
      description: "A specialized network of vessels originating from the aorta to supply the heart muscle itself with oxygen-rich blood.",
      function: "Myocardial blood and nutrient supply",
      clinicalImpact: hasPlaque
        ? "⚠️ Elevated lipids (>240 mg/dL) are accelerating fibrous cholesterol deposits (plaques), raising stenosis risk."
        : "✅ Artery lumens are clear of severe cholesterol deposits."
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">Digital Twin Anatomy</span>
          <h3 className="font-extrabold text-slate-800 text-lg">Interactive 2D Heart Visualizer</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-150">
          <Activity className={`w-3.5 h-3.5 text-rose-500 ${hasArrhythmia ? "animate-ping" : "animate-pulse"}`} />
          <span>Interactive Hotspots Active</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* SVG Interactive Heart Model */}
        <div className="md:col-span-5 flex justify-center bg-slate-50/50 rounded-2xl p-6 border border-slate-100 relative overflow-visible h-72 items-center">
          {/* Animated Background Pulse Waves */}
          <div className={`absolute inset-0 bg-gradient-to-tr transition-opacity duration-500 rounded-2xl ${
            hasHypertrophy ? "from-red-50/30 to-rose-50/30" : "from-emerald-50/10 to-teal-50/10"
          }`} />

          {/* Dynamic SVG Vector Heart Anatomy */}
          <div className="relative w-48 h-48">
            <svg
              viewBox="0 0 200 220"
              className={`w-full h-full drop-shadow-md transition-all duration-700 ${
                hasArrhythmia ? "animate-[bounce_0.6s_infinite]" : "animate-[pulse_4s_infinite]"
              }`}
            >
              {/* Background Shadow */}
              <path
                d="M100,50 C80,20 20,30 20,90 C20,150 100,200 100,200 C100,200 180,150 180,90 C180,30 120,20 100,50 Z"
                fill="#f1f5f9"
                opacity="0.8"
              />

              {/* Left Atrium & Ventricle Shape */}
              <path
                d="M100,50 C80,25 30,35 30,90 C30,140 100,190 100,190 Z"
                className="transition-colors duration-500"
                fill={hasHypertrophy ? "#991b1b" : "#be123c"} // Darker red if hypertrophied
                stroke="#e11d48"
                strokeWidth={hasHypertrophy ? "5" : "2"}
              />

              {/* Right Atrium & Ventricle Shape */}
              <path
                d="M100,50 C120,25 170,35 170,90 C170,140 100,190 100,190 Z"
                className="transition-colors duration-500"
                fill={isHypoxia ? "#1e293b" : "#475569"} // Slate blue if hypoxia/smoking is active
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Simulated Aorta and Coronary Arteries */}
              <path
                d="M95,50 C95,20 120,10 130,20 C135,25 125,40 115,45"
                fill="none"
                stroke="#dc2626"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Arterial Plaque / Cholesterol Deposits Layer */}
              {hasPlaque && (
                <g className="animate-pulse">
                  {/* Plaque deposits in Aorta */}
                  <circle cx="112" cy="22" r="4" fill="#fbbf24" />
                  <circle cx="118" cy="30" r="3.5" fill="#f59e0b" />
                  {/* Coronary Plaque lines */}
                  <path d="M70,95 Q85,130 90,160" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="3,3" />
                  <path d="M130,95 Q115,130 110,160" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="3,3" />
                </g>
              )}

              {/* Cardiac Muscle Hypertrophy Warning Ring */}
              {hasHypertrophy && (
                <path
                  d="M40,90 C40,130 100,175 100,175"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}

              {/* Arrhythmia Irregular Electrical Signal Waves */}
              {hasArrhythmia && (
                <g stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round">
                  <path d="M35,45 Q45,35 55,50 T75,40" className="animate-[pulse_0.5s_infinite]" />
                  <path d="M125,45 Q135,35 145,50 T165,40" className="animate-[pulse_0.4s_infinite]" />
                </g>
              )}
            </svg>

            {/* Floating Interactive Hotspot Nodes */}
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                style={{
                  position: "absolute",
                  left: `${(spot.x / 200) * 100}%`,
                  top: `${(spot.y / 220) * 100}%`,
                  transform: "translate(-50%, -50%)"
                }}
                className="z-10"
              >
                <button
                  type="button"
                  onMouseEnter={() => setActiveHotspot(spot)}
                  onMouseLeave={() => setActiveHotspot(null)}
                  className="relative flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border-2 border-white text-white font-bold cursor-pointer hover:scale-125 transition-all shadow-md focus:outline-none"
                >
                  <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75" />
                  <Info className="w-3 h-3 text-white fill-current opacity-90" />
                </button>
              </div>
            ))}

            {/* Hover Tooltip Overlay with Framer Motion */}
            <AnimatePresence>
              {activeHotspot && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 bg-slate-950 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-left w-52"
                  style={{
                    left: "50%",
                    top: "-20px",
                    transform: "translateX(-50%)"
                  }}
                >
                  <h5 className="font-extrabold text-xs text-rose-400 border-b border-slate-800 pb-1.5 mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {activeHotspot.name}
                  </h5>
                  <p className="text-[10px] text-slate-300 leading-normal mb-1.5 font-normal">
                    {activeHotspot.description}
                  </p>
                  <div className="text-[9px] bg-slate-900 rounded p-1 mb-1 border border-slate-800">
                    <span className="text-slate-500 font-bold block uppercase tracking-wider">Physiological Function</span>
                    <span className="text-slate-300 font-semibold">{activeHotspot.function}</span>
                  </div>
                  <div className="text-[9px] bg-slate-900/60 rounded p-1 border border-slate-800">
                    <span className="text-rose-400/80 font-bold block uppercase tracking-wider">Patient Specific Twin Status</span>
                    <span className="text-slate-300 font-normal">{activeHotspot.clinicalImpact}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Anatomic Labels Indicator */}
          <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[10px] font-bold text-slate-400">
            <span>RA / RV (Deoxygenated)</span>
            <span>LA / LV (Oxygenated)</span>
          </div>
        </div>

        {/* Dynamic Diagnostics Status Console */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Hotspots Instructions</span>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-0.5">
              Hover over any of the interactive information nodes (<Info className="inline w-3 h-3 text-slate-900 fill-current" />) on the digital heart illustration to examine specific vascular sub-structures and patient-specific twin statuses in real-time.
            </p>
          </div>
          
          <h4 className="font-extrabold text-slate-800 text-sm">Organ Structure Diagnostics</h4>
          
          <div className="grid gap-3">
            {/* Hypertrophy Status */}
            <div className={`p-3.5 rounded-xl border flex gap-3 items-start transition-colors ${
              hasHypertrophy ? "bg-red-50/40 border-red-100" : "bg-slate-50 border-slate-100"
            }`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${hasHypertrophy ? "bg-red-600 animate-ping" : "bg-slate-300"}`} />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Myocardial Wall Thickness</span>
                  {hasHypertrophy && <span className="text-[9px] font-extrabold text-red-600 uppercase bg-red-100 px-1.5 py-0.5 rounded">Hypertrophy Strain</span>}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-normal">
                  {hasHypertrophy 
                    ? "Systolic pressure above 140 mmHg induces continuous hemodynamic resistance, driving thickening (hypertrophy) of the left ventricular myocardium."
                    : "Hemodynamic loads are within typical thresholds; myocardial structural thickness is currently modeled as normal."}
                </p>
              </div>
            </div>

            {/* Plaque / Cholesterol Status */}
            <div className={`p-3.5 rounded-xl border flex gap-3 items-start transition-colors ${
              hasPlaque ? "bg-amber-50/40 border-amber-100" : "bg-slate-50 border-slate-100"
            }`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${hasPlaque ? "bg-amber-500 animate-ping" : "bg-slate-300"}`} />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Coronary Artery Plaque Buildup</span>
                  {hasPlaque && <span className="text-[9px] font-extrabold text-amber-600 uppercase bg-amber-100 px-1.5 py-0.5 rounded">Occlusion Risk</span>}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-normal">
                  {hasPlaque
                    ? "Lipid volume above 240 mg/dL accelerates the deposition of fibrous atherosclerotic plaques, narrowing coronary passages."
                    : "Lumen integrity modeled as clear. Low circulating lipoprotein cholesterol decreases coronary deposition coefficients."}
                </p>
              </div>
            </div>

            {/* Arrhythmia Status */}
            <div className={`p-3.5 rounded-xl border flex gap-3 items-start transition-colors ${
              hasArrhythmia ? "bg-rose-50/40 border-rose-100" : "bg-slate-50 border-slate-100"
            }`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${hasArrhythmia ? "bg-rose-500 animate-ping" : "bg-slate-300"}`} />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Electrophysiological Waveform</span>
                  {hasArrhythmia && <span className="text-[9px] font-extrabold text-rose-600 uppercase bg-rose-100 px-1.5 py-0.5 rounded">Rhythm Wave Deflection</span>}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-normal">
                  {hasArrhythmia
                    ? "Active irregular rhythm indicators or resting tachycardia. Electrophysiological pacemakers are firing chaotically."
                    : "Sinus rhythms show steady baseline electrical signaling; standard R-R intervals modeled."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
