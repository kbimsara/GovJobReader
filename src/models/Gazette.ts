import mongoose, { Document, Schema } from 'mongoose';

export interface IGazette extends Document {
  date: string;
  name: string;
  pdfUrl: string;
  localPath?: string;
  language?: string;
  sectionTitle?: string;
  jobsExtracted?: number;
  status?: string;
  timestampScraped: Date;
}

const GazetteSchema: Schema = new Schema({
  date: { type: String, required: true, index: true },
  name: { type: String, required: true },
  pdfUrl: { type: String, required: true, index: true },
  localPath: { type: String },
  language: { type: String, default: 'EN' },
  sectionTitle: { type: String },
  jobsExtracted: { type: Number, default: 0 },
  status: { type: String, default: 'PROCESSED' },
  timestampScraped: { type: Date, default: Date.now }
});

GazetteSchema.index({ date: 1, pdfUrl: 1 });
GazetteSchema.index({ date: 1, name: 1 });

export default mongoose.models.Gazette || mongoose.model<IGazette>('Gazette', GazetteSchema);
