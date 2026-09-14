import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import { saveAs } from 'file-saver';

const APP_PY_CODE = `"""
Vendor Contract Generator - Streamlit Web Application
Automates the generation of customized vendor contracts from Excel data and a Word (.docx) template.
"""

import io
import re
import time
import zipfile
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

import pandas as pd
import streamlit as st
from docxtpl import DocxTemplate

# -----------------------------------------------------------------------------
# Page Configuration & Theming
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Vendor Contract Generator",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
    <style>
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 3rem;
        max-width: 1200px;
    }
    .tag-chip {
        display: inline-block;
        background: #f1f5f9;
        color: #334155;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.82rem;
        margin: 0.15rem;
        border: 1px solid #e2e8f0;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------
def sanitize_value(val: Any) -> Any:
    """Sanitizes NaN, None, and NaT into empty strings, formats dates cleanly."""
    if pd.isna(val) or val is None:
        return ""
    if isinstance(val, (datetime, pd.Timestamp)):
        return val.strftime("%Y-%m-%d")
    if isinstance(val, float) and val.is_integer():
        return int(val)
    return val


def sanitize_row_context(row: pd.Series) -> Dict[str, Any]:
    """Converts a DataFrame row into a clean dictionary context for Jinja2/docxtpl."""
    context: Dict[str, Any] = {}
    for col_name, value in row.items():
        clean_val = sanitize_value(value)
        # Original column key
        context[str(col_name)] = clean_val
        
        # Normalized snake_case key (e.g., 'Vendor Name' -> 'vendor_name')
        normalized_key = re.sub(r"[^\\w]+", "_", str(col_name).strip().lower()).strip("_")
        if normalized_key and normalized_key not in context:
            context[normalized_key] = clean_val
            
    return context


def auto_detect_columns(columns: List[str]) -> Tuple[Optional[str], Optional[str]]:
    """Heuristically auto-detects vendor ID and vendor Name columns."""
    id_candidates = ["vendor_id", "vendor id", "id", "supplier_id", "vendor_code", "code", "account_id"]
    name_candidates = ["vendor_name", "vendor name", "company_name", "company", "name", "supplier_name", "vendor", "supplier"]

    detected_id = None
    detected_name = None

    for col in columns:
        cleaned = col.strip().lower()
        if cleaned in id_candidates or any(cand in cleaned for cand in ["vendor_id", "vendor id", "supplier_id"]):
            detected_id = col
            break
    if not detected_id:
        for col in columns:
            if "id" in col.strip().lower() or "code" in col.strip().lower():
                detected_id = col
                break

    for col in columns:
        cleaned = col.strip().lower()
        if cleaned in name_candidates or any(cand in cleaned for cand in ["vendor_name", "company"]):
            detected_name = col
            break
    if not detected_name:
        for col in columns:
            if "name" in col.strip().lower() and col != detected_id:
                detected_name = col
                break

    if not detected_id and len(columns) > 0:
        detected_id = columns[0]
    if not detected_name and len(columns) > 1:
        detected_name = columns[1] if columns[1] != detected_id else columns[0]
    elif not detected_name and len(columns) > 0:
        detected_name = columns[0]

    return detected_id, detected_name


# -----------------------------------------------------------------------------
# Main Application Flow
# -----------------------------------------------------------------------------
def main():
    st.title("📄 Vendor Contract Generator")
    st.markdown(
        "Automate the batch generation of personalized vendor contracts from an Excel sheet and a Word template with Jinja2 placeholders."
    )

    if "selected_indices" not in st.session_state:
        st.session_state.selected_indices = []

    # Sidebar: File Uploads
    with st.sidebar:
        st.header("📂 1. Source Files")

        excel_file = st.file_uploader(
            "Excel Vendor Data (.xlsx, .xls)",
            type=["xlsx", "xls"],
            help="Upload the spreadsheet containing vendor rows and attributes.",
        )

        template_file = st.file_uploader(
            "Word Contract Template (.docx)",
            type=["docx"],
            help="Upload the Word template with Jinja2 placeholders (e.g. {{ vendor_name }}).",
        )

    if not excel_file or not template_file:
        st.info("👈 Please upload both an Excel file and a Word template in the sidebar to begin.")
        return

    # Parse Excel
    try:
        df = pd.read_excel(excel_file)
    except Exception as e:
        st.error(f"❌ Failed to parse Excel file: {str(e)}")
        return

    if df.empty:
        st.warning("⚠️ The uploaded Excel file contains no rows.")
        return

    # Verify Word template in memory
    try:
        template_bytes = template_file.getvalue()
        _ = DocxTemplate(io.BytesIO(template_bytes))
    except Exception as e:
        st.error(f"❌ The uploaded Word template is invalid: {str(e)}")
        return

    columns_list = [str(c) for c in df.columns.tolist()]
    detected_id_col, detected_name_col = auto_detect_columns(columns_list)

    # Step 2: Data Preview & Column Mapping
    st.subheader("📊 2. Data Preview & Column Mapping")
    with st.expander("🔍 Inspect Uploaded Vendor Data & Key Column Selection", expanded=True):
        col_c1, col_c2, col_c3 = st.columns([1, 1, 1])
        with col_c1:
            id_col = st.selectbox(
                "Vendor ID Column:",
                options=columns_list,
                index=columns_list.index(detected_id_col) if detected_id_col in columns_list else 0,
            )
        with col_c2:
            name_col = st.selectbox(
                "Vendor Name Column:",
                options=columns_list,
                index=columns_list.index(detected_name_col) if detected_name_col in columns_list else 0,
            )
        with col_c3:
            st.metric("Total Vendors Found", len(df))

        st.dataframe(df.fillna(""), use_container_width=True, height=220)

    # Step 3: Interactive Selection
    st.subheader("🎯 3. Select Vendors for Contract Generation")
    vendor_options = {}
    for idx, row in df.iterrows():
        v_id = str(sanitize_value(row.get(id_col, idx)))
        v_name = str(sanitize_value(row.get(name_col, f"Vendor {idx}")))
        vendor_options[int(idx)] = f"[{v_id}] - {v_name}"

    all_indices = list(vendor_options.keys())

    ctrl_col1, ctrl_col2, ctrl_col3 = st.columns([1, 1, 3])
    with ctrl_col1:
        if st.button("✅ Select All", use_container_width=True):
            st.session_state.selected_indices = all_indices
    with ctrl_col2:
        if st.button("❌ Deselect All", use_container_width=True):
            st.session_state.selected_indices = []
    with ctrl_col3:
        st.markdown(
            f"<div style='padding-top: 0.4rem;'>Selected: <b>{len(st.session_state.selected_indices)}</b> of <b>{len(df)}</b> vendors</div>",
            unsafe_allow_html=True,
        )

    selected_indices = st.multiselect(
        "Choose vendors to generate contracts for:",
        options=all_indices,
        default=st.session_state.selected_indices,
        format_func=lambda x: vendor_options.get(x, str(x)),
    )
    st.session_state.selected_indices = selected_indices

    if not selected_indices:
        st.warning("⚠️ Please select at least one vendor to generate contracts.")
        return

    # Step 4: Generation Logic
    st.subheader("⚡ 4. Document Generation")
    if st.button(f"Generate {len(selected_indices)} Contract{'s' if len(selected_indices) > 1 else ''}", type="primary", use_container_width=True):
        progress_bar = st.progress(0)
        status_text = st.empty()
        generated_files: List[Tuple[str, bytes]] = []
        errors: List[str] = []

        total_selected = len(selected_indices)
        start_time = time.time()

        for i, idx in enumerate(selected_indices):
            row = df.loc[idx]
            v_id = str(sanitize_value(row.get(id_col, idx)))
            v_name = str(sanitize_value(row.get(name_col, f"Vendor_{idx}")))
            safe_name = re.sub(r"[^\\w\\-_\\. ]", "_", f"{v_id}_{v_name}").strip()
            filename = f"Contract_{safe_name}.docx"

            status_text.text(f"Rendering contract ({i+1}/{total_selected}): {v_name}...")

            try:
                context = sanitize_row_context(row)
                doc = DocxTemplate(io.BytesIO(template_bytes))
                doc.render(context)
                out_stream = io.BytesIO()
                doc.save(out_stream)
                generated_files.append((filename, out_stream.getvalue()))
            except Exception as render_err:
                errors.append(f"Failed to generate for row {idx} ({v_name}): {str(render_err)}")

            progress_bar.progress((i + 1) / total_selected)

        elapsed = time.time() - start_time
        status_text.empty()
        progress_bar.empty()

        if errors:
            for err in errors:
                st.error(f"⚠️ {err}")

        if not generated_files:
            st.error("❌ No contracts could be generated.")
            return

        st.success(f"🎉 Successfully rendered {len(generated_files)} contract{'s' if len(generated_files) > 1 else ''} in {elapsed:.2f}s!")

        # Step 5: Output & Downloads
        st.subheader("📥 5. Download Contracts")
        if len(generated_files) == 1:
            fname, fbytes = generated_files[0]
            st.download_button(
                label=f"📄 Download {fname}",
                data=fbytes,
                file_name=fname,
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                type="primary",
            )
        else:
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_file:
                for fname, fbytes in generated_files:
                    zip_file.writestr(fname, fbytes)

            zip_bytes = zip_buffer.getvalue()
            zip_filename = f"Vendor_Contracts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"

            st.download_button(
                label=f"📦 Download All {len(generated_files)} Contracts as ZIP ({len(zip_bytes) / 1024:.1f} KB)",
                data=zip_bytes,
                file_name=zip_filename,
                mime="application/zip",
                type="primary",
                use_container_width=True,
            )


if __name__ == "__main__":
    main()
`;

const REQUIREMENTS_TXT = `streamlit>=1.35.0
pandas>=2.0.0
openpyxl>=3.1.2
python-docx>=1.1.0
docxtpl>=0.16.8
`;

export const PythonSourceView: React.FC = () => {
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopyApp = () => {
    navigator.clipboard.writeText(APP_PY_CODE);
    setCopiedApp(true);
    setTimeout(() => setCopiedApp(false), 2000);
  };

  const handleCopyReqs = () => {
    navigator.clipboard.writeText(REQUIREMENTS_TXT);
    setCopiedReqs(true);
    setTimeout(() => setCopiedReqs(false), 2000);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(
      'pip install -r requirements.txt\nstreamlit run app.py'
    );
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadAppPy = () => {
    const blob = new Blob([APP_PY_CODE], { type: 'text/x-python;charset=utf-8' });
    saveAs(blob, 'app.py');
  };

  const handleDownloadRequirements = () => {
    const blob = new Blob([REQUIREMENTS_TXT], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, 'requirements.txt');
  };

  return (
    <div className="space-y-6">
      {/* CLI Quickstart Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <span>Run Streamlit Locally</span>
                <span className="ml-2.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Python 3.9+
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Execute the script natively on your machine using standard Streamlit CLI
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCmd}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd ? 'Commands Copied' : 'Copy Commands'}</span>
            </button>
          </div>
        </div>

        {/* Terminal block */}
        <div className="mt-4 font-mono text-xs sm:text-sm bg-black/50 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300">
          <div className="text-slate-500"># 1. (Optional) Create and activate virtual environment</div>
          <div className="text-emerald-400">python -m venv .venv && source .venv/bin/activate</div>
          <div className="text-slate-500 pt-1"># 2. Install required dependencies</div>
          <div className="text-emerald-400">pip install -r requirements.txt</div>
          <div className="text-slate-500 pt-1"># 3. Launch the Streamlit application</div>
          <div className="text-emerald-400">streamlit run app.py</div>
        </div>
      </div>

      {/* 2-Column: requirements.txt & app.py info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* requirements.txt Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">requirements.txt</h4>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleCopyReqs}
                  className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                  title="Copy requirements.txt"
                >
                  {copiedReqs ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadRequirements}
                  className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                  title="Download requirements.txt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs">
              <pre>{REQUIREMENTS_TXT}</pre>
            </div>

            <div className="mt-4 text-xs text-slate-500 space-y-1.5">
              <p>
                <strong>streamlit:</strong> Interactive web dashboard framework.
              </p>
              <p>
                <strong>pandas &amp; openpyxl:</strong> High-performance Excel reading and row context preparation.
              </p>
              <p>
                <strong>docxtpl:</strong> High-fidelity Word document templating without layout or style corruption.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              onClick={handleDownloadRequirements}
              type="button"
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download requirements.txt</span>
            </button>
          </div>
        </div>

        {/* app.py Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">app.py (Full Python Script)</h4>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyApp}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {copiedApp ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedApp ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAppPy}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download app.py</span>
                </button>
              </div>
            </div>

            <div className="mt-3 bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-96 overflow-y-auto">
              <pre>{APP_PY_CODE}</pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Production-ready with in-memory io.BytesIO rendering and zipfile packaging</span>
            <button
              onClick={handleDownloadAppPy}
              type="button"
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              Download app.py
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
