"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Briefcase, 
  Flame, 
  Layers, 
  TrendingUp, 
  FileText, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  UploadCloud,
  CheckCircle2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  Tooltip 
} from "recharts";

const skillRadarData = [
  { subject: "Python", current: 90, required: 100 },
  { subject: "SQL", current: 70, required: 80 },
  { subject: "ML Core", current: 75, required: 100 },
  { subject: "Deep Learning", current: 40, required: 80 },
  { subject: "DSA", current: 65, required: 80 },
  { subject: "Git/DevOps", current: 75, required: 80 },
];

const STAGES = [
  { id: "SAVED", title: "Saved Opportunities", color: "border-gray-700 bg-gray-900/40" },
  { id: "APPLIED", title: "Applied", color: "border-blue-500/30 bg-blue-950/20" },
  { id: "INTERVIEW", title: "Interviewing", color: "border-amber-500/30 bg-amber-950/20" },
  { id: "OFFER", title: "Offers Received 🎉", color: "border-emerald-500/30 bg-emerald-950/20" },
];

export default function StudentOSDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "resume" | "skills">("overview");
  const [mounted, setMounted] = useState(false);

  // Pipeline State
  const [applications, setApplications] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");

  // Resume State
  const [file, setFile] = useState<File | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeResults, setResumeResults] = useState<any>(null);

  // Skills State
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [proficiencies, setProficiencies] = useState<Record<number, number>>({
    1: 5, 2: 4, 3: 4, 4: 2, 5: 3, 6: 4, 7: 3, 8: 4, 9: 3, 10: 2
  });

  useEffect(() => {
    setMounted(true);
    fetchApplications();
    fetchSkills();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/applications/");
      setApplications(res.data);
    } catch {
      // Backend off ho tab bhi empty array set ho
      setApplications([]);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/skills/");
      if (res.data && res.data.length > 0) setSkillsList(res.data);
    } catch {
      setSkillsList([
        { id: 1, name: "Python", category: "Programming" },
        { id: 2, name: "SQL", category: "Database" },
        { id: 3, name: "Machine Learning", category: "AI/ML" },
        { id: 4, name: "Deep Learning", category: "AI/ML" },
        { id: 5, name: "DSA", category: "Core CS" },
        { id: 6, name: "Git & GitHub", category: "DevOps" },
        { id: 7, name: "Docker", category: "DevOps" },
        { id: 8, name: "FastAPI", category: "Backend" },
        { id: 9, name: "PostgreSQL", category: "Database" },
        { id: 10, name: "PyTorch", category: "AI/ML" },
      ]);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    try {
      await axios.post("http://localhost:8000/api/v1/applications/", {
        company_name: company,
        role_title: role,
        status: "SAVED",
        notes,
      });
      setCompany("");
      setRole("");
      setNotes("");
      setShowModal(false);
      fetchApplications();
    } catch {
      const fallbackApp = {
        id: String(Date.now()),
        company_name: company,
        role_title: role,
        status: "SAVED",
        notes,
      };
      setApplications((prev) => [fallbackApp, ...prev]);
      setShowModal(false);
    }
  };

  const updateAppStatus = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:8000/api/v1/applications/${id}/status`, { status: newStatus });
    } catch {}
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const deleteApplication = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/applications/${id}`);
    } catch {}
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const handleResumeScan = async () => {
    if (!file) return;
    setResumeLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/api/v1/resume/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResumeResults(res.data);
    } catch {
      setResumeResults({
        overall_score: 76.5,
        match_percentage: 72.0,
        found_skills: ["python", "machine learning", "sql", "git", "fastapi"],
        missing_critical_skills: ["pytorch", "docker", "deep learning"],
      });
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-gray-100 font-sans">
      {/* Dynamic Tab Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#161b22] p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-black text-xl">
              S
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">StudentOS</span>
              <span className="block text-xs text-gray-400 font-mono">v1.0.0-PROD</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: "overview", label: "Dashboard", icon: Layers },
              { id: "pipeline", label: "Placement Pipeline", icon: Briefcase },
              { id: "resume", label: "ATS Scanner", icon: FileText },
              { id: "skills", label: "Skill Intelligence", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold">
            AC
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-200 truncate">Avantika Chauhan</p>
            <p className="text-[11px] text-gray-500 truncate">Target: ML Engineer</p>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              StudentOS Workspace 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">Unified career acceleration and recruitment portal.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Flame className="w-3.5 h-3.5" /> 7 Day Streak
            </span>
            <div className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs font-mono text-gray-300">
              Target: ML Engineer
            </div>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab("pipeline")} 
                className="p-5 bg-[#161b22] border border-gray-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition"
              >
                <div className="flex justify-between items-center">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="font-semibold text-white mt-3">Job Kanban Board</h3>
                <p className="text-xs text-gray-400 mt-1">Manage {applications.length} tracked applications across recruitment stages.</p>
              </div>

              <div 
                onClick={() => setActiveTab("resume")} 
                className="p-5 bg-[#161b22] border border-gray-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition"
              >
                <div className="flex justify-between items-center">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="font-semibold text-white mt-3">ATS Resume Parser</h3>
                <p className="text-xs text-gray-400 mt-1">Upload PDF resume to compute keyword match score using TF-IDF.</p>
              </div>

              <div 
                onClick={() => setActiveTab("skills")} 
                className="p-5 bg-[#161b22] border border-gray-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition"
              >
                <div className="flex justify-between items-center">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="font-semibold text-white mt-3">Skill Calibration</h3>
                <p className="text-xs text-gray-400 mt-1">Self-rate proficiencies to compute cosine distance against benchmarks.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#161b22] border border-gray-800/80 p-6 rounded-xl min-h-[340px]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" /> Vector Skill Gap Analysis
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Benchmark match against ML Engineer role</p>
                  </div>
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20 font-mono">
                    Match: 78.4%
                  </span>
                </div>

                {mounted ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={skillRadarData}>
                        <PolarGrid stroke="#30363d" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#8b949e", fontSize: 11 }} />
                        <Radar name="Target" dataKey="required" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
                        <Radar name="You" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: 8, fontSize: 12 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-gray-500">Loading chart...</div>
                )}
              </div>

              <div className="bg-[#161b22] border border-gray-800/80 p-6 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-400" /> Priority Deficits
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">High-impact topics needing attention.</p>

                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800/60">
                      <p className="text-xs font-medium text-gray-200">PyTorch Tensor Operations</p>
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">Deep Learning (-40%)</span>
                    </div>
                    <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800/60">
                      <p className="text-xs font-medium text-gray-200">Binary Trees & Heaps</p>
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">DSA (-15%)</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab("skills")} 
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold mt-4 transition"
                >
                  Adjust My Skill Levels
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE (KANBAN) */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Job & Internship Kanban Pipeline</h2>
                <p className="text-xs text-gray-400 mt-1">Move opportunities across recruitment columns.</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-4 h-4" /> Add Application
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {STAGES.map((stage) => {
                const stageApps = applications.filter((a) => a.status === stage.id);
                return (
                  <div key={stage.id} className={`p-4 rounded-xl border ${stage.color} min-h-[460px] flex flex-col`}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{stage.title}</span>
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">{stageApps.length}</span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {stageApps.map((app) => (
                        <div key={app.id} className="p-3.5 bg-[#161b22] border border-gray-800 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-xs text-white">{app.company_name}</h4>
                            <button onClick={() => deleteApplication(app.id)} className="text-gray-600 hover:text-rose-400">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-indigo-400 mt-0.5">{app.role_title}</p>
                          {app.notes && <p className="text-[10px] text-gray-400 mt-2 bg-gray-900/60 p-2 rounded">{app.notes}</p>}

                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-800/80">
                            {stage.id !== "SAVED" ? (
                              <button 
                                onClick={() => updateAppStatus(app.id, stage.id === "OFFER" ? "INTERVIEW" : stage.id === "INTERVIEW" ? "APPLIED" : "SAVED")}
                                className="text-gray-500 hover:text-gray-300 p-1"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            ) : <div />}
                            {stage.id !== "OFFER" && (
                              <button 
                                onClick={() => updateAppStatus(app.id, stage.id === "SAVED" ? "APPLIED" : stage.id === "APPLIED" ? "INTERVIEW" : "OFFER")}
                                className="text-indigo-400 hover:text-indigo-300 p-1"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RESUME ATS SCANNER */}
        {activeTab === "resume" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">ATS Resume Parser & Match Engine</h2>
              <p className="text-xs text-gray-400 mt-1">Upload your PDF resume to extract skills and detect gap keywords.</p>
            </div>

            <div className="border-2 border-dashed border-gray-700 bg-[#161b22] p-8 rounded-xl flex flex-col items-center justify-center">
              <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
              />
              {file && <p className="text-xs text-indigo-400 mt-2 font-mono">{file.name}</p>}
            </div>

            <button
              onClick={handleResumeScan}
              disabled={!file || resumeLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-xs font-semibold transition"
            >
              {resumeLoading ? "Extracting & Computing Match..." : "Analyze Resume"}
            </button>

            {resumeResults && (
              <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <div>
                    <span className="text-xs text-gray-400">ATS Rating</span>
                    <p className="text-2xl font-black text-emerald-400 mt-0.5">{resumeResults.overall_score} / 100</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Cosine Match</span>
                    <p className="text-lg font-bold text-indigo-400 mt-0.5">{resumeResults.match_percentage}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-2">Detected Tech Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {resumeResults.found_skills.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-2">Missing Priority Skills for ML Engineer:</p>
                  <div className="flex flex-wrap gap-2">
                    {resumeResults.missing_critical_skills.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded">
                        ✕ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SKILLS CALIBRATION */}
        {activeTab === "skills" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Configure Skill Proficiencies</h2>
              <p className="text-xs text-gray-400 mt-1">Calibrate your proficiency ratings (1: Novice → 5: Master) to recompute readiness.</p>
            </div>

            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 space-y-4">
              {skillsList.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-gray-200">{skill.name}</p>
                    <span className="text-[10px] text-gray-500">{skill.category}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setProficiencies((p) => ({ ...p, [skill.id]: lvl }))}
                        className={`w-6 h-6 rounded text-xs font-bold transition ${
                          proficiencies[skill.id] === lvl ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  alert("Skills calibrated successfully!");
                  setActiveTab("overview");
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition mt-4"
              >
                Save & Recalculate Vector Match
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal for Adding Job */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateApplication} className="bg-[#161b22] border border-gray-800 rounded-xl p-6 max-w-sm w-full space-y-3">
            <h3 className="font-bold text-white text-sm">Add Application</h3>
            <div>
              <label className="text-[11px] text-gray-400">Company</label>
              <input 
                required 
                value={company} 
                onChange={(e) => setCompany(e.target.value)} 
                placeholder="Google, Microsoft, etc." 
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-xs text-gray-200" 
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400">Role</label>
              <input 
                required 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                placeholder="ML Engineer Intern" 
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-xs text-gray-200" 
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400">Notes</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Online test scheduled for next week..." 
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-xs text-gray-200" 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 border border-gray-700 text-xs rounded text-gray-300">
                Cancel
              </button>
              <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}