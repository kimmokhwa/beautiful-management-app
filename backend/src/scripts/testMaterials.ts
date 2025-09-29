import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Checking materials table...');
    
    // 1. Count total materials
    const { count, error: countError } = await supabase
      .from('materials')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count error:', countError);
    } else {
      console.log(`📊 Total materials count: ${count}`);
    }

    // 2. Get first 5 materials
    const { data: materials, error: dataError } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (dataError) {
      console.error('❌ Data fetch error:', dataError);
    } else {
      console.log(`📋 First 5 materials:`, materials);
    }

    // 3. Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('materials')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Table structure error:', tableError);
    } else if (tableInfo && tableInfo.length > 0) {
      console.log(`🏗️ Table structure (first row):`, Object.keys(tableInfo[0]));
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Script error:', err instanceof Error ? err.message : err);
    process.exit(2);
  }
}

main();
