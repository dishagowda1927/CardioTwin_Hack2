import { Printer, FileDown, ShieldCheck, HelpCircle, FileCode, Code2, Database, Download } from "lucide-react";
import { PatientData } from "../types";
import { generateFHIRBundle, generateCCDAXML, generateHL7v2Message } from "../utils/fhirProtocols";

interface ClinicalReportExportProps {
  patientData: PatientData;
  overallRisk: number;
  bestModelName: string;
  summaryText: string;
  onOpenEHRProtocols?: () => void;
}

export default function ClinicalReportExport({ 
  patientData, 
  overallRisk, 
  bestModelName, 
  summaryText,
  onOpenEHRProtocols
}: ClinicalReportExportProps) {
  const handlePrint = () => {
    window.print();
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

  const handleExportFHIR = () => {
    const bundle = generateFHIRBundle(patientData);
    downloadFile(JSON.stringify(bundle, null, 2), `FHIR-R4-Bundle-Patient-${patientData.age}y.json`, "application/json");
  };

  const handleExportCCDA = () => {
    const ccda = generateCCDAXML(patientData);
    downloadFile(ccda, `CCDA-ContinuityOfCare-${patientData.age}y.xml`, "application/xml");
  };

  const handleExportHL7v2 = () => {
    const hl7 = generateHL7v2Message(patientData);
    downloadFile(hl7, `HL7-ORU-R01-${patientData.age}y.hl7`, "text/plain");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-400 block">Consult Documentation &amp; Interoperability</span>
            <h3 className="font-extrabold text-white text-lg">Official Medical Report &amp; EHR Compiler</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>HL7 FHIR R4 &amp; C-CDA Certified</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-3">
          <p className="text-slate-300 text-xs leading-relaxed font-normal">
            Compile all model parameters, SHAP explanations, counterfactual simulations, and the clinical report summary into print-ready dossiers or standard hospital electronic health record formats.
          </p>
          
          {/* EHR & FHIR protocol export chips */}
          <div className="pt-1">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-2">
              Instant EHR &amp; FHIR Export Protocols:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportFHIR}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <FileCode className="w-3.5 h-3.5 text-rose-400" />
                <span>FHIR R4 Bundle (.json)</span>
                <Download className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleExportCCDA}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>C-CDA Release 2.1 (.xml)</span>
                <Download className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleExportHL7v2}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>HL7 v2.5.1 (.hl7)</span>
                <Download className="w-3 h-3 text-slate-400" />
              </button>

              {onOpenEHRProtocols && (
                <button
                  type="button"
                  onClick={onOpenEHRProtocols}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Open Full EHR Gateway →</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Clinical Dossier</span>
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Save PDF Document</span>
          </button>
        </div>
      </div>

      {/* Structured Print Layout Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: #000000 !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
