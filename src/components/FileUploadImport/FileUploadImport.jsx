import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import './FileUploadImport.css';

export default function FileUploadImport({ columns, onImport, label }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const parseFile = async (file) => {
    setFileName(file.name);
    const ext = file.name.split('.').pop().toLowerCase();

    try {
      let data = [];

      if (ext === 'xlsx' || ext === 'xls') {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      } else if (ext === 'csv' || ext === 'txt') {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length === 0) { setPreview([]); return; }
        const sep = text.includes('\t') ? '\t' : ',';
        const header = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/["'']/g, ''));
        data = lines.slice(1).map(line => {
          const vals = line.split(sep).map(v => v.trim().replace(/^["']|["']$/g, ''));
          const obj = {};
          header.forEach((h, i) => { obj[h] = vals[i] || ''; });
          return obj;
        }).filter(r => Object.values(r).some(v => v));
      } else {
        alert('Formato no soportado. Use .xlsx, .xls, .csv o .txt');
        return;
      }

      if (data.length === 0) {
        alert('El archivo está vacío o no se pudo leer.');
        return;
      }
      setPreview(data);
    } catch (err) {
      console.error(err);
      alert('Error al leer el archivo. Verifique el formato.');
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) return;
    setLoading(true);
    try {
      await onImport(preview);
      setPreview(null);
      setFileName('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert('Error al importar los datos.');
    }
    setLoading(false);
  };

  const hasRequired = preview
    ? columns.filter(c => c.required).every(c =>
        preview.some(row => row[c.key] || row[c.key] === 0)
      )
    : false;

  return (
    <div className="upload-wrap">
      <div
        className="upload-zone"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFile} hidden />
        <span className="upload-icon">📂</span>
        <span className="upload-text">{fileName || `Subir ${label} — Excel, CSV o TXT`}</span>
        <span className="upload-hint">Haz clic o arrastra un archivo aquí</span>
      </div>

      {preview && preview.length > 0 && (
        <div className="upload-preview">
          <div className="upload-preview-header">
            <span className="upload-preview-count">{preview.length} registro(s) detectados</span>
            <button className="upload-import-btn" onClick={handleImport} disabled={loading || !hasRequired}>
              {loading ? 'Importando...' : `Importar ${preview.length} registro(s)`}
            </button>
          </div>
          <div className="upload-preview-table-wrap">
            <table className="upload-preview-table">
              <thead>
                <tr>
                  <th>#</th>
                  {columns.map(col => (
                    <th key={col.key} className={col.required ? 'required' : ''}>
                      {col.label}{col.required ? ' *' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    {columns.map(col => (
                      <td key={col.key}>{row[col.key] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
