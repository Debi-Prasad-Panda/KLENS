"""
K-LENS Demo Data Generator
Generates 20 interconnected PDF documents with shared entities for Knowledge Graph demo.
"""
import os
import random
from fpdf import FPDF
from datetime import datetime, timedelta

# --- CONFIGURATION: THE "CONNECTING" ENTITIES ---
MACHINES = ["Boiler-B7", "Pump-Station-Alpha", "Turbine-C2", "Loco-WAP7-302", "Transformer-T9", "Compressor-K3"]
PEOPLE = ["Eng. Rajesh Kumar", "Safety Officer Ramesh", "Manager Priya Sharma", "Supervisor Khan", "Tech. Suresh", "Inspector Meera"]
DEPTS = ["Engineering Dept", "Procurement", "Safety Cell", "HR Dept", "Finance Dept", "Operations"]
RISKS = ["Pressure Valve Leak", "Overheating Detected", "Vibration Anomaly", "Hydraulic Failure", "Insulation Degradation", "Electrical Fault"]
STANDARDS = ["ISO 9001:2015", "RDSO Standard", "Factory Act 1948", "Boiler Regulation 2017", "Railway Safety Rules", "ASME BPVC"]

# Create output folder
OUTPUT_FOLDER = "klens_demo_data"
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'KOCHI METRO RAIL LIMITED - OFFICIAL DOCUMENT', 0, 1, 'C')
        self.set_font('Arial', 'I', 8)
        self.cell(0, 5, 'Document Management System - K-LENS', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()} - CONFIDENTIAL - Generated for K-LENS Demo', 0, 0, 'C')


def generate_engineering_spec(filename, machine, author, dept):
    """Generate Technical Specification Document"""
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    
    ref_no = f"ENG/{random.randint(1000, 9999)}/2025"
    date_str = datetime.now().strftime("%Y-%m-%d")
    related_machine = random.choice([m for m in MACHINES if m != machine])
    compliance = random.sample(STANDARDS, 2)
    
    content = f"""
TECHNICAL SPECIFICATION REPORT
===============================
Ref No: {ref_no}
Date: {date_str}
Department: {dept}
Prepared By: {author}

SUBJECT: OPERATIONAL PARAMETERS FOR {machine}

1.0 SCOPE
---------
This specification covers the technical requirements for the maintenance 
and operation of {machine}. The equipment is located in Sector-4 and 
falls under the jurisdiction of the {dept}.

This equipment works in conjunction with {related_machine} for optimal 
system performance.

2.0 TECHNICAL DATA
------------------
- Rated Voltage: 25 kV AC
- Max Operating Temperature: 85 Deg C
- Pressure Limit: 300 PSI (Critical threshold: 350 PSI)
- Manufacturer: BHEL / Alstom
- Commissioning Date: 2019
- Expected Service Life: 15 years

3.0 CRITICAL COMPONENTS
-----------------------
The primary valves of {machine} require weekly inspection. 
Any variance in vibration levels must be reported to {author} immediately.

Safety interlocks are connected to the central monitoring system.
Monthly calibration required as per {compliance[0]}.

4.0 COMPLIANCE REQUIREMENTS
---------------------------
This equipment must comply with:
- {compliance[0]}
- {compliance[1]}

All maintenance personnel must be certified by {dept}.

5.0 RESPONSIBLE PERSONNEL
-------------------------
Primary Contact: {author}
Secondary: {random.choice([p for p in PEOPLE if p != author])}
Department Head: {random.choice(PEOPLE)}

Approved by: Station Manager
"""
    pdf.multi_cell(0, 8, content)
    pdf.output(os.path.join(OUTPUT_FOLDER, filename))


def generate_maintenance_log(filename, machine, person, risk, dept):
    """Generate Maintenance Log with Risk Detection"""
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Courier", size=10)
    
    date_str = (datetime.now() - timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d")
    related_person = random.choice([p for p in PEOPLE if p != person])
    
    content = f"""
==============================================================
            DAILY MAINTENANCE LOG SHEET
==============================================================
UNIT: {machine}                    DATE: {date_str}
INSPECTED BY: {person}             SHIFT: Night
DEPARTMENT: {dept}
==============================================================

TIME     PARAMETER      VALUE     STATUS      REMARKS
--------------------------------------------------------------
08:00    Temperature    72C       OK          Within limits
10:00    Pressure       280 PSI   OK          Normal operation
12:00    Vibration      4.2mm     WARNING     Slight increase
14:00    Pressure       310 PSI   CRITICAL    Exceeds threshold
16:00    Temperature    92C       WARNING     Rising trend
18:00    Emergency Shutdown Initiated
--------------------------------------------------------------

INCIDENT REPORT
===============
During routine inspection of {machine}, critical anomaly detected.

RISK TYPE: {risk}
SEVERITY: HIGH
AFFECTED SYSTEMS: Primary cooling loop, Pressure relief valves

ROOT CAUSE ANALYSIS:
- Possible wear in primary seal
- Calibration drift in pressure sensors
- Last maintenance overdue by 12 days

IMMEDIATE ACTIONS TAKEN:
1. Emergency shutdown protocol initiated
2. Alert sent to {dept}
3. Notified {related_person} via WhatsApp
4. Cordoned off area as per safety protocol

PARTS REQUIRED:
- High pressure gasket (Type A) x 4
- Pressure sensor (Model PS-300) x 2
- Hydraulic fluid (50 liters)

ESTIMATED DOWNTIME: 48 hours

Signed: {person}
Designation: Senior Section Engineer
Contact: Ext. {random.randint(100, 999)}

CC: {related_person}, {dept} Head
"""
    pdf.multi_cell(0, 7, content)
    pdf.output(os.path.join(OUTPUT_FOLDER, filename))


def generate_invoice(filename, machine, dept, person):
    """Generate Invoice/Bill of Quantities"""
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    
    invoice_no = f"INV-{random.randint(10000, 99999)}"
    date_str = datetime.now().strftime("%Y-%m-%d")
    amount = random.randint(30000, 150000)
    
    content = f"""
BILL OF QUANTITIES / INVOICE
============================
INVOICE NO: {invoice_no}
DATE: {date_str}
TO: {dept}
FROM: Central Stores

PAYMENT FOR: REPAIR WORKS ON {machine}
WORK ORDER REF: WO-{random.randint(1000, 9999)}
REQUESTED BY: {person}

---------------------------------------------------------------
S.No  Item Description                    Qty      Amount (INR)
---------------------------------------------------------------
1.    High Pressure Gasket (Type A)        4        12,000.00
2.    Hydraulic Fluid (Liters)            50        25,000.00
3.    Pressure Sensor (Model PS-300)       2        18,000.00
4.    Labor Charges (Emergency)            1        15,000.00
5.    Calibration of Sensors               2         5,000.00
6.    Safety Equipment Replacement         1         8,000.00
---------------------------------------------------------------
      SUB-TOTAL:                                    83,000.00
      GST (18%):                                    14,940.00
      =========================================================
      GRAND TOTAL:                                  97,940.00
---------------------------------------------------------------

PAYMENT TERMS: Within 30 days
APPROVAL STATUS: PENDING

BUDGET HEAD: Maintenance & Repairs
PROJECT CODE: MR-2025-{random.randint(100, 999)}

APPROVALS REQUIRED:
1. Section Head: {person} - APPROVED
2. Finance: Pending
3. Station Manager: Pending

NOTE: This expenditure is linked to the incident reported on {machine}.
Urgency Level: HIGH - Safety Critical

Prepared by: Accounts Section
Verified by: {random.choice(PEOPLE)}
"""
    pdf.multi_cell(0, 8, content)
    pdf.output(os.path.join(OUTPUT_FOLDER, filename))


def generate_safety_audit(filename, machine, inspector, risks):
    """Generate Safety Audit Report"""
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    
    date_str = datetime.now().strftime("%Y-%m-%d")
    compliance = random.sample(STANDARDS, 3)
    
    content = f"""
SAFETY AUDIT REPORT
===================
Audit Reference: SA-{random.randint(1000, 9999)}/2025
Audit Date: {date_str}
Lead Auditor: {inspector}
Department: Safety Cell

EQUIPMENT AUDITED: {machine}
LOCATION: Sector 4, Main Plant Area

1.0 EXECUTIVE SUMMARY
---------------------
This audit was conducted as part of the quarterly safety compliance 
program. The following areas were assessed:
- Operational safety protocols
- Equipment condition
- Personnel training compliance
- Emergency preparedness

2.0 COMPLIANCE STATUS
---------------------
Standard                          Status
------------------------------------------
{compliance[0]}                   COMPLIANT
{compliance[1]}                   PARTIAL
{compliance[2]}                   COMPLIANT

3.0 RISKS IDENTIFIED
--------------------
During this audit, the following risks were identified:

RISK 1: {risks[0]}
- Severity: HIGH
- Likelihood: MEDIUM
- Action: Immediate maintenance required

RISK 2: {risks[1] if len(risks) > 1 else 'Minor wear observed'}
- Severity: MEDIUM
- Likelihood: LOW
- Action: Schedule preventive maintenance

4.0 RECOMMENDATIONS
-------------------
1. Conduct immediate repair of {machine}
2. Update training records for all operators
3. Install additional monitoring sensors
4. Review emergency evacuation routes

5.0 PERSONNEL INTERVIEWED
-------------------------
- {random.choice(PEOPLE)} - Shift Operator
- {random.choice(PEOPLE)} - Maintenance Lead
- {random.choice(PEOPLE)} - Department Head

NEXT AUDIT DUE: {(datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")}

Signed: {inspector}
Designation: Safety Inspector
"""
    pdf.multi_cell(0, 8, content)
    pdf.output(os.path.join(OUTPUT_FOLDER, filename))


def generate_memo(filename, from_person, to_dept, machine, subject):
    """Generate Internal Memo"""
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    
    date_str = datetime.now().strftime("%Y-%m-%d")
    
    content = f"""
INTERNAL MEMORANDUM
===================

DATE: {date_str}
FROM: {from_person}
TO: {to_dept}
CC: Safety Cell, Operations

SUBJECT: {subject}

REFERENCE: {machine} Incident Report

Dear Sir/Madam,

This is to bring to your immediate attention regarding the recent 
incident involving {machine} in Sector 4.

BACKGROUND:
As per the maintenance log dated {(datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")}, 
abnormal readings were observed in the primary pressure systems. 
The situation was escalated following standard protocol.

CURRENT STATUS:
- Equipment is under emergency shutdown
- Repair team has been mobilized
- Spare parts procurement in progress
- Estimated repair time: 48-72 hours

FINANCIAL IMPACT:
- Estimated repair cost: INR 97,940
- Production loss/day: INR 45,000
- Total projected impact: INR 2,32,940

ACTION REQUIRED:
1. Approval for emergency procurement
2. Overtime authorization for maintenance crew
3. Temporary power rerouting arrangement

RESPONSIBLE PARTIES:
- Technical Lead: {random.choice(PEOPLE)}
- Safety Coordinator: {random.choice(PEOPLE)}
- Finance Approval: {to_dept} Head

Please treat this as URGENT.

Regards,
{from_person}
Senior Manager
Contact: Ext. {random.randint(100, 999)}
"""
    pdf.multi_cell(0, 8, content)
    pdf.output(os.path.join(OUTPUT_FOLDER, filename))


# --- GENERATION LOOP ---
print(f"Generating Interconnected PDFs in '{OUTPUT_FOLDER}'...")
print("=" * 50)

file_count = 0

# Generate 6 Engineering Specs
for i, machine in enumerate(MACHINES):
    person = PEOPLE[i % len(PEOPLE)]
    dept = DEPTS[i % len(DEPTS)]
    filename = f"Spec_{machine.replace('-', '_')}.pdf"
    generate_engineering_spec(filename, machine, person, dept)
    print(f"  Created: {filename}")
    file_count += 1

# Generate 6 Maintenance Logs (with Risk connections)
for i, machine in enumerate(MACHINES):
    person = PEOPLE[(i + 1) % len(PEOPLE)]
    risk = RISKS[i % len(RISKS)]
    dept = DEPTS[(i + 2) % len(DEPTS)]
    filename = f"Log_{machine.replace('-', '_')}.pdf"
    generate_maintenance_log(filename, machine, person, risk, dept)
    print(f"  Created: {filename}")
    file_count += 1

# Generate 4 Invoices
for i in range(4):
    machine = MACHINES[i]
    dept = DEPTS[i % len(DEPTS)]
    person = PEOPLE[i % len(PEOPLE)]
    filename = f"Invoice_{machine.replace('-', '_')}.pdf"
    generate_invoice(filename, machine, dept, person)
    print(f"  Created: {filename}")
    file_count += 1

# Generate 2 Safety Audits
for i in range(2):
    machine = MACHINES[i]
    inspector = PEOPLE[3]  # Safety Officer
    risks = RISKS[i*2:(i+1)*2]
    filename = f"SafetyAudit_{machine.replace('-', '_')}.pdf"
    generate_safety_audit(filename, machine, inspector, risks)
    print(f"  Created: {filename}")
    file_count += 1

# Generate 2 Memos
for i in range(2):
    machine = MACHINES[i]
    from_person = PEOPLE[2]  # Manager
    to_dept = DEPTS[4]  # Finance
    subject = f"Urgent: {RISKS[i]} on {machine}"
    filename = f"Memo_{machine.replace('-', '_')}.pdf"
    generate_memo(filename, from_person, to_dept, machine, subject)
    print(f"  Created: {filename}")
    file_count += 1

print("=" * 50)
print(f"✅ SUCCESS! Generated {file_count} interconnected PDFs")
print(f"📁 Location: {os.path.abspath(OUTPUT_FOLDER)}")
print("")
print("📊 Entity Connections Created:")
print(f"   - Machines: {len(MACHINES)} (appear across all doc types)")
print(f"   - People: {len(PEOPLE)} (engineers, managers, inspectors)")
print(f"   - Departments: {len(DEPTS)} (cross-referenced)")
print(f"   - Risks: {len(RISKS)} (detected in logs & audits)")
print("")
print("🚀 Next Step: Upload these files to K-LENS and watch the Knowledge Graph light up!")
