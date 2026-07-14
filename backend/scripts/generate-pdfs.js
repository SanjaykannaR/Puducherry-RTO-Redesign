// ── generate-pdfs.js ──
// Generates 12 realistic RTO form PDFs using pdfkit.
// Output: ../frontend/public/downloads/

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../../frontend/public/downloads');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BLUE = '#1a3a6e';
const LIGHT_BLUE = '#e8eef6';
const GRAY = '#666666';

const forms = [
  {
    file: 'form-20.pdf',
    num: 'FORM 20',
    title: 'Application for Registration of Motor Vehicle',
    fields: [
      'Owner Full Name', 'Father / Husband Name', 'Address (House No, Street, City)',
      'State', 'District', 'Pincode', 'Vehicle Make', 'Vehicle Model',
      'Year of Manufacture', 'Engine Number', 'Chassis Number',
      'Fuel Type', 'Seating Capacity (incl. driver)', 'Unladen Weight (kg)',
      'Type of Body', 'Colour of Vehicle', 'HP / Leased (Yes / No)',
    ],
  },
  {
    file: 'form-21.pdf',
    num: 'FORM 21',
    title: 'Sale Certificate from Dealer',
    fields: [
      'Seller Name & Address', 'Buyer Name & Address',
      'Vehicle Registration Number', 'Date of Sale', 'Sale Consideration (Rs.)',
      'Engine Number', 'Chassis Number', 'Odometer Reading (km)',
      'Vehicle Make & Model', 'Year of Manufacture', 'Trade Certificate No.',
    ],
  },
  {
    file: 'form-22.pdf',
    num: 'FORM 22',
    title: 'Road Worthiness Certificate',
    fields: [
      'Vehicle Registration Number', 'Make & Model', 'Date of Inspection',
      'Brake Test (Pass / Fail)', 'Headlight Test (Pass / Fail)',
      'Horn Test (Pass / Fail)', 'Speedometer Test (Pass / Fail)',
      'Steering Test (Pass / Fail)', 'Overall Result',
      "Inspector's Name & Signature", 'Testing Centre',
    ],
  },
  {
    file: 'form-29.pdf',
    num: 'FORM 29',
    title: 'Notice of Transfer of Ownership of Motor Vehicle',
    fields: [
      'Transferor Name', 'Transferor Address', 'Transferee Name',
      'Transferee Address', 'Vehicle Registration Number',
      'Date of Transfer', 'Reason for Transfer',
      'Engine Number', 'Chassis Number',
    ],
  },
  {
    file: 'form-30.pdf',
    num: 'FORM 30',
    title: 'Report of Transfer of Ownership of Motor Vehicle',
    fields: [
      'Transferor Name & Address', 'Transferee Name & Address',
      'Vehicle Registration Number', 'Date of Transfer',
      'Insurance Company', 'Policy Number', 'Policy Expiry Date',
      'Fee Paid (Rs.)', 'Receipt Number',
      "Owner's Signature", 'RTO Endorsement',
    ],
  },
  {
    file: 'form-1.pdf',
    num: 'FORM 1',
    title: "Application for Learner's License",
    fields: [
      'Applicant Full Name', 'Date of Birth', 'Place of Birth',
      'Address (House No, Street, City)', 'State', 'District',
      'Blood Group', 'Vehicle Class Applied For', 'Qualification',
      'Medical Certificate Attached (Yes / No)', "Father's / Guardian's Name",
      'Photo Attached (Yes / No)',
    ],
  },
  {
    file: 'form-2.pdf',
    num: 'FORM 2',
    title: 'Application for Driving License',
    fields: [
      "Learner's License Number", 'Applicant Full Name', 'Date of Birth',
      'Address', 'Vehicle Class', 'Date LL Issued',
      'Training Period (From — To)', 'Training Institute Name',
      'Date of Driving Test', 'RTO Code',
    ],
  },
  {
    file: 'form-3.pdf',
    num: 'FORM 3',
    title: 'Application for International Driving Permit',
    fields: [
      'Applicant Full Name', 'Driving License Number',
      'Address', 'Passport Number', 'Passport Expiry Date',
      'Countries to Visit', 'Validity Period (From — To)',
      'Purpose of Travel', 'Fee Paid (Rs.)',
    ],
  },
  {
    file: 'form-4.pdf',
    num: 'FORM 4',
    title: 'Application for Renewal of Driving License',
    fields: [
      'License Number', 'Holder Full Name', 'Date of Expiry',
      'Address', 'Vehicle Class', 'Medical Certificate Attached (Yes / No)',
      'Date of Medical Exam', 'Fee Paid (Rs.)',
    ],
  },
  {
    file: 'form-35.pdf',
    num: 'FORM 35',
    title: 'Application for Duplicate Registration Certificate',
    fields: [
      'Vehicle Registration Number', 'Owner Full Name',
      'RC Number (Lost / Damaged)', 'Date of Issue of Original RC',
      'Reason for Duplicate', 'Police Report Attached (Yes / No)',
      'FIR Number', 'Fee Paid (Rs.)',
    ],
  },
  {
    file: 'form-7.pdf',
    num: 'FORM 7',
    title: 'Application for Duplicate Driving License',
    fields: [
      'License Number', 'Holder Full Name', 'Date of Issue',
      'Address', 'Vehicle Class', 'Reason for Duplicate',
      'Police Report Attached (Yes / No)', 'FIR Number',
      'Fee Paid (Rs.)',
    ],
  },
  {
    file: 'form-14.pdf',
    num: 'FORM 14',
    title: 'Application for Registration of Trailer',
    fields: [
      'Owner Full Name', 'Vehicle Registration Number (Towing Vehicle)',
      'Trailer Make', 'Trailer Model', 'Year of Manufacture',
      'Gross Vehicle Weight (kg)', 'Unladen Weight (kg)',
      'Axle Configuration', 'Chassis Number', 'Engine Number',
    ],
  },
];

function drawForm(form) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(path.join(OUT_DIR, form.file));
  doc.pipe(stream);

  // ── Header bar ──
  doc.rect(0, 0, doc.page.width, 90).fill(BLUE);
  doc.fontSize(11).fill('#ffffff').font('Helvetica-Bold')
    .text('GOVERNMENT OF PUDUCHERRY', 50, 18, { align: 'center' })
    .text('REGIONAL TRANSPORT AUTHORITY', { align: 'center' })
    .fontSize(9).font('Helvetica')
    .text('Puducherry, India — 605001', { align: 'center' });

  // ── Form number + title ──
  doc.fill('#000000').fontSize(16).font('Helvetica-Bold')
    .text(form.num, 50, 110, { align: 'center' })
    .fontSize(12).font('Helvetica')
    .text(form.title, { align: 'center' });

  // ── Horizontal rule ──
  doc.moveTo(50, 155).lineTo(545, 155).lineWidth(1).stroke(BLUE);

  // ── Instruction ──
  doc.fontSize(8).fill(GRAY).font('Helvetica-Oblique')
    .text('Fill all fields in BLOCK LETTERS using black or blue ink. Attach supporting documents where indicated.', 50, 165, { width: 495 });

  // ── Fields ──
  let y = 195;
  const left = 55;
  const lineLen = 330;
  const labelW = 200;

  form.fields.forEach((field, i) => {
    if (y > 750) {
      // New page
      doc.addPage();
      y = 60;
      doc.fontSize(8).fill(GRAY).font('Helvetica-Oblique')
        .text(`${form.num} — ${form.title} (continued)`, 50, 45, { align: 'center' });
      doc.moveTo(50, 55).lineTo(545, 55).lineWidth(0.5).stroke(BLUE);
      y = 75;
    }

    // Field number
    doc.fontSize(9).fill(BLUE).font('Helvetica-Bold')
      .text(`${i + 1}.`, left - 18, y + 4);

    // Field label
    doc.fontSize(9).fill('#000000').font('Helvetica-Bold')
      .text(field, left, y, { width: labelW });

    // Underline for writing
    const lineY = y + 16;
    doc.moveTo(left + labelW, lineY)
      .lineTo(left + labelW + lineLen, lineY)
      .lineWidth(0.5)
      .stroke(GRAY);

    y += 34;
  });

  // ── Signature area ──
  y += 20;
  if (y > 700) {
    doc.addPage();
    y = 80;
  }
  doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).stroke(GRAY);
  y += 20;

  doc.fontSize(10).fill('#000000').font('Helvetica')
    .text("Applicant's Signature / Thumb Impression:", left, y, { continued: true });
  doc.text('  ______________________________', { continued: true });
  doc.text('          Date: ____/____/________');

  y += 40;
  doc.text("RTO Officer's Endorsement:", left, y, { continued: true });
  doc.text('  ______________________________');

  // ── Footer ──
  const footerY = doc.page.height - 40;
  doc.fontSize(7).fill(GRAY).font('Helvetica-Oblique')
    .text('This is a computer-generated form. No signature required for online submission.', 50, footerY, { align: 'center', width: 495 })
    .text(`Page 1`, 50, footerY + 12, { align: 'center', width: 495 });

  doc.end();
  return new Promise((resolve) => stream.on('finish', resolve));
}

async function main() {
  console.log(`Generating ${forms.length} PDFs to ${OUT_DIR}...`);
  for (const form of forms) {
    await drawForm(form);
    console.log(`  ✓ ${form.file}`);
  }
  console.log('Done!');
}

main().catch(console.error);
