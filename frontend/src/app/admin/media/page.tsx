"use client";

import React, { useState } from 'react';
import { 
  Image as ImageIcon, UploadCloud, Search, Filter, 
  Trash2, Download, Copy, Eye, Video, FileText, X,
  AlertTriangle, Play
} from 'lucide-react';

export default function AdminMediaPage() {
  // Mock media library data
  const [media, setMedia] = useState([
    { id: '1', name: 'hero-banner-2026.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', size: '2.4 MB', date: 'Oct 14, 2026' },
    { id: '2', name: 'react-components-guide.mp4', type: 'video', url: '#', size: '14.2 MB', date: 'Oct 12, 2026' },
    { id: '3', name: 'system-architecture.pdf', type: 'document', url: '#', size: '850 KB', date: 'Oct 10, 2026' },
    { id: '4', name: 'profile-placeholder.png', type: 'image', url: 'https://images.unsplash.com/photo-1531297172864-822d1fe12117', size: '1.1 MB', date: 'Oct 09, 2026' },
    { id: '5', name: 'dashboard-mockup-v2.webp', type: 'image', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', size: '3.5 MB', date: 'Oct 05, 2026' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Hidden input ref for manual selection
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    return new Promise<{url: string, size: number}>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result })
          });
          const data = await res.json();
          if (data.success) resolve({ url: data.url, size: file.size });
          else reject(data.error);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    setIsUploading(true);
    const newMedia: any[] = [];
    for (const file of Array.from(files)) {
      try {
        const { url, size } = await uploadToCloudinary(file);
        const formatSize = (bytes: number) => {
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        };
        const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('application/') ? 'document' : 'image';
        
        newMedia.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type,
          url,
          size: formatSize(size),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        });
      } catch (e) {
        alert('Failed to upload ' + file.name);
      }
    }
    if (newMedia.length > 0) {
      setMedia((prev) => [...newMedia, ...prev]);
    }
    setIsUploading(false);
  };
  
  // Preview Modal
  const [previewMedia, setPreviewMedia] = useState<any>(null);

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || item.type === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this file permanently?")) {
      setMedia(media.filter(m => m.id !== id));
      if (previewMedia?.id === id) setPreviewMedia(null);
    }
  };

  const handleCopyLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const getIconForType = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-8 h-8 text-[var(--muted-foreground)]" />;
    if (type === 'video') return <Video className="w-8 h-8 text-[var(--muted-foreground)]" />;
    return <FileText className="w-8 h-8 text-[var(--muted-foreground)]" />;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] flex flex-col min-h-screen">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-[var(--border)] bg-white sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-[var(--foreground)]">Media Library</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage images, videos, and documents used in your content.</p>
          </div>
          <button onClick={handleUploadClick} disabled={isUploading} className="flex items-center gap-2 bg-[var(--foreground)] text-[var(--background)] px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all disabled:opacity-50">
            <UploadCloud className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} 
            className="hidden" 
            multiple 
            accept="image/*,video/*,application/pdf" 
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input 
              type="text" 
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[#FAFAFA]"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
            >
              <option value="All">All Media Types</option>
              <option value="Image">Images</option>
              <option value="Video">Videos</option>
              <option value="Document">Documents</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">

        {/* Drag & Drop Upload Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          className={`mb-8 border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragging ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] bg-white hover:bg-[#FAFAFA]'
          }`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
            isDragging ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
          }`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
            {isUploading ? 'Uploading files...' : 'Drag and drop files here'}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] max-w-sm">Support for Images (JPEG, PNG, WEBP), Videos (MP4), and Documents (PDF) up to 20MB.</p>
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-12 h-12 text-[var(--border)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">No media found</h3>
            <p className="text-[var(--muted-foreground)]">Try adjusting your filters or upload new files.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMedia.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--primary)] transition-all cursor-pointer group flex flex-col"
                onClick={() => setPreviewMedia(item)}
              >
                {/* Thumbnail Area */}
                <div className="h-40 bg-[#FAFAFA] border-b border-[var(--border)] relative flex items-center justify-center overflow-hidden">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    getIconForType(item.type)
                  )}
                  
                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewMedia(item); }} className="w-8 h-8 bg-white text-[var(--foreground)] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm" title="Preview">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => handleCopyLink(item.url, e)} className="w-8 h-8 bg-white text-[var(--foreground)] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm" title="Copy URL">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Meta Area */}
                <div className="p-3 flex flex-col flex-1">
                  <div className="font-semibold text-sm text-[var(--foreground)] truncate mb-1" title={item.name}>{item.name}</div>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{item.type}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewMedia(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col sm:flex-row h-full max-h-[800px]" onClick={e => e.stopPropagation()}>
            
            {/* Media Viewer Area */}
            <div className="flex-1 bg-[#FAFAFA] flex items-center justify-center relative overflow-hidden group/viewer border-b sm:border-b-0 sm:border-r border-[var(--border)]">
              {previewMedia.type === 'image' && (
                <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-full object-contain" />
              )}
              {previewMedia.type === 'video' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] bg-black/5">
                  <Play className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-bold">Video Preview Placeholder</p>
                </div>
              )}
              {previewMedia.type === 'document' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                  <FileText className="w-20 h-20 mb-4 opacity-50 text-[var(--primary)]" />
                  <p className="font-bold text-lg text-[var(--foreground)]">{previewMedia.name}</p>
                  <p className="text-sm">Document Preview Not Available</p>
                </div>
              )}
            </div>

            {/* Sidebar Details Area */}
            <div className="w-full sm:w-80 bg-white flex flex-col shrink-0">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-bold font-heading text-lg">File Details</h3>
                <button onClick={() => setPreviewMedia(null)} className="p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">File Name</label>
                  <p className="font-semibold text-sm break-all">{previewMedia.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">File Type</label>
                    <p className="font-semibold text-sm capitalize">{previewMedia.type}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">File Size</label>
                    <p className="font-semibold text-sm">{previewMedia.size}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Uploaded On</label>
                    <p className="font-semibold text-sm">{previewMedia.date}</p>
                  </div>
                </div>

                <div className="h-px bg-[var(--border)]"></div>

                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">File URL</label>
                  <div className="flex">
                    <input type="text" readOnly value={previewMedia.url} className="w-full px-3 py-2 text-xs border border-[var(--border)] rounded-l-lg bg-[#FAFAFA] focus:outline-none" />
                    <button onClick={(e) => handleCopyLink(previewMedia.url, e)} className="px-3 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-r-lg border border-[var(--foreground)] hover:opacity-90">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[var(--border)] bg-[#FAFAFA] flex flex-col gap-3">
                <button className="w-full px-4 py-2.5 rounded-lg text-sm font-bold bg-white border border-[var(--border)] hover:bg-[#FAFAFA] transition-colors flex justify-center items-center gap-2">
                  <Download className="w-4 h-4" /> Download File
                </button>
                <button onClick={(e) => handleDelete(previewMedia.id, e)} className="w-full px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex justify-center items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete File
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
