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
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
// ✅ FIX: Gunakan SERVICE_ROLE_KEY untuk bypass RLS
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

    if (!user_id || !session_name) {
      return res.status(400).json({
        success: false,
        error: "user_id dan session_name dibutuhkan",
      });
    }

    // Gunakan .maybeSingle() agar tidak throw error jika data tidak ditemukan
    const { data: existingSession, error: findError } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("user_id", user_id)
      .eq("session_id", session_name)
      .maybeSingle();

    if (findError) throw findError;

    if (existingSession) {
      return res.status(400).json({
        success: false,
        error: "Session dengan nama tersebut sudah ada",
      });
    }

    // Simpan session baru ke DB
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

    // Inisialisasi Baileys
    const sessionPath = `./sessions/${user_id}-${session_name}`;
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.macOS("Safari"),
    });

    activeSessions.set(newSession.id, { socket: sock, state, saveCreds });

    // Event: QR Code & Connection Status
    sock.ev.on("connection.update", async (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        const qrDataUrl = await QRCode.toDataURL(qr);
        const qrExpires = new Date(Date.now() + 60 * 1000); // 1 menit

        await supabaseAdmin
          .from("whatsapp_sessions")
          .update({
            qr_code: qrDataUrl,
            qr_expires_at: qrExpires,
            status: "pending",
          })
          .eq("id", newSession.id);
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        await supabaseAdmin
          .from("whatsapp_sessions")
          .update({ status: "disconnected" })
          .eq("id", newSession.id);

        activeSessions.delete(newSession.id);

        // Jika user sengaja logout dari HP, hapus session lokal
        if (!shouldReconnect) {
          fs.rmSync(sessionPath, { recursive: true, force: true });
        }
      }

      if (connection === "open") {
        await supabaseAdmin
          .from("whatsapp_sessions")
          .update({
            status: "connected",
            qr_code: null,
            // Catatan: Jangan menyimpan object `state` secara utuh ke JSONB karena struktur sirkular
          })
          .eq("id", newSession.id);
      }
    });

    // Simpan credentials ketika berubah ke lokal
    sock.ev.on("creds.update", saveCreds);

    res.json({
      success: true,
      data: {
        session_id: newSession.id,
        message: "Session dibuat. Silakan scan QR Code.",
      },
    });
  } catch (err) {
    console.error("Create Session Error:", err);
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

    const { data: session, error } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) throw error;

    res.json({ success: true, data: session });
  } catch (err) {
    console.error("Get Session Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. Kirim Pesan WhatsApp
 * POST /api/whatsapp/send-message
 */
router.post("/send-message", async (req, res) => {
  let dbMessage = null; // Simpan reference DB message agar bisa di-update di blok catch

  try {
    const {
      session_id,
      recipient,
      message_type = "text",
      message_content,
      media_url,
      user_id,
    } = req.body;

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
      return res.status(400).json({
        success: false,
        error: "Session tidak terhubung. Silakan scan QR Code ulang.",
      });
    }

    // 1. Simpan status pesan 'queued' ke DB
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

    // 2. Ambil atau restore session
    let sessionData = activeSessions.get(session.id);

    if (!sessionData) {
      // Restore logic
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

      // Tunggu sebentar hingga socket benar-benar open
      await sock.waitForConnectionUpdate(
        (update) => update.connection === "open",
      );
    }

    // 3. Format nomor dan Kirim pesan
    const formattedNumber = formatPhoneNumber(recipient);

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

    // 4. Update status DB menjadi 'sent'
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
    console.error("Send Message Error:", err);

    // Perbaikan: Update status failed menggunakan ID pesan yang spesifik
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

    res.json({
      success: true,
      data: messages,
      total: count,
      page,
      limit,
    });
  } catch (err) {
    console.error("Get Messages Error:", err);
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

    const { data: sessions, error } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error("Get Sessions Error:", err);
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

    // Ambil data session dari DB terlebih dahulu untuk mendapatkan nama foldernya
    const { data: sessionInfo, error: fetchError } = await supabaseAdmin
      .from("whatsapp_sessions")
      .select("user_id, session_id")
      .eq("id", sessionId)
      .single();

    if (fetchError) throw fetchError;

    // 1. Hapus dan logout dari active sessions
    if (activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      if (session.socket) {
        try {
          await session.socket.logout();
        } catch (e) {
          /* ignore */
        }
      }
      activeSessions.delete(sessionId);
    }

    // 2. Bersihkan file/folder lokal (Mencegah Storage Leak)
    if (sessionInfo) {
      const sessionPath = `./sessions/${sessionInfo.user_id}-${sessionInfo.session_id}`;
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      }
    }

    // 3. Hapus dari DB
    const { error: deleteError } = await supabaseAdmin
      .from("whatsapp_sessions")
      .delete()
      .eq("id", sessionId);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: "Session berhasil dihapus" });
  } catch (err) {
    console.error("Delete Session Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;