"use client";

import { useState, useEffect } from 'react';
import { 
  Settings, Globe, Edit3, BookOpen, Image as ImageIcon, 
  MessageSquare, Palette, Save, RotateCcw, CheckCircle2,
  UploadCloud, AlertCircle, Loader2
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState<any>({});
  const [savedSettings, setSavedSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setSavedSettings(JSON.parse(JSON.stringify(data.data)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setShowSuccessToast(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();

      if (data.success) {
        setSettings(data.data);
        setSavedSettings(JSON.parse(JSON.stringify(data.data)));
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        setErrorMsg(data.error || 'Failed To Save Changes');
      }
    } catch (err) {
      setErrorMsg('Failed To Save Changes due to a network error.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to discard your unsaved changes?")) {
      setSettings(JSON.parse(JSON.stringify(savedSettings)));
    }
  };

  const uploadToCloudinary = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result })
          });
          const data = await res.json();
          if (data.success) resolve(data.url);
          else reject(data.error);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      try {
        const url = await uploadToCloudinary(file);
        setSettings({
          ...settings,
          seo: { ...settings.seo, defaultOgImage: url }
        });
      } catch (err) {
        setErrorMsg('Failed to upload image to Cloudinary.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const tabs = [
    { id: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'SEO', icon: <Globe className="w-4 h-4" /> },
    { id: 'Writing', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'Reading', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'Media', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'Discussion', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--background)]">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-[var(--border)] bg-white sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-[var(--foreground)] flex items-center gap-3">
              Settings 
              {hasUnsavedChanges && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md uppercase tracking-wider">Unsaved Changes</span>}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Configure your platform preferences and core mechanics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReset} 
              disabled={!hasUnsavedChanges || isSaving}
              className="px-4 py-2 border border-[var(--border)] bg-white text-[var(--foreground)] rounded-lg text-sm font-bold shadow-sm hover:bg-[#FAFAFA] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button 
              onClick={handleSave} 
              disabled={!hasUnsavedChanges || isSaving} 
              className="px-5 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar Nav */}
        <aside className="w-64 border-r border-[var(--border)] bg-white overflow-y-auto shrink-0">
          <nav className="p-4 space-y-1">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-[#FAFAFA] text-[var(--primary)] border border-[var(--border)] shadow-sm' 
                  : 'text-[var(--muted-foreground)] hover:bg-[#FAFAFA] hover:text-[var(--foreground)] border border-transparent'
                }`}
              >
                {tab.icon} {tab.id}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Form Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
          <div className="max-w-3xl bg-white border border-[var(--border)] rounded-2xl shadow-sm p-8">
            
            <h2 className="text-xl font-bold font-heading mb-6 pb-4 border-b border-[var(--border)]">{activeTab} Settings</h2>

            <div className="space-y-6">
              
              {/* GENERAL SETTINGS */}
              {activeTab === 'General' && settings.general && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Website Name</label>
                      <input type="text" value={settings.general.websiteName} onChange={e => setSettings({...settings, general: {...settings.general, websiteName: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Tagline</label>
                      <input type="text" value={settings.general.tagline} onChange={e => setSettings({...settings, general: {...settings.general, tagline: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Admin Email Address</label>
                      <input type="email" value={settings.general.adminEmail} onChange={e => setSettings({...settings, general: {...settings.general, adminEmail: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">This address is used for admin purposes and site notifications.</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Timezone</label>
                      <select value={settings.general.timezone} onChange={e => setSettings({...settings, general: {...settings.general, timezone: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
                        <option value="UTC">UTC (Universal Time)</option>
                        <option value="EST">Eastern Standard Time</option>
                        <option value="PST">Pacific Standard Time</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Site Language</label>
                      <select value={settings.general.siteLanguage} onChange={e => setSettings({...settings, general: {...settings.general, siteLanguage: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
                        <option value="en-US">English (United States)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* SEO SETTINGS */}
              {activeTab === 'SEO' && settings.seo && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Homepage Meta Title</label>
                    <input type="text" value={settings.seo.metaTitle} onChange={e => setSettings({...settings, seo: {...settings.seo, metaTitle: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Homepage Meta Description</label>
                    <textarea rows={4} value={settings.seo.metaDescription} onChange={e => setSettings({...settings, seo: {...settings.seo, metaDescription: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Global Keywords</label>
                    <input type="text" value={settings.seo.globalKeywords} onChange={e => setSettings({...settings, seo: {...settings.seo, globalKeywords: e.target.value}})} placeholder="tech, react, coding..." className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Default Open Graph Image</label>
                    
                    {settings.seo.defaultOgImage ? (
                      <div className="relative group rounded-xl overflow-hidden border border-[var(--border)] h-48 mb-4">
                        <img src={settings.seo.defaultOgImage} alt="OG Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                            Replace Image
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#FAFAFA] transition-colors cursor-pointer group block">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <UploadCloud className="w-6 h-6 text-[var(--muted-foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors" />
                        <p className="text-sm font-bold">Upload default share image</p>
                      </label>
                    )}
                  </div>
                </>
              )}

              {/* WRITING SETTINGS */}
              {activeTab === 'Writing' && settings.writing && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Default Category</label>
                      <select value={settings.writing.defaultCategory} onChange={e => setSettings({...settings, writing: {...settings.writing, defaultCategory: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
                        <option value="Uncategorized">Uncategorized</option>
                        <option value="Web Development">Web Development</option>
                        <option value="AI Integration">AI Integration</option>
                        <option value="Design">Design</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Default Author</label>
                      <select value={settings.writing.defaultAuthor} onChange={e => setSettings({...settings, writing: {...settings.writing, defaultAuthor: e.target.value}})} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
                        <option value="Admin">Admin</option>
                        <option value="Deepak">Deepak</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Auto-save Interval</label>
                      <div className="flex items-center gap-4">
                        <input type="number" min="5" value={settings.writing.autoSaveInterval} onChange={e => setSettings({...settings, writing: {...settings.writing, autoSaveInterval: parseInt(e.target.value) || 0}})} className="w-24 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                        <span className="text-sm text-[var(--muted-foreground)] font-medium">Seconds</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* READING SETTINGS */}
              {activeTab === 'Reading' && settings.reading && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Articles Per Page</label>
                    <div className="flex items-center gap-4">
                      <input type="number" min="1" value={settings.reading.articlesPerPage} onChange={e => setSettings({...settings, reading: {...settings.reading, articlesPerPage: parseInt(e.target.value) || 0}})} className="w-24 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                      <span className="text-sm text-[var(--muted-foreground)] font-medium">articles shown on blog loops</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Related Articles Count</label>
                    <div className="flex items-center gap-4">
                      <input type="number" min="0" value={settings.reading.relatedArticlesCount} onChange={e => setSettings({...settings, reading: {...settings.reading, relatedArticlesCount: parseInt(e.target.value) || 0}})} className="w-24 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                      <span className="text-sm text-[var(--muted-foreground)] font-medium">shown at the bottom of posts</span>
                    </div>
                  </div>
                </>
              )}

              {/* MEDIA SETTINGS */}
              {activeTab === 'Media' && settings.media && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Maximum Upload Size</label>
                    <div className="flex items-center gap-4">
                      <input type="number" min="1" value={settings.media.maxUploadSize} onChange={e => setSettings({...settings, media: {...settings.media, maxUploadSize: parseInt(e.target.value) || 0}})} className="w-24 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[#FAFAFA] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
                      <span className="text-sm text-[var(--muted-foreground)] font-medium">Megabytes (MB)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Allowed File Types</label>
                    <div className="space-y-3 mt-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={settings.media.allowImages} onChange={e => setSettings({...settings, media: {...settings.media, allowImages: e.target.checked}})} className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)] rounded border-[var(--border)]" />
                        <span className="text-sm font-medium">Images (JPG, PNG, WEBP, GIF)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={settings.media.allowVideos} onChange={e => setSettings({...settings, media: {...settings.media, allowVideos: e.target.checked}})} className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)] rounded border-[var(--border)]" />
                        <span className="text-sm font-medium">Videos (MP4, WEBM)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={settings.media.allowDocuments} onChange={e => setSettings({...settings, media: {...settings.media, allowDocuments: e.target.checked}})} className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)] rounded border-[var(--border)]" />
                        <span className="text-sm font-medium">Documents (PDF, DOCX)</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* DISCUSSION SETTINGS */}
              {activeTab === 'Discussion' && settings.discussion && (
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl hover:bg-[#FAFAFA] cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-[var(--foreground)]">Enable Comments</div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Allow visitors to comment on new articles.</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${settings.discussion.enableComments ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setSettings({...settings, discussion: {...settings.discussion, enableComments: !settings.discussion.enableComments}})}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.discussion.enableComments ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl hover:bg-[#FAFAFA] cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-[var(--foreground)]">Comment Moderation</div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Comments must be manually approved before appearing.</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${settings.discussion.commentModeration ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setSettings({...settings, discussion: {...settings.discussion, commentModeration: !settings.discussion.commentModeration}})}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.discussion.commentModeration ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl hover:bg-[#FAFAFA] cursor-pointer transition-colors">
                    <div>
                      <div className="text-sm font-bold text-[var(--foreground)]">Spam Protection</div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Automatically filter known spam comments.</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${settings.discussion.spamProtection ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setSettings({...settings, discussion: {...settings.discussion, spamProtection: !settings.discussion.spamProtection}})}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.discussion.spamProtection ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>
              )}

              {/* APPEARANCE SETTINGS */}
              {activeTab === 'Appearance' && settings.appearance && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Dashboard Theme</label>
                    <div className="flex gap-4">
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="theme" checked={settings.appearance.theme === 'light'} onChange={() => setSettings({...settings, appearance: {...settings.appearance, theme: 'light'}})} className="peer sr-only" />
                        <div className="p-4 border-2 border-[var(--border)] rounded-xl peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)]/5 text-center transition-colors">
                          <div className="w-full h-16 bg-white border border-slate-200 rounded mb-2 shadow-sm"></div>
                          <span className="text-sm font-bold">Light</span>
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input type="radio" name="theme" checked={settings.appearance.theme === 'dark'} onChange={() => setSettings({...settings, appearance: {...settings.appearance, theme: 'dark'}})} className="peer sr-only" />
                        <div className="p-4 border-2 border-[var(--border)] rounded-xl peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)]/5 text-center transition-colors">
                          <div className="w-full h-16 bg-slate-900 border border-slate-700 rounded mb-2 shadow-sm"></div>
                          <span className="text-sm font-bold">Dark</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Site Logo</label>
                      {settings.appearance.logo ? (
                        <div className="relative group rounded-xl overflow-hidden border border-[var(--border)] h-40">
                          <img src={settings.appearance.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                              Replace
                              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsSaving(true);
                                  try {
                                    const url = await uploadToCloudinary(file);
                                    setSettings({...settings, appearance: {...settings.appearance, logo: url}});
                                  } catch (err) {
                                    setErrorMsg('Failed to upload logo.');
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }
                              }} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#FAFAFA] transition-colors cursor-pointer group block h-40">
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsSaving(true);
                                  try {
                                    const url = await uploadToCloudinary(file);
                                    setSettings({...settings, appearance: {...settings.appearance, logo: url}});
                                  } catch (err) {
                                    setErrorMsg('Failed to upload logo.');
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }
                              }} />
                          <ImageIcon className="w-6 h-6 text-[var(--muted-foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors" />
                          <p className="text-sm font-bold">Upload Logo</p>
                        </label>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Favicon</label>
                      {settings.appearance.favicon ? (
                        <div className="relative group rounded-xl overflow-hidden border border-[var(--border)] h-40 flex items-center justify-center bg-[#FAFAFA]">
                          <img src={settings.appearance.favicon} alt="Favicon" className="w-16 h-16 object-contain" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                              Replace
                              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsSaving(true);
                                  try {
                                    const url = await uploadToCloudinary(file);
                                    setSettings({...settings, appearance: {...settings.appearance, favicon: url}});
                                  } catch (err) {
                                    setErrorMsg('Failed to upload favicon.');
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }
                              }} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#FAFAFA] transition-colors cursor-pointer group block h-40">
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsSaving(true);
                                  try {
                                    const url = await uploadToCloudinary(file);
                                    setSettings({...settings, appearance: {...settings.appearance, favicon: url}});
                                  } catch (err) {
                                    setErrorMsg('Failed to upload favicon.');
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }
                              }} />
                          <UploadCloud className="w-6 h-6 text-[var(--muted-foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors" />
                          <p className="text-sm font-bold">Upload Favicon</p>
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* Error Notification Toast */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-bold tracking-wide">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-2 font-bold text-red-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Save Notification Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold tracking-wide">Settings Saved Successfully</span>
        </div>
      )}

    </div>
  );
}
