import fs from 'fs-extra';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DocumentData } from './types';
import { DOCUMENTS_DIR } from './config';

function getDocumentData(): DocumentData[] {
  const baseDate = new Date('2024-01-10');
  
  return [
    {
      title: 'Q1 2024 Team Meeting Agenda',
      date: new Date(baseDate),
      type: 'agenda',
      content: `Q1 2024 TEAM MEETING AGENDA
Date: January 10, 2024
Time: 10:00 AM - 11:30 AM
Location: Conference Room A / Zoom

AGENDA ITEMS:

1. Welcome & Introductions (5 min)
   - New team member introductions
   - Q1 goals overview

2. Q4 2023 Review (15 min)
   - Key achievements
   - Lessons learned
   - Metrics and KPIs

3. Q1 2024 Objectives (20 min)
   - Product roadmap discussion
   - Resource allocation
   - Timeline review

4. Budget Planning (15 min)
   - Q1 budget allocation
   - Project funding priorities
   - Cost optimization strategies

5. Team Updates (20 min)
   - Engineering: Sprint planning
   - Design: New UI/UX initiatives
   - Marketing: Campaign launches

6. Open Discussion (10 min)
   - Questions and concerns
   - Action items assignment

7. Next Steps (5 min)
   - Follow-up meetings scheduled
   - Documentation assignments

ACTION ITEMS:
- [ ] Sarah: Prepare detailed Q1 budget breakdown
- [ ] Mike: Share sprint timeline with stakeholders
- [ ] Lisa: Finalize design system documentation

NEXT MEETING: January 24, 2024 at 10:00 AM`
    },
    {
      title: 'Electricity Bill - January 2024',
      date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      type: 'bill',
      content: `ELECTRICITY BILL
Account Number: 1234-5678-9012
Service Address: 123 Main Street, San Francisco, CA 94102
Billing Period: December 15, 2023 - January 15, 2024
Due Date: February 5, 2024

USAGE SUMMARY:
Previous Reading: 12,450 kWh
Current Reading: 13,280 kWh
Total Usage: 830 kWh

RATE BREAKDOWN:
Base Charge: $12.50
Energy Charge (830 kWh @ $0.28/kWh): $232.40
Delivery Charge: $45.20
State Tax (8.5%): $24.66
Total Amount Due: $314.76

PAYMENT OPTIONS:
- Online: www.utilitycompany.com/pay
- Phone: 1-800-555-0123
- Mail: P.O. Box 12345, San Francisco, CA 94101

ENERGY SAVING TIPS:
- Replace incandescent bulbs with LEDs
- Use programmable thermostats
- Unplug devices when not in use

Questions? Contact us at support@utilitycompany.com`
    },
    {
      title: 'Project Status Report - Mobile App Development',
      date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      type: 'report',
      content: `PROJECT STATUS REPORT
Project: Mobile App Development
Report Date: January 15, 2024
Project Manager: David Kim
Status: ON TRACK

EXECUTIVE SUMMARY:
The mobile app development project is progressing well with 65% completion. 
All major milestones have been met on schedule. The team is currently 
working on the authentication module and preparing for beta testing.

KEY ACHIEVEMENTS:
- Completed UI/UX design phase
- Implemented core navigation structure
- Integrated payment processing API
- Completed 80% of backend services

CURRENT SPRINT (Sprint 8):
- Authentication module development (In Progress)
- Push notification setup (In Progress)
- Performance optimization (Planned)
- Beta testing preparation (Planned)

METRICS:
- Code Coverage: 78%
- Bugs Fixed: 45/52 (87%)
- Test Cases Passed: 312/320 (97.5%)
- Team Velocity: 42 story points

RISKS & ISSUES:
1. API rate limiting from third-party service (Medium)
   - Mitigation: Implementing caching layer
2. iOS App Store review timeline (Low)
   - Mitigation: Early submission for review

UPCOMING MILESTONES:
- Beta Release: February 1, 2024
- Production Release: March 15, 2024

BUDGET STATUS:
- Allocated: $150,000
- Spent: $97,500 (65%)
- Remaining: $52,500
- Projected Completion Cost: $148,000

NEXT STEPS:
1. Complete authentication module by January 25
2. Begin beta testing recruitment
3. Schedule App Store submission review`
    },
    {
      title: 'Quarterly Budget Proposal - Q2 2024',
      date: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      type: 'proposal',
      content: `QUARTERLY BUDGET PROPOSAL
Quarter: Q2 2024 (April - June)
Department: Engineering
Prepared By: Sarah Chen
Date: January 17, 2024

BUDGET OVERVIEW:
Total Requested: $250,000
Previous Quarter: $200,000
Increase: $50,000 (25%)

ALLOCATION BREAKDOWN:

1. Personnel Costs: $180,000 (72%)
   - Senior Engineers (2): $120,000
   - Mid-level Engineers (3): $45,000
   - Interns (2): $15,000

2. Infrastructure & Tools: $40,000 (16%)
   - Cloud hosting (AWS): $25,000
   - Development tools/licenses: $10,000
   - CI/CD services: $5,000

3. Training & Development: $15,000 (6%)
   - Conference attendance: $8,000
   - Online courses: $4,000
   - Certifications: $3,000

4. Equipment: $10,000 (4%)
   - Development machines: $6,000
   - Testing devices: $4,000

5. Miscellaneous: $5,000 (2%)
   - Team events: $2,000
   - Office supplies: $1,500
   - Contingency: $1,500

JUSTIFICATION:
- Increased headcount for new product initiatives
- Scaling infrastructure for user growth
- Enhanced security measures requiring additional tools
- Team skill development for emerging technologies

EXPECTED OUTCOMES:
- 40% increase in development velocity
- Improved system reliability (99.9% uptime)
- Enhanced security posture
- Team skill advancement

APPROVAL REQUIRED BY: January 31, 2024`
    },
    {
      title: 'Internal Memo - Policy Update',
      date: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      type: 'memo',
      content: `INTERNAL MEMO
To: All Employees
From: HR Department
Date: January 20, 2024
Subject: Updated Remote Work Policy

Dear Team,

We are pleased to announce updates to our remote work policy, 
effective February 1, 2024. These changes reflect our commitment 
to flexibility and work-life balance.

KEY CHANGES:

1. Remote Work Options:
   - Full-time remote: Available for all eligible positions
   - Hybrid: 3 days remote, 2 days in-office (flexible)
   - Office-first: Available upon request

2. Core Hours:
   - All employees must be available 10:00 AM - 3:00 PM (local time)
   - Outside core hours, flexible scheduling is permitted

3. Equipment & Setup:
   - Company will provide necessary equipment
   - $500 annual stipend for home office setup
   - IT support available for remote setup

4. Communication Expectations:
   - Daily standups remain mandatory
   - Response time: Within 4 hours during business days
   - Video-on for team meetings

5. Performance Review:
   - Quarterly check-ins (instead of annual)
   - Focus on outcomes, not hours worked

QUESTIONS?
Contact HR at hr@company.com or schedule a meeting with your manager.

Thank you for your continued dedication.

Best regards,
HR Team`
    },
    {
      title: 'Healthcare Insurance Statement',
      date: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000),
      type: 'bill',
      content: `HEALTHCARE INSURANCE STATEMENT
Member ID: MEM-2024-12345
Member Name: John Doe
Statement Date: January 22, 2024
Coverage Period: January 1 - January 31, 2024

CLAIMS SUMMARY:
Total Claims: 3
Total Billed: $1,250.00
Insurance Paid: $1,000.00
Your Responsibility: $250.00

CLAIM DETAILS:

1. Annual Physical Exam
   Date: January 5, 2024
   Provider: Dr. Smith, Family Medicine
   Billed: $350.00
   Covered: $350.00
   Your Cost: $0.00 (Preventive care)

2. Prescription Medication
   Date: January 10, 2024
   Pharmacy: CVS Pharmacy #1234
   Medication: Generic Antibiotic
   Billed: $45.00
   Covered: $30.00
   Your Cost: $15.00

3. Specialist Consultation
   Date: January 18, 2024
   Provider: Dr. Johnson, Cardiology
   Billed: $855.00
   Covered: $620.00
   Your Cost: $235.00

PAYMENT INFORMATION:
- Amount Due: $250.00
- Due Date: February 15, 2024
- Payment Methods: Online, Phone, Mail

COVERAGE SUMMARY:
- Deductible: $500.00 (Remaining: $250.00)
- Out-of-Pocket Maximum: $3,000.00
- Year-to-Date: $250.00

QUESTIONS?
Call: 1-800-555-HEALTH
Online: www.healthinsurance.com/member`
    },
    {
      title: 'Product Launch Agenda - February 2024',
      date: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000),
      type: 'agenda',
      content: `PRODUCT LAUNCH AGENDA
Product: Mobile App v2.0
Date: February 5, 2024
Time: 2:00 PM - 4:00 PM
Location: Main Conference Room

AGENDA:

1. Pre-Launch Checklist Review (15 min)
   - App Store submissions (iOS & Android)
   - Marketing materials finalization
   - Support team briefing
   - Monitoring setup

2. Launch Timeline (20 min)
   - T-0: Soft launch to beta users
   - T+1: Public announcement
   - T+3: Press release
   - T+7: User acquisition campaign

3. Marketing Strategy (25 min)
   - Social media campaign
   - Email marketing sequence
   - Influencer partnerships
   - PR outreach

4. Support Readiness (15 min)
   - FAQ documentation
   - Support ticket system
   - Escalation procedures
   - Known issues list

5. Monitoring & Metrics (20 min)
   - Key metrics to track
   - Alert thresholds
   - Dashboard setup
   - Daily review schedule

6. Risk Mitigation (15 min)
   - Rollback procedures
   - Communication plan for issues
   - Emergency contacts

7. Post-Launch Activities (10 min)
   - User feedback collection
   - Performance review meeting
   - Iteration planning

ATTENDEES:
- Product Manager: Emma Watson
- Engineering Lead: James Taylor
- Marketing Director: Rachel Green
- Support Manager: Chris Brown

ACTION ITEMS:
- [ ] Finalize app store listings
- [ ] Prepare press release
- [ ] Set up monitoring dashboards
- [ ] Brief support team`
    },
    {
      title: 'Quarterly Financial Report - Q4 2023',
      date: new Date(baseDate.getTime() + 18 * 24 * 60 * 60 * 1000),
      type: 'report',
      content: `QUARTERLY FINANCIAL REPORT
Quarter: Q4 2023 (October - December)
Company: Tech Innovations Inc.
Prepared: January 25, 2024

EXECUTIVE SUMMARY:
Q4 2023 showed strong growth with revenue increasing 35% year-over-year.
The company achieved profitability for the first time, with a net margin of 8%.

REVENUE:
Total Revenue: $2,450,000
- Product Sales: $1,800,000 (73%)
- Subscription Revenue: $520,000 (21%)
- Services: $130,000 (6%)

EXPENSES:
Total Expenses: $2,254,000
- Cost of Goods Sold: $980,000 (43%)
- Operating Expenses: $1,274,000 (57%)
  - Salaries & Benefits: $850,000
  - Marketing: $250,000
  - R&D: $120,000
  - General & Admin: $54,000

PROFITABILITY:
Gross Profit: $1,470,000 (60% margin)
Operating Profit: $196,000 (8% margin)
Net Profit: $196,000

KEY METRICS:
- Customer Acquisition Cost: $45
- Lifetime Value: $320
- Monthly Recurring Revenue: $173,333
- Churn Rate: 2.5%

OUTLOOK:
Q1 2024 projected revenue: $2,800,000
Focus areas: International expansion, product diversification

APPROVED BY:
CFO: Michael Johnson
Date: January 25, 2024`
    },
    {
      title: 'Team Building Event Proposal',
      date: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000),
      type: 'proposal',
      content: `TEAM BUILDING EVENT PROPOSAL
Event: Annual Team Retreat
Date: March 15-17, 2024
Location: Lake Tahoe Resort
Proposed By: HR Team
Budget Request: $15,000

EVENT OVERVIEW:
A 3-day team building retreat to strengthen collaboration, celebrate 
achievements, and plan for the upcoming year. The event will include 
workshops, outdoor activities, and team bonding exercises.

SCHEDULE:

Day 1 (March 15):
- 2:00 PM: Check-in and welcome reception
- 4:00 PM: Team building workshop
- 6:00 PM: Dinner and networking
- 8:00 PM: Team trivia night

Day 2 (March 16):
- 9:00 AM: Breakfast and morning session
- 11:00 AM: Outdoor activities (hiking, kayaking)
- 2:00 PM: Lunch
- 3:00 PM: Strategy planning session
- 6:00 PM: Awards ceremony and dinner
- 8:00 PM: Bonfire and s'mores

Day 3 (March 17):
- 9:00 AM: Breakfast
- 10:00 AM: Reflection and goal setting
- 12:00 PM: Check-out and departure

BUDGET BREAKDOWN:
- Accommodation (25 rooms): $7,500
- Meals: $4,500
- Activities: $2,000
- Transportation: $800
- Miscellaneous: $200

EXPECTED OUTCOMES:
- Improved team cohesion
- Enhanced communication
- Renewed motivation
- Clear Q2 objectives

APPROVAL REQUESTED BY: February 15, 2024`
    },
    {
      title: 'Security Audit Report',
      date: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000),
      type: 'report',
      content: `SECURITY AUDIT REPORT
Audit Date: January 30, 2024
Conducted By: Security Team
Scope: Infrastructure, Applications, Policies

EXECUTIVE SUMMARY:
Overall security posture: GOOD
Risk Level: LOW-MEDIUM
Compliance Status: COMPLIANT

FINDINGS:

1. INFRASTRUCTURE SECURITY: PASS
   - Firewall rules properly configured
   - Network segmentation in place
   - DDoS protection active
   - SSL/TLS certificates valid

2. APPLICATION SECURITY: PASS (with recommendations)
   - Authentication: Strong (MFA enabled)
   - Authorization: Proper role-based access
   - Input validation: Good
   - Recommendation: Implement rate limiting on API endpoints

3. DATA PROTECTION: PASS
   - Encryption at rest: Enabled
   - Encryption in transit: Enabled
   - Backup encryption: Enabled
   - Data retention policies: Compliant

4. ACCESS MANAGEMENT: PASS
   - SSO implemented
   - Regular access reviews conducted
   - Principle of least privilege followed
   - Recommendation: Quarterly access audits

5. INCIDENT RESPONSE: PASS
   - Response plan documented
   - Team trained on procedures
   - Monitoring and alerting active
   - Recommendation: Conduct quarterly drills

VULNERABILITIES FOUND:
- 2 Low severity issues (patched)
- 1 Medium severity issue (patch in progress)
- 0 High/Critical issues

RECOMMENDATIONS:
1. Implement API rate limiting (Priority: Medium)
2. Conduct quarterly access audits (Priority: Low)
3. Schedule incident response drills (Priority: Medium)
4. Update security training materials (Priority: Low)

NEXT AUDIT: April 30, 2024

APPROVED BY:
CISO: Sarah Martinez
Date: January 30, 2024`
    },
  ];
}

async function createPDF(content: string, title: string, outputPath: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([612, 792]); // US Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const lines = content.split('\n');
  let y = 750;
  const fontSize = 11;
  const lineHeight = 14;
  const margin = 50;
  
  // Add title first
  currentPage.drawText(title, {
    x: margin,
    y: y,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  y -= lineHeight * 2; // Space after title
  
  for (const line of lines) {
    if (y < 50) {
      currentPage = pdfDoc.addPage([612, 792]);
      y = 750;
    }
    
    if (line.trim().length === 0) {
      y -= lineHeight / 2;
      continue;
    }
    
    // Check if line is a heading (all caps or starts with number)
    const isHeading = /^[A-Z\s]+$/.test(line.trim()) && line.length < 50;
    const currentFont = isHeading ? boldFont : font;
    const currentSize = isHeading ? fontSize + 2 : fontSize;
    
    currentPage.drawText(line, {
      x: margin,
      y: y,
      size: currentSize,
      font: currentFont,
      color: rgb(0, 0, 0),
    });
    
    y -= lineHeight;
  }
  
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}

export async function generateDocuments(): Promise<void> {
  console.log('\n📄 Generating Documents...\n');
  
  await fs.ensureDir(DOCUMENTS_DIR);
  
  const documents = getDocumentData();
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const filename = `document-${i + 1}-${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    const outputPath = path.join(DOCUMENTS_DIR, filename);
    
    console.log(`📝 Document ${i + 1}: ${doc.title}`);
    console.log(`   Date: ${doc.date.toISOString().split('T')[0]}`);
    console.log(`   Type: ${doc.type}`);
    
    await createPDF(doc.content, doc.title, outputPath);
    console.log(`   ✅ Saved: ${filename}`);
    
    // Also save as text file for reference
    const textPath = path.join(DOCUMENTS_DIR, filename.replace('.pdf', '.txt'));
    await fs.writeFile(textPath, doc.content);
  }
  
  console.log(`\n✅ Document generation complete! Files saved to: ${DOCUMENTS_DIR}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateDocuments().catch(console.error);
}

