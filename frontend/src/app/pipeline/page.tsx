"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Briefcase, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

interface ApplicationItem {
  id: string;
  company_name: string;
  role_title: string;
  status: "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  notes?: string;
  created_at: string;
}

const STAGES: { id: ApplicationItem["status"]; title: string; color: string }[] = [
  { id: "SAVED", title: "Saved Opportunities", color: "border-gray-700 bg-gray-900/40" },
  { id: "APPLIED", title: "Applied", color: "border-blue-500/30 bg-blue-950/20" },
  { id: "INTERVIEW", title: "Interviewing", color: "border-amber-500/30 bg-amber-950/20" },
  { id: "OFFER", title: "Offers Received 🎉", color: "border-emerald-500/30 bg-emerald-950/20" },
];

export default function KanbanPipeline() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/applications/");
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
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
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, newStatus: ApplicationItem["status"]) => {
    try {
      await axios.patch(`http://localhost:8000/api/v1/applications/${id}/status`, {
        status: newStatus,
      });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteApp = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/applications/${id}`);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error("Failed to delete application:", err);
    }
  };

  const getNextStage = (status: ApplicationItem["status"]): ApplicationItem["status"] | null => {
    if (status === "SAVED") return "APPLIED";
    if (status === "APPLIED") return "INTERVIEW";
    if (status === "INTERVIEW") return "OFFER";
    return null;
  };

  const getPrevStage = (status: ApplicationItem["status"]): ApplicationItem["status"] | null => {
    if (status === "OFFER") return "INTERVIEW";
    if (status === "INTERVIEW") return "APPLIED";
    if (status === "APPLIED") return "SAVED";
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 p-6 md:p-10 flex flex-col font-sans">
      <div className="flex items-center justify-between pb-8 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" /> Placement & Application Pipeline
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage active job and internship applications across stages.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Add Opportunity
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 flex-1 items-start">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((app) => app.status === stage.id);
          return (
            <div key={stage.id} className={`p-4 rounded-xl border ${stage.color} flex flex-col min-h-[500px]`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-200">{stage.title}</span>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                  {stageApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {stageApps.map((app) => {
                  const next = getNextStage(app.status);
                  const prev = getPrevStage(app.status);
                  return (
                    <div key={app.id} className="p-4 bg-[#161b22] border border-gray-800 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-white">{app.company_name}</h4>
                        <button onClick={() => deleteApp(app.id)} className="text-gray-600 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-indigo-400 mt-0.5">{app.role_title}</p>
                      {app.notes && <p className="text-[11px] text-gray-400 mt-2 bg-gray-900/60 p-2 rounded">{app.notes}</p>}

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800/80">
                        {prev ? (
                          <button
                            onClick={() => updateStatus(app.id, prev)}
                            className="p-1 hover:bg-gray-800 rounded text-gray-400"
                            title="Move to previous stage"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : <div />}

                        {next && (
                          <button
                            onClick={() => updateStatus(app.id, next)}
                            className="p-1 hover:bg-gray-800 rounded text-indigo-400"
                            title="Move to next stage"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-[#161b22] border border-gray-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-white text-lg">Add New Opportunity</h3>
            <div>
              <label className="text-xs text-gray-400">Company Name</label>
              <input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, IncodeVision, etc."
                className="w-full mt-1 p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Role Title</label>
              <input
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="ML Intern, Data Analyst, etc."
                className="w-full mt-1 p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Notes / Round Details</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="OA deadline on 15th, applied via referral..."
                className="w-full mt-1 p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}