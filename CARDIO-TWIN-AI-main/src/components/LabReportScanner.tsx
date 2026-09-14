import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, Upload, Sparkles, RefreshCw, CheckCircle2, AlertCircle, 
  AlertTriangle, Eye, ArrowRight, ShieldCheck, Trash2, Image as ImageIcon,
  Activity, Heart, Stethoscope, Info, Check, X, FileCheck, Zap,
  ExternalLink, Layers, ChevronRight, BookOpen
} from "lucide-react";
import { PatientData, LabReportScanResult, LabReportExtractedBiomarker } from "../types";
import { SAMPLE_LAB_REPORTS, SampleLabReportPreset } from "../data/sampleLabReports";

interface LabReportScannerProps {
  onApplyData: (data: PatientData, runAnalysisImmediately?: boolean) => void;
  onClose?: () => void;
  isModal?: boolean;
  theme?: "doctor" | "citizen";
}

export default function LabReportScanner({
  onApplyData,
  onClose,
  isModal = false,
  theme = "doctor"
}: LabReportScannerProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    base64: string;
    previewUrl?: string;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scanResult, setScanResult] = useState<LabReportScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeSummaryTab, setActiveSummaryTab] = useState<"professional" | "layman">(
    theme === "citizen" ? "layman" : "professional"
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size formatting helper
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Handle file selection (PDF or Image)
  const processFile = (file: File) => {
    setScanError(null);
    setScanResult(null);
    setActivePresetId(null);

    const validTypes = [
      "application/pdf", 
      "image/jpeg", 
      "image/png", 
      "image/webp", 
      "image/heic", 
      "image/jpg"
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|webp|heic)$/i)) {
      setScanError("Please upload a valid PDF document or Image (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setScanError("File size exceeds 25 MB limit. Please upload a smaller document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      const isImg = file.type.startsWith("image/");
      
      setSelectedFile({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        base64: base64Data,
        previewUrl: isImg ? base64Data : undefined
      });
    };

    reader.onerror = () => {
      setScanError("Failed to read the selected file. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Trigger Gemini AI Lab Report Scan API
  const handleScanReport = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanError(null);
    setScanStep(1);

    // Simulate scanning progress steps
    const stepTimer1 = setTimeout(() => setScanStep(2), 700);
    const stepTimer2 = setTimeout(() => setScanStep(3), 1400);

    try {
      const response = await fetch("/api/scan-lab-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: selectedFile.base64,
          mimeType: selectedFile.type,
          fileName: selectedFile.name
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: LabReportScanResult = await response.json();
      setScanStep(4);
      setTimeout(() => {
        setScanResult(data);
        setIsScanning(false);
      }, 500);

    } catch (err: any) {
      console.error("Lab Report Scanning failed:", err);
      setScanError(err.message || "Failed to scan report. Please verify file readability or try a sample report.");
      setIsScanning(false);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
    }
  };

  // Load a Pre-configured Sample Clinical Report
  const loadSampleReport = (preset: SampleLabReportPreset) => {
    setSelectedFile({
      name: `${preset.name}.pdf`,
      size: "1.4 MB",
      type: "application/pdf",
      base64: "data:application/pdf;base64,JVBERi0xLjQK...",
    });
    setActivePresetId(preset.id);
    setScanResult(preset.result);
    setScanError(null);
  };

  const handleApply = (runImmediately: boolean) => {
    if (!scanResult) return;
    onApplyData(scanResult.extractedPatientData, runImmediately);
    if (onClose) onClose();
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setScanResult(null);
    setScanError(null);
    setActivePresetId(null);
    setScanStep(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden ${isModal ? "max-h-[90vh] flex flex-col" : ""}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-7 relative overflow-hidden shrink-0">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30 ring-2 ring-white/20">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  Multimodal Medical OCR & Clinical AI
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                  PDF & Image Compatible
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                AI Lab Report Scanner
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                Upload blood work, lipid panels, or doctor vitals sheets to auto-extract parameters into CardioTwin.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`p-6 sm:p-8 space-y-6 ${isModal ? "overflow-y-auto" : ""}`}>
        {/* Step 1: Upload or Choose Sample if no scan result yet */}
        {!scanResult && (
          <div className="space-y-6">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer group ${
                dragOver 
                  ? "border-rose-500 bg-rose-50/40 ring-4 ring-rose-500/10" 
                  : selectedFile
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-slate-300 hover:border-rose-400 hover:bg-slate-50/70"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/heic"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div className="max-w-md mx-auto space-y-4">
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                      {selectedFile.type.includes("pdf") ? (
                        <FileText className="w-8 h-8" />
                      ) : (
                        <ImageIcon className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">
                        {selectedFile.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                        {selectedFile.size} • {selectedFile.type.toUpperCase()} • Ready for AI Ingestion
                      </p>
                    </div>
                    {selectedFile.previewUrl && (
                      <div className="max-w-[220px] max-h-[140px] mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm mt-2">
                        <img 
                          src={selectedFile.previewUrl} 
                          alt="Document Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs text-slate-400">Click or drop another file to replace</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base sm:text-lg group-hover:text-rose-600 transition-colors">
                        Drop your Lab Report (PDF or Photo) here
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Supports <span className="font-bold text-slate-700">PDF, JPG, PNG, WEBP</span> from diagnostic labs (Quest, Labcorp, Apollo, Metropolis, etc.)
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 cursor-pointer transition-all">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      <span>Browse from Computer or Phone</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error Message if any */}
            {scanError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{scanError}</p>
                  <p className="mt-0.5 text-red-600 font-normal">
                    Try uploading a clearer photo, an uncorrupted PDF, or click one of the calibrated sample reports below.
                  </p>
                </div>
              </div>
            )}

            {/* Action Bar when file is selected */}
            {selectedFile && !isScanning && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                >
                  Clear File
                </button>
                <button
                  type="button"
                  onClick={handleScanReport}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-sm font-extrabold shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan with Gemini Medical OCR</span>
                </button>
              </div>
            )}

            {/* Scanning Progress Overlay */}
            {isScanning && (
              <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-indigo-500/10" />
                
                {/* Laser scan line animation */}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-800 border border-rose-500/40 relative flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <FileText className="w-10 h-10 text-rose-400" />
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-lg shadow-rose-400"
                    animate={{ top: ["10%", "85%", "10%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>

                <div className="space-y-2 relative z-10">
                  <h3 className="text-lg font-black text-white">
                    Analyzing Medical Document...
                  </h3>
                  <p className="text-xs text-slate-300 font-normal">
                    Gemini 3.5 is parsing biomarkers, reference intervals, blood pressure metrics, and clinical findings.
                  </p>
                </div>

                {/* Step Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left relative z-10 max-w-2xl mx-auto">
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                    scanStep >= 1 ? "bg-rose-500/20 border-rose-500/50 text-rose-300" : "bg-slate-800/40 border-slate-700 text-slate-500"
                  }`}>
                    {scanStep > 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />}
                    <span>1. Document OCR</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                    scanStep >= 2 ? "bg-rose-500/20 border-rose-500/50 text-rose-300" : "bg-slate-800/40 border-slate-700 text-slate-500"
                  }`}>
                    {scanStep > 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : scanStep === 2 ? <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" /> : <Layers className="w-3.5 h-3.5 shrink-0" />}
                    <span>2. Biomarker Parsing</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                    scanStep >= 3 ? "bg-rose-500/20 border-rose-500/50 text-rose-300" : "bg-slate-800/40 border-slate-700 text-slate-500"
                  }`}>
                    {scanStep > 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : scanStep === 3 ? <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" /> : <ShieldCheck className="w-3.5 h-3.5 shrink-0" />}
                    <span>3. Unit Conversion</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                    scanStep >= 4 ? "bg-rose-500/20 border-rose-500/50 text-rose-300" : "bg-slate-800/40 border-slate-700 text-slate-500"
                  }`}>
                    {scanStep >= 4 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Activity className="w-3.5 h-3.5 shrink-0" />}
                    <span>4. Cardio Mapping</span>
                  </div>
                </div>
              </div>
            )}

            {/* Instant Sample Reports Test Library */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-700">
                    Or Try Calibrated Clinical Sample Reports
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Click to test instant OCR parsing</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {SAMPLE_LAB_REPORTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => loadSampleReport(preset)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-rose-300 bg-slate-50/50 hover:bg-rose-50/20 text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          {preset.tag}
                        </span>
                        <span className="text-[10px] text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform">
                          Load →
                        </span>
                      </div>
                      <h5 className="text-xs font-black text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {preset.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {preset.previewSnippet}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Extracted Results View */}
        {scanResult && (
          <div className="space-y-6">
            {/* Top Extraction Summary Ribbon */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      OCR Extracted Successfully ({scanResult.confidenceScore}% Confidence)
                    </span>
                    <span className="text-xs text-slate-400">• {scanResult.reportDate}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    {scanResult.reportTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Patient: <strong className="text-slate-700">{scanResult.patientName || "Assigned Profile"}</strong> | Lab: <strong className="text-slate-700">{scanResult.laboratoryName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>

            {/* Key Clinical Findings */}
            {scanResult.keyFindings && scanResult.keyFindings.length > 0 && (
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-rose-800">
                    Primary Biomarker Alerts & Clinical Observations
                  </h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {scanResult.keyFindings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white/80 border border-rose-100 p-2.5 rounded-xl text-xs text-slate-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Biomarkers Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-700">
                    Parsed Biomarkers & Vitals ({scanResult.biomarkers?.length || 0} Parameters)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">Standardized to CardioTwin inputs</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Biomarker / Vital</th>
                      <th className="py-3 px-4">Extracted Value</th>
                      <th className="py-3 px-4">Reference Range</th>
                      <th className="py-3 px-4">Status Flag</th>
                      <th className="py-3 px-4">Clinical Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scanResult.biomarkers?.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {b.name}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900 font-mono">
                          {b.value} <span className="text-slate-400 font-sans font-normal text-[10px]">{b.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {b.referenceRange || "Standard"}
                        </td>
                        <td className="py-3 px-4">
                          {b.status === "normal" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3" /> Normal
                            </span>
                          )}
                          {b.status === "high" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> Elevated
                            </span>
                          )}
                          {b.status === "critical" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Critical
                            </span>
                          )}
                          {b.status === "low" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              <Info className="w-3 h-3" /> Low
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] font-normal">
                          {b.clinicalNote || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Summary Tabs */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-800">
                    AI Diagnostic Briefing
                  </h4>
                </div>

                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveSummaryTab("professional")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSummaryTab === "professional" 
                        ? "bg-slate-900 text-white shadow-2xs" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Physician Brief
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSummaryTab("layman")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeSummaryTab === "layman" 
                        ? "bg-rose-600 text-white shadow-2xs" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Patient Plain English
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed font-normal">
                {activeSummaryTab === "professional" ? (
                  <p className="bg-white p-4 rounded-xl border border-slate-200/80 font-mono text-[11.5px] text-slate-800 leading-relaxed">
                    {scanResult.clinicalSummary}
                  </p>
                ) : (
                  <p className="bg-white p-4 rounded-xl border border-slate-200/80 text-slate-800 leading-relaxed text-xs">
                    {scanResult.laymanSummary}
                  </p>
                )}
              </div>

              {scanResult.recommendations && scanResult.recommendations.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Suggested Next Steps:
                  </h5>
                  <ul className="space-y-1">
                    {scanResult.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Ingestion Action Buttons */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetScanner}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                ← Back to Upload
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleApply(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-slate-800 text-slate-800 hover:bg-slate-100 text-xs font-extrabold transition-all cursor-pointer active:scale-98"
                >
                  Populate Form Inputs Only
                </button>

                <button
                  type="button"
                  onClick={() => handleApply(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-sm font-black shadow-xl shadow-rose-500/25 transition-all cursor-pointer active:scale-98"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Apply & Run CardioTwin Analysis</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
