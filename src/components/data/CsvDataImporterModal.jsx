import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Check, 
  Search, 
  Trash2, 
  RefreshCw,
  Database,
  ArrowRight
} from 'lucide-react';

export default function CsvDataImporterModal({ 
  isOpen, 
  onClose, 
  onImportSuccess,
  title = "Import Student & Candidate CSV Data",
  description = "Upload a .csv file containing student credentials, academic marks, roll numbers, and placement statuses."
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Simple and robust CSV line splitter taking care of quoted values
  const parseCsvText = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row.");
    }

    const splitLine = (row) => {
      const result = [];
      let current = '';
      let insideQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"' || char === "'") {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const rawHeaders = splitLine(lines[0]);
    const normalizedHeaders = rawHeaders.map(h => h.trim());

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = splitLine(lines[i]);
      if (values.length === 1 && values[0] === '') continue;

      const rowObj = { _id: `csv_row_${Date.now()}_${i}` };
      normalizedHeaders.forEach((header, idx) => {
        rowObj[header] = values[idx] !== undefined ? values[idx] : '';
      });

      // Normalize standard keys
      rowObj.name = rowObj.name || rowObj.Name || rowObj.student_name || rowObj['Student Name'] || rowObj.candidate_name || `Student #${i}`;
      rowObj.rollNumber = rowObj.rollNumber || rowObj.roll_number || rowObj['Roll Number'] || rowObj.rollno || rowObj.RollNo || `2024/CSE/${String(i).padStart(3, '0')}`;
      rowObj.email = rowObj.email || rowObj.Email || rowObj['Email Address'] || `${rowObj.name.toLowerCase().replace(/\s+/g, '')}@jecrc.ac.in`;
      rowObj.branch = rowObj.branch || rowObj.Branch || rowObj.Department || 'Computer Science & Engineering';
      rowObj.cgpa = parseFloat(rowObj.cgpa || rowObj.CGPA || rowObj.gpa || 8.0) || 8.0;
      rowObj.batch = rowObj.batch || rowObj.Batch || rowObj.graduation_year || '2026';
      rowObj.phone = rowObj.phone || rowObj.Phone || rowObj.mobile || '+91 98765 43210';
      rowObj.activeBacklogs = parseInt(rowObj.activeBacklogs || rowObj.backlogs || rowObj.ActiveBacklogs || 0, 10) || 0;
      rowObj.status = rowObj.status || rowObj.Status || 'Applied';

      rows.push(rowObj);
    }

    return { headers: normalizedHeaders, rows };
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Please upload a valid .csv file format.');
      return;
    }

    setSelectedFile(file);
    setParseError(null);
    setImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const { headers: parsedHeaders, rows: parsedRows } = parseCsvText(text);
        setHeaders(parsedHeaders);
        setParsedData(parsedRows);
      } catch (err) {
        setParseError(err.message || 'Failed to parse CSV file.');
        setParsedData([]);
        setHeaders([]);
      }
    };
    reader.onerror = () => {
      setParseError('Could not read the uploaded file.');
    };
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = 
`name,roll_number,email,branch,cgpa,tenth_percentage,twelfth_percentage,active_backlogs,phone,batch,status
Payanshi Jain,2026/AI/045,payanshijain.ai27@jecrc.ac.in,Artificial Intelligence & Data Science,8.84,94.2,92.8,0,+919950661182,2026,Shortlisted
Aditya Sharma,2026/CSE/012,aditya.sharma@jecrc.ac.in,Computer Science & Engineering,8.92,95.0,91.4,0,+919823456789,2026,Applied
Ananya Gupta,2026/IT/034,ananya.g@jecrc.ac.in,Information Technology,8.45,89.5,88.0,0,+919876543210,2026,Technical
Rohan Mehta,2026/ECE/089,rohan.mehta@jecrc.ac.in,Electronics & Comm. Engineering,7.90,88.2,85.5,0,+919811223344,2026,Applied
Tanvi Verma,2026/AIML/008,tanvi.verma@jecrc.ac.in,AI & Machine Learning,9.15,96.0,94.6,0,+919944556677,2026,Selected`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'placeprep_student_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    if (!parsedData || parsedData.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      // Save to localStorage for persistence
      try {
        const existingDataStr = localStorage.getItem('placeprep_imported_csv_data');
        const existing = existingDataStr ? JSON.parse(existingDataStr) : [];
        const merged = [...parsedData, ...existing];
        localStorage.setItem('placeprep_imported_csv_data', JSON.stringify(merged));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      if (onImportSuccess) {
        onImportSuccess(parsedData);
      }

      setIsProcessing(false);
      setImportSuccessMsg(`Successfully imported ${parsedData.length} records into the system!`);
      setTimeout(() => {
        onClose();
        setImportSuccessMsg(null);
        setSelectedFile(null);
        setParsedData([]);
      }, 1200);
    }, 600);
  };

  const filteredRows = parsedData.filter(r => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(q)) ||
      (r.email && r.email.toLowerCase().includes(q)) ||
      (r.branch && r.branch.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .CSV Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Upload Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
              dragActive 
                ? 'border-indigo-600 bg-indigo-50/50' 
                : selectedFile 
                ? 'border-emerald-400 bg-emerald-50/30' 
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              selectedFile ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {selectedFile ? <FileText className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
            </div>

            <div>
              {selectedFile ? (
                <>
                  <p className="text-sm font-black text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-emerald-600 font-bold mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {parsedData.length} Records parsed successfully
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag and drop your <span className="text-indigo-600">.csv</span> file here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports comma-delimited columns: name, roll_number, email, branch, cgpa, phone, batch, etc.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Parsing Error Notice */}
          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{parseError}</span>
            </div>
          )}

          {/* Success Banner */}
          {importSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {/* Parsed Data Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Data Preview:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black">
                    {parsedData.length} Candidates Loaded
                  </span>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search preview rows..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Roll Number</th>
                        <th className="py-2.5 px-3">Branch</th>
                        <th className="py-2.5 px-3">CGPA</th>
                        <th className="py-2.5 px-3">Batch</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredRows.slice(0, 50).map((row, idx) => (
                        <tr key={row._id || idx} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{row.name}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-indigo-700">{row.rollNumber}</td>
                          <td className="py-2 px-3 truncate max-w-[150px]">{row.branch}</td>
                          <td className="py-2 px-3 font-bold text-emerald-700">{row.cgpa}</td>
                          <td className="py-2 px-3">{row.batch}</td>
                          <td className="py-2 px-3 truncate max-w-[150px] text-slate-500">{row.email}</td>
                          <td className="py-2 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-black text-[10px]">
                              {row.status || 'Verified'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredRows.length > 50 && (
                  <div className="p-2 bg-slate-50 text-center text-[11px] text-slate-500 border-t border-slate-200">
                    Showing top 50 of {filteredRows.length} candidates. All will be ingested.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedFile && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setParsedData([]);
                  setHeaders([]);
                }}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove File</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={parsedData.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer ${
                parsedData.length > 0 && !isProcessing
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Ingesting Data...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ingest {parsedData.length} Candidates to Database</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
