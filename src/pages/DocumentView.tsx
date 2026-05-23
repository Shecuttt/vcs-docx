import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import UploadZone from '../components/UploadZone';
import { ArrowLeft, Clock, GitCompare } from 'lucide-react';

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const fetchDocumentAndVersions = async () => {
    if (!id) return;
    setLoading(true);
    
    // Fetch document
    const { data: docData } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (docData) setDocument(docData);

    // Fetch versions
    const { data: verData } = await supabase
      .from('versions')
      .select('id, version_number, created_at, storage_url')
      .eq('document_id', id)
      .order('version_number', { ascending: false });
      
    if (verData) setVersions(verData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocumentAndVersions();
  }, [id]);

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) return prev.filter(v => v !== versionId);
      if (prev.length >= 2) return [prev[1], versionId];
      return [...prev, versionId];
    });
  };

  if (loading) return <div>Loading document...</div>;
  if (!document) return <div>Document not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{document.title}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Version History</h2>
            {selectedVersions.length === 2 && (
              <Link 
                to={`/document/${id}/diff/${selectedVersions[0]}/${selectedVersions[1]}`}
                className="btn btn-primary"
              >
                <GitCompare size={16} /> Compare Selected
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {versions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No versions uploaded yet.</p>
            ) : (
              versions.map((ver) => (
                <div 
                  key={ver.id} 
                  className="card"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    border: selectedVersions.includes(ver.id) ? '2px solid var(--accent-primary)' : '',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleVersionSelection(ver.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', height: '40px', 
                      borderRadius: '50%', 
                      background: 'var(--surface-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', color: 'var(--accent-primary)'
                    }}>
                      v{ver.version_number}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Version {ver.version_number}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {new Date(ver.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <input 
                      type="checkbox" 
                      checked={selectedVersions.includes(ver.id)} 
                      onChange={() => {}} // Handled by parent div onClick
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div style={{ position: 'sticky', top: '2rem' }}>
            <UploadZone documentId={document.id} onUploadComplete={fetchDocumentAndVersions} />
          </div>
        </div>
      </div>
    </div>
  );
}
