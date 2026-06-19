import { createClient } from '@supabase/supabase-js';
import dns2 from 'dns2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const { Packet } = dns2;

const server = dns2.createServer({
  udp: true,
  tcp: true,
  handle: async (request, send, rinfo) => {
    const response = Packet.createResponseFromRequest(request);
    const [ question ] = request.questions;
    
    if (!question) {
      return send(response);
    }

    const { name } = question; // e.g. sub.domain.com
    console.log(`[DNS] Received query for ${name} (Type: ${question.type}) from ${rinfo.address}:${rinfo.port}`);

    try {
      // 1. Fetch all domains (to match the suffix)
      const { data: domains, error: domainError } = await supabase
        .from('custom_domains')
        .select('id, domain');

      if (domainError) throw domainError;

      let matchedDomain = null;
      let recordName = null;

      // 2. Find the longest matching domain
      for (const d of domains || []) {
        if (name === d.domain) {
          matchedDomain = d;
          recordName = '@';
          break;
        } else if (name.endsWith(`.${d.domain}`)) {
          matchedDomain = d;
          recordName = name.slice(0, -(d.domain.length + 1));
          break;
        }
      }

      if (matchedDomain) {
        // 3. Fetch DNS records for this exact domain & recordName
        const { data: records, error: recordsError } = await supabase
          .from('dns_records')
          .select('*')
          .eq('domain_id', matchedDomain.id)
          .eq('name', recordName);

        if (!recordsError && records && records.length > 0) {
          records.forEach(rec => {
            // Type matches
            if (rec.type === 'A' && question.type === Packet.TYPE.A) {
              response.answers.push({
                name,
                type: Packet.TYPE.A,
                class: Packet.CLASS.IN,
                ttl: rec.ttl || 60,
                address: rec.value
              });
            } else if (rec.type === 'CNAME' && (question.type === Packet.TYPE.CNAME || question.type === Packet.TYPE.A)) {
              // If it's a CNAME but they asked for A, we return the CNAME. 
              // A real resolver will then follow the CNAME.
              response.answers.push({
                name,
                type: Packet.TYPE.CNAME,
                class: Packet.CLASS.IN,
                ttl: rec.ttl || 60,
                domain: rec.value
              });
            } else if (rec.type === 'MX' && question.type === Packet.TYPE.MX) {
              response.answers.push({
                name,
                type: Packet.TYPE.MX,
                class: Packet.CLASS.IN,
                ttl: rec.ttl || 60,
                priority: rec.priority || 10,
                exchange: rec.value
              });
            } else if (rec.type === 'TXT' && question.type === Packet.TYPE.TXT) {
              response.answers.push({
                name,
                type: Packet.TYPE.TXT,
                class: Packet.CLASS.IN,
                ttl: rec.ttl || 60,
                data: rec.value
              });
            }
          });
        } else {
          console.log(`[DNS] No matching records found for ${recordName} under ${matchedDomain.domain}`);
        }
      } else {
         console.log(`[DNS] Domain not recognized by RYZ system: ${name}`);
      }

      send(response);
    } catch (err) {
      console.error("[DNS Error]", err);
      send(response);
    }
  }
});

server.on('requestError', (error) => {
  console.log('Client sent an invalid request', error);
});

server.on('listening', () => {
  console.log('✅ RYZ DNS Server is listening on UDP & TCP Port 53');
  console.log('⏳ Waiting for requests from the global internet...');
});

server.on('close', () => {
  console.log('Server closed');
});

const PORT = 53;
server.listen({
  udp: PORT,
  tcp: PORT,
  ipv4: '0.0.0.0'
});
