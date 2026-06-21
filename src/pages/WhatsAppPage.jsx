import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import * as LucideIcons from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";
import DashboardLayout from "../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import AutoResponderTab from "../components/whatsapp/AutoResponderTab";
import WebhookTab from "../components/whatsapp/WebhookTab";

const API_URL = import.meta.env.VITE_API_URL || "https://api.ryz.my.id/api";

export default function WhatsAppPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [pollingQR, setPollingQR] = useState(false);
  const [qrStatus, setQrStatus] = useState(""); // ✅ NEW: Debug status
  const pollingIntervalRef = useRef(null); // ✅ NEW: Track interval
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("send");

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  // ✅ IMPROVED: More aggressive QR polling (every 1 second)
  useEffect(() => {
    if (!pollingQR || !selectedSession) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      return;
    }

    console.log(`[QR_POLL] Starting QR poll for session: ${selectedSession.id}`);
    setQrStatus("Polling...");

    // Initial refresh immediately
    refreshQR(selectedSession.id);

    // Then poll every 1 second (instead of 2)
    pollingIntervalRef.current = setInterval(() => {
      refreshQR(selectedSession.id);
    }, 1000);

    // Stop polling after 120 seconds (was 60)
    const timeout = setTimeout(() => {
      console.log(`[QR_POLL] Timeout reached, stopping poll`);
      setPollingQR(false);
      setQrStatus("QR Expired - Please try again");
      clearInterval(pollingIntervalRef.current);
    }, 120000);

    return () => {
      clearInterval(pollingIntervalRef.current);
      clearTimeout(timeout);
    };
  }, [pollingQR, selectedSession?.id]);

  const loadSessions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      console.log(`[LOAD_SESSIONS] Fetching sessions for user: ${user.id}`);

      const res = await fetch(`${API_URL}/whatsapp/sessions/${user.id}`);
      const data = await res.json();

      console.log(`[LOAD_SESSIONS] Response:`, data);

      if (data.success) {
        setSessions(data.data);
        if (data.data.length > 0) {
          setSelectedSession(data.data[0]);
          loadMessages(data.data[0].id);
        }
      }
    } catch (err) {
      console.error("[LOAD_SESSIONS] Error:", err);
      setQrStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      const res = await fetch(
        `${API_URL}/whatsapp/messages/${user.id}?page=1&limit=20`
      );
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("[LOAD_MESSAGES] Error:", err);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    if (!sessionName.trim() || !user) return;

    try {
      console.log(`[CREATE_SESSION] Creating session: ${sessionName}`);
      setQrStatus("Creating session...");

      const res = await fetch(`${API_URL}/whatsapp/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          session_name: sessionName.trim(),
        }),
      });

      const data = await res.json();
      console.log(`[CREATE_SESSION] Response:`, data);

      if (data.success) {
        setSessionName("");
        setQrStatus("Session created, loading QR...");

        // Reload sessions
        await loadSessions();

        // Find and select the newly created session
        setTimeout(async () => {
          const updatedRes = await fetch(
            `${API_URL}/whatsapp/sessions/${user.id}`
          );
          const updatedData = await updatedRes.json();

          if (updatedData.success) {
            const newSession = updatedData.data.find(
              (s) => s.session_id === sessionName.trim()
            );
            if (newSession) {
              console.log(`[CREATE_SESSION] New session found:`, newSession);
              setSelectedSession(newSession);

              // ✅ Start aggressive polling
              if (newSession.status === "pending") {
                console.log(`[CREATE_SESSION] Starting QR polling`);
                setPollingQR(true);
                setQrStatus("Waiting for QR code...");
              }
            }
          }
        }, 500);
      } else {
        setQrStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("[CREATE_SESSION] Error:", err);
      setQrStatus(`Error: ${err.message}`);
    }
  };

  const refreshQR = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/whatsapp/session/${sessionId}`);
      const data = await res.json();

      console.log(`[REFRESH_QR] Session ${sessionId}:`, {
        status: data.data?.status,
        qr_exists: !!data.data?.qr_code,
        qr_expires_at: data.data?.qr_expires_at,
      });

      if (data.success) {
        // ✅ Update both selected and sessions list
        setSelectedSession((prev) => {
          if (prev && prev.id === sessionId) {
            return { ...prev, ...data.data };
          }
          return prev;
        });

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, ...data.data } : s
          )
        );

        // ✅ Update status text
        if (data.data.qr_code) {
          setQrStatus("QR Code Ready!");
        } else if (data.data.status === "connected") {
          setQrStatus("✅ Connected!");
          setPollingQR(false); // Stop polling
        } else {
          setQrStatus(`Status: ${data.data.status}`);
        }

        // Auto-stop polling if connected
        if (data.data.status === "connected") {
          console.log(`[REFRESH_QR] Session connected, stopping poll`);
          setPollingQR(false);
        }
      } else {
        console.error(`[REFRESH_QR] Error:`, data.error);
        setQrStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("[REFRESH_QR] Error:", err);
      setQrStatus(`Network error: ${err.message}`);
    }
  };

  const handleDeleteClick = (sessionId) => {
    setSessionToDelete(sessionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      const res = await fetch(`${API_URL}/whatsapp/session/${sessionToDelete}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Session dihapus");
        setSelectedSession(null);
        setPollingQR(false);
        setQrStatus("");
        await loadSessions();
      }
    } catch (err) {
      console.error("[DELETE_SESSION] Error:", err);
      toast.error("Gagal menghapus session");
    } finally {
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedSession || !recipient || !messageContent || !user) return;

    try {
      setSending(true);
      const res = await fetch(`${API_URL}/whatsapp/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: selectedSession.id,
          user_id: user.id,
          recipient: recipient,
          message_type: messageType,
          message_content: messageContent,
          media_url: messageType !== "text" ? mediaUrl : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Pesan berhasil dikirim!");
        setRecipient("");
        setMessageContent("");
        setMediaUrl("");
        await loadMessages(selectedSession.id);
      }
    } catch (err) {
      console.error("[SEND_MESSAGE] Error:", err);
      toast.error("Gagal mengirim pesan: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <SEO
        title="WhatsApp API - RYZ Shortlink"
        description="Kelola WhatsApp API"
      />
      <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
        <div className="space-y-8">
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3 mb-2">
              <LucideIcons.MessageSquare className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">
                WhatsApp API
              </h1>
            </div>
            <p className="text-slate-600">
              Kelola session dan kirim pesan WhatsApp
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar: Daftar Session */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <LucideIcons.Smartphone className="w-5 h-5" /> Sessions
                </h2>

                <form onSubmit={createSession} className="mb-4">
                  <input
                    type="text"
                    placeholder="Nama Session (misal: Personal)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Buat Session Baru
                  </button>
                </form>

                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        setSelectedSession(session);
                        // Auto-start polling if pending & no QR
                        if (session.status === "pending" && !session.qr_code) {
                          setPollingQR(true);
                          setQrStatus("Waiting for QR code...");
                        }
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedSession?.id === session.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">
                          {session.session_id}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === "connected"
                              ? "bg-green-100 text-green-700"
                              : session.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshQR(session.id);
                          }}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                        >
                          {pollingQR && selectedSession?.id === session.id
                            ? "Polling..."
                            : "Refresh QR"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(session.id);
                          }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* QR Code Section */}
              {selectedSession && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Session Details
                  </h2>

                  {/* ✅ Debug Status */}
                  {qrStatus && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      Status: {qrStatus}
                    </div>
                  )}

                  {selectedSession.status === "pending" &&
                  selectedSession.qr_code ? (
                    <div className="text-center">
                      <img
                        src={selectedSession.qr_code}
                        alt="QR Code"
                        className="mx-auto w-64 h-64 border-2 border-green-400 rounded-lg p-2"
                      />
                      <p className="text-slate-600 mt-4 font-medium">
                        ✅ Scan QR Code ini dengan WhatsApp Anda
                      </p>
                      <p className="text-sm text-slate-500">
                        Tekan tombol "Refresh QR" jika QR tidak merespons
                      </p>
                    </div>
                  ) : selectedSession.status === "pending" &&
                    !selectedSession.qr_code ? (
                    <div className="text-center py-8">
                      <div className="inline-block">
                        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
                      </div>
                      <p className="text-slate-600 mt-4 font-medium">
                        Mempersiapkan QR Code...
                      </p>
                      <p className="text-sm text-slate-500">
                        Tunggu 2-5 detik, QR akan muncul otomatis
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        💡 Cek browser console (F12) untuk debug details
                      </p>
                    </div>
                  ) : null}

                  {selectedSession.status === "connected" && (
                    <div className="text-center py-8">
                      <LucideIcons.CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-slate-900">
                        ✅ Session Terhubung!
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        Anda sekarang bisa mengirim pesan
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tabs UI */}
              {selectedSession && selectedSession.status === "connected" && (
                <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-6 overflow-x-auto">
                  <button onClick={() => setActiveTab("send")} className={`whitespace-nowrap flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === "send" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>Kirim Pesan</button>
                  <button onClick={() => setActiveTab("history")} className={`whitespace-nowrap flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === "history" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>Riwayat</button>
                  <button onClick={() => setActiveTab("autoresponder")} className={`whitespace-nowrap flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === "autoresponder" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}>Auto Responder</button>
                  <button onClick={() => setActiveTab("webhook")} className={`whitespace-nowrap flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === "webhook" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>Webhook</button>
                </div>
              )}

              {/* Kirim Pesan */}
              {selectedSession && selectedSession.status === "connected" && activeTab === "send" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Kirim Pesan Baru
                  </h2>

                  <form onSubmit={sendMessage} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nomor WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="081234567890"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tipe Pesan
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value)}
                      >
                        <option value="text">Teks</option>
                        <option value="image">Gambar</option>
                        <option value="document">Dokumen (PDF)</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio / Voice Note</option>
                      </select>
                    </div>

                    {messageType !== "text" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          URL Media
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Isi Pesan
                      </label>
                      <textarea
                        placeholder="Tulis pesan Anda disini..."
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-700"
                    >
                      {sending ? (
                        <>
                          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <LucideIcons.Send className="w-5 h-5" />
                          Kirim Pesan
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Riwayat Pesan */}
              {selectedSession && selectedSession.status === "connected" && activeTab === "history" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Riwayat Pesan
                </h2>

                {messages.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    Belum ada pesan
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="flex gap-3 p-3 rounded-lg bg-slate-50"
                      >
                        <LucideIcons.MessageCircle className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900">
                              {msg.recipient}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                msg.status === "sent"
                                  ? "bg-green-100 text-green-700"
                                  : msg.status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {msg.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {msg.message_content}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(msg.created_at).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}

              {selectedSession && selectedSession.status === "connected" && activeTab === "autoresponder" && (
                <AutoResponderTab sessionId={selectedSession.id} userId={user?.id} apiUrl={API_URL} />
              )}

              {selectedSession && selectedSession.status === "connected" && activeTab === "webhook" && (
                <WebhookTab sessionId={selectedSession.id} userId={user?.id} apiUrl={API_URL} />
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteSession}
        title="Hapus Session"
        message="Apakah Anda yakin ingin menghapus session ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
      />
    </DashboardLayout>
  );
}