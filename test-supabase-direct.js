import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zwropbskjywvpzaqyrtd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QliePmyF31f-uYMayncEig_tRAbWl7x';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testLoad() {
  console.log('Testing Supabase connection...\n');
  
  try {
    const { data, error, status } = await supabase
      .from('publications')
      .select('pmid, title, lastauthorcity, lastauthorcountry')
      .limit(5);
    
    if (error) {
      console.error('❌ Query error:', error);
      console.error('Status:', status);
    } else {
      console.log('✅ Success! Retrieved', data.length, 'publications');
      if (data.length > 0) {
        console.log('\nSample publication:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

await testLoad();
