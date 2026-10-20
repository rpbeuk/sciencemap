import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zwropbskjywvpzaqyrtd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_KEY environment variable not set');
  process.exit(1);
}

async function createTables() {
  console.log('🔧 Creating Supabase tables and policies...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false
      }
    });

    // Test connection first
    console.log('Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (testError && testError.code !== 'PGRST116') {
      console.log('✅ Supabase connected!\n');
    }

    // Create publication_batches table
    console.log('Creating publication_batches table...');
    try {
      const { error: e1 } = await supabase.from('publication_batches').select('id').limit(1);
      if (e1?.code === 'PGRST116') {
        // Table doesn't exist, we can infer it needs to be created
        console.log('⚠️  Table doesn\'t exist yet - will be created on first insert');
      }
    } catch (e) {
      console.log(`Note: ${e.message}`);
    }

    // Create publications table
    console.log('Creating publications table...');
    try {
      const { error: e2 } = await supabase.from('publications').select('id').limit(1);
      if (e2?.code === 'PGRST116') {
        console.log('⚠️  Table doesn\'t exist yet - will be created on first insert');
      }
    } catch (e) {
      console.log(`Note: ${e.message}`);
    }

    console.log('\n⚠️  IMPORTANT: The Supabase client can\'t create tables directly.');
    console.log('Please run the SQL manually in the Supabase dashboard:');
    console.log('https://zwropbskjywvpzaqyrtd.supabase.co/project/default/sql\n');
    console.log('Copy and paste this SQL:\n');
    console.log(`
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
    `);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

await createTables();
