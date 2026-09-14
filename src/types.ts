export interface VendorRow {
  [key: string]: any;
}

export interface ColumnMapping {
  idColumn: string;
  nameColumn: string;
}

export interface GeneratedContract {
  filename: string;
  blob: Blob;
  sizeKb: number;
  vendorId: string;
  vendorName: string;
}

export interface GenerationProgress {
  current: number;
  total: number;
  status: string;
  isGenerating: boolean;
}
