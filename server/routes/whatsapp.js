import express from "express";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "baileys";
import pino from "pino"; // ✅ Wajib diinstall: npm install pino
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import crypto from "crypto";
import multer from "multer";

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

const router = express.Router();

// Map untuk menyimpan active sessions (di memori)
const activeSessions = new Map();

/**
 * Helper: Format nomor WhatsApp
 */
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned + "@s.whatsapp.net";
}

/**
 * 1. Buat WhatsApp Session Baru
 * POST /api/whatsapp/create-session
 */
router.post("/create-session", async (req, res) => {
  try {
    const { user_id, session_name } = req.body;

    console.log(`[CREATE_SESSION] user_id=${user_id}, session_name=${session_name}`);

    if (!user_id || !session_name) {
      return res.status(400).json({
        success: false,
        error: "user_id dan session_name dibutuhkan",
      });
    }

    // Cek session exist
    const { data: existingSession, error: findError } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("user_id", user_id)
      .eq("session_id", session_name)
      .maybeSingle();

    if (findError) throw findError;

    if (existingSession) {
      console.log(`[CREATE_SESSION] Session sudah ada: ${existingSession.id}`);
      return res.status(400).json({
        success: false,
        error: "Session dengan nama tersebut sudah ada",
      });
    }

    // Insert session baru
    const { data: newSession, error: insertError } = await supabaseAdmin
      .from("whatsapp_sessions")
      .insert({
        user_id: user_id,
        session_id: session_name,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`[CREATE_SESSION] Session baru dibuat: ${newSession.id}`);

    // ✅ FIX: Paksa pembuatan folder 'sessions' jika belum ada di server
    const baseSessionPath = path.resolve('./sessions');
    if (!fs.existsSync(baseSessionPath)) {
      fs.mkdirSync(baseSessionPath, { recursive: true });
      console.log(`[BAILEYS] Folder 'sessions' utama berhasil dibuat.`);
    }

    // Initialize Baileys dengan proper config
    const sessionPath = path.join(baseSessionPath, `${user_id}-${session_name}`);
    console.log(`[BAILEYS] Initializing session di ${sessionPath}`);

    // ✅ FIX: Bersihkan folder sisa jika sebelumnya pernah gagal/nyangkut
    if (fs.existsSync(sessionPath)) {
      console.log(`[BAILEYS] Menghapus folder sisa sesi lama...`);
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }

    const connectToWA = async (isReconnect = false) => {
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      const { version, isLatest } = await fetchLatestBaileysVersion();
      if (!isReconnect) {
        console.log(`[BAILEYS] using WA v${version.join('.')}, isLatest: ${isLatest}`);
      }

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true, 
        logger: pino({ level: 'info' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'], 
        connectTimeoutMs: 60_000,
        defaultQueryTimeoutMs: 60_000,
        keepAliveIntervalMs: 10_000,
        syncFullHistory: false, 
        generateHighQualityLinkPreview: false
      });

      activeSessions.set(newSession.id, { socket: sock, state, saveCreds });

      let qrReceived = false;
      let qrTimeout;
      
      if (!isReconnect) {
        qrTimeout = setTimeout(async () => {
          if (!qrReceived) {
            console.log(`[QR_TIMEOUT] QR tidak muncul dalam 60 detik, disconnect & cleanup`);
            try { await sock.end(); } catch (e) {}
            activeSessions.delete(newSession.id);
          }
        }, 60_000); 
      }

      sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr) {
          qrReceived = true;
          clearTimeout(qrTimeout);
          
          try {
            const qrDataUrl = await QRCode.toDataURL(qr);
            const qrExpires = new Date(Date.now() + 5 * 60 * 1000);

            await supabaseAdmin
              .from("whatsapp_sessions")
              .update({
                qr_code: qrDataUrl,
                qr_expires_at: qrExpires,
                status: "pending",
              })
              .eq("id", newSession.id);
          } catch (err) {
            console.error(`[QR_CODE] ERROR generating QR:`, err);
          }
        }

        if (connection === "close") {
          clearTimeout(qrTimeout);

          const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !==
            DisconnectReason.loggedOut;

          console.log(`[DISCONNECT] shouldReconnect=${shouldReconnect}`);

          if (shouldReconnect) {
            console.log(`[DISCONNECT] Reconnecting...`);
            connectToWA(true);
          } else {
            if (qrReceived) {
              await supabaseAdmin
                .from("whatsapp_sessions")
                .update({ status: "disconnected" })
                .eq("id", newSession.id);
            }
            activeSessions.delete(newSession.id);
            console.log(`[SESSION] User logged out, removing session folder`);
            try {
              fs.rmSync(sessionPath, { recursive: true, force: true });
            } catch (err) {}
          }
        }

        if (connection === "open") {
          console.log(`[CONNECTION] ✅ Connection OPEN - Session connected!`);
          clearTimeout(qrTimeout);

          await supabaseAdmin
            .from("whatsapp_sessions")
            .update({
              status: "connected",
              qr_code: null,
              qr_expires_at: null,
            })
            .eq("id", newSession.id);
        }
      });
      sock.ev.on("messages.upsert", async (m) => {
        try {
          const msg = m.messages[0];
          if (!msg.message || msg.key.fromMe) return;

          const remoteJid = msg.key.remoteJid;
          let textMsg = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
          if (!textMsg) return;

          // 1. Auto Responder
          const { data: autoResponders } = await supabaseAdmin
            .from("whatsapp_autoresponders")
            .select("*")
            .eq("session_id", newSession.id)
            .eq("is_active", true);

          let isHandled = false;

          if (autoResponders && autoResponders.length > 0) {
            for (const rule of autoResponders) {
              if (rule.keyword === '*') continue; // Skip catch-all in normal matching
              
              let isMatch = false;
              const keyword = rule.keyword.toLowerCase();
              const lowerText = textMsg.toLowerCase();

              if (rule.match_type === "exact" && lowerText === keyword) isMatch = true;
              else if (rule.match_type === "contains" && lowerText.includes(keyword)) isMatch = true;
              else if (rule.match_type === "starts_with" && lowerText.startsWith(keyword)) isMatch = true;

              if (isMatch) {
                isHandled = true;
                let finalMessage = rule.reply_message;
                
                // AI Rephrasing to make response sound natural
                try {
                  const groqApiKey = process.env.GROQ_API_KEY;
                  if (groqApiKey) {
                    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${groqApiKey}`
                      },
                      body: JSON.stringify({
                        model: 'llama-3.1-8b-instant',
                        messages: [
                          { 
                            role: 'system', 
                            content: `Anda adalah AI Customer Service WhatsApp. Anda harus merespon pesan secara natural, ramah, dan profesional seperti manusia asli (bukan bot kaku).
Berdasarkan aturan sistem, informasi/inti jawaban yang harus Anda sampaikan adalah: "${rule.reply_message}"

Tugas Anda: 
Jawab pesan pelanggan berikut dengan gaya bahasa yang luwes dan nyambung, namun pastikan pesan inti di atas tetap tersampaikan. 
Jangan tambahkan kalimat pengantar seperti "Tentu" atau "Ini jawabannya", langsung berikan balasan akhirnya saja.`
                          },
                          { role: 'user', content: `Pesan pelanggan: "${textMsg}"` }
                        ],
                        temperature: 0.7,
                        max_tokens: 500,
                      })
                    });
                    const groqData = await groqRes.json();
                    if (groqData.choices && groqData.choices.length > 0) {
                      finalMessage = groqData.choices[0].message.content.trim();
                    }
                  }
                } catch (aiErr) {
                  console.error("[AUTO_RESPONDER] AI Error:", aiErr);
                }

                await sock.sendMessage(remoteJid, { text: finalMessage });
                break; 
              }
            }

            // 1.5 Full AI Bot (Catch-all)
            if (!isHandled) {
              const aiBotRule = autoResponders.find(r => r.keyword === '*');
              if (aiBotRule) {
                try {
                  const groqApiKey = process.env.GROQ_API_KEY;
                  if (groqApiKey) {
                    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${groqApiKey}`
                      },
                      body: JSON.stringify({
                        model: 'llama-3.1-8b-instant',
                        messages: [
                          { 
                            role: 'system', 
                            content: aiBotRule.reply_message // The user's custom system prompt
                          },
                          { role: 'user', content: textMsg }
                        ],
                        temperature: 0.7,
                        max_tokens: 1024,
                      })
                    });
                    const groqData = await groqRes.json();
                    if (groqData.choices && groqData.choices.length > 0) {
                      const finalMessage = groqData.choices[0].message.content.trim();
                      await sock.sendMessage(remoteJid, { text: finalMessage });
                      isHandled = true;
                    }
                  }
                } catch (aiErr) {
                  console.error("[FULL_AI_BOT] AI Error:", aiErr);
                }
              }
            }
          }

          // 2. Webhook
          const { data: webhook } = await supabaseAdmin
            .from("whatsapp_webhooks")
            .select("webhook_url")
            .eq("session_id", newSession.id)
            .eq("is_active", true)
            .maybeSingle();

          if (webhook && webhook.webhook_url) {
            try {
              await fetch(webhook.webhook_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  session_id: newSession.id,
                  message: msg,
                  text: textMsg,
                  from: remoteJid
                })
              });
            } catch (e) {
              console.error("[WEBHOOK] Error forwarding:", e);
            }
          }

        } catch (err) {
          console.error("[MESSAGES_UPSERT] Error:", err);
        }
      });

      sock.ev.on("creds.update", saveCreds);
      sock.ev.on("error", (err) => {
        console.error(`[SOCKET_ERROR]`, err);
      });
    };

    // Start connection
    connectToWA();

    console.log(`[CREATE_SESSION] ✅ Response sent, waiting for QR...`);

    res.json({
      success: true,
      data: {
        session_id: newSession.id,
        message: "Session dibuat. Silakan scan QR Code.",
      },
    });
  } catch (err) {
    console.error("[CREATE_SESSION] ❌ ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. Dapatkan Detail Session
 * GET /api/whatsapp/session/:sessionId
 */
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log(`[GET_SESSION] Fetching session: ${sessionId}`);

    const { data: session, error } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) throw error;

    console.log(`[GET_SESSION] ✅ Session found, status=${session.status}, qr=${session.qr_code ? "YES" : "NO"}`);

    res.json({ success: true, data: session });
  } catch (err) {
    console.error("[GET_SESSION] ❌ ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. Kirim Pesan WhatsApp
 * POST /api/whatsapp/send-message
 */
router.post("/send-message", upload.single('media_file'), async (req, res) => {
  let dbMessage = null;

  try {
    const {
      session_id,
      recipient,
      message_type = "text",
      message_content = "", // text might be empty if it's just audio
      media_url,
      user_id,
    } = req.body;

    console.log(`[SEND_MESSAGE] session_id=${session_id}, recipient=${recipient}`);

    if (!session_id || !recipient || !user_id) {
      return res.status(400).json({
        success: false,
        error: "session_id, user_id, dan recipient dibutuhkan",
      });
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError) throw sessionError;

    if (session.status !== "connected") {
      console.log(`[SEND_MESSAGE] Session not connected: ${session.status}`);
      return res.status(400).json({
        success: false,
        error: "Session tidak terhubung. Silakan scan QR Code ulang.",
      });
    }

    // Save message to DB
    const insertResult = await supabaseAdmin
      .from("whatsapp_messages")
      .insert({
        session_id: session.id,
        user_id: user_id,
        recipient: recipient,
        message_type: message_type,
        message_content: message_content,
        media_url: media_url || null,
        status: "queued",
      })
      .select()
      .single();

    if (insertResult.error) throw insertResult.error;
    dbMessage = insertResult.data;

    console.log(`[SEND_MESSAGE] Message saved to DB: ${dbMessage.id}`);

    // Get or restore session
    let sessionData = activeSessions.get(session.id);

    if (!sessionData) {
      console.log(`[SEND_MESSAGE] Session not in memory, restoring...`);
      const sessionPath = `./sessions/${session.user_id}-${session.session_id}`;
      if (!fs.existsSync(sessionPath)) {
        throw new Error("Sesi lokal tidak ditemukan. Silakan login ulang.");
      }

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      
      const { version } = await fetchLatestBaileysVersion();

      // ✅ Update Config Baileys untuk Pemulihan Sesi agar Konsisten
      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }), // Silent mode saat kirim pesan agar terminal rapi
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        syncFullHistory: false,
        generateHighQualityLinkPreview: false
      });

      sock.ev.on("creds.update", saveCreds);
      sessionData = { socket: sock, state, saveCreds };
      activeSessions.set(session.id, sessionData);

      console.log(`[SEND_MESSAGE] Session restored`);
    }

    // Send message
    const formattedNumber = formatPhoneNumber(recipient);
    console.log(`[SEND_MESSAGE] Formatted number: ${formattedNumber}`);

    const hasFile = req.file && req.file.buffer;

    if (message_type === "text") {
      await sessionData.socket.sendMessage(formattedNumber, {
        text: message_content,
      });
    } else if (message_type === "image") {
      if (hasFile) {
        await sessionData.socket.sendMessage(formattedNumber, { image: req.file.buffer, caption: message_content });
      } else if (media_url) {
        await sessionData.socket.sendMessage(formattedNumber, { image: { url: media_url }, caption: message_content });
      }
    } else if (message_type === "document") {
      if (hasFile) {
        await sessionData.socket.sendMessage(formattedNumber, { document: req.file.buffer, mimetype: req.file.mimetype || "application/octet-stream", fileName: req.file.originalname || "document.pdf", caption: message_content });
      } else if (media_url) {
        await sessionData.socket.sendMessage(formattedNumber, { document: { url: media_url }, mimetype: "application/pdf", fileName: "document.pdf", caption: message_content });
      }
    } else if (message_type === "video") {
      if (hasFile) {
        await sessionData.socket.sendMessage(formattedNumber, { video: req.file.buffer, caption: message_content });
      } else if (media_url) {
        await sessionData.socket.sendMessage(formattedNumber, { video: { url: media_url }, caption: message_content });
      }
    } else if (message_type === "audio") {
      // Baileys requires 'ptt: true' for it to render as a Voice Note
      if (hasFile) {
        await sessionData.socket.sendMessage(formattedNumber, { audio: req.file.buffer, mimetype: req.file.mimetype || "audio/mp4", ptt: true });
      } else if (media_url) {
        await sessionData.socket.sendMessage(formattedNumber, { audio: { url: media_url }, mimetype: 'audio/mp4', ptt: true });
      }
    }

    console.log(`[SEND_MESSAGE] ✅ Message sent`);

    // Update DB status
    await supabaseAdmin
      .from("whatsapp_messages")
      .update({
        status: "sent",
        sent_at: new Date(),
      })
      .eq("id", dbMessage.id);

    res.json({
      success: true,
      data: { message_id: dbMessage.id, status: "sent" },
    });
  } catch (err) {
    console.error("[SEND_MESSAGE] ❌ ERROR:", err);

    if (dbMessage && dbMessage.id) {
      await supabaseAdmin
        .from("whatsapp_messages")
        .update({
          status: "failed",
          error_message: err.message,
        })
        .eq("id", dbMessage.id);
    }

    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. Dapatkan Riwayat Pesan
 * GET /api/whatsapp/messages/:userId
 */
router.get("/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const from = (page - 1) * limit;
    const to = page * limit - 1;

    console.log(`[GET_MESSAGES] userId=${userId}, page=${page}`);

    const {
      data: messages,
      error,
      count,
    } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("*, whatsapp_sessions(session_id)", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    console.log(`[GET_MESSAGES] ✅ Found ${messages.length} messages`);

    res.json({
      success: true,
      data: messages,
      total: count,
      page,
      limit,
    });
  } catch (err) {
    console.error("[GET_MESSAGES] ❌ ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. Dapatkan Semua Session User
 * GET /api/whatsapp/sessions/:userId
 */
router.get("/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`[GET_SESSIONS] userId=${userId}`);

    const { data: sessions, error } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(`[GET_SESSIONS] ✅ Found ${sessions.length} sessions`);

    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error("[GET_SESSIONS] ❌ ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. Hapus Session
 * DELETE /api/whatsapp/session/:sessionId
 */
router.delete("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log(`[DELETE_SESSION] sessionId=${sessionId}`);

    const { data: sessionInfo, error: fetchError } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("user_id, session_id")
      .eq("id", sessionId)
      .single();

    if (fetchError) throw fetchError;

    // Logout & remove from memory
    if (activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      if (session.socket) {
        try {
          await session.socket.logout();
          console.log(`[DELETE_SESSION] Socket logged out`);
        } catch (e) {
          console.error(`[DELETE_SESSION] Logout error:`, e);
        }
      }
      activeSessions.delete(sessionId);
    }

    // Remove local files
    if (sessionInfo) {
      const sessionPath = path.resolve(`./sessions/${sessionInfo.user_id}-${sessionInfo.session_id}`);
      if (fs.existsSync(sessionPath)) {
        try {
          fs.rmSync(sessionPath, { recursive: true, force: true });
          console.log(`[DELETE_SESSION] Local folder removed`);
        } catch (err) {
          console.error(`[DELETE_SESSION] Error removing folder:`, err);
        }
      }
    }

    // Remove from DB
    const { error: deleteError } = await supabaseAdmin
      .from("whatsapp_sessions")
      .delete()
      .eq("id", sessionId);

    if (deleteError) throw deleteError;

    console.log(`[DELETE_SESSION] ✅ Session deleted`);

    res.json({ success: true, message: "Session berhasil dihapus" });
  } catch (err) {
    console.error("[DELETE_SESSION] ❌ ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. WEBHOOKS CRUD
 */
router.get("/webhooks/:sessionId", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("whatsapp_webhooks").select("*").eq("session_id", req.params.sessionId).maybeSingle();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/webhooks", async (req, res) => {
  try {
    const { user_id, session_id, webhook_url, is_active } = req.body;
    
    // Upsert logic
    const { data: existing } = await supabaseAdmin.from("whatsapp_webhooks").select("id").eq("session_id", session_id).maybeSingle();
    
    let result;
    if (existing) {
      result = await supabaseAdmin.from("whatsapp_webhooks").update({ webhook_url, is_active, updated_at: new Date() }).eq("id", existing.id).select().single();
    } else {
      result = await supabaseAdmin.from("whatsapp_webhooks").insert({ user_id, session_id, webhook_url, is_active }).select().single();
    }
    
    if (result.error) throw result.error;
    res.json({ success: true, data: result.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 8. AUTO-RESPONDERS CRUD
 */
router.get("/autoresponders/:sessionId", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("whatsapp_autoresponders").select("*").eq("session_id", req.params.sessionId).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/autoresponders", async (req, res) => {
  try {
    const { user_id, session_id, keyword, match_type, reply_message } = req.body;
    const { data, error } = await supabaseAdmin.from("whatsapp_autoresponders").insert({ user_id, session_id, keyword, match_type, reply_message }).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/autoresponders/:id", async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("whatsapp_autoresponders").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 9. CHECKOUT NOTIFICATION (Public Endpoint for Monetization Blocks)
 */
router.post("/checkout-notify", async (req, res) => {
  try {
    const { page_owner_id, customer_phone, customer_name, product_name, total_price, custom_message_template } = req.body;

    if (!page_owner_id || !customer_phone) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Find active session for this owner
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("user_id", page_owner_id)
      .eq("status", "connected")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (sessionErr || !session) {
      return res.status(404).json({ success: false, error: "No connected WhatsApp session found for this creator." });
    }

    // Format message
    let finalMessage = custom_message_template || "Halo {nama_pembeli}, terima kasih atas pesanan {nama_produk} Anda.";
    finalMessage = finalMessage
      .replace(/{nama_pembeli}/g, customer_name || "Kakak")
      .replace(/{nama_produk}/g, product_name || "Produk")
      .replace(/{total_harga}/g, total_price || "");

    // Restore session if not in memory
    let sessionData = activeSessions.get(session.id);
    if (!sessionData) {
      const fs = (await import("fs")).default;
      const sessionPath = `./sessions/${session.user_id}-${session.session_id}`;
      if (!fs.existsSync(sessionPath)) {
        return res.status(500).json({ success: false, error: "Session local files missing." });
      }
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const { version } = await fetchLatestBaileysVersion();
      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        syncFullHistory: false,
        generateHighQualityLinkPreview: false
      });
      sock.ev.on("creds.update", saveCreds);
      sessionData = { socket: sock, state, saveCreds };
      activeSessions.set(session.id, sessionData);
    }

    const formattedNumber = formatPhoneNumber(customer_phone);
    await sessionData.socket.sendMessage(formattedNumber, { text: finalMessage });

    console.log(`[CHECKOUT_NOTIFY] Sent to ${formattedNumber} for product ${product_name}`);
    res.json({ success: true, message: "Notification sent." });

  } catch (err) {
    console.error("[CHECKOUT_NOTIFY] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 🚀 DEVELOPER API (SAAS) & API KEYS
// ==========================================

router.get("/api-keys/:user_id", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("whatsapp_api_keys").select("*").eq("user_id", req.params.user_id).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api-keys", async (req, res) => {
  try {
    const { user_id, name } = req.body;
    if (!user_id || !name) return res.status(400).json({ success: false, error: "user_id and name required" });
    
    const apiKey = "ryz_" + crypto.randomBytes(24).toString("hex");
    
    const { data, error } = await supabaseAdmin.from("whatsapp_api_keys").insert({ user_id, name, api_key: apiKey }).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api-keys/:id", async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("whatsapp_api_keys").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 📡 PUBLIC DEVELOPER API ENDPOINT
 * Endpoint: POST /api/whatsapp/v1/send-message
 * Headers: { Authorization: "Bearer ryz_..." }
 * Body: { "to": "0812...", "message": "Hello from API!", "session_id": "optional" }
 */
router.post("/v1/send-message", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized. Missing or invalid Bearer Token." });
    }
    const apiKey = authHeader.split(" ")[1];

    // Verify API Key
    const { data: keyData, error: keyError } = await supabaseAdmin.from("whatsapp_api_keys").select("user_id, id").eq("api_key", apiKey).single();
    if (keyError || !keyData) {
      return res.status(401).json({ success: false, error: "Invalid API Key." });
    }

    // Update last_used_at async (don't await)
    supabaseAdmin.from("whatsapp_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyData.id).then();

    const { to, message, media_url, session_id } = req.body;
    if (!to || (!message && !media_url)) {
      return res.status(400).json({ success: false, error: "'to' and ('message' or 'media_url') are required." });
    }

    // Find a connected session
    let query = supabaseAdmin.from("whatsapp_sessions").select("*").eq("user_id", keyData.user_id).eq("status", "connected");
    if (session_id) query = query.eq("session_id", session_id);
    
    const { data: sessions, error: sessionErr } = await query;
    if (sessionErr || !sessions || sessions.length === 0) {
       return res.status(400).json({ success: false, error: "No connected WhatsApp session found." });
    }
    
    const session = sessions[0];
    
    // Restore session if not in memory
    let sessionData = activeSessions.get(session.id);
    if (!sessionData) {
      const fs = (await import("fs")).default;
      const sessionPath = `./sessions/${session.user_id}-${session.session_id}`;
      if (!fs.existsSync(sessionPath)) {
        return res.status(500).json({ success: false, error: "Session local files missing. Please scan QR again." });
      }
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const { version } = await fetchLatestBaileysVersion();
      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        syncFullHistory: false,
        generateHighQualityLinkPreview: false
      });
      sock.ev.on("creds.update", saveCreds);
      sessionData = { socket: sock, state, saveCreds };
      activeSessions.set(session.id, sessionData);
    }

    const sock = sessionData.socket;
    const recipientJid = formatPhoneNumber(to);
    
    let msgOptions = {};
    if (media_url) {
       msgOptions = { image: { url: media_url }, caption: message || "" };
    } else {
       msgOptions = { text: message };
    }

    const sendRes = await sock.sendMessage(recipientJid, msgOptions);
    return res.json({ success: true, message: "Message sent successfully.", data: { to: recipientJid, message_id: sendRes?.key?.id } });
  } catch (err) {
    console.error("[DEV_API_SEND] Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 📇 CONTACT MANAGEMENT
// ==========================================

router.get("/contact-groups/:user_id", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("whatsapp_contact_groups").select("*").eq("user_id", req.params.user_id).order("name", { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/contact-groups", async (req, res) => {
  try {
    const { user_id, name } = req.body;
    if (!user_id || !name) return res.status(400).json({ success: false, error: "user_id and name required" });
    const { data, error } = await supabaseAdmin.from("whatsapp_contact_groups").insert({ user_id, name }).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/contact-groups/:id", async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("whatsapp_contact_groups").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/contacts/:user_id", async (req, res) => {
  try {
    // using eq user_id and selecting group_id
    const { data, error } = await supabaseAdmin
      .from("whatsapp_contacts")
      .select("*, whatsapp_contact_groups(name)")
      .eq("user_id", req.params.user_id)
      .order("name", { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const { user_id, name, phone, group_id } = req.body;
    if (!user_id || !name || !phone) return res.status(400).json({ success: false, error: "user_id, name, and phone required" });
    
    // basic cleanup
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);
    
    const insertData = { user_id, name, phone: cleanPhone };
    if (group_id) insertData.group_id = group_id;

    const { data, error } = await supabaseAdmin.from("whatsapp_contacts").insert(insertData).select().single();
    if (error) {
       if (error.code === '23505') return res.status(400).json({ success: false, error: "Contact with this phone number already exists." });
       throw error;
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/contacts/:id", async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("whatsapp_contacts").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 📢 BROADCAST MANAGEMENT
// ==========================================

router.get("/broadcasts/:session_id", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("whatsapp_broadcasts")
      .select("*")
      .eq("session_id", req.params.session_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/broadcasts", async (req, res) => {
  try {
    const { user_id, session_id, name, message_content, group_id } = req.body;
    if (!user_id || !session_id || !name || !message_content) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const sock = getSession(session_id);
    if (!sock) {
      return res.status(400).json({ success: false, error: "WhatsApp Session is not active" });
    }

    // Fetch targets
    let query = supabaseAdmin.from("whatsapp_contacts").select("phone").eq("user_id", user_id);
    if (group_id) {
      query = query.eq("group_id", group_id);
    }
    const { data: contacts, error: contactErr } = await query;
    if (contactErr) throw contactErr;
    if (!contacts || contacts.length === 0) {
      return res.status(400).json({ success: false, error: "Tidak ada kontak yang ditemukan untuk target ini." });
    }

    // Insert broadcast record
    const { data: broadcast, error: insertErr } = await supabaseAdmin.from("whatsapp_broadcasts").insert({
      user_id,
      session_id,
      name,
      message_content,
      total_recipients: contacts.length,
      status: 'processing'
    }).select().single();
    if (insertErr) throw insertErr;

    // Send response back to user immediately so UI doesn't hang
    res.json({ success: true, data: broadcast });

    // Process broadcast asynchronously
    const processBroadcast = async () => {
      let sentCount = 0;
      let failedCount = 0;

      for (const contact of contacts) {
        try {
          const jid = contact.phone + "@s.whatsapp.net";
          await sock.sendMessage(jid, { text: message_content });
          sentCount++;
          // Random delay between 1-3 seconds to prevent ban
          await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
        } catch (e) {
          failedCount++;
        }
      }

      // Update broadcast record when done
      await supabaseAdmin.from("whatsapp_broadcasts").update({
        sent_count: sentCount,
        failed_count: failedCount,
        status: failedCount === contacts.length ? 'failed' : 'completed',
        updated_at: new Date().toISOString()
      }).eq("id", broadcast.id);
    };

    // Run async without awaiting
    processBroadcast().catch(e => console.error("Broadcast Process Error:", e));

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/broadcasts/:id", async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from("whatsapp_broadcasts").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;