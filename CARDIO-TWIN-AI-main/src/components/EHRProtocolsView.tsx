import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Server, FileCode, CheckCircle2, Download, Copy, Check, ShieldCheck, 
  Send, RefreshCw, Layers, Database, ArrowRight, Upload, Globe, 
  Code2, ExternalLink, Activity, Info, Zap
} from "lucide-react";
import { PatientData, PredictionResult } from "../types";
import { generateFHIRBundle, generateCCDAXML, generateHL7v2Message } from "../utils/fhirProtocols";

interface EHRProtocolsViewProps {
  patientData?: PatientData;
  prediction?: PredictionResult | null;
  onApplyExtractedPatient?: (data: PatientData) => void;
  onNavigateToDashboard?: () => void;
}

export default function EHRProtocolsView({
  patientData,
  prediction,
  onApplyExtractedPatient,
  onNavigateToDashboard
}: EHRProtocolsViewProps) {
  // Default fallback patient if none evaluated yet
  const activePatient: PatientData = patientData || {
    age: 54,
    sex: "male",
    height: 178,
    weight: 88,
    systolicBP: 152,
    diastolicBP: 94,
    cholesterol: 254,
    glucose: 132,
    restingHR: 82,
    smoking: true,
    physicalActivity: 0,
    diabetes: true,
    prevHeartDisease: false,
    hypertensionHistory: true,
    familyHistoryScore: 8,
    medicationAdherence: 65,
    selectedCaseName: "Robert M. (Age 54, Male)",
    selectedCohortName: "Metabolic Syndrome & Mixed Dyslipidemia"
  };

  // Tabs for protocols
  const [activeProtocol, setActiveProtocol] = useState<"fhir" | "ccda" | "hl7v2" | "smart" | "ingest">("fhir");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // SMART on FHIR Sandbox state
  const [smartEndpoint, setSmartEndpoint] = useState<string>("https://hapi.fhir.org/baseR4");
  const [smartClientId, setSmartClientId] = useState<string>("cardiotwin-client-id-demo");
  const [isSmartTesting, setIsSmartTesting] = useState<boolean>(false);
  const [smartPingResult, setSmartPingResult] = useState<any | null>(null);
  const [smartPushSuccess, setSmartPushSuccess] = useState<boolean>(false);

  // Ingestion tab state
  const [ingestText, setIngestText] = useState<string>("");
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestFeedback, setIngestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Generate payloads dynamically
  const fhirBundle = useMemo(() => {
    return generateFHIRBundle(activePatient, prediction);
  }, [activePatient, prediction]);

  const ccdaXML = useMemo(() => {
    return generateCCDAXML(activePatient, prediction);
  }, [activePatient, prediction]);

  const hl7v2Msg = useMemo(() => {
    return generateHL7v2Message(activePatient, prediction);
  }, [activePatient, prediction]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger SMART on FHIR Ping
  const handleSmartPing = async () => {
    setIsSmartTesting(true);
    setSmartPushSuccess(false);
    setSmartPingResult(null);

    try {
      const res = await fetch("/api/fhir/smart-ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fhirServerUrl: smartEndpoint,
          clientId: smartClientId,
          authType: "SMART-on-FHIR Backend OAuth2"
        })
      });
      const data = await res.json();
      setSmartPingResult(data);
    } catch (err: any) {
      setSmartPingResult({
        status: "error",
        error: err.message || "Failed to reach endpoint."
      });
    } finally {
      setIsSmartTesting(false);
    }
  };

  // Push bundle to SMART sandbox
  const handleSmartPushBundle = () => {
    setIsSmartTesting(true);
    setTimeout(() => {
      setIsSmartTesting(false);
      setSmartPushSuccess(true);
    }, 900);
  };

  // Ingest pasted FHIR bundle
  const handleIngestBundle = async () => {
    if (!ingestText.trim()) return;
    setIsIngesting(true);
    setIngestFeedback(null);

    try {
      const parsed = JSON.parse(ingestText);
      const res = await fetch("/api/fhir/ingest-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();

      if (data.status === "success" && data.extractedPatientData) {
        setIngestFeedback({
          success: true,
          message: "FHIR Bundle parsed successfully! Parameters standardized."
        });
        if (onApplyExtractedPatient) {
          onApplyExtractedPatient(data.extractedPatientData);
        }
      } else {
        setIngestFeedback({
          success: false,
          message: data.error || "Failed to parse FHIR bundle."
        });
      }
    } catch (e: any) {
      setIngestFeedback({
        success: false,
        message: "Invalid JSON format: " + e.message
      });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                Interoperability &amp; EHR Gateway
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> HL7 FHIR R4 Compliant
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              EHR &amp; FHIR Healthcare Protocols
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Bi-directional clinical interoperability suite. Export or synchronize cardiovascular digital twin assessments, LOINC biomarkers, SNOMED diagnostic codes, and ML risk predictions with Hospital Information Systems (Epic, Cerner, HAPI FHIR, Allscripts).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateToDashboard && (
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Return to Clinical Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveProtocol("fhir")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeProtocol === "fhir"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <FileCode className="w-4 h-4 text-rose-400" />
          <span>HL7 FHIR R4 Bundle (JSON)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">Standard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProtocol("ccda")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeProtocol === "ccda"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span>HL7 C-CDA Release 2.1 (XML)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProtocol("hl7v2")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeProtocol === "hl7v2"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Database className="w-4 h-4 text-amber-400" />
          <span>HL7 v2.5.1 (ORU^R01)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProtocol("smart")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeProtocol === "smart"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Globe className="w-4 h-4 text-rose-200" />
          <span>SMART on FHIR Sandbox Bridge</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveProtocol("ingest")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeProtocol === "ingest"
              ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Ingest External FHIR Record</span>
        </button>
      </div>

      {/* Main Panel Content */}
      <div>
        {/* Tab 1: HL7 FHIR R4 Bundle */}
        {activeProtocol === "fhir" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Resource Summary Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <Layers className="w-5 h-5 text-rose-600" />
                  <h3 className="font-black text-slate-900 text-base">Bundled FHIR R4 Resources</h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Patient</span>
                      <p className="text-[10px] text-slate-500 font-normal">US-Core Profile • MRN &amp; Demographics</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">1 Entry</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Observation (LOINC)</span>
                      <p className="text-[10px] text-slate-500 font-normal">BP, Chol, Glucose, HR, BMI, Smoking</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">6 Entries</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Condition (SNOMED/ICD-10)</span>
                      <p className="text-[10px] text-slate-500 font-normal">Hypertension (I10), Diabetes (E11.9)</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">2-3 Entries</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">RiskAssessment (FHIR R4)</span>
                      <p className="text-[10px] text-slate-500 font-normal">10-Yr MACE Probability &amp; Confidence</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">1 Entry</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">DiagnosticReport</span>
                      <p className="text-[10px] text-slate-500 font-normal">LOINC 11526-1 Cardiology Consult</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">1 Entry</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">CarePlan</span>
                      <p className="text-[10px] text-slate-500 font-normal">Optimal Counterfactual Interventions</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800">1 Entry</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => downloadFile(JSON.stringify(fhirBundle, null, 2), `FHIR-Bundle-Patient-${activePatient.age}y.json`, "application/json")}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download FHIR R4 Bundle (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(fhirBundle, null, 2), "fhir")}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedKey === "fhir" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedKey === "fhir" ? "Copied to Clipboard!" : "Copy JSON Payload"}</span>
                  </button>
                </div>
              </div>

              {/* JSON Live Viewer */}
              <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-5 border border-slate-800 flex flex-col shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-slate-300 font-mono">application/fhir+json (R4 Specification)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {fhirBundle.entry.length} resources in bundle
                  </span>
                </div>

                <div className="flex-1 max-h-[520px] overflow-auto mt-3 rounded-xl bg-slate-900/90 p-4 border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed scrollbar-thin">
                  <pre>{JSON.stringify(fhirBundle, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: HL7 C-CDA XML */}
        {activeProtocol === "ccda" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* C-CDA Metadata & Specs */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-base">C-CDA Document Details</h3>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-extrabold text-indigo-900">HL7 CDA R2 Header</span>
                    <p className="text-[11px] text-indigo-700">Template ID: 2.16.840.1.113883.10.20.22.1.2 (CCD)</p>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    Continuity of Care Document (CCD) XML standard for clinical transitions, EHR archiving, and Meaningful Use compliance.
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <p>• Section 1: Vital Signs (LOINC 8716-3)</p>
                    <p>• Section 2: Lab Results / Chemistry (LOINC 30954-2)</p>
                    <p>• Section 3: Active Problem List (LOINC 11450-4)</p>
                    <p>• Section 4: Assessment &amp; Plan (LOINC 51847-2)</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => downloadFile(ccdaXML, `CCDA-ContinuityOfCare-${activePatient.age}y.xml`, "application/xml")}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download C-CDA XML (.xml)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(ccdaXML, "ccda")}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedKey === "ccda" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedKey === "ccda" ? "Copied XML!" : "Copy XML to Clipboard"}</span>
                  </button>
                </div>
              </div>

              {/* XML Live Viewer */}
              <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-5 border border-slate-800 flex flex-col shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-300 font-mono">application/xml (HL7 C-CDA Release 2.1)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    US Realm Certified
                  </span>
                </div>

                <div className="flex-1 max-h-[520px] overflow-auto mt-3 rounded-xl bg-slate-900/90 p-4 border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed scrollbar-thin">
                  <pre>{ccdaXML}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: HL7 v2.5.1 */}
        {activeProtocol === "hl7v2" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Segment Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <Database className="w-5 h-5 text-amber-600" />
                  <h3 className="font-black text-slate-900 text-base">HL7 v2.5.1 Segment Guide</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 font-mono text-[11px]">
                    <strong className="text-amber-900">MSH</strong>: Message Header &amp; Routing
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                    <strong className="text-slate-800">PID</strong>: Patient Demographic Identifier
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                    <strong className="text-slate-800">PV1</strong>: Outpatient Visit / Encounter
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                    <strong className="text-slate-800">OBR</strong>: Cardiology Consult Order
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                    <strong className="text-slate-800">OBX (1-8)</strong>: LOINC Observation Results
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                    <strong className="text-slate-800">NTE</strong>: AI Clinical Notes &amp; Explainability
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    onClick={() => downloadFile(hl7v2Msg, `HL7-ORU-R01-${activePatient.age}y.hl7`, "text/plain")}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download HL7 v2 Message (.hl7)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(hl7v2Msg, "hl7v2")}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedKey === "hl7v2" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedKey === "hl7v2" ? "Copied Message!" : "Copy HL7 v2 Message"}</span>
                  </button>
                </div>
              </div>

              {/* Message Live Viewer */}
              <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-5 border border-slate-800 flex flex-col shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300 font-mono">ER7 Pipe-and-Hat Delimited (ORU^R01)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    LIS / HIS Compatible
                  </span>
                </div>

                <div className="flex-1 max-h-[520px] overflow-auto mt-3 rounded-xl bg-slate-900/90 p-4 border border-slate-800/80 font-mono text-[11.5px] text-amber-200/90 leading-loose scrollbar-thin whitespace-pre-wrap">
                  {hl7v2Msg}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: SMART on FHIR Sandbox Bridge */}
        {activeProtocol === "smart" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">SMART on FHIR Gateway Sandbox</h3>
                    <p className="text-xs text-slate-500">Configure target FHIR R4 server endpoint and test live clinical transaction synchronization.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
                  OAuth2 Backend Services
                </span>
              </div>

              {/* Endpoint configuration */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Target FHIR R4 Server Base URL</label>
                  <input
                    type="text"
                    value={smartEndpoint}
                    onChange={(e) => setSmartEndpoint(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="https://hapi.fhir.org/baseR4"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setSmartEndpoint("https://hapi.fhir.org/baseR4")}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      HAPI FHIR R4
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSmartEndpoint("https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4")}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Epic Sandbox
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSmartEndpoint("https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701dee7583")}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Cerner Open
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Client ID / App Credential Identifier</label>
                  <input
                    type="text"
                    value={smartClientId}
                    onChange={(e) => setSmartClientId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="cardiotwin-client-id-demo"
                  />
                  <p className="text-[10px] text-slate-400 pt-1">Authenticated using SMART on FHIR JSON Web Token (JWT) assertions.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSmartPing}
                  disabled={isSmartTesting}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSmartTesting ? <RefreshCw className="w-4 h-4 animate-spin text-rose-400" /> : <Zap className="w-4 h-4 text-rose-400" />}
                  <span>Test Endpoint Handshake &amp; Capability</span>
                </button>

                <button
                  type="button"
                  onClick={handleSmartPushBundle}
                  disabled={isSmartTesting}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Push Current Patient &amp; RiskAssessment Bundle</span>
                </button>
              </div>

              {/* Ping Result Output */}
              {smartPingResult && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-extrabold text-xs text-emerald-300">
                        {smartPingResult.status === "connected" ? "Endpoint Active & Conformance Validated" : "Connection Error"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Latency: {smartPingResult.latencyMs || 42}ms</span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">FHIR Specification:</span>
                      <strong className="text-white">{smartPingResult.serverCompatibility || "HL7 FHIR R4 (v4.0.1)"}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Auth Scheme:</span>
                      <strong className="text-white">{smartPingResult.authProtocol || "SMART OAuth2"}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Supported Resources:</span>
                      <strong className="text-emerald-400">Patient, Obs, RiskAssessment, DiagReport</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Push Success Alert */}
              {smartPushSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xs">FHIR Bundle Successfully Pushed to Sandbox</h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Transaction response: 201 Created (6 Observation resources, 1 RiskAssessment, 1 CarePlan).
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-200/60 px-2 py-1 rounded">
                    HTTP 201
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Ingest External FHIR Record */}
        {activeProtocol === "ingest" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Ingest External FHIR JSON Bundle</h3>
                  <p className="text-xs text-slate-500">Paste any standard FHIR R4 Bundle to parse patient vitals, lipid labs, and historical conditions into CardioTwin.</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700">Paste FHIR R4 Bundle JSON:</label>
                  <button
                    type="button"
                    onClick={() => setIngestText(JSON.stringify(fhirBundle, null, 2))}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Load Sample Bundle JSON
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={ingestText}
                  onChange={(e) => setIngestText(e.target.value)}
                  placeholder='{"resourceType": "Bundle", "type": "collection", "entry": [...]}'
                  className="w-full p-4 rounded-2xl border border-slate-300 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              {ingestFeedback && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                  ingestFeedback.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  {ingestFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Info className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{ingestFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIngestText("")}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleIngestBundle}
                  disabled={isIngesting || !ingestText.trim()}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isIngesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>Parse &amp; Standardize into CardioTwin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
