import express from "express";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from "baileys";
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

    // Initialize Baileys
    const sessionPath = `./sessions/${user_id}-${session_name}`;
    console.log(`[BAILEYS] Initializing session di ${sessionPath}`);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.macOS("Safari"),
    });

    activeSessions.set(newSession.id, { socket: sock, state, saveCreds });
    console.log(`[BAILEYS] Socket ditambahkan ke activeSessions`);

    // ============================================================================
    // EVENT LISTENERS - Improved with better logging
    // ============================================================================

    sock.ev.on("connection.update", async (update) => {
      const { connection, qr, lastDisconnect } = update;

      console.log(`[CONNECTION_UPDATE] connection=${connection}, qr=${qr ? "YES" : "NO"}`);

      // QR Code Generated
      if (qr) {
        try {
          console.log(`[QR_CODE] Generating QR Code...`);
          const qrDataUrl = await QRCode.toDataURL(qr);
          const qrExpires = new Date(Date.now() + 5 * 60 * 1000); // ✅ Extended: 5 menit

          console.log(`[QR_CODE] Saving QR to DB, expires at ${qrExpires}`);

          const { error: updateError } = await supabaseAdmin
            .from("whatsapp_sessions")
            .update({
              qr_code: qrDataUrl,
              qr_expires_at: qrExpires,
              status: "pending",
            })
            .eq("id", newSession.id);

          if (updateError) {
            console.error(`[QR_CODE] ERROR saving QR:`, updateError);
          } else {
            console.log(`[QR_CODE] ✅ QR saved successfully`);
          }
        } catch (err) {
          console.error(`[QR_CODE] ERROR generating QR:`, err);
        }
      }

      // Connection Closed
      if (connection === "close") {
        console.log(`[CONNECTION] Connection closed`);
        console.log(`[DISCONNECT] lastDisconnect:`, lastDisconnect);

        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log(`[DISCONNECT] shouldReconnect=${shouldReconnect}`);

        await supabaseAdmin
          .from("whatsapp_sessions")
          .update({ status: "disconnected" })
          .eq("id", newSession.id);

        activeSessions.delete(newSession.id);

        if (!shouldReconnect) {
          console.log(`[SESSION] User logged out, removing session folder`);
          try {
            fs.rmSync(sessionPath, { recursive: true, force: true });
          } catch (err) {
            console.error(`[SESSION] Error removing folder:`, err);
          }
        }
      }

      // Connection Open (Success)
      if (connection === "open") {
        console.log(`[CONNECTION] ✅ Connection OPEN - Session connected!`);
        const { error: updateError } = await supabaseAdmin
          .from("whatsapp_sessions")
          .update({
            status: "connected",
            qr_code: null,
            qr_expires_at: null,
          })
          .eq("id", newSession.id);

        if (updateError) {
          console.error(`[CONNECTION] ERROR updating status:`, updateError);
        } else {
          console.log(`[CONNECTION] ✅ Status updated to connected`);
        }
      }
    });

    // Credentials Update
    sock.ev.on("creds.update", () => {
      console.log(`[CREDS] Credentials updated`);
      saveCreds();
    });

    // Error Handler
    sock.ev.on("error", (err) => {
      console.error(`[SOCKET_ERROR]`, err);
    });

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
      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.macOS("Safari"),
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
      const sessionPath = `./sessions/${sessionInfo.user_id}-${sessionInfo.session_id}`;
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

export default router;