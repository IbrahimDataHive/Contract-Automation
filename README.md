# Vendor Contract Generator (Streamlit & Web App)

Automates the generation of customized vendor contracts from an Excel sheet (`.xlsx` / `.xls`) and a Word template (`.docx`) with Jinja2 placeholders.

## Quickstart (Local Python / Streamlit)

### 1. Prerequisites
Ensure you have Python 3.9+ installed.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

*(Optional: create a virtual environment first)*
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run the Streamlit Application
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## How it Works

1. **Excel Uploader**: Accepts `.xlsx` or `.xls` containing vendor records.
2. **Word Template Uploader**: Accepts a `.docx` document containing Jinja2 placeholders like `{{ vendor_name }}`, `{{ vendor_id }}`, `{{ effective_date }}`.
3. **Data Preview & Column Mapping**: Inspects rows, auto-detects vendor ID and vendor Name columns, and displays available template tags.
4. **Interactive Multi-Select**: Filter vendors with `[ID] - [Name]` labels and instant **Select All** / **Deselect All** controls.
5. **In-Memory Generation**: Renders customized Word documents with `docxtpl` (`DocxTemplate`), sanitizing all `NaN` values to clean empty strings without corrupting Word document styles or tables.
6. **One-Click Download**: Directly download a single `.docx` file or an in-memory `.zip` archive containing all generated contracts.
