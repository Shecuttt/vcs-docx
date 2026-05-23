-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  owner_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create versions table
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  author_id TEXT,
  extracted_text TEXT[],
  storage_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for docx files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('docx-versions', 'docx-versions', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) for public access (POC phase)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert documents" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update documents" ON documents FOR UPDATE USING (true);

CREATE POLICY "Allow public read versions" ON versions FOR SELECT USING (true);
CREATE POLICY "Allow public insert versions" ON versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update versions" ON versions FOR UPDATE USING (true);

-- Storage policies
CREATE POLICY "Allow public read docx-versions" ON storage.objects FOR SELECT USING (bucket_id = 'docx-versions');
CREATE POLICY "Allow public insert docx-versions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'docx-versions');
CREATE POLICY "Allow public update docx-versions" ON storage.objects FOR UPDATE USING (bucket_id = 'docx-versions');
