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

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

          if (autoResponders && autoResponders.length > 0) {
            for (const rule of autoResponders) {
              let isMatch = false;
              const keyword = rule.keyword.toLowerCase();
              const lowerText = textMsg.toLowerCase();

              if (rule.match_type === "exact" && lowerText === keyword) isMatch = true;
              else if (rule.match_type === "contains" && lowerText.includes(keyword)) isMatch = true;
              else if (rule.match_type === "starts_with" && lowerText.startsWith(keyword)) isMatch = true;

              if (isMatch) {
                await sock.sendMessage(remoteJid, { text: rule.reply_message });
                break; 
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
router.post("/send-message", async (req, res) => {
  let dbMessage = null;

  try {
    const {
      session_id,
      recipient,
      message_type = "text",
      message_content,
      media_url,
      user_id,
    } = req.body;

    console.log(`[SEND_MESSAGE] session_id=${session_id}, recipient=${recipient}`);

    if (!session_id || !recipient || !message_content || !user_id) {
      return res.status(400).json({
        success: false,
        error: "session_id, user_id, recipient, dan message_content dibutuhkan",
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

    if (message_type === "text") {
      await sessionData.socket.sendMessage(formattedNumber, {
        text: message_content,
      });
    } else if (message_type === "image" && media_url) {
      await sessionData.socket.sendMessage(formattedNumber, {
        image: { url: media_url },
        caption: message_content,
      });
    } else if (message_type === "document" && media_url) {
      await sessionData.socket.sendMessage(formattedNumber, {
        document: { url: media_url },
        mimetype: "application/pdf",
        fileName: "document.pdf",
        caption: message_content,
      });
    } else if (message_type === "video" && media_url) {
      await sessionData.socket.sendMessage(formattedNumber, {
        video: { url: media_url },
        caption: message_content,
      });
    } else if (message_type === "audio" && media_url) {
      await sessionData.socket.sendMessage(formattedNumber, {
        audio: { url: media_url },
        mimetype: 'audio/mp4'
      });
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

export default router;