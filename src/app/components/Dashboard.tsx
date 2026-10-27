"use client"

import { useState, useEffect, useCallback } from "react";
import { fetchJobs } from "../actions";
import { Search, Briefcase, GraduationCap, FileText, ChevronLeft, ChevronRight, Loader2, RefreshCw, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getAppUrl, useAppUrl } from "@/lib/paths";

type Job = {
  _id: string;
  gazetteDate: string;
  sourcePdf: string;
  gazetteUrl?: string;
  type: string;
  title: string;
  description: string;
  department?: string;
  closingDate?: string;
  qualifications?: string[];
  extractedAt: string;
};

const TABS = [
  { id: 'all', label: 'All Updates', icon: FileText },
  { id: 'vacancies', label: 'Vacancies', icon: Briefcase },
  { id: 'examinations', label: 'Examinations', icon: GraduationCap },
  { id: 'results', label: 'Results', icon: FileText },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const settingsUrl = useAppUrl("/settings");

  const handleSettingsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = getAppUrl("/settings");
  };

  const loadData = useCallback(async (tab: string, p: number, q: string) => {
    setLoading(true);
    try {
      const res = await fetchJobs(tab, p, 9, q);
      setJobs(res.jobs);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab, page, search);
  }, [activeTab, page, search, loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);
  };

  return (
    <div className="w-full">
      {/* Settings Link */}
      <div className="flex justify-end mb-6">
        <a 
          href={settingsUrl}
          onClick={handleSettingsClick}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-emerald-400 transition-colors shadow-lg"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">System Settings</span>
        </a>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8 relative max-w-xl mx-auto">
        <div className="flex gap-2 w-full">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-2xl leading-5 bg-gray-900/50 backdrop-blur-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all shadow-xl"
              placeholder="Search by title, department, or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="absolute inset-y-1 right-1 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20">
              Search
            </button>
          </div>
          <button 
            type="button" 
            onClick={() => loadData(activeTab, page, search)}
            className="flex items-center justify-center px-4 border border-gray-700 rounded-2xl bg-gray-900/50 hover:bg-gray-800 text-emerald-400 hover:text-emerald-300 transition-all shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </form>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                ${isActive 
                  ? 'text-white bg-emerald-600/20 ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : ''}`} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 border border-emerald-500/50 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-300">No records found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-emerald-500/10 group flex flex-col h-full cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                      {job.type}
                    </span>
                    <span className="text-xs text-gray-500">{job.gazetteDate}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {job.title}
                  </h3>
                  
                  {job.department && (
                    <div className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      <span className="truncate">{job.department}</span>
                    </div>
                  )}
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                    {job.description || "No description provided."}
                  </p>

                  {job.qualifications && job.qualifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.qualifications.slice(0, 2).map((q, qIdx) => (
                        <span key={qIdx} className="text-[11px] bg-gray-700/50 border border-gray-600/40 text-emerald-300 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                          {q}
                        </span>
                      ))}
                      {job.qualifications.length > 2 && (
                        <span className="text-[11px] text-gray-500 self-center">
                          +{job.qualifications.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {job.closingDate && (
                    <div className="mt-auto pt-4 border-t border-gray-700/50 text-xs text-gray-400 flex justify-between items-center">
                      <span className="text-red-400/90 font-medium bg-red-400/10 px-2 py-1 rounded">
                        Closes: {job.closingDate}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium text-gray-400">
            Page <span className="text-emerald-400">{page}</span> of {totalPages}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-4 pr-10">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                    {selectedJob.type}
                  </span>
                  <span className="text-sm text-gray-400">Gazette Date: {selectedJob.gazetteDate}</span>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4">
                  {selectedJob.title}
                </h2>
                
                {selectedJob.department && (
                  <div className="flex items-center gap-2 text-gray-300 mb-6 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                    <Briefcase className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">{selectedJob.department}</span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {selectedJob.description || "No detailed description available."}
                  </p>
                </div>

                {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      Qualifications & Requirements
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside text-gray-200 bg-gray-800/40 p-4 rounded-xl border border-gray-700/40">
                      {selectedJob.qualifications.map((q, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-gray-300">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedJob.closingDate && (
                  <div className="mb-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h3 className="text-sm font-semibold text-red-400 mb-1">Closing Date</h3>
                    <p className="text-lg font-bold text-red-100">{selectedJob.closingDate}</p>
                  </div>
                )}
                
                {selectedJob.gazetteUrl && (
                  <div className="mt-6 flex justify-center">
                    <a 
                      href={selectedJob.gazetteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Official Gazette PDF
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
