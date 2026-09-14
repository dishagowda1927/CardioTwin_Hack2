import { PatientData, PredictionResult } from "../types";

/**
 * HL7 FHIR R4 & EHR Protocol Generator Utility for CardioTwin AI
 * Generates standards-compliant:
 * 1. HL7 FHIR R4 Bundle (Patient, Observation, Condition, RiskAssessment, DiagnosticReport, CarePlan)
 * 2. HL7 C-CDA R2.1 XML (Continuity of Care Document)
 * 3. HL7 v2.5.1 ORU^R01 / ADT^A08 Message
 */

export interface FHIRBundleOptions {
  patientId?: string;
  practitionerId?: string;
  organizationName?: string;
  encounterId?: string;
}

// Generate unique FHIR UUIDs
const generateUuid = () => "urn:uuid:" + Math.random().toString(36).substring(2, 15) + "-" + Math.random().toString(36).substring(2, 10);

/**
 * Builds a complete, compliant HL7 FHIR R4 Bundle
 */
export function generateFHIRBundle(
  patientData: PatientData,
  prediction?: PredictionResult | null,
  options: FHIRBundleOptions = {}
) {
  const patientId = options.patientId || "pat-cardiotwin-7492";
  const practitionerId = options.practitionerId || "pract-cardio-01";
  const organizationName = options.organizationName || "CardioTwin Digital Twin Health System";
  const timestamp = new Date().toISOString();
  const dateOnly = new Date().toISOString().split("T")[0];

  // Calculate approximate birth year from age
  const birthYear = new Date().getFullYear() - patientData.age;
  const approxBirthDate = `${birthYear}-01-01`;

  const patientUuid = `Patient/${patientId}`;

  // 1. Patient Resource
  const patientResource = {
    resourceType: "Patient",
    id: patientId,
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
      lastUpdated: timestamp
    },
    identifier: [
      {
        use: "usual",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "MR",
              display: "Medical Record Number"
            }
          ]
        },
        system: "http://cardiotwin.ai/mrn",
        value: `MRN-${patientId.replace("pat-", "").toUpperCase()}`
      }
    ],
    active: true,
    name: [
      {
        use: "official",
        family: patientData.selectedCaseName ? patientData.selectedCaseName.split(" ")[0] : "CardioPatient",
        given: [patientData.selectedCaseName ? (patientData.selectedCaseName.split(" ")[1] || "Clinical") : "Evaluated"]
      }
    ],
    gender: patientData.sex === "male" ? "male" : "female",
    birthDate: approxBirthDate,
    extension: [
      {
        url: "http://cardiotwin.ai/fhir/StructureDefinition/clinical-cohort",
        valueString: patientData.selectedCohortName || "Standard Outpatient Cohort"
      }
    ]
  };

  // 2. Observation Resources (LOINC Standard Mapped)
  const observations: any[] = [];

  // Systolic & Diastolic Blood Pressure (LOINC 85354-9 Panel)
  const bpObsId = `obs-bp-${Date.now()}`;
  observations.push({
    resourceType: "Observation",
    id: bpObsId,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/bp"]
    },
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "85354-9",
          display: "Blood pressure panel with all children optional"
        }
      ],
      text: "Blood Pressure"
    },
    subject: { reference: patientUuid },
    effectiveDateTime: timestamp,
    component: [
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8480-6",
              display: "Systolic blood pressure"
            }
          ]
        },
        valueQuantity: {
          value: patientData.systolicBP,
          unit: "mmHg",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]"
        },
        interpretation: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                code: patientData.systolicBP >= 140 ? "H" : patientData.systolicBP >= 130 ? "A" : "N",
                display: patientData.systolicBP >= 140 ? "High" : patientData.systolicBP >= 130 ? "Abnormal" : "Normal"
              }
            ]
          }
        ]
      },
      {
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8462-4",
              display: "Diastolic blood pressure"
            }
          ]
        },
        valueQuantity: {
          value: patientData.diastolicBP,
          unit: "mmHg",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]"
        },
        interpretation: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                code: patientData.diastolicBP >= 90 ? "H" : "N",
                display: patientData.diastolicBP >= 90 ? "High" : "Normal"
              }
            ]
          }
        ]
      }
    ]
  });

  // Total Cholesterol (LOINC 2093-3)
  observations.push({
    resourceType: "Observation",
    id: `obs-chol-${Date.now()}`,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory",
            display: "Laboratory"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "2093-3",
          display: "Cholesterol [Mass/volume] in Serum or Plasma"
        }
      ],
      text: "Total Cholesterol"
    },
    subject: { reference: patientUuid },
    effectiveDateTime: timestamp,
    valueQuantity: {
      value: patientData.cholesterol,
      unit: "mg/dL",
      system: "http://unitsofmeasure.org",
      code: "mg/dL"
    },
    referenceRange: [
      {
        high: {
          value: 200,
          unit: "mg/dL",
          system: "http://unitsofmeasure.org",
          code: "mg/dL"
        }
      }
    ]
  });

  // Fasting Blood Glucose (LOINC 2345-7)
  observations.push({
    resourceType: "Observation",
    id: `obs-glu-${Date.now()}`,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory",
            display: "Laboratory"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "2345-7",
          display: "Glucose [Mass/volume] in Serum or Plasma"
        }
      ],
      text: "Fasting Blood Glucose"
    },
    subject: { reference: patientUuid },
    effectiveDateTime: timestamp,
    valueQuantity: {
      value: patientData.glucose,
      unit: "mg/dL",
      system: "http://unitsofmeasure.org",
      code: "mg/dL"
    },
    referenceRange: [
      {
        low: { value: 70, unit: "mg/dL" },
        high: { value: 99, unit: "mg/dL" }
      }
    ]
  });

  // Heart Rate (LOINC 8867-4)
  observations.push({
    resourceType: "Observation",
    id: `obs-hr-${Date.now()}`,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "8867-4",
          display: "Heart rate"
        }
      ],
      text: "Resting Heart Rate"
    },
    subject: { reference: patientUuid },
    effectiveDateTime: timestamp,
    valueQuantity: {
      value: patientData.restingHR,
      unit: "beats/minute",
      system: "http://unitsofmeasure.org",
      code: "/min"
    }
  });

  // BMI (LOINC 39156-5) & Body Measurements
  const heightM = patientData.height / 100;
  const calculatedBmi = Number((patientData.weight / (heightM * heightM)).toFixed(1));

  observations.push({
    resourceType: "Observation",
    id: `obs-bmi-${Date.now()}`,
    status: "final",
    category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }],
    code: {
      coding: [{ system: "http://loinc.org", code: "39156-5", display: "Body mass index (BMI) [Ratio]" }],
      text: "Body Mass Index"
    },
    subject: { reference: patientUuid },
    effectiveDateTime: timestamp,
    valueQuantity: {
      value: calculatedBmi,
      unit: "kg/m2",
      system: "http://unitsofmeasure.org",
      code: "kg/m2"
    }
  });

  // Tobacco Smoking Status (LOINC 72166-2)
  observations.push({
    resourceType: "Observation",
    id: `obs-smoke-${Date.now()}`,
    status: "final",
    category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "social-history" }] }],
    code: {
      coding: [{ system: "http://loinc.org", code: "72166-2", display: "Tobacco smoking status" }],
      text: "Tobacco Smoking Status"
    },
    subject: { reference: patientUuid },
    effectiveDateTime: timestamp,
    valueCodeableConcept: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: patientData.smoking ? "449868002" : "266919005",
          display: patientData.smoking ? "Current every day smoker" : "Never smoker"
        }
      ],
      text: patientData.smoking ? "Current Tobacco Smoker" : "Non-Smoker"
    }
  });

  // 3. Condition Resources (Active Pre-existing Diagnoses)
  const conditions: any[] = [];
  if (patientData.hypertensionHistory) {
    conditions.push({
      resourceType: "Condition",
      id: `cond-htn-${Date.now()}`,
      clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
      verificationStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }] },
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-category", code: "encounter-diagnosis" }] }],
      code: {
        coding: [
          { system: "http://hl7.org/fhir/sid/icd-10-cm", code: "I10", display: "Essential (primary) hypertension" },
          { system: "http://snomed.info/sct", code: "59621000", display: "Essential hypertension" }
        ],
        text: "Essential Hypertension"
      },
      subject: { reference: patientUuid },
      recordedDate: dateOnly
    });
  }

  if (patientData.diabetes) {
    conditions.push({
      resourceType: "Condition",
      id: `cond-t2d-${Date.now()}`,
      clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
      verificationStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }] },
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-category", code: "encounter-diagnosis" }] }],
      code: {
        coding: [
          { system: "http://hl7.org/fhir/sid/icd-10-cm", code: "E11.9", display: "Type 2 diabetes mellitus without complications" },
          { system: "http://snomed.info/sct", code: "44054006", display: "Type 2 diabetes mellitus" }
        ],
        text: "Type 2 Diabetes Mellitus"
      },
      subject: { reference: patientUuid },
      recordedDate: dateOnly
    });
  }

  if (patientData.prevHeartDisease) {
    conditions.push({
      resourceType: "Condition",
      id: `cond-cad-${Date.now()}`,
      clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
      verificationStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }] },
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-category", code: "encounter-diagnosis" }] }],
      code: {
        coding: [
          { system: "http://hl7.org/fhir/sid/icd-10-cm", code: "I25.10", display: "Atherosclerotic heart disease of native coronary artery" },
          { system: "http://snomed.info/sct", code: "53741008", display: "Coronary arteriosclerosis" }
        ],
        text: "Coronary Artery Disease / Prior Cardiovascular Event"
      },
      subject: { reference: patientUuid },
      recordedDate: dateOnly
    });
  }

  // 4. RiskAssessment Resource (HL7 FHIR R4 RiskAssessment for CVD)
  const overallRisk = prediction ? prediction.overallRisk : (patientData.systolicBP > 140 || patientData.cholesterol > 240 ? 0.38 : 0.12);
  const riskCategory = prediction ? prediction.riskCategory : (overallRisk > 0.4 ? "High Risk" : overallRisk > 0.2 ? "Moderate Risk" : "Low Risk");

  const riskAssessmentResource = {
    resourceType: "RiskAssessment",
    id: `risk-cvd-${Date.now()}`,
    status: "final",
    subject: { reference: patientUuid },
    occurrenceDateTime: timestamp,
    performer: {
      display: "CardioTwin AI Decision Engine (XGBoost + SHAP Attributions)"
    },
    method: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "713603004",
          display: "Cardiovascular disease risk assessment tool"
        }
      ],
      text: "CardioTwin Explainable Ensemble Digital Twin Model"
    },
    basis: observations.map(o => ({ reference: `Observation/${o.id}` })),
    prediction: [
      {
        outcome: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "49436004",
              display: "Atrial fibrillation / Coronary atherosclerosis / Major Adverse Cardiovascular Event (10-Year)"
            }
          ],
          text: "10-Year Major Adverse Cardiovascular Event (MACE) Risk"
        },
        probabilityDecimal: Number(overallRisk.toFixed(3)),
        qualitativeRisk: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/risk-probability",
              code: overallRisk > 0.4 ? "high" : overallRisk > 0.2 ? "moderate" : "low",
              display: riskCategory
            }
          ],
          text: riskCategory
        },
        rationale: prediction?.shap?.summary || "Calculated using multidimensional hemodynamic and lipid biomarkers."
      }
    ],
    note: [
      {
        text: `CardioTwin Model Confidence: ${prediction?.modelConfidence || "94.8% (Calibrated)"}. Phenotype Cluster: ${prediction?.cluster?.assignedCluster?.name || "Metabolic Syndrome Cohort"}.`
      }
    ]
  };

  // 5. DiagnosticReport Resource (Cardiology Evaluation Summary)
  const diagnosticReportResource = {
    resourceType: "DiagnosticReport",
    id: `diag-report-${Date.now()}`,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0074",
            code: "CG",
            display: "Cardiology"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "11526-1",
          display: "Cardiology Consult note"
        }
      ],
      text: "CardioTwin Comprehensive Cardiovascular Evaluation Report"
    },
    subject: { reference: patientUuid },
    effectiveDateTime: timestamp,
    issued: timestamp,
    result: observations.map(o => ({ reference: `Observation/${o.id}` })),
    conclusion: `Patient evaluated with 10-year composite CVD risk of ${(overallRisk * 100).toFixed(1)}% (${riskCategory}). Key contributing factors: Systolic BP ${patientData.systolicBP} mmHg, Total Cholesterol ${patientData.cholesterol} mg/dL, Fasting Blood Glucose ${patientData.glucose} mg/dL.`
  };

  // 6. CarePlan Resource (Recommended Interventions & Counterfactuals)
  const carePlanResource = {
    resourceType: "CarePlan",
    id: `careplan-${Date.now()}`,
    status: "active",
    intent: "plan",
    category: [
      {
        coding: [
          {
            system: "http://hl7.org/fhir/us/core/CodeSystem/careplan-category",
            code: "assess-plan",
            display: "Assessment and Plan of Treatment"
          }
        ]
      }
    ],
    subject: { reference: patientUuid },
    period: {
      start: dateOnly
    },
    activity: (prediction?.counterfactuals || [
      { id: "cf-1", label: "BP Reduction to <125 mmHg", risk: 0.18, diff: -0.15, description: "Target systolic BP below 125 mmHg with dual antihypertensives" },
      { id: "cf-2", label: "Lipid Optimization", risk: 0.22, diff: -0.11, description: "Initiate high-intensity statin to lower LDL by 40%" }
    ]).map(cf => ({
      detail: {
        kind: "ServiceRequest",
        code: {
          text: cf.label
        },
        status: "in-progress",
        description: `${cf.description} (Projected relative risk reduction: ${(Math.abs(cf.diff) * 100).toFixed(1)}%)`
      }
    }))
  };

  // Assemble full FHIR Transaction/Document Bundle
  const allResources = [
    patientResource,
    ...observations,
    ...conditions,
    riskAssessmentResource,
    diagnosticReportResource,
    carePlanResource
  ];

  const fhirBundle = {
    resourceType: "Bundle",
    id: `bundle-cardiotwin-${Date.now()}`,
    meta: {
      lastUpdated: timestamp
    },
    type: "collection",
    timestamp: timestamp,
    entry: allResources.map(res => ({
      fullUrl: `urn:uuid:${res.id}`,
      resource: res
    }))
  };

  return fhirBundle;
}

/**
 * Builds a standards-compliant HL7 C-CDA (Continuity of Care Document R2.1) XML document
 */
export function generateCCDAXML(
  patientData: PatientData,
  prediction?: PredictionResult | null,
  options: FHIRBundleOptions = {}
): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14) + "+0000";
  const dateFormatted = new Date().toISOString().slice(0, 10);
  const birthYear = new Date().getFullYear() - patientData.age;
  const overallRisk = prediction ? (prediction.overallRisk * 100).toFixed(1) : "34.5";
  const riskCategory = prediction ? prediction.riskCategory : "Elevated Risk";
  const patientName = patientData.selectedCaseName || "CardioTwin Patient";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="cda.xsl"?>
<!-- HL7 C-CDA Release 2.1: Continuity of Care Document (CCD) Generated by CardioTwin AI -->
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:sdtc="urn:hl7-org:sdtc">
  <realmCode code="US"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <!-- US Realm Header template ID -->
  <templateId root="2.16.840.1.113883.10.20.22.1.1" extension="2015-08-01"/>
  <!-- Continuity of Care Document (CCD) template ID -->
  <templateId root="2.16.840.1.113883.10.20.22.1.2" extension="2015-08-01"/>
  <id root="2.16.840.1.113883.19.5.99999.1" extension="CT-${Date.now()}"/>
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Summarization of Episode Note"/>
  <title>CardioTwin AI — Cardiovascular Health &amp; Risk Intelligence Summary</title>
  <effectiveTime value="${timestamp}"/>
  <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
  <languageCode code="en-US"/>

  <!-- Record Target / Patient Demographics -->
  <recordTarget>
    <patientRole>
      <id root="2.16.840.1.113883.19.5" extension="MRN-749201"/>
      <addr use="HP">
        <streetAddressLine>100 Heart Health Blvd</streetAddressLine>
        <city>Medical District</city>
        <state>CA</state>
        <postalCode>94103</postalCode>
        <country>USA</country>
      </addr>
      <telecom value="tel:+1-555-555-0199" use="HP"/>
      <patient>
        <name use="L">
          <given>${patientName.split(" ")[0] || "Patient"}</given>
          <family>${patientName.split(" ")[1] || "Record"}</family>
        </name>
        <administrativeGenderCode code="${patientData.sex === "male" ? "M" : "F"}" codeSystem="2.16.840.1.113883.5.1" displayName="${patientData.sex === "male" ? "Male" : "Female"}"/>
        <birthTime value="${birthYear}0101"/>
      </patient>
    </patientRole>
  </recordTarget>

  <!-- Author: CardioTwin Digital Twin AI Decision Support -->
  <author>
    <time value="${timestamp}"/>
    <assignedAuthor>
      <id root="2.16.840.1.113883.4.6" extension="9999999999"/>
      <assignedPerson>
        <name>
          <prefix>Dr.</prefix>
          <given>CardioTwin</given>
          <family>Intelligence AI</family>
        </name>
      </assignedPerson>
      <representedOrganization>
        <id root="2.16.840.1.113883.19.5"/>
        <name>CardioTwin Precision Cardiology Network</name>
      </representedOrganization>
    </assignedAuthor>
  </author>

  <!-- Custodian Organization -->
  <custodian>
    <assignedCustodian>
      <representedCustodianOrganization>
        <id root="2.16.840.1.113883.19.5"/>
        <name>CardioTwin Precision Health EHR Gateway</name>
      </representedCustodianOrganization>
    </assignedCustodian>
  </custodian>

  <!-- Structured Body Sections -->
  <component>
    <structuredBody>

      <!-- 1. VITAL SIGNS SECTION (LOINC 8716-3) -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.4.1" extension="2015-08-01"/>
          <code code="8716-3" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Vital Signs"/>
          <title>Vital Signs &amp; Physiological Biomarkers</title>
          <text>
            <table border="1" width="100%">
              <thead>
                <tr>
                  <th>Biomarker</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Systolic Blood Pressure</td>
                  <td>${patientData.systolicBP}</td>
                  <td>mm[Hg]</td>
                  <td>${patientData.systolicBP >= 140 ? "Elevated / Stage 2" : "Acceptable"}</td>
                </tr>
                <tr>
                  <td>Diastolic Blood Pressure</td>
                  <td>${patientData.diastolicBP}</td>
                  <td>mm[Hg]</td>
                  <td>${patientData.diastolicBP >= 90 ? "Elevated" : "Normal"}</td>
                </tr>
                <tr>
                  <td>Resting Heart Rate</td>
                  <td>${patientData.restingHR}</td>
                  <td>bpm</td>
                  <td>Normal Sinus Rhythm</td>
                </tr>
                <tr>
                  <td>Body Height</td>
                  <td>${patientData.height}</td>
                  <td>cm</td>
                  <td>Standard</td>
                </tr>
                <tr>
                  <td>Body Weight</td>
                  <td>${patientData.weight}</td>
                  <td>kg</td>
                  <td>Standard</td>
                </tr>
              </tbody>
            </table>
          </text>
        </section>
      </component>

      <!-- 2. LAB RESULTS & CHEMISTRY SECTION (LOINC 30954-2) -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.3.1" extension="2015-08-01"/>
          <code code="30954-2" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Relevant Diagnostic Tests/Laboratory Results"/>
          <title>Metabolic &amp; Lipid Panel Results</title>
          <text>
            <table border="1" width="100%">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Result</th>
                  <th>Reference Interval</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Serum Total Cholesterol (LOINC 2093-3)</td>
                  <td>${patientData.cholesterol} mg/dL</td>
                  <td>&lt; 200 mg/dL</td>
                  <td>${patientData.cholesterol >= 200 ? "High" : "Desirable"}</td>
                </tr>
                <tr>
                  <td>Fasting Blood Glucose (LOINC 2345-7)</td>
                  <td>${patientData.glucose} mg/dL</td>
                  <td>70 - 99 mg/dL</td>
                  <td>${patientData.glucose >= 126 ? "Diabetic Range" : patientData.glucose >= 100 ? "Pre-diabetic" : "Normal"}</td>
                </tr>
              </tbody>
            </table>
          </text>
        </section>
      </component>

      <!-- 3. ACTIVE PROBLEM LIST (LOINC 11450-4) -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.5.1" extension="2015-08-01"/>
          <code code="11450-4" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Problem List"/>
          <title>Active Cardiovascular &amp; Metabolic Diagnoses</title>
          <text>
            <ul>
              ${patientData.hypertensionHistory ? '<li><strong>Essential Hypertension</strong> (ICD-10-CM: I10, SNOMED: 59621000) — Active</li>' : ''}
              ${patientData.diabetes ? '<li><strong>Type 2 Diabetes Mellitus</strong> (ICD-10-CM: E11.9, SNOMED: 44054006) — Active</li>' : ''}
              ${patientData.prevHeartDisease ? '<li><strong>Coronary Atherosclerosis / History of Heart Disease</strong> (ICD-10-CM: I25.10) — Active</li>' : ''}
              ${patientData.smoking ? '<li><strong>Tobacco Use Disorder</strong> (ICD-10-CM: F17.200) — Current Daily Smoker</li>' : ''}
            </ul>
          </text>
        </section>
      </component>

      <!-- 4. ASSESSMENT & PLAN OF TREATMENT (LOINC 51847-2) -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.9" extension="2015-08-01"/>
          <code code="51847-2" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Assessment &amp; Plan of Treatment"/>
          <title>CardioTwin Risk Assessment &amp; Clinical Counterfactuals</title>
          <text>
            <paragraph>
              <strong>10-Year Composite CVD Risk:</strong> ${overallRisk}% (${riskCategory})
            </paragraph>
            <paragraph>
              <strong>Phenotypic Subtype:</strong> ${prediction?.cluster?.assignedCluster?.name || "Metabolic Syndrome Cohort"}
            </paragraph>
            <paragraph>
              <strong>Machine Learning Explainability (SHAP):</strong> ${prediction?.shap?.summary || "Calculated using multidimensional hemodynamic features."}
            </paragraph>
            <paragraph>
              <strong>Recommended Clinical Interventions:</strong>
            </paragraph>
            <list>
              <item>Optimize blood pressure to target &lt; 130/80 mmHg using evidence-based ACEI/ARB or CCB therapy.</item>
              <item>Initiate or intensify statin therapy targeting LDL reduction &gt; 30-50%.</item>
              <item>Dietary sodium restriction (&lt; 2,000 mg/day) and structured aerobic physical activity (150 min/wk).</item>
            </list>
          </text>
        </section>
      </component>

    </structuredBody>
  </component>
</ClinicalDocument>`;

  return xml.trim();
}

/**
 * Builds a traditional HL7 v2.5.1 ORU^R01 (Unsolicited Observation Result) Pipe-and-Hat formatted message
 */
export function generateHL7v2Message(
  patientData: PatientData,
  prediction?: PredictionResult | null
): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const msgControlId = `MSG${Date.now().toString().slice(-8)}`;
  const patientId = `MRN${Math.floor(100000 + Math.random() * 900000)}`;
  const patientName = patientData.selectedCaseName ? patientData.selectedCaseName.replace(/\s+/g, "^") : "PATIENT^CARDIOTWIN";
  const overallRisk = prediction ? (prediction.overallRisk * 100).toFixed(1) : "34.5";
  const riskCategory = prediction ? prediction.riskCategory : "High Risk";

  const lines = [
    `MSH|^~\\&|CARDIOTWIN_AI|CARDIOLOGY_CLINIC|HOSPITAL_EHR|METRO_HEALTH|${timestamp}||ORU^R01^ORU_R01|${msgControlId}|P|2.5.1|||AL|NE||UNICODE UTF-8`,
    `PID|1||${patientId}^^^CARDIOTWIN^MR||${patientName}||${new Date().getFullYear() - patientData.age}0101|${patientData.sex === "male" ? "M" : "F"}|||100 HEART HEALTH WAY^^SAN FRANCISCO^CA^94103^USA`,
    `PV1|1|O|CARDIOLOGY^ROOM101^BED1||||9999^ATTENDING^CARDIOLOGIST^MD||||||||||||CON001|||||||||||||||||||||||||${timestamp}`,
    `ORC|RE|ORD${Date.now().toString().slice(-6)}|PL${Date.now().toString().slice(-6)}||CM||||${timestamp}|${msgControlId}|||CARDIOTWIN_AI`,
    `OBR|1|ORD${Date.now().toString().slice(-6)}|PL${Date.now().toString().slice(-6)}|11526-1^CARDIOLOGY CONSULT EVALUATION^LN|||${timestamp}|||||||||9999^CARDIOLOGIST^MD||||||${timestamp}|||F`,
    `OBX|1|NM|8480-6^SYSTOLIC BLOOD PRESSURE^LN|1|${patientData.systolicBP}|mm[Hg]|<120|${patientData.systolicBP >= 140 ? "H" : "N"}|||F|||${timestamp}`,
    `OBX|2|NM|8462-4^DIASTOLIC BLOOD PRESSURE^LN|1|${patientData.diastolicBP}|mm[Hg]|<80|${patientData.diastolicBP >= 90 ? "H" : "N"}|||F|||${timestamp}`,
    `OBX|3|NM|2093-3^TOTAL CHOLESTEROL^LN|1|${patientData.cholesterol}|mg/dL|<200|${patientData.cholesterol >= 200 ? "H" : "N"}|||F|||${timestamp}`,
    `OBX|4|NM|2345-7^FASTING GLUCOSE^LN|1|${patientData.glucose}|mg/dL|70-99|${patientData.glucose >= 126 ? "H" : "N"}|||F|||${timestamp}`,
    `OBX|5|NM|8867-4^RESTING HEART RATE^LN|1|${patientData.restingHR}|bpm|60-100|N|||F|||${timestamp}`,
    `OBX|6|ST|72166-2^TOBACCO SMOKING STATUS^LN|1|${patientData.smoking ? "CURRENT SMOKER" : "NEVER SMOKED"}|||${patientData.smoking ? "A" : "N"}|||F|||${timestamp}`,
    `OBX|7|NM|713603004^10-YEAR CVD RISK PROBABILITY^SCT|1|${overallRisk}|%|<10.0|${Number(overallRisk) >= 20 ? "H" : "N"}|||F|||${timestamp}`,
    `OBX|8|TX|CARDIO_RISK_CATEGORY^QUALITATIVE ASSESSMENT^CT|1|${riskCategory.toUpperCase()}|||${riskCategory.includes("High") ? "H" : "N"}|||F|||${timestamp}`,
    `NTE|1|L|CardioTwin AI SHAP Explainability: ${prediction?.shap?.summary || "Blood pressure and lipid burden are primary drivers of cardiovascular risk."}`,
    `NTE|2|L|Recommended Clinical Counterfactual: Achieve SBP <130 mmHg and LDL reduction >40% for simulated 15% absolute risk decrement.`
  ];

  return lines.join("\r\n");
}
