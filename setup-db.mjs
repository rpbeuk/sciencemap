const SUPABASE_URL = 'https://zwropbskjywvpzaqyrtd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_KEY environment variable not set');
  process.exit(1);
}

async function executeSql(sql) {
  console.log('🔧 Executing SQL on Supabase...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql })
    });

    const data = await response.json();
    
    if (response.ok || response.status === 201) {
      console.log('✅ SQL executed successfully!');
      return true;
    } else {
      console.log('Response:', data);
      return false;
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
    return false;
  }
}

const sql = `
CREATE TABLE IF NOT EXISTS publication_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batchName TEXT NOT NULL,
  uploadedAt TIMESTAMP DEFAULT NOW(),
  publicationCount INTEGER,
  createdBy TEXT
);

CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pmid INTEGER UNIQUE NOT NULL,
  doi TEXT,
  title TEXT NOT NULL,
  authors TEXT,
  year INTEGER,
  journal TEXT,
  summary TEXT,
  summaryMandM TEXT,
  sampleSpecies TEXT,
  sampleType TEXT,
  instrument TEXT,
  enzymes TEXT,
  lastAuthorCity TEXT,
  lastAuthorCountry TEXT,
  beneluxFlag BOOLEAN DEFAULT false,
  status TEXT,
  batchId UUID,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmid ON publications(pmid);
CREATE INDEX IF NOT EXISTS idx_city ON publications(lastAuthorCity);
CREATE INDEX IF NOT EXISTS idx_country ON publications(lastAuthorCountry);
CREATE INDEX IF NOT EXISTS idx_batchId ON publications(batchId);

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON publications FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON publications FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON publication_batches FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON publication_batches FOR INSERT WITH CHECK (true);
`;

const success = await executeSql(sql);

if (!success) {
  console.log('\n⚠️  Could not execute via API. Please run manually:');
  console.log('1. Go to: https://zwropbskjywvpzaqyrtd.supabase.co/project/default/sql');
  console.log('2. Click "New Query"');
  console.log('3. Copy and paste the SQL from SUPABASE_SETUP.sql');
  console.log('4. Click "Run"');
  process.exit(1);
}

console.log('\n✅ Database tables created successfully!');
console.log('Next: Ready to load publication data...\n');
