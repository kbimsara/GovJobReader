import mongoose, { Schema, Document } from "mongoose";

export interface IExtractedJob extends Document {
  gazetteDate: string;
  sourcePdf: string;
  type: string; // 'Vacancy', 'Examination', 'Result'
  title: string;
  description: string;
  department: string;
  closingDate?: string;
  qualifications?: string[];
  pageNumber?: number;
  extractedAt: Date;
}

const ExtractedJobSchema: Schema = new Schema({
  gazetteDate: { type: String, required: true },
  sourcePdf: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  department: { type: String },
  closingDate: { type: String },
  qualifications: { type: [String], default: [] },
  pageNumber: { type: Number },
  extractedAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError
export default mongoose.models.ExtractedJob ||
  mongoose.model<IExtractedJob>("ExtractedJob", ExtractedJobSchema);
