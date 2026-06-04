import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDraft extends Document {
  title: string;
  content: string;
  lastSaved: Date;
}

const DraftSchema: Schema = new Schema({
  title: { type: String, default: 'Untitled Draft' },
  content: { type: String, default: '' },
  lastSaved: { type: Date, default: Date.now },
}, { timestamps: true });

const Draft: Model<IDraft> = mongoose.models.Draft || mongoose.model<IDraft>('Draft', DraftSchema);

export default Draft;
