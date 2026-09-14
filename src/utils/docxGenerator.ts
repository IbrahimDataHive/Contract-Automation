import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import JSZip from 'jszip';
import { VendorRow, GeneratedContract, GenerationProgress } from '../types';

/**
 * Sanitizes a single cell value:
 * Replaces NaN, null, undefined, and 'NaN'/'nan' strings with empty string.
 */
export function sanitizeCellValue(value: any): string | number {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    if (isNaN(value)) return '';
    return value;
  }
  const str = String(value).trim();
  if (str.toLowerCase() === 'nan' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return '';
  }
  return str;
}

/**
 * Converts a vendor row object into a multi-format context dictionary
 * with sanitized values, slugified keys, and normalized casing.
 */
export function buildRowContext(row: VendorRow): Record<string, any> {
  const context: Record<string, any> = {};

  for (const [key, rawVal] of Object.entries(row)) {
    const cleanVal = sanitizeCellValue(rawVal);
    // Keep exact column name
    context[key] = cleanVal;

    // Add slugified version (e.g., 'Vendor Name' -> 'vendor_name')
    const slug = key
      .trim()
      .toLowerCase()
      .replace(/[^\w]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (slug && !(slug in context)) {
      context[slug] = cleanVal;
    }

    // Add no-space lowercase (e.g. 'vendorname')
    const condensed = key.trim().toLowerCase().replace(/\s+/g, '');
    if (condensed && !(condensed in context)) {
      context[condensed] = cleanVal;
    }
  }

  return context;
}

/**
 * Detects whether the Word template uses {{ tag }} (Jinja2/docxtpl style) or { tag }
 */
function detectDelimiters(templateBuffer: ArrayBuffer): { start: string; end: string } {
  try {
    const zip = new PizZip(templateBuffer);
    const documentXml = zip.file('word/document.xml')?.asText() || '';
    if (documentXml.includes('{{') && documentXml.includes('}}')) {
      return { start: '{{', end: '}}' };
    }
  } catch (e) {
    console.warn('Could not inspect document.xml for delimiters, using {{ and }} by default', e);
  }
  return { start: '{', end: '}' };
}

/**
 * Renders a single Word document in-memory using docxtemplater and pizzip
 */
export function renderSingleDocument(
  templateBuffer: ArrayBuffer,
  context: Record<string, any>
): Blob {
  const zip = new PizZip(templateBuffer);
  const delimiters = detectDelimiters(templateBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters,
    nullGetter: () => '',
  });

  doc.render(context);

  const out = doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  });

  return out;
}

/**
 * Batch renders contracts for all selected vendors, updating progress.
 */
export async function batchRenderContracts(
  templateBuffer: ArrayBuffer,
  selectedRows: { row: VendorRow; vendorId: string; vendorName: string }[],
  onProgress?: (progress: GenerationProgress) => void
): Promise<{ contracts: GeneratedContract[]; errors: string[] }> {
  const contracts: GeneratedContract[] = [];
  const errors: string[] = [];
  const total = selectedRows.length;

  for (let i = 0; i < total; i++) {
    const { row, vendorId, vendorName } = selectedRows[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        status: `Rendering contract for ${vendorName} (${vendorId})...`,
        isGenerating: true,
      });
    }

    // Small yield to let UI re-render smoothly
    await new Promise((resolve) => setTimeout(resolve, 30));

    try {
      const context = buildRowContext(row);
      const blob = renderSingleDocument(templateBuffer, context);

      const safeId = String(vendorId).replace(/[^\w\-]/g, '_');
      const safeName = String(vendorName).replace(/[^\w\-]/g, '_').substring(0, 30);
      const filename = `Contract_${safeId}_${safeName}.docx`;

      contracts.push({
        filename,
        blob,
        sizeKb: Math.round((blob.size / 1024) * 10) / 10,
        vendorId,
        vendorName,
      });
    } catch (err: any) {
      console.error(`Error rendering for ${vendorName}:`, err);
      errors.push(`Failed to render contract for "${vendorName}" (${vendorId}): ${err.message || String(err)}`);
    }
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      status: `Completed ${contracts.length} contracts.`,
      isGenerating: false,
    });
  }

  return { contracts, errors };
}

/**
 * Bundles multiple generated docx Blobs into a single ZIP archive in-memory.
 */
export async function createZipBundle(contracts: GeneratedContract[]): Promise<Blob> {
  const zip = new JSZip();

  for (const contract of contracts) {
    zip.file(contract.filename, contract.blob);
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return zipBlob;
}
