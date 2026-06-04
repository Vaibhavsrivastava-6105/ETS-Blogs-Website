import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  views: number;
  publishedAt: Date;
}

const ArticleSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  status: { type: String, default: 'Published' },
  views: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;
