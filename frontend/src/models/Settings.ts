import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  general: {
    websiteName: string;
    tagline: string;
    adminEmail: string;
    timezone: string;
    siteLanguage: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    globalKeywords: string;
    defaultOgImage: string;
  };
  writing: {
    defaultCategory: string;
    defaultAuthor: string;
    autoSaveInterval: number;
  };
  reading: {
    articlesPerPage: number;
    relatedArticlesCount: number;
  };
  media: {
    maxUploadSize: number;
    allowImages: boolean;
    allowVideos: boolean;
    allowDocuments: boolean;
  };
  discussion: {
    enableComments: boolean;
    commentModeration: boolean;
    spamProtection: boolean;
  };
  appearance: {
    theme: string;
    logo: string;
    favicon: string;
  };
}

const SettingsSchema: Schema = new Schema({
  general: {
    websiteName: { type: String, default: 'ETS Blogs' },
    tagline: { type: String, default: 'The best tech content.' },
    adminEmail: { type: String, default: 'admin@etsblogs.com' },
    timezone: { type: String, default: 'UTC' },
    siteLanguage: { type: String, default: 'en-US' }
  },
  seo: {
    metaTitle: { type: String, default: 'ETS Blogs - Tech & Design' },
    metaDescription: { type: String, default: 'Read about the latest in tech.' },
    globalKeywords: { type: String, default: 'tech, blog, design' },
    defaultOgImage: { type: String, default: '' }
  },
  writing: {
    defaultCategory: { type: String, default: 'Uncategorized' },
    defaultAuthor: { type: String, default: 'Admin' },
    autoSaveInterval: { type: Number, default: 15 }
  },
  reading: {
    articlesPerPage: { type: Number, default: 10 },
    relatedArticlesCount: { type: Number, default: 3 }
  },
  media: {
    maxUploadSize: { type: Number, default: 5 },
    allowImages: { type: Boolean, default: true },
    allowVideos: { type: Boolean, default: true },
    allowDocuments: { type: Boolean, default: true }
  },
  discussion: {
    enableComments: { type: Boolean, default: true },
    commentModeration: { type: Boolean, default: true },
    spamProtection: { type: Boolean, default: true }
  },
  appearance: {
    theme: { type: String, default: 'light' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' }
  }
}, { timestamps: true });

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
