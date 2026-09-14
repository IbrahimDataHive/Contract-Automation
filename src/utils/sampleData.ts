import * as XLSX from 'xlsx';
import PizZip from 'pizzip';

export const SAMPLE_VENDOR_DATA = [
  {
    vendor_id: 'VEND-101',
    vendor_name: 'Apex Logistics Solutions LLC',
    contact_person: 'Sarah Jenkins',
    email: 'sarah.j@apexlogistics.com',
    phone: '(555) 234-8901',
    effective_date: '2026-10-01',
    contract_term: '12 Months',
    contract_value: 45000,
    currency: 'USD',
    payment_terms: 'Net 30',
    state_of_incorporation: 'Delaware',
    notes: 'Includes priority 24/7 SLA dispatch.',
  },
  {
    vendor_id: 'VEND-102',
    vendor_name: 'BluePeak Cloud Technologies Inc.',
    contact_person: 'Michael Chang',
    email: 'mchang@bluepeakcloud.io',
    phone: '(555) 876-5432',
    effective_date: '2026-10-15',
    contract_term: '24 Months',
    contract_value: 120000,
    currency: 'USD',
    payment_terms: 'Net 15',
    state_of_incorporation: 'California',
    notes: 'Cloud infrastructure SLA 99.95% tier.',
  },
  {
    vendor_id: 'VEND-103',
    vendor_name: 'Cascade Industrial Supplies',
    contact_person: 'Elena Rostova',
    email: 'e.rostova@cascade-ind.com',
    phone: '(555) 345-6789',
    effective_date: '2026-11-01',
    contract_term: '36 Months',
    contract_value: 32500,
    currency: 'USD',
    payment_terms: 'Net 45',
    state_of_incorporation: 'Washington',
    notes: '', // Empty cell / NaN test
  },
  {
    vendor_id: 'VEND-104',
    vendor_name: 'Delta Precision Engineering',
    contact_person: 'David Miller',
    email: 'dmiller@deltaprecision.com',
    phone: '(555) 901-2345',
    effective_date: '2026-11-15',
    contract_term: '12 Months',
    contract_value: 88000,
    currency: 'USD',
    payment_terms: 'Net 30',
    state_of_incorporation: 'Texas',
    notes: 'Certified ISO-9001 precision supplier.',
  },
  {
    vendor_id: 'VEND-105',
    vendor_name: 'Evergreen Facility Services',
    contact_person: 'Amina Patel',
    email: 'apatel@evergreenfs.com',
    phone: '(555) 678-1234',
    effective_date: '2026-12-01',
    contract_term: '24 Months',
    contract_value: 19500,
    currency: 'USD',
    payment_terms: 'Net 30',
    state_of_incorporation: 'Illinois',
    notes: '', // Empty cell / NaN test
  },
];

export function createSampleExcelBlob(): Blob {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_VENDOR_DATA);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendors');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function createSampleDocxTemplateBlob(): Blob {
  const zip = new PizZip();

  // [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
  );

  // _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // word/_rels/document.xml.rels
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  // word/styles.xml
  zip.file(
    'word/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:sz w:val="22"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`
  );

  // word/document.xml with template placeholders
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <!-- Title -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
        <w:t>MASTER VENDOR SERVICES AGREEMENT</w:t>
      </w:r>
    </w:p>

    <!-- Subtitle -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="280"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:i/>
          <w:sz w:val="22"/>
          <w:color w:val="64748B"/>
        </w:rPr>
        <w:t>Agreement Reference: {vendor_id}</w:t>
      </w:r>
    </w:p>

    <!-- Preamble -->
    <w:p>
      <w:pPr>
        <w:spacing w:line="300" w:lineRule="auto" w:after="200"/>
      </w:pPr>
      <w:r><w:t>This Master Vendor Agreement ("Agreement") is made and entered into as of </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{effective_date}</w:t></w:r>
      <w:r><w:t>, by and between Enterprise Global Corporation ("Client"), and </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{vendor_name}</w:t></w:r>
      <w:r><w:t>, a corporation duly organized under the laws of </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>{state_of_incorporation}</w:t></w:r>
      <w:r><w:t> ("Vendor").</w:t></w:r>
    </w:p>

    <!-- Section 1 Heading -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="26"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
        <w:t>1. Vendor Information &amp; Commercial Terms</w:t>
      </w:r>
    </w:p>

    <!-- Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="3200"/>
        <w:gridCol w:w="5800"/>
      </w:tblGrid>

      <!-- Row 1 -->
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Vendor ID</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{vendor_id}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <!-- Row 2 -->
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Primary Contact</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{contact_person}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <!-- Row 3 -->
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Email / Phone</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{email} / {phone}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <!-- Row 4 -->
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Engagement Term</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{contract_term}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <!-- Row 5 -->
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Contract Value</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{contract_value} {currency}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <!-- Row 6 -->
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Payment Terms</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>{payment_terms}</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>

    <!-- Section 2: Special Notes -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="280" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="26"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
        <w:t>2. Scope Notes &amp; Special Conditions</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:line="300" w:lineRule="auto" w:after="240"/>
      </w:pPr>
      <w:r><w:t>{notes}</w:t></w:r>
    </w:p>

    <!-- Section 3: Signatures -->
    <w:p>
      <w:pPr>
        <w:spacing w:before="240" w:after="160"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="26"/>
          <w:color w:val="0F172A"/>
        </w:rPr>
        <w:t>3. Execution &amp; Authorized Signatures</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>IN WITNESS WHEREOF</w:t></w:r>
      <w:r><w:t>, the parties hereto have caused this Agreement to be executed by their duly authorized representatives.</w:t></w:r>
    </w:p>

    <w:tbl>
      <w:tblPr>
        <w:tblBorders>
          <w:top w:val="none"/>
          <w:left w:val="none"/>
          <w:bottom w:val="none"/>
          <w:right w:val="none"/>
          <w:insideH w:val="none"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4500"/>
        <w:gridCol w:w="4500"/>
      </w:tblGrid>
      <w:tr>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>FOR CLIENT: Enterprise Corporation</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>FOR VENDOR: {vendor_name}</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Signature: ______________________</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Signature: ______________________</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Date: {effective_date}</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Contact: {contact_person}</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:sectPr/>
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);
  const out = zip.generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  return out;
}
