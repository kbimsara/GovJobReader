import mongoose, { Schema, Document } from "mongoose";

export interface ISyncState extends Document {
  targetDate: string; // The date of the gazette being tracked (e.g. "2026-10-02")
  isComplete: boolean; // True if we successfully got data for this date
  lastAttempt: Date; // When we last tried
}

const SyncStateSchema = new Schema<ISyncState>({
  targetDate: { type: String, required: true, unique: true },
  isComplete: { type: Boolean, default: false },
  lastAttempt: { type: Date, default: Date.now }
});

export default mongoose.models.SyncState || mongoose.model<ISyncState>("SyncState", SyncStateSchema);
