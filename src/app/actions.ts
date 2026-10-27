"use server"

import { connectToDatabase } from "@/lib/db";
import ExtractedJob from "@/models/ExtractedJob";
import Gazette from "@/models/Gazette";
import SyncState from "@/models/SyncState";

export async function fetchJobs(
  type: string = 'all', 
  page: number = 1, 
  limit: number = 10,
  search: string = ''
) {
  await connectToDatabase();

  const query: any = {};
  if (type !== 'all') {
    // Map tab ids to DB values
    const typeMap: Record<string, string> = {
      'vacancies': 'Vacancy',
      'examinations': 'Examination',
      'results': 'Result'
    };
    query.type = typeMap[type] || type;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const total = await ExtractedJob.countDocuments(query);
  const jobs: any = await ExtractedJob.find(query)
    .sort({ extractedAt: -1, gazetteDate: -1 }) // latest first
    .skip(skip)
    .limit(limit)
    .lean();

  // Attach PDF URL from Gazette model
  const pdfNames = [...new Set(jobs.map((j: any) => j.sourcePdf))];
  const gazettes = await Gazette.find({ name: { $in: pdfNames } }).lean();
  const pdfMap = gazettes.reduce((acc: any, g: any) => {
    acc[g.name] = g.pdfUrl;
    return acc;
  }, {});

  for (const job of jobs) {
    job.gazetteUrl = pdfMap[job.sourcePdf] || undefined;
  }

  return {
    jobs: JSON.parse(JSON.stringify(jobs)), // serialize for Client Component
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function fetchSettingsData() {
  await connectToDatabase();
  
  const syncHistory = await SyncState.find().sort({ targetDate: -1 }).limit(10).lean();
  const readGazettes = await Gazette.find().sort({ date: -1, timestampScraped: -1 }).limit(30).lean();
  
  // Get job counts per date
  const counts = await ExtractedJob.aggregate([
    { $group: { _id: "$gazetteDate", count: { $sum: 1 } } }
  ]);
  
  const countMap = counts.reduce((acc: any, curr: any) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const formattedHistory = syncHistory.map((s: any) => ({
    targetDate: s.targetDate,
    lastAttempt: s.lastAttempt,
    isComplete: s.isComplete,
    jobsFound: countMap[s.targetDate] || 0
  }));

  return {
    history: JSON.parse(JSON.stringify(formattedHistory)),
    readPdfs: JSON.parse(JSON.stringify(readGazettes))
  };
}
