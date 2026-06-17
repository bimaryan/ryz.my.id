import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.ryaze.my.id'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: links, error: linksErr } = await supabase.from('links').select('*').limit(1)
  if (linksErr) {
    console.error('Error fetching links:', linksErr)
    return
  }
  
  if (!links || links.length === 0) {
    console.log('No links found')
    return
  }
  
  const linkId = links[0].id
  console.log('Testing update on link:', linkId)
  
  const { error: updateErr } = await supabase.from('links').update({ clicks_count: 99 }).eq('id', linkId)
  console.log('Update error:', updateErr)
  
  console.log('Testing insert to analytics')
  const { error: insertErr } = await supabase.from('analytics').insert([{
    link_id: linkId,
    referrer: 'direct',
    device_type: 'desktop'
  }])
  console.log('Insert error:', insertErr)
}

test()
