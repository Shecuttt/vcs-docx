import { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import * as mammoth from 'mammoth';
import { supabase } from '../utils/supabase';

interface UploadZoneProps {
  documentId: string;
  onUploadComplete: () => void;
}

export default function UploadZone({ documentId, onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      alert('Please upload a .docx file');
      return;
    }

    setUploading(true);
    try {
      // 1. Extract text using mammoth
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      // Split by double newline to get paragraphs, filter out empty ones
      const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

      // 2. Get current version number
      const { data: versions } = await supabase
        .from('versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      // 3. Upload file to Supabase Storage
      const timestamp = new Date().getTime();
      const filePath = `${documentId}/v${nextVersion}_${timestamp}.docx`;
      
      const { error: storageError } = await supabase.storage
        .from('docx-versions')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // 4. Save version record to DB
      const { error: dbError } = await supabase
        .from('versions')
        .insert([{
          document_id: documentId,
          version_number: nextVersion,
          extracted_text: paragraphs,
          storage_url: filePath
        }]);

      if (dbError) throw dbError;

      onUploadComplete();
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div 
      className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        accept=".docx" 
        style={{ display: 'none' }} 
        onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
      />
      
      <UploadCloud className="icon" />
      <h3>{uploading ? 'Processing & Uploading...' : 'Upload new version'}</h3>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        Drag and drop a .docx file here, or click to browse
      </p>
    </div>
  );
}
