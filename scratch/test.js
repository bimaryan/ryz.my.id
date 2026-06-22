import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://supabase.ryaze.my.id',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q'
);

async function checkUsernames() {
  const { data, error } = await supabaseAdmin.from('users').select('username, email');
  console.log("Current Usernames:", data);
}

checkUsernames();
