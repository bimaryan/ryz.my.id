import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.ryaze.my.id'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { error: e2 } = await supabase.from('links').select('domain_id').limit(1)
    console.log(e2 ? e2.message : "Column domain_id exists")
}

test()
