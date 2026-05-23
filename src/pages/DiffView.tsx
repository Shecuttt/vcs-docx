import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { ArrowLeft } from 'lucide-react';
import * as Diff from 'diff';
import ParagraphDiff from '../components/ParagraphDiff';

export default function DiffView() {
  const { id, v1, v2 } = useParams<{ id: string; v1: string; v2: string }>();
  const [loading, setLoading] = useState(true);
  const [docTitle, setDocTitle] = useState('');
  const [versionData, setVersionData] = useState<{ v1: any; v2: any } | null>(null);
  const [diffPairs, setDiffPairs] = useState<{ p1: string; p2: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      const { data: doc } = await supabase.from('documents').select('title').eq('id', id).single();
      if (doc) setDocTitle(doc.title);

      const { data: versions } = await supabase
        .from('versions')
        .select('*')
        .in('id', [v1, v2]);

      if (versions && versions.length === 2) {
        // Ensure vA is older, vB is newer
        const vA = versions[0].version_number < versions[1].version_number ? versions[0] : versions[1];
        const vB = versions[0].version_number > versions[1].version_number ? versions[0] : versions[1];
        
        setVersionData({ v1: vA, v2: vB });
        calculateDiff(vA.extracted_text || [], vB.extracted_text || []);
      }
      setLoading(false);
    }
    loadData();
  }, [id, v1, v2]);

  const calculateDiff = (text1: string[], text2: string[]) => {
    const changes = Diff.diffArrays(text1, text2);
    const pairs: { p1: string; p2: string }[] = [];
    
    let i = 0;
    while (i < changes.length) {
      const current = changes[i];
      const next = i + 1 < changes.length ? changes[i + 1] : null;

      if (current.removed && next && next.added) {
        // Zip the removed and added arrays
        const maxLen = Math.max(current.value.length, next.value.length);
        for (let j = 0; j < maxLen; j++) {
          pairs.push({
            p1: current.value[j] || '',
            p2: next.value[j] || ''
          });
        }
        i += 2;
      } else if (current.added) {
        current.value.forEach((v: string) => pairs.push({ p1: '', p2: v }));
        i++;
      } else if (current.removed) {
        current.value.forEach((v: string) => pairs.push({ p1: v, p2: '' }));
        i++;
      } else {
        // Unchanged
        current.value.forEach((v: string) => pairs.push({ p1: v, p2: v }));
        i++;
      }
    }
    setDiffPairs(pairs);
  };

  if (loading) return <div>Calculating diff...</div>;
  if (!versionData) return <div>Failed to load versions.</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/document/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Document
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Comparing Versions</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {docTitle} — Version {versionData.v1.version_number} vs Version {versionData.v2.version_number}
        </p>
      </div>

      <div className="diff-container">
        {diffPairs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No text available to compare.</p>
        ) : (
          diffPairs.map((pair, idx) => (
            <ParagraphDiff key={idx} p1={pair.p1} p2={pair.p2} />
          ))
        )}
      </div>
    </div>
  );
}
