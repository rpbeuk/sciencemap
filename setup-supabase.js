import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import fs from 'fs';

const SUPABASE_URL = 'https://zwropbskjywvpzaqyrtd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_KEY environment variable not set');
  console.error('Usage: SUPABASE_KEY=your_key node setup-supabase.js <excel-file>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTables() {
  console.log('Creating database tables...');
  
  // Note: These need to be run in Supabase SQL editor
  const sql = `
    -- Publications table
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

    -- Publication batches table
    CREATE TABLE IF NOT EXISTS publication_batches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      batchName TEXT NOT NULL,
      uploadedAt TIMESTAMP DEFAULT NOW(),
      publicationCount INTEGER,
      createdBy TEXT
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_pmid ON publications(pmid);
    CREATE INDEX IF NOT EXISTS idx_city ON publications(lastAuthorCity);
    CREATE INDEX IF NOT EXISTS idx_country ON publications(lastAuthorCountry);
    CREATE INDEX IF NOT EXISTS idx_batchId ON publications(batchId);
  `;
  
  console.log('Copy the following SQL and run it in Supabase SQL Editor:');
  console.log('================================================');
  console.log(sql);
  console.log('================================================');
}

async function loadExcelData(filePath) {
  console.log(`\nLoading Excel file: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  console.log(`Loaded ${data.length} publications`);

  // Create batch
  const { data: batchData, error: batchError } = await supabase
    .from('publication_batches')
    .insert({
      batchName: `Initial upload - ${new Date().toISOString()}`,
      publicationCount: data.length,
    })
    .select()
    .single();

  if (batchError) {
    console.error('Error creating batch:', batchError);
    process.exit(1);
  }

  const batchId = batchData.id;
  console.log(`Created batch: ${batchId}`);

  // Transform and insert publications
  const publications = data.map(row => ({
    pmid: row.pmid,
    doi: row.doi || null,
    title: row.title || '',
    authors: row.authors || '',
    year: row.year || null,
    journal: row.journal || '',
    summary: row.summary || '',
    summaryMandM: row.summaryMandM || '',
    sampleSpecies: row['sample species'] || '',
    sampleType: row['sample type'] || '',
    instrument: row.instrument || '',
    enzymes: row.enzymes || '',
    lastAuthorCity: row['Last author city'] || '',
    lastAuthorCountry: row['Last author country'] || '',
    beneluxFlag: row['Benelux Flag'] === 1,
    status: row.Status || '',
    batchId,
  }));

  // Insert in chunks
  const chunkSize = 50;
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < publications.length; i += chunkSize) {
    const chunk = publications.slice(i, i + chunkSize);
    const { error } = await supabase.from('publications').insert(chunk);

    if (error) {
      console.error(`Chunk ${i / chunkSize + 1} error:`, error);
      // Don't fail entirely - some rows might have duplicate PMIDs
      failed += chunk.length;
    } else {
      inserted += chunk.length;
    }

    if ((i / chunkSize + 1) % 5 === 0) {
      console.log(`Progress: ${Math.min(i + chunkSize, publications.length)}/${publications.length}`);
    }
  }

  console.log(`\nUpload complete!`);
  console.log(`Successfully inserted: ${inserted}`);
  console.log(`Failed: ${failed}`);
}

async function main() {
  const excelFile = process.argv[2];

  if (!excelFile) {
    console.error('Usage: SUPABASE_KEY=your_key node setup-supabase.js <excel-file>');
    console.error('\nExample:');
    console.error('  SUPABASE_KEY=eyJ... node setup-supabase.js ./data.xlsx');
    process.exit(1);
  }

  await createTables();
  await loadExcelData(excelFile);
}

main().catch(console.error);
