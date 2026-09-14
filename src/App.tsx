import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { DataPreviewSection } from './components/DataPreviewSection';
import { VendorSelectionSection } from './components/VendorSelectionSection';
import { GenerationSection } from './components/GenerationSection';
import { TemplateGuideModal } from './components/TemplateGuideModal';
import { PythonSourceView } from './components/PythonSourceView';
import {
  VendorRow,
  ColumnMapping,
  GeneratedContract,
  GenerationProgress,
} from './types';
import {
  SAMPLE_VENDOR_DATA,
  createSampleExcelBlob,
  createSampleDocxTemplateBlob,
} from './utils/sampleData';
import {
  batchRenderContracts,
  createZipBundle,
} from './utils/docxGenerator';
import {
  FileText,
  AlertCircle,
  HelpCircle,
  Code2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'python'>('studio');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Source files state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [templateFileName, setTemplateFileName] = useState<string>('');
  const [templateBuffer, setTemplateBuffer] = useState<ArrayBuffer | null>(null);

  // Parsed data & mapping
  const [vendorData, setVendorData] = useState<VendorRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    idColumn: '',
    nameColumn: '',
  });

  // Selection
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    status: '',
    isGenerating: false,
  });
  const [generatedContracts, setGeneratedContracts] = useState<GeneratedContract[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Heuristic column auto-detection
  const autoDetectColumns = (cols: string[]): ColumnMapping => {
    const idCandidates = ['vendor_id', 'vendor id', 'id', 'supplier_id', 'vendor_code', 'code'];
    const nameCandidates = ['vendor_name', 'vendor name', 'company_name', 'company', 'name', 'supplier_name', 'vendor'];

    let detectedId = cols.find((c) => idCandidates.includes(c.trim().toLowerCase()));
    if (!detectedId) {
      detectedId = cols.find((c) => c.toLowerCase().includes('id') || c.toLowerCase().includes('code'));
    }

    let detectedName = cols.find((c) => nameCandidates.includes(c.trim().toLowerCase()));
    if (!detectedName) {
      detectedName = cols.find((c) => c.toLowerCase().includes('name') && c !== detectedId);
    }

    return {
      idColumn: detectedId || cols[0] || '',
      nameColumn: detectedName || (cols[1] ? cols[1] : cols[0] || ''),
    };
  };

  // Load realistic sample files on initial load for instant zero-config testing
  useEffect(() => {
    handleLoadSamples();
  }, []);

  const handleLoadSamples = async () => {
    const sampleExcelBlob = createSampleExcelBlob();
    const sampleTemplateBlob = createSampleDocxTemplateBlob();

    const sampleExcelFile = new File([sampleExcelBlob], 'sample_vendor_data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const sampleTemplateFile = new File([sampleTemplateBlob], 'sample_contract_template.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    setExcelFile(sampleExcelFile);
    setExcelFileName('sample_vendor_data.xlsx');
    setTemplateFile(sampleTemplateFile);
    setTemplateFileName('sample_contract_template.docx');

    const buffer = await sampleTemplateBlob.arrayBuffer();
    setTemplateBuffer(buffer);

    const cols = Object.keys(SAMPLE_VENDOR_DATA[0]);
    setColumns(cols);
    setVendorData(SAMPLE_VENDOR_DATA);

    const detected = autoDetectColumns(cols);
    setMapping(detected);
    setSelectedIndices([0, 1, 2, 3, 4]); // Pre-select all samples

    // Reset previous generation results
    setGeneratedContracts([]);
    setZipBlob(null);
    setErrors([]);
  };

  const handleResetFiles = () => {
    setExcelFile(null);
    setTemplateFile(null);
    setExcelFileName('');
    setTemplateFileName('');
    setTemplateBuffer(null);
    setVendorData([]);
    setColumns([]);
    setMapping({ idColumn: '', nameColumn: '' });
    setSelectedIndices([]);
    setGeneratedContracts([]);
    setZipBlob(null);
    setErrors([]);
  };

  // Handle user uploaded Excel file
  const handleExcelUpload = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        alert('The uploaded Excel file does not contain any sheets.');
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const parsedJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (parsedJson.length === 0) {
        alert('No data rows found in the uploaded spreadsheet.');
        return;
      }

      const cols = Object.keys(parsedJson[0]);
      setExcelFile(file);
      setExcelFileName(file.name);
      setVendorData(parsedJson);
      setColumns(cols);

      const detected = autoDetectColumns(cols);
      setMapping(detected);
      setSelectedIndices(parsedJson.map((_, i) => i)); // Select all by default

      // Reset generated results
      setGeneratedContracts([]);
      setZipBlob(null);
      setErrors([]);
    } catch (err: any) {
      alert(`Failed to read Excel spreadsheet: ${err.message}`);
    }
  };

  // Handle user uploaded Word template
  const handleTemplateUpload = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      setTemplateFile(file);
      setTemplateFileName(file.name);
      setTemplateBuffer(buffer);

      // Reset generated results
      setGeneratedContracts([]);
      setZipBlob(null);
      setErrors([]);
    } catch (err: any) {
      alert(`Failed to read Word document: ${err.message}`);
    }
  };

  // Execute Document Generation
  const handleGenerate = async () => {
    if (!templateBuffer || selectedIndices.length === 0) return;

    setIsGenerating(true);
    setErrors([]);
    setGeneratedContracts([]);
    setZipBlob(null);

    const rowsToProcess = selectedIndices.map((idx) => {
      const row = vendorData[idx];
      const vendorId = row[mapping.idColumn] || `Row_${idx + 1}`;
      const vendorName = row[mapping.nameColumn] || `Vendor_${idx + 1}`;
      return { row, vendorId: String(vendorId), vendorName: String(vendorName) };
    });

    try {
      const { contracts, errors: genErrors } = await batchRenderContracts(
        templateBuffer,
        rowsToProcess,
        (p) => setProgress(p)
      );

      setGeneratedContracts(contracts);
      setErrors(genErrors);

      if (contracts.length > 1) {
        const bundle = await createZipBundle(contracts);
        setZipBlob(bundle);
      }
    } catch (e: any) {
      setErrors([`Batch generation error: ${e.message || String(e)}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  const isReadyToGenerate =
    !!templateBuffer && vendorData.length > 0 && selectedIndices.length > 0;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'studio' ? (
          <div className="space-y-6">
            {/* Step 1: Upload Source Files */}
            <UploadSection
              excelFile={excelFile}
              templateFile={templateFile}
              excelFileName={excelFileName}
              templateFileName={templateFileName}
              onExcelUpload={handleExcelUpload}
              onTemplateUpload={handleTemplateUpload}
              onLoadSamples={handleLoadSamples}
              onResetFiles={handleResetFiles}
              rowCount={vendorData.length}
            />

            {/* Step 2: Data Preview & Column Mapping (when Excel uploaded) */}
            {vendorData.length > 0 && (
              <DataPreviewSection
                data={vendorData}
                columns={columns}
                mapping={mapping}
                onMappingChange={setMapping}
              />
            )}

            {/* Step 3: Interactive Selection (Select All / Deselect All) */}
            {vendorData.length > 0 && (
              <VendorSelectionSection
                data={vendorData}
                mapping={mapping}
                selectedIndices={selectedIndices}
                onSelectionChange={setSelectedIndices}
              />
            )}

            {/* Step 4: Generation Logic & Downloads */}
            <GenerationSection
              selectedCount={selectedIndices.length}
              isReadyToGenerate={isReadyToGenerate}
              isGenerating={isGenerating}
              progress={progress}
              generatedContracts={generatedContracts}
              errors={errors}
              onGenerate={handleGenerate}
              zipBlob={zipBlob}
            />
          </div>
        ) : (
          /* Python Streamlit Source Code & CLI View */
          <PythonSourceView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Vendor Contract Generator • In-memory Word templating &amp; automated NaN sanitization
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-slate-600 hover:text-blue-600 underline font-medium"
            >
              Template Guide
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('python')}
              className="text-slate-600 hover:text-indigo-600 underline font-medium"
            >
              Streamlit CLI Source
            </button>
          </div>
        </div>
      </footer>

      {/* Template Guide Modal */}
      <TemplateGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
