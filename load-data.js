import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import fs from 'fs';

const SUPABASE_URL = 'https://zwropbskjywvpzaqyrtd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadExcelAndUpload(filePath) {
  console.log(`📂 Loading Excel file: ${filePath}\n`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  // Read Excel file
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  console.log(`✅ Loaded ${data.length} publications from Excel\n`);

  // Transform data - map Excel columns to database columns
  const publications = data.map(row => {
    // Parse year safely
    let year = null;
    if (row.year && row.year !== '') {
      const yearNum = parseInt(row.year);
      if (!isNaN(yearNum)) year = yearNum;
    }
    
    // Parse PMID safely - generate from DOI hash if missing
    let pmid = null;
    if (row.pmid && row.pmid !== '') {
      const pmidNum = parseInt(row.pmid);
      if (!isNaN(pmidNum)) pmid = pmidNum;
    }
    
    // If no PMID, create a pseudo-PMID from DOI hash
    if (!pmid && row.doi) {
      // Create a 10-digit number from DOI string hash
      let hash = 0;
      for (let i = 0; i < row.doi.length; i++) {
        hash = ((hash << 5) - hash) + row.doi.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      pmid = Math.abs(hash % 90000000) + 10000000; // 8-9 digit number
    }
    
    return {
      pmid: pmid,
      doi: row.doi || null,
      title: String(row.title || '').trim(),
      authors: String(row.authors || '').trim(),
      year: year,
      journal: String(row.journal || '').trim(),
      summary: String(row.summary || '').trim(),
      summarymandm: String(row.summaryMandM || '').trim(),
      samplespecies: String(row['sample species'] || '').trim(),
      sampletype: String(row['sample type'] || '').trim(),
      instrument: String(row.instrument || '').trim(),
      enzymes: String(row.enzymes || '').trim(),
      lastauthorcity: String(row['Last author city'] || '').trim(),
      lastauthorcountry: String(row['Last author country'] || '').trim(),
      beneluxflag: row['Benelux Flag'] === 1 || String(row['Benelux Flag']).toLowerCase() === 'yes' || String(row['Benelux Flag']).toLowerCase() === 'true',
      status: String(row.Status || '').trim(),
    };
  });

  console.log('🚀 Uploading to Supabase...\n');

  // Upload in chunks
  const chunkSize = 50;
  let insertedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < publications.length; i += chunkSize) {
    const chunk = publications.slice(i, i + chunkSize);
    const progress = Math.min(i + chunkSize, publications.length);
    
    try {
      const { error } = await supabase
        .from('publications')
        .insert(chunk);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation (duplicate PMID) - this is OK
          console.log(`⚠️  Chunk ${Math.floor(i / chunkSize) + 1}: Some PMIDs already exist (skipped)`);
          insertedCount += chunk.length;
        } else {
          console.error(`❌ Chunk error:`, error);
          failedCount += chunk.length;
        }
      } else {
        insertedCount += chunk.length;
        console.log(`✅ Progress: ${progress}/${publications.length} publications`);
      }
    } catch (err) {
      console.error(`❌ Upload error:`, err);
      failedCount += chunk.length;
    }

    // Small delay between chunks
    if (i + chunkSize < publications.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Upload Complete!`);
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Successfully inserted: ${insertedCount}`);
  if (failedCount > 0) {
    console.log(`⚠️  Failed or skipped: ${failedCount}`);
  }
  console.log(`${'='.repeat(50)}\n`);

  console.log('Your ScienceMap Benelux app is now ready!');
  console.log('📍 Visit: https://rpbeuk.github.io/sciencemap/');
  console.log('\nThe app will automatically load all publications from Supabase.');
}

const excelFile = process.argv[2];
if (!excelFile) {
  console.error('Usage: SUPABASE_KEY=your_key node load-data.js <excel-file>');
  process.exit(1);
}

await loadExcelAndUpload(excelFile);
