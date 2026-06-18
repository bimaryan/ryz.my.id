import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    env[match[1]] = match[2]
  }
})

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY'])

async function run() {
  const { data, error } = await supabase.from('plan_limits').select('*')
  console.log('Current data:', data)
  console.log('Error:', error)
  
  if (data && data.length <= 1) {
    // Insert pro and enterprise plans based on the schema:
    // plan_type ('free', 'pro', 'enterprise'), max_links, max_team_members, api_requests_per_month, custom_domains (boolean), storage_gb, analytics_retention_days
    const { data: insertData, error: insertError } = await supabase.from('plan_limits').upsert([
      { plan_type: 'free', max_links: 100, max_team_members: 0, api_requests_per_month: 1000, custom_domains: false, storage_gb: 1, analytics_retention_days: 7 },
      { plan_type: 'pro', max_links: -1, max_team_members: 10, api_requests_per_month: 100000, custom_domains: true, storage_gb: 50, analytics_retention_days: 30 },
      { plan_type: 'enterprise', max_links: -1, max_team_members: 100, api_requests_per_month: 1000000, custom_domains: true, storage_gb: 500, analytics_retention_days: 365 }
    ], { onConflict: 'plan_type' })
    console.log('Insert Data:', insertData)
    console.log('Insert Error:', insertError)
  }
}
run()
