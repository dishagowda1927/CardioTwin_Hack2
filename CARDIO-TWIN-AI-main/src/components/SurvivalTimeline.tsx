import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Calendar, ShieldCheck, HeartPulse } from "lucide-react";
import { PatientData } from "../types";

interface SurvivalTimelineProps {
  patientData: PatientData;
  simulatedData?: PatientData;
  currentRisk: number;
  simulatedRisk: number;
}

export default function SurvivalTimeline({ patientData, simulatedData, currentRisk, simulatedRisk }: SurvivalTimelineProps) {
  // Generate longitudinal survival curve data over 10 years based on risk coefficients
  const baseDecayRate = currentRisk / 100 * 0.08;
  const simDecayRate = simulatedRisk / 100 * 0.08;

  const dataPoints = Array.from({ length: 11 }, (_, year) => {
    // Standard survival calculation: S(t) = exp(-lambda * t)
    const baselineSurvival = Math.exp(-baseDecayRate * year) * 100;
    const simulatedSurvival = Math.exp(-simDecayRate * year) * 100;

    return {
      year: `Yr ${year}`,
      "Baseline Profile": parseFloat(baselineSurvival.toFixed(1)),
      "Simulated Profile": parseFloat(simulatedSurvival.toFixed(1))
    };
  });

  const yearsLeftBaseline = Math.round(100 - currentRisk / 2);
  const yearsLeftSimulated = Math.round(100 - simulatedRisk / 2);
  const gains = Math.max(0, yearsLeftSimulated - yearsLeftBaseline);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">Longitudinal Analytics</span>
          <h3 className="font-extrabold text-slate-800 text-lg">10-Year Cardiovascular Survival Forecast</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 self-start">
          <ShieldCheck className="w-4 h-4" />
          <span>Kaplan-Meier Model Projected</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-center">
        {/* Recharts Curve */}
        <div className="lg:col-span-8 h-64 bg-slate-50/40 rounded-2xl p-4 border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataPoints} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" strokeWidth={1.2} opacity={0.65} vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
              <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={10} fontWeight="bold" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  fontSize: "11px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)"
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
              <Line
                type="monotone"
                dataKey="Baseline Profile"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Simulated Profile"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Metadata Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500" />
              Projected Health Span Gains
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Baseline Survival (10 Yr)</span>
                <span className="font-bold text-rose-600">{dataPoints[10]["Baseline Profile"]}%</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Simulated Survival (10 Yr)</span>
                <span className="font-bold text-emerald-600">{dataPoints[10]["Simulated Profile"]}%</span>
              </div>
              <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Potential Risk Gap</span>
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  +{parseFloat((dataPoints[10]["Simulated Profile"] - dataPoints[10]["Baseline Profile"]).toFixed(1))}% Survival
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-rose-500 to-rose-600 p-4 rounded-2xl text-white shadow-sm flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-white/85">Hypothetical Life Extension</span>
              <p className="text-xs text-white/90 leading-relaxed font-normal mt-0.5">
                Simulating model variables shows you can increase your modeled survival longevity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
