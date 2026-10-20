import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zwropbskjywvpzaqyrtd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QliePmyF31f-uYMayncEig_tRAbWl7x';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface Publication {
  id?: string;
  pmid: number;
  doi: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  summary: string;
  summarymandm: string;
  samplespecies: string;
  sampletype: string;
  instrument: string;
  enzymes: string;
  lastauthorcity: string;
  lastauthorcountry: string;
  beneluxflag: boolean;
  status: string;
  createdat?: string;
  updatedat?: string;
}

export interface PublicationBatch {
  id?: string;
  batchName: string;
  uploadedAt?: string;
  publicationCount: number;
}

export async function initializeDatabase() {
  try {
    // Check if tables exist
    const { error } = await supabase
      .from('publications')
      .select('count', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Creating publications table...');
      await createTables();
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

export async function createTables() {
  // Tables will be created via Supabase dashboard SQL
  // This is just a reference for what's needed
  const sql = `
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

    CREATE TABLE IF NOT EXISTS publication_batches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      batchName TEXT NOT NULL,
      uploadedAt TIMESTAMP DEFAULT NOW(),
      publicationCount INTEGER,
      createdBy TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_pmid ON publications(pmid);
    CREATE INDEX IF NOT EXISTS idx_city ON publications(lastAuthorCity);
    CREATE INDEX IF NOT EXISTS idx_country ON publications(lastAuthorCountry);
    CREATE INDEX IF NOT EXISTS idx_batchId ON publications(batchId);
  `;
  console.log('SQL for Supabase dashboard:');
  console.log(sql);
}

export async function uploadPublications(
  publications: Publication[],
  batchName: string
): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    // Create batch record
    const { data: batchData, error: batchError } = await supabase
      .from('publication_batches')
      .insert({
        batchName,
        publicationCount: publications.length,
      })
      .select()
      .single();

    if (batchError) throw batchError;

    const batchId = batchData?.id;

    // Prepare publications with batch ID
    const pubsToInsert = publications.map((pub) => ({
      pmid: pub.pmid,
      doi: pub.doi,
      title: pub.title,
      authors: pub.authors,
      year: pub.year,
      journal: pub.journal,
      summary: pub.summary,
      summarymandm: pub.summarymandm,
      samplespecies: pub.samplespecies,
      sampletype: pub.sampletype,
      instrument: pub.instrument,
      enzymes: pub.enzymes,
      lastauthorcity: pub.lastauthorcity,
      lastauthorcountry: pub.lastauthorcountry,
      beneluxflag: pub.beneluxflag,
      status: pub.status,
      batchid: batchId,
    }));

    // Insert publications in chunks to avoid request size limits
    const chunkSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < pubsToInsert.length; i += chunkSize) {
      const chunk = pubsToInsert.slice(i, i + chunkSize);
      const { error: insertError } = await supabase
        .from('publications')
        .insert(chunk);

      if (insertError) {
        console.error('Insert error:', insertError);
        // Continue with next chunk even if this one fails (some duplicates might exist)
        if (insertError.code !== '23505') {
          // 23505 is unique constraint violation
          throw insertError;
        }
      } else {
        insertedCount += chunk.length;
      }
    }

    return { success: true, count: insertedCount };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function getPublications(filters?: {
  city?: string;
  country?: string;
  species?: string;
  sampleType?: string;
}): Promise<Publication[]> {
  try {
    let query = supabase.from('publications').select('*');

    if (filters?.city) {
      query = query.ilike('lastauthorcity', `%${filters.city}%`);
    }
    if (filters?.country) {
      query = query.eq('lastauthorcountry', filters.country);
    }
    if (filters?.species) {
      query = query.ilike('samplespecies', `%${filters.species}%`);
    }
    if (filters?.sampleType) {
      query = query.ilike('sampletype', `%${filters.sampleType}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Fetch error:', error);
    return [];
  }
}

export async function searchPublications(keyword: string): Promise<Publication[]> {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .or(
        `title.ilike.%${keyword}%,summary.ilike.%${keyword}%,sampletype.ilike.%${keyword}%,instrument.ilike.%${keyword}%`
      )
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Search error:', error);
    return [];
  }
}

export async function getPublicationsByBatch(batchId: string): Promise<Publication[]> {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('batchId', batchId);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Fetch batch error:', error);
    return [];
  }
}

export async function getBatches(): Promise<PublicationBatch[]> {
  try {
    const { data, error } = await supabase
      .from('publication_batches')
      .select('*')
      .order('uploadedAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Fetch batches error:', error);
    return [];
  }
}
