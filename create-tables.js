import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zwropbskjywvpzaqyrtd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTablesAndLoadData() {
  try {
    console.log('Creating database tables...');

    // Create tables using raw SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
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
          batchId UUID REFERENCES publication_batches(id),
          createdAt TIMESTAMP DEFAULT NOW(),
          updatedAt TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_pmid ON publications(pmid);
        CREATE INDEX IF NOT EXISTS idx_city ON publications(lastAuthorCity);
        CREATE INDEX IF NOT EXISTS idx_country ON publications(lastAuthorCountry);
        CREATE INDEX IF NOT EXISTS idx_batchId ON publications(batchId);

        ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE publication_batches ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Enable read access for all users" ON publications FOR SELECT USING (true);
        CREATE POLICY "Enable insert for authenticated users" ON publications FOR INSERT WITH CHECK (true);
        CREATE POLICY "Enable read access for all users" ON publication_batches FOR SELECT USING (true);
        CREATE POLICY "Enable insert for authenticated users" ON publication_batches FOR INSERT WITH CHECK (true);
      `
    });

    if (createError) {
      console.log('Note: exec_sql function may not exist. Using alternative approach...');
      console.log('Please run the SQL manually in Supabase dashboard.');
      return;
    }

    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('Setup error:', error);
    console.log('\n⚠️  IMPORTANT: Run this SQL manually in Supabase SQL Editor:');
    console.log('================================================');
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
      batchId UUID REFERENCES publication_batches(id),
      createdAt TIMESTAMP DEFAULT NOW(),
      updatedAt TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_pmid ON publications(pmid);
    CREATE INDEX IF NOT EXISTS idx_city ON publications(lastAuthorCity);
    CREATE INDEX IF NOT EXISTS idx_country ON publications(lastAuthorCountry);
    CREATE INDEX IF NOT EXISTS idx_batchId ON publications(batchId);

    ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE publication_batches ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Enable read access for all users" ON publications FOR SELECT USING (true);
    CREATE POLICY "Enable insert for authenticated users" ON publications FOR INSERT WITH CHECK (true);
    CREATE POLICY "Enable read access for all users" ON publication_batches FOR SELECT USING (true);
    CREATE POLICY "Enable insert for authenticated users" ON publication_batches FOR INSERT WITH CHECK (true);
    `);
    console.log('================================================');
    process.exit(1);
  }
}

createTablesAndLoadData();
