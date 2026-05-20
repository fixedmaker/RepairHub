import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import { Device } from '../../types';
import { UploadCloud, FileText, File, ExternalLink, X, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DocumentationUploadProps {
  device: Device;
  onUpdate: () => void | Promise<void>;
  readOnly?: boolean;
}

export default function DocumentationUpload({ device, onUpdate, readOnly = false }: DocumentationUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file size (e.g., limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('file melebihi batas 10MB');
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      setErrorMsg('Format file harus berupa Gambar atau PDF');
      return;
    }

    setErrorMsg('');
    setUploading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
      });

      // Send to server
      const response = await api.devices.upload(file.name, file.type, base64);
      
      // Update device in database
      const existingDoc = device.documentation || [];
      const updatedDocs = [...existingDoc, response.url];

      await api.devices.update(device.id, {
        documentation: updatedDocs
      });

      // Call callback to refresh parent
      if (onUpdate) {
        await onUpdate();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mengunggah berkas');
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (indexToDelete: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokumentasi ini?')) {
      try {
        const existingDoc = device.documentation || [];
        const updatedDocs = existingDoc.filter((_, idx) => idx !== indexToDelete);

        await api.devices.update(device.id, {
          documentation: updatedDocs
        });

        if (onUpdate) {
          await onUpdate();
        }
      } catch (err) {
        alert('Gagal menghapus berkas dokumentasi');
      }
    }
  };

  const isPdfFile = (url: string) => {
    return url.toLowerCase().endsWith('.pdf') || url.includes('.pdf');
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const getFileName = (url: string) => {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      // strip unique timestamp prefixes if present
      if (filename.includes('-')) {
        return filename.substring(filename.indexOf('-') + 1);
      }
      return filename;
    } catch (e) {
      return 'Dokumen_Servis';
    }
  };

  const docs = device.documentation || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
          Dokumentasi Servis & Unit
        </h3>
        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold">
          {docs.length} Berkas
        </span>
      </div>

      {/* Docs List */}
      {docs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {docs.map((url, idx) => {
            const isPdf = isPdfFile(url);
            const fileName = getFileName(url);

            return (
              <div
                key={idx}
                className="group relative flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-100 transition-all hover:bg-white"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  isPdf ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                )}>
                  {isPdf ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-xs font-extrabold text-slate-800 truncate font-sans">
                    {fileName}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {isPdf ? 'PDF Dokumen' : 'Gambar / Foto'}
                  </p>
                </div>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <a
                    href={url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="p-1 px-1.5 bg-white border border-slate-100 rounded-lg hover:text-red-500 hover:bg-red-50 text-slate-505 transition-all text-xs flex items-center gap-1 font-bold"
                    title="Buka lampiran"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1 px-1.5 bg-white border border-slate-100 rounded-lg hover:text-red-500 text-slate-505 hover:bg-red-50 transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Zone */}
      {!readOnly && (
        <div className="space-y-2">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerInputClick}
            className={cn(
              "border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px]",
              dragActive 
                ? "border-red-500 bg-red-50/10 scale-[0.99]" 
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={onFileInputChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
            
            {uploading ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Sedang mengunggah berkas...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mx-auto">
                  <UploadCloud className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Geser & Letakkan berkas di sini atau <span className="text-red-500 hover:underline">Pilih File</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Mendukung format Gambar (PNG, JPG) dan PDF up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1 text-red-500 text-[11px] font-bold bg-red-50/50 px-3 py-1.5 rounded-lg border border-red-100">
              <X className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
