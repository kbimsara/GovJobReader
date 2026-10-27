"use client"

import { useEffect, useState } from "react";
import { fetchSettingsData } from "../actions";
import { Settings as SettingsIcon, Clock, CheckCircle2, XCircle, Database, FileText, ExternalLink } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { getAppUrl, useAppUrl } from "@/lib/paths";

type SyncHistory = {
  targetDate: string;
  lastAttempt: string;
  isComplete: boolean;
  jobsFound: number;
};

type ReadPdf = {
  _id: string;
  date: string;
  name: string;
  pdfUrl: string;
  language?: string;
  sectionTitle?: string;
  jobsExtracted?: number;
  timestampScraped: string;
};

export default function SettingsPage() {
  const [history, setHistory] = useState<SyncHistory[]>([]);
  const [readPdfs, setReadPdfs] = useState<ReadPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const homeUrl = useAppUrl("/");

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = getAppUrl("/");
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSettingsData();
        if (data.history) {
          setHistory(data.history);
          setReadPdfs(data.readPdfs || []);
        } else if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to load settings data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-100 flex flex-col p-8 md:p-12">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <a 
            href={homeUrl}
            onClick={handleHomeClick}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-6 h-6" />
          </a>
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
            <SettingsIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">System Settings</h1>
            <p className="text-emerald-400 font-medium">Scraping History & Processed PDF Registry</p>
          </div>
        </div>

        {/* Sync History Card */}
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-2xl mb-10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            Recent Synchronization History
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No synchronization history found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-4 px-4 text-sm font-semibold text-gray-400">Gazette Date</th>
                    <th className="py-4 px-4 text-sm font-semibold text-gray-400">Last Attempt</th>
                    <th className="py-4 px-4 text-sm font-semibold text-gray-400">Status</th>
                    <th className="py-4 px-4 text-sm font-semibold text-gray-400 text-right">Details Found</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-200">
                        {record.targetDate}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {new Date(record.lastAttempt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        {record.isComplete ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Pending Retry
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-gray-200">
                        {record.jobsFound > 0 ? (
                          <span className="text-emerald-400">{record.jobsFound} items</span>
                        ) : (
                          <span className="text-gray-500">0 items</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Read PDFs Registry */}
        <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Read & Processed PDF Registry ({readPdfs.length})
            </h2>
            <span className="text-xs text-gray-400 bg-gray-900/60 px-3 py-1.5 rounded-full border border-gray-700">
              Late supplement detection enabled
            </span>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            These Gazette PDFs have been read and stored in the database. When the daily sync runs, any newly published PDF on an existing date is automatically identified, extracted by Vision AI, and dispatched to Discord.
          </p>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : readPdfs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No read PDF records found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-4 px-4 text-sm font-semibold text-gray-400">Gazette Date</th>
                    <th className="py-4 px-4 text-sm font-semibold text-gray-400">Document / Section</th>
                    <th className="py-4 px-4 text-sm font-semibold text-gray-400">Processed At</th>
                    <th className="py-4 px-4 text-sm font-semibold text-gray-400 text-right">PDF Link</th>
                  </tr>
                </thead>
                <tbody>
                  {readPdfs.map((pdf) => (
                    <tr key={pdf._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-medium text-emerald-400">
                        {pdf.date}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-200">
                        <div className="font-semibold text-white">
                          {pdf.sectionTitle || pdf.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono truncate max-w-xs">
                          {pdf.name}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400">
                        {pdf.timestampScraped ? new Date(pdf.timestampScraped).toLocaleString() : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {pdf.pdfUrl ? (
                          <a
                            href={pdf.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                          >
                            <span>Open PDF</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-gray-500 text-xs">No URL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
