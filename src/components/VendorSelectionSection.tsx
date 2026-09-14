import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Users,
  Search,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import { VendorRow, ColumnMapping } from '../types';

interface VendorSelectionSectionProps {
  data: VendorRow[];
  mapping: ColumnMapping;
  selectedIndices: number[];
  onSelectionChange: (indices: number[]) => void;
}

export const VendorSelectionSection: React.FC<VendorSelectionSectionProps> = ({
  data,
  mapping,
  selectedIndices,
  onSelectionChange,
}) => {
  const [filterText, setFilterText] = useState<string>('');

  const handleSelectAll = () => {
    onSelectionChange(data.map((_, i) => i));
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const toggleIndex = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      onSelectionChange(selectedIndices.filter((i) => i !== idx));
    } else {
      onSelectionChange([...selectedIndices, idx]);
    }
  };

  // Build items with requested label "[Index/ID] - [Vendor Name]"
  const vendorItems = data.map((row, idx) => {
    const rawId = row[mapping.idColumn];
    const rawName = row[mapping.nameColumn];
    const idDisplay =
      rawId !== null && rawId !== undefined && rawId !== '' ? String(rawId) : `Row ${idx + 1}`;
    const nameDisplay =
      rawName !== null && rawName !== undefined && rawName !== ''
        ? String(rawName)
        : `Vendor #${idx + 1}`;
    const label = `[${idDisplay}] - ${nameDisplay}`;

    return {
      index: idx,
      id: idDisplay,
      name: nameDisplay,
      label,
      row,
    };
  });

  const filteredItems = vendorItems.filter((item) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      Object.values(item.row).some(
        (v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q)
      )
    );
  });

  const allSelected = selectedIndices.length === data.length && data.length > 0;
  const noneSelected = selectedIndices.length === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            3
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center">
              <span>Select Vendors for Contract Generation</span>
              <span
                className={`ml-2.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  selectedIndices.length > 0
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {selectedIndices.length} of {data.length} selected
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Pick individual vendors or bulk-select to batch generate tailored agreements
            </p>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            id="select-all-vendors-btn"
            type="button"
            onClick={handleSelectAll}
            disabled={allSelected}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Select All</span>
          </button>

          <button
            id="deselect-all-vendors-btn"
            type="button"
            onClick={handleDeselectAll}
            disabled={noneSelected}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Deselect All</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor by ID, name, or attribute..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Vendors Checkbox Grid / List */}
        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-80 overflow-y-auto bg-slate-50/30">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No vendors match "{filterText}"
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedIndices.includes(item.index);
              return (
                <div
                  key={item.index}
                  onClick={() => toggleIndex(item.index)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/60 hover:bg-blue-50'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-3">
                    <button
                      type="button"
                      className="text-blue-600 focus:outline-hidden shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      {/* Required Label Format: "[Index/ID] - [Vendor Name]" */}
                      <p
                        className={`text-xs sm:text-sm truncate font-medium ${
                          isSelected ? 'text-blue-950 font-semibold' : 'text-slate-800'
                        }`}
                      >
                        {item.label}
                      </p>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.row.contact_person && (
                          <span>Contact: {String(item.row.contact_person)}</span>
                        )}
                        {item.row.email && <span>• {String(item.row.email)}</span>}
                        {item.row.contract_value && (
                          <span>
                            • ${Number(item.row.contract_value).toLocaleString()}{' '}
                            {item.row.currency || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Row {item.index + 1}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
