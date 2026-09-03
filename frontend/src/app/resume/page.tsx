"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import axios from "axios";

export default function ResumeScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/api/v1/resume/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to scan resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 p-8 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Intelligence & ATS Scanner</h1>
          <p className="text-sm text-gray-400 mt-1">Upload your PDF resume to compute keyword match index and missing gaps.</p>
        </div>

        <div className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center transition bg-[#161b22]">
          <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
          />
          {file && <p className="text-xs text-indigo-400 mt-2 font-mono">{file.name}</p>}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-semibold transition"
        >
          {loading ? "Parsing & Scoring with TF-IDF..." : "Analyze Resume"}
        </button>

        {results && (
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-xs text-gray-400">ATS Match Rating</span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">{results.overall_score} / 100</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">TF-IDF Vector Similarity</span>
                <p className="text-xl font-bold text-indigo-400 mt-1">{results.match_percentage}%</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Identified Skills</h3>
              <div className="flex flex-wrap gap-2">
                {results.found_skills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-md">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {results.missing_critical_skills.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Missing Priority Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {results.missing_critical_skills.map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-md">
                      ✕ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}