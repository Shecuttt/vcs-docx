import { Link } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';

interface DocumentProps {
  document: {
    id: string;
    title: string;
    updated_at: string;
  };
}

export default function DocumentCard({ document }: DocumentProps) {
  const date = new Date(document.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link to={`/document/${document.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
            <FileText size={24} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>{document.title}</h3>
        </div>
        
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <Clock size={14} />
          <span>Updated {date}</span>
        </div>
      </div>
    </Link>
  );
}
