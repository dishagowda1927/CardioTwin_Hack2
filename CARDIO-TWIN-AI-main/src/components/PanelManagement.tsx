import React, { useState, useEffect } from "react";
import { FolderHeart, Plus, Trash2, Eye, FileSpreadsheet, Sparkles } from "lucide-react";
import { PatientData } from "../types";

interface PanelManagementProps {
  currentProfile: PatientData;
  onLoadProfile: (profile: PatientData) => void;
}

interface SavedPanel {
  id: string;
  patientName: string;
  timestamp: string;
  profile: PatientData;
  overallRisk: number;
}

export default function PanelManagement({ currentProfile, onLoadProfile }: PanelManagementProps) {
  const [savedPanels, setSavedPanels] = useState<SavedPanel[]>([]);
  const [patientName, setPatientName] = useState("");
  const [currentRisk, setCurrentRisk] = useState(38); // Baseline estimation placeholder

  // Load panel history on mount
  useEffect(() => {
    const saved = localStorage.getItem("cardiotwin_panels");
    if (saved) {
      try {
        setSavedPanels(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const savePanel = () => {
    if (!patientName.trim()) return;

    // Estimate temporary mock risk just to display in panel list
    const calcRisk = Math.round(
      Math.min(
        95,
        Math.max(
          5,
          (currentProfile.age * 0.5 +
            currentProfile.systolicBP * 0.4 +
            currentProfile.cholesterol * 0.1 -
            currentProfile.physicalActivity * 5) *
            (currentProfile.smoking ? 1.3 : 1.0)
        )
      )
    );

    const newPanel: SavedPanel = {
      id: Date.now().toString(),
      patientName: patientName.trim(),
      timestamp: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      profile: { ...currentProfile, selectedCaseName: patientName.trim() },
      overallRisk: calcRisk
    };

    const updated = [newPanel, ...savedPanels];
    setSavedPanels(updated);
    localStorage.setItem("cardiotwin_panels", JSON.stringify(updated));
    setPatientName("");
  };

  const deletePanel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPanels.filter(p => p.id !== id);
    setSavedPanels(updated);
    localStorage.setItem("cardiotwin_panels", JSON.stringify(updated));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">Clinician Workspace</span>
          <h3 className="font-extrabold text-slate-800 text-lg">Patient Panel & Cases Manager</h3>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl text-slate-500">
          <FolderHeart className="w-5 h-5" />
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Save Current Session */}
        <div className="md:col-span-5 space-y-4">
          <h4 className="text-xs font-extrabold text-slate-700">Save Active Session to Panel</h4>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Store all loaded biochemical readings and lifestyle inputs to reference or load in future screening sessions.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Name or Case ID</label>
              <input
                type="text"
                placeholder="e.g. Ward 4B Patient 101"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-250 focus:border-rose-500 focus:outline-none font-medium text-slate-800"
              />
            </div>

            <button
              type="button"
              disabled={!patientName.trim()}
              onClick={savePanel}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Save Profile to Panel</span>
            </button>
          </div>
        </div>

        {/* List of Saved Sessions */}
        <div className="md:col-span-7 space-y-4">
          <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            Saved Assessments History ({savedPanels.length})
          </h4>

          {savedPanels.length === 0 ? (
            <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-4">
              <Eye className="w-8 h-8 mb-1 opacity-60" />
              <p className="text-[11px] font-medium text-center">No saved custom panels found in local workspace storage.</p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1.5">
              {savedPanels.map(panel => (
                <div
                  key={panel.id}
                  onClick={() => onLoadProfile(panel.profile)}
                  className="p-3 bg-slate-50 border border-slate-150 rounded-xl hover:bg-rose-50/20 hover:border-rose-200 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-800 group-hover:text-rose-600">
                      {panel.patientName}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>Saved: {panel.timestamp}</span>
                      <span>•</span>
                      <span>Age: {panel.profile.age}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      panel.overallRisk >= 50
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : panel.overallRisk >= 25
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      CVD Risk ~{panel.overallRisk}%
                    </span>

                    <button
                      type="button"
                      onClick={(e) => deletePanel(panel.id, e)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                      title="Delete profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
