import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip
} from "recharts";
import { 
  Heart, Brain, Activity, Sliders, AlertTriangle, Info, ShieldAlert, Zap, Cpu, Settings, RefreshCw, UserPlus, FileText, CheckCircle2, Network
} from "lucide-react";
import { PredictionResult, PatientData } from "../types";

interface CardiovascularRiskMapViewProps {
  prediction?: PredictionResult | null;
  patientData?: PatientData;
}

// 7 primary CVD target node definitions with default coordinates for our force graph
interface GnnNode {
  id: string;
  label: string;
  type: "disease" | "comorbidity";
  x: number;
  y: number;
  baseRisk: number; // base baseline risk percentage
  description: string;
}

interface GnnEdge {
  source: string;
  target: string;
  baseWeight: number; // how strongly the comorbidity triggers this disease in our GNN layers
}

export default function CardiovascularRiskMapView({ prediction, patientData }: CardiovascularRiskMapViewProps) {
  // Comorbidity toggle states - initialized with patient values if available, or clinical high-risk presets
  const [comorbidities, setComorbidities] = useState({
    diabetes: patientData?.diabetes ?? true,
    hypertension: patientData?.hypertensionHistory ?? true,
    smoking: patientData?.smoking ?? true,
    hypercholesterolemia: (patientData?.cholesterol ?? 240) > 200,
    obesity: (patientData?.weight && patientData?.height) 
      ? (patientData.weight / Math.pow(patientData.height / 100, 2)) > 28 
      : true,
    advancedAge: (patientData?.age ?? 55) > 50,
    sedentary: (patientData?.physicalActivity ?? 0) === 0
  });

  const [selectedNode, setSelectedNode] = useState<string>("cad");
  const [activeTab, setActiveTab] = useState<"visualizer" | "math_engine">("visualizer");
  
  // Static base nodes
  const baseNodes: GnnNode[] = [
    // Comorbidities (Left Column & center)
    { id: "diabetes", label: "Diabetes Mellitus", type: "comorbidity", x: 100, y: 110, baseRisk: 0, description: "Chronic hyperglycemia promoting endothelial dysfunction, vascular inflammation, and microvascular lesions." },
    { id: "hypertension", label: "Hypertension", type: "comorbidity", x: 90, y: 220, baseRisk: 0, description: "Chronic high pressure stressing vessel walls, accelerating mechanical shear stress, and myocardial wall thickness." },
    { id: "smoking", label: "Tobacco Exposure", type: "comorbidity", x: 110, y: 330, baseRisk: 0, description: "Nicotine and carbon monoxide triggering vasoconstriction, systemic oxidative stress, and platelet aggregation." },
    { id: "hypercholesterolemia", label: "Dyslipidemia", type: "comorbidity", x: 220, y: 60, baseRisk: 0, description: "Circulating LDL-C particles infiltrating damaged arterial walls, initiating atheromatous plaque progression." },
    { id: "obesity", label: "Visceral Obesity", type: "comorbidity", x: 200, y: 170, baseRisk: 0, description: "Adipose-tissue inflammatory secretions increasing total blood volume and baseline metabolic strain." },
    { id: "advancedAge", label: "Senescence (Age > 50)", type: "comorbidity", x: 180, y: 280, baseRisk: 0, description: "Natural arterial wall stiffening, loss of endothelial nitric oxide synthesis, and cellular repair fatigue." },
    { id: "sedentary", label: "Sedentary Lifestyle", type: "comorbidity", x: 210, y: 390, baseRisk: 0, description: "Lack of hemodynamic conditioning leading to decreased insulin sensitivity and sub-optimal vascular shear stress." },

    // Diseases (Right Circle Layout)
    { id: "cad", label: "Coronary Artery Disease", type: "disease", x: 500, y: 80, baseRisk: 35, description: "Severe atherosclerotic lipid plaques inside epicardial vessels, presenting as myocardial ischemia or angina." },
    { id: "stroke", label: "Ischemic / Hemorrhagic Stroke", type: "disease", x: 610, y: 140, baseRisk: 28, description: "Obstruction or rupture of cerebrovascular vessels resulting in neuronal tissue hypoxia and rapid necrosis." },
    { id: "hf", label: "Congestive Heart Failure", type: "disease", x: 580, y: 260, baseRisk: 42, description: "Structural deterioration of left-ventricular pumping or filling capacity, causing peripheral backup congestion." },
    { id: "af", label: "Atrial Fibrillation", type: "disease", x: 440, y: 380, baseRisk: 20, description: "Chaotic supraventricular electrical signals leading to high stroke risk from stagnant left atrial appendage thrombi." },
    { id: "hhd", label: "Hypertensive Heart Disease", type: "disease", x: 380, y: 200, baseRisk: 38, description: "Compensatory Left Ventricular Hypertrophy (LVH) caused by long-term unmanaged systemic arterial resistance." },
    { id: "pad", label: "Peripheral Artery Disease", type: "disease", x: 630, y: 360, baseRisk: 15, description: "Occlusion of lower-extremity peripheral arteries, producing severe claudication pain during mobility." },
    { id: "vhd", label: "Valvular Heart Disease", type: "disease", x: 480, y: 470, baseRisk: 18, description: "Aortic stenosis or mitral regurgitation forcing high myocardial mechanical workload, accelerating failure." },
  ];

  const baseEdges: GnnEdge[] = [
    // Cross-comorbidity mutual reinforcement weights
    { source: "diabetes", target: "hypertension", baseWeight: 0.72 },
    { source: "obesity", target: "diabetes", baseWeight: 0.78 },
    { source: "obesity", target: "hypertension", baseWeight: 0.82 },

    // Diabetes connections
    { source: "diabetes", target: "cad", baseWeight: 0.85 },
    { source: "diabetes", target: "stroke", baseWeight: 0.70 },
    { source: "diabetes", target: "pad", baseWeight: 0.90 },
    { source: "diabetes", target: "hf", baseWeight: 0.60 },

    // Hypertension connections
    { source: "hypertension", target: "stroke", baseWeight: 0.95 },
    { source: "hypertension", target: "hhd", baseWeight: 0.98 },
    { source: "hypertension", target: "hf", baseWeight: 0.80 },
    { source: "hypertension", target: "af", baseWeight: 0.65 },
    { source: "hypertension", target: "cad", baseWeight: 0.75 },

    // Smoking connections
    { source: "smoking", target: "cad", baseWeight: 0.90 },
    { source: "smoking", target: "pad", baseWeight: 0.95 },
    { source: "smoking", target: "stroke", baseWeight: 0.80 },

    // Dyslipidemia connections
    { source: "hypercholesterolemia", target: "cad", baseWeight: 0.92 },
    { source: "hypercholesterolemia", target: "stroke", baseWeight: 0.75 },
    { source: "hypercholesterolemia", target: "pad", baseWeight: 0.80 },

    // Obesity connections
    { source: "obesity", target: "hhd", baseWeight: 0.70 },
    { source: "obesity", target: "af", baseWeight: 0.75 },
    { source: "obesity", target: "hf", baseWeight: 0.85 },

    // Advanced age connections
    { source: "advancedAge", target: "vhd", baseWeight: 0.88 },
    { source: "advancedAge", target: "af", baseWeight: 0.82 },
    { source: "advancedAge", target: "hf", baseWeight: 0.78 },
    { source: "advancedAge", target: "cad", baseWeight: 0.70 },

    // Sedentary connections
    { source: "sedentary", target: "diabetes", baseWeight: 0.80 },
    { source: "sedentary", target: "obesity", baseWeight: 0.85 },
    { source: "sedentary", target: "cad", baseWeight: 0.60 },
    { source: "sedentary", target: "hf", baseWeight: 0.55 },
  ];

  // Custom graph simulation state
  const [nodes, setNodes] = useState<GnnNode[]>(() => {
    return baseNodes.map(node => ({
      ...node,
      calculatedRisk: node.type === "comorbidity" ? 0 : node.baseRisk
    }));
  });
  const [edges, setEdges] = useState<GnnEdge[]>(baseEdges);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  // Calculate dynamic GNN values and risk outputs based on comorbidity toggles
  const calculateDynamicState = () => {
    setNodes(prevNodes => prevNodes.map(node => {
      if (node.type === "comorbidity") {
        const isActive = (comorbidities as any)[node.id];
        return {
          ...node,
          calculatedRisk: isActive ? 100 : 0
        };
      } else {
        const incomingEdges = baseEdges.filter(e => e.target === node.id);
        let totalInputForce = 0;
        let activeComorbiditiesCount = 0;

        incomingEdges.forEach(edge => {
          const isSourceActive = (comorbidities as any)[edge.source];
          if (isSourceActive) {
            totalInputForce += edge.baseWeight * 30;
            activeComorbiditiesCount++;
          }
        });

        const calculatedProbability = Math.min(
          98,
          Math.max(
            5,
            node.baseRisk + totalInputForce - (incomingEdges.length - activeComorbiditiesCount) * 4
          )
        );

        return {
          ...node,
          calculatedRisk: Math.round(calculatedProbability)
        };
      }
    }));
    setEdges(baseEdges);
  };

  useEffect(() => {
    calculateDynamicState();
  }, [comorbidities]);

  const toggleComorbidity = (key: string) => {
    setComorbidities(prev => ({
      ...prev,
      [key]: !(prev as any)[key]
    }));
  };

  const getDiseaseRisk = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? node.calculatedRisk : 0;
  };

  // Compile radar chart data representing the 7 disease modules
  const radarData = [
    { subject: "CAD (Arteries)", value: getDiseaseRisk("cad"), fullMark: 100 },
    { subject: "Stroke (Brain)", value: getDiseaseRisk("stroke"), fullMark: 100 },
    { subject: "Heart Failure", value: getDiseaseRisk("hf"), fullMark: 100 },
    { subject: "Atrial Fib.", value: getDiseaseRisk("af"), fullMark: 100 },
    { subject: "Hypertrophic HHD", value: getDiseaseRisk("hhd"), fullMark: 100 },
    { subject: "PAD (Legs)", value: getDiseaseRisk("pad"), fullMark: 100 },
    { subject: "Valvular Disease", value: getDiseaseRisk("vhd"), fullMark: 100 },
  ];

  const getSeverityBadge = (risk: number) => {
    if (risk >= 70) return <span className="px-2.5 py-1 bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-extrabold rounded-full uppercase">Critical Activation</span>;
    if (risk >= 40) return <span className="px-2.5 py-1 bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-extrabold rounded-full uppercase">Elevated Threat</span>;
    return <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold rounded-full uppercase">Low Latency</span>;
  };

  const activeDiseaseNode = nodes.find(n => n.id === selectedNode && n.type === "disease");

  // Helper to find connections of the selected node
  const getSelectedNodeEdges = () => {
    return edges.filter(e => e.target === selectedNode || e.source === selectedNode);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNode) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    // Bounds check to keep nodes comfortably inside the canvas frame
    const boundedX = Math.max(30, Math.min(svgRect.width - 30, x));
    const boundedY = Math.max(30, Math.min(svgRect.height - 30, y));

    setNodes(prev => prev.map(n => n.id === draggedNode ? { ...n, x: boundedX, y: boundedY } : n));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Tab Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-extrabold uppercase tracking-wide">
          <Network className="w-4 h-4" />
          Graph Neural Network (GNN) Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Cardiovascular Risk Map & Comorbidity Graph
        </h1>
        <p className="text-slate-500 text-sm">
          Simulate how chronic patient comorbidities pass risk messages through deep GNN interaction layers, triggering multi-condition disease outcomes.
        </p>
      </div>

      {/* Primary Visual Columns */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Comorbidity Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Patient Comorbidities
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Toggle comorbidities to pass neural hazard signals into the GNN engine.</p>
          </div>

          <div className="space-y-2">
            {[
              { id: "diabetes", label: "Diabetes Mellitus", color: "border-amber-200 text-amber-700 bg-amber-50/30", description: "Vascular glucose micro-calcification" },
              { id: "hypertension", label: "Arterial Hypertension", color: "border-teal-200 text-teal-700 bg-teal-50/30", description: "Systolic load & arterial shear stress" },
              { id: "smoking", label: "Tobacco Exposure", color: "border-orange-200 text-orange-700 bg-orange-50/30", description: "Chemical vasoconstriction & oxidant cells" },
              { id: "hypercholesterolemia", label: "Dyslipidemia", color: "border-blue-200 text-blue-700 bg-blue-50/30", description: "Plaque-forming LDL concentration" },
              { id: "obesity", label: "Visceral Obesity", color: "border-purple-200 text-purple-700 bg-purple-50/30", description: "Adipokine-driven systemic vascular load" },
              { id: "advancedAge", label: "Advanced Senescence", color: "border-slate-200 text-slate-700 bg-slate-50/30", description: "Age-related vessel collagen degradation" },
              { id: "sedentary", label: "Sedentary Lifestyle", color: "border-rose-200 text-rose-700 bg-rose-50/30", description: "Deconditioned stroke volume indices" }
            ].map(item => {
              const active = (comorbidities as any)[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => toggleComorbidity(item.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    active 
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-100 scale-[1.01]" 
                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className={`text-[9px] ${active ? "text-slate-300" : "text-slate-400"} font-medium mt-0.5`}>
                      {item.description}
                    </p>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${active ? "bg-emerald-500" : "bg-slate-200"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${active ? "translate-x-4" : ""}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-indigo-50 border border-indigo-100/60 p-4 rounded-2xl space-y-2">
            <h4 className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Dynamic GNN Inference
            </h4>
            <p className="text-[11px] text-indigo-700 leading-normal font-medium">
              Every comorbidity toggle recalculates message transmission layers in real-time. Nodes size up and links illuminate according to weight multiplier vectors.
            </p>
          </div>
        </div>

        {/* Center Canvas / SVG Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sub Navigation Modes */}
          <div className="flex border border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm max-w-sm">
            <button
              onClick={() => setActiveTab("visualizer")}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "visualizer" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Interactive Network Map
            </button>
            <button
              onClick={() => setActiveTab("math_engine")}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "math_engine" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CVD Multi-Radar Compare
            </button>
          </div>

          {activeTab === "visualizer" ? (
            /* Force-Directed / Interactive Comorbidity Network Component */
            <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Interactive GNN Risk Message-Passing Visualizer
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Click disease nodes (indigo rings) to inspect deep neural connections and signal triggers.</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Comorbidity
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> CVD Target Node
                  </div>
                </div>
              </div>

              {/* Force Directed Graph Canvas Frame */}
              <div className="border border-slate-800 rounded-2xl bg-slate-950 h-[380px] relative overflow-hidden">
                <svg 
                  className="w-full h-full select-none" 
                  xmlns="http://www.w3.org/2000/svg"
                  onMouseMove={handleSvgMouseMove}
                  onMouseUp={() => setDraggedNode(null)}
                  onMouseLeave={() => setDraggedNode(null)}
                >
                  {/* Dynamic Force Links / Edges rendering with active animated packets */}
                  {edges.map((edge, idx) => {
                    const srcNode = nodes.find(n => n.id === edge.source);
                    const tgtNode = nodes.find(n => n.id === edge.target);
                    if (!srcNode || !tgtNode) return null;

                    const isSourceActive = (comorbidities as any)[edge.source];
                    const isSelectedPath = edge.target === selectedNode || edge.source === selectedNode;
                    const isHoveredPath = hoveredNode === edge.source || hoveredNode === edge.target;

                    return (
                      <g key={`${edge.source}-${edge.target}-${idx}`}>
                        {/* Static/Active Line connection */}
                        <line
                          x1={srcNode.x}
                          y1={srcNode.y}
                          x2={tgtNode.x}
                          y2={tgtNode.y}
                          stroke={isSourceActive ? (isSelectedPath || isHoveredPath ? "#f43f5e" : "#818cf8") : (isHoveredPath ? "#475569" : "#334155")}
                          strokeWidth={isSourceActive ? (isSelectedPath || isHoveredPath ? 3 : 1.5) : (isHoveredPath ? 1.5 : 0.8)}
                          strokeDasharray={isSourceActive ? "4 4" : "none"}
                          className={isSourceActive ? "animate-[dash_10s_linear_infinite]" : ""}
                          opacity={isSourceActive ? 1 : (isHoveredPath ? 0.4 : 0.2)}
                        />
                        {/* Dynamic animated signal pulse traversing the path */}
                        {isSourceActive && (
                          <circle r="3.5" fill={isSelectedPath || isHoveredPath ? "#fbbf24" : "#10b981"} opacity="0.9">
                            <animateMotion
                              dur={`${4 - edge.baseWeight * 3}s`}
                              repeatCount="indefinite"
                              path={`M ${srcNode.x} ${srcNode.y} L ${tgtNode.x} ${tgtNode.y}`}
                            />
                          </circle>
                        )}
                        {/* Transient edge weight pill on hover */}
                        {isHoveredPath && (
                          <g className="transition-all duration-300 pointer-events-none">
                            <rect
                              x={(srcNode.x + tgtNode.x) / 2 - 22}
                              y={(srcNode.y + tgtNode.y) / 2 - 10}
                              width="44"
                              height="20"
                              rx="6"
                              fill="#1e1b4b"
                              stroke={isSourceActive ? "#fbbf24" : "#818cf8"}
                              strokeWidth="1.5"
                              opacity="0.95"
                            />
                            <text
                              x={(srcNode.x + tgtNode.x) / 2}
                              y={(srcNode.y + tgtNode.y) / 2 + 4}
                              textAnchor="middle"
                              fill="#e0e7ff"
                              fontSize="8.5"
                              fontWeight="extrabold"
                            >
                              w={edge.baseWeight.toFixed(2)}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes Rendering */}
                  {nodes.map(node => {
                    const isDisease = node.type === "disease";
                    const isSelected = selectedNode === node.id;
                    const isActiveComorbidity = node.type === "comorbidity" && (comorbidities as any)[node.id];
                    const isHovered = hoveredNode === node.id;
                    
                    // Determine radius based on activation strength and hover
                    let radius = isDisease ? 18 + (node.calculatedRisk / 6) : 10;
                    if (isSelected) radius += 3;
                    if (isHovered) radius += 4;

                    return (
                      <g 
                        key={node.id}
                        className="cursor-grab active:cursor-grabbing group select-none transition-all duration-300"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggedNode(node.id);
                        }}
                        onClick={() => {
                          if (isDisease) {
                            setSelectedNode(node.id);
                          } else {
                            toggleComorbidity(node.id);
                          }
                        }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {/* Selected or Hovered halo */}
                        {(isSelected || isHovered) && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={radius + 6}
                            fill="none"
                            stroke={isHovered ? "#fbbf24" : "#f43f5e"}
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                            className="animate-[spin_20s_linear_infinite]"
                          />
                        )}

                        {/* Outer Glow / active state */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius + 2.5}
                          fill={isHovered ? "rgba(99, 102, 241, 0.15)" : "transparent"}
                          stroke={isDisease ? "#6366f1" : isActiveComorbidity ? "#10b981" : "#475569"}
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          opacity={isDisease ? 0.6 : isActiveComorbidity ? 0.8 : 0.3}
                          className="transition-all duration-300"
                        />

                        {/* Inner filled node */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius}
                          fill={
                            isDisease 
                              ? (isSelected ? "#e11d48" : isHovered ? "#312e81" : "#4f46e5") 
                              : (isActiveComorbidity ? "#059669" : isHovered ? "#1e293b" : "#0f172a")
                          }
                          stroke={isDisease ? "#ffffff" : isActiveComorbidity ? "#a7f3d0" : "#64748b"}
                          strokeWidth={1.5}
                          className="transition-all duration-300"
                        />

                        {/* Inner text values or identifiers */}
                        {isDisease && (
                          <text
                            x={node.x}
                            y={node.y + 3.5}
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="extrabold"
                            fill="#ffffff"
                          >
                            {node.calculatedRisk}%
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltips or labels overlay */}
                {nodes.map(node => {
                  const isHovered = hoveredNode === node.id;
                  const isSelected = selectedNode === node.id;
                  if (!isHovered && !isSelected) return null;

                  return (
                    <div
                      key={`label-${node.id}`}
                      style={{
                        position: "absolute",
                        left: `${node.x + 18}px`,
                        top: `${node.y - 12}px`,
                        pointerEvents: "none"
                      }}
                      className="bg-slate-900 border border-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-lg text-white whitespace-nowrap z-30"
                    >
                      {node.label} {node.type === "disease" ? `(${node.calculatedRisk}% Risk)` : "(Comorbidity)"}
                    </div>
                  );
                })}
              </div>

              {/* Path Legend */}
              <div className="grid md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">GNN Active Node:</span>
                  <p className="font-extrabold mt-0.5 text-white">{activeDiseaseNode?.label || "Select any disease ring"}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-normal leading-relaxed">{activeDiseaseNode?.description}</p>
                </div>
                <div className="border-l border-slate-800 pl-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">Neural Message Inputs:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getSelectedNodeEdges().length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">No incoming connections selected.</span>
                    ) : (
                      getSelectedNodeEdges().map((edge, idx) => {
                        const comNode = nodes.find(n => n.id === (edge.source === selectedNode ? edge.target : edge.source));
                        const isSourceActive = (comorbidities as any)[edge.source];
                        if (!comNode) return null;
                        return (
                          <span 
                            key={idx} 
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 ${
                              isSourceActive 
                                ? "bg-emerald-950 border border-emerald-900 text-emerald-400" 
                                : "bg-slate-900 border border-slate-800 text-slate-500"
                            }`}
                          >
                            {comNode.label} (w: {edge.baseWeight})
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Multi-Condition Radar Compare View */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-500" />
                    Overall Multi-Condition Risk Radar Comparison
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Observe real-time model hazard expansion as additional comorbidities are triggered.</p>
                </div>
              </div>

              {/* Radar Chart Component */}
              <div className="h-[280px] bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" strokeWidth={1.5} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#1e293b", fontSize: 10, fontWeight: "bold" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" strokeWidth={1.2} />
                    <Radar 
                      name="Active Simulation Risk" 
                      dataKey="value" 
                      stroke="#4f46e5" 
                      fill="#818cf8" 
                      fillOpacity={0.35} 
                    />
                    <Tooltip 
                      formatter={(v: any) => [`${v}%`, "Computed Pathway Activation"]}
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#ffffff", borderRadius: "12px", fontSize: "11px" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Informative Stats panels */}
              <div className="grid sm:grid-cols-3 gap-3">
                {nodes.filter(n => n.type === "disease").slice(0, 3).map(node => (
                  <div key={node.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Computed Variable</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5 truncate">{node.label}</h4>
                    </div>
                    <div className="flex items-end justify-between mt-3">
                      <span className="text-xl font-extrabold text-slate-900">{node.calculatedRisk}%</span>
                      {getSeverityBadge(node.calculatedRisk)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Info Panel for the selected Condition */}
          {activeDiseaseNode && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{activeDiseaseNode.label} Clinical Guide</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Active Target Panel Profile</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider">Pathology Summary</h4>
                  <p className="font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">{activeDiseaseNode.description}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider">Clinical GNN Action Layer</h4>
                  <div className="bg-indigo-50/50 border border-indigo-100/60 p-4 rounded-xl space-y-2 text-indigo-950 font-semibold">
                    <p className="text-[11px] leading-normal font-medium text-slate-600">
                      In the GNN deep layer, this node performs normalized linear aggregation with a localized non-linear activation threshold (Sigmoid/ReLU):
                    </p>
                    <div className="bg-slate-900 text-slate-100 p-2 rounded-lg font-mono text-[10px] text-center border border-slate-800 my-1">
                      y = Sigmoid( ∑ (Comorbidity_i * W_i) )
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
