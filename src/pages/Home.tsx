import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard';
import { FileText, Plus } from 'lucide-react';

export default function Home() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) console.error('Error fetching documents:', error);
    else setDocuments(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const { data, error } = await supabase
      .from('documents')
      .insert([{ title: newTitle }])
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
    } else if (data) {
      navigate(`/document/${data.id}`);
    }
  }

  return (
    <div className="home-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Your Documents</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewInput(true)}
        >
          <Plus size={18} /> New Document
        </button>
      </div>

      {showNewInput && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Document Title (e.g. Skripsi Final)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white'
              }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowNewInput(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No documents found. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
