import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map plan type to messages limit
const PLAN_LIMITS = {
  free: 100,
  pro: 2000,
  enterprise: 10000,
};

/**
 * Check if user is allowed to send 'count' messages.
 * Automatically creates a usage record for the current month if not exists.
 * @param {string} user_id 
 * @param {number} count 
 * @returns {Promise<{ allowed: boolean, remaining: number, error?: string }>}
 */
export async function checkUsage(user_id, count = 1) {
  try {
    // 1. Get user plan
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("plan_type")
      .eq("id", user_id)
      .single();

    if (userError) throw userError;

    const planType = user?.plan_type || "free";
    const limit = PLAN_LIMITS[planType] || PLAN_LIMITS.free;

    // 2. Get current month bounds
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    // 3. Find usage for current month
    let { data: usage, error: usageError } = await supabaseAdmin
      .from("whatsapp_usage")
      .select("*")
      .eq("user_id", user_id)
      .gte("start_date", startOfMonth)
      .lte("end_date", endOfMonth)
      .maybeSingle();

    if (usageError) throw usageError;

    // 4. Create if not exists
    if (!usage) {
      const { data: newUsage, error: insertError } = await supabaseAdmin
        .from("whatsapp_usage")
        .insert({
          user_id: user_id,
          messages_sent: 0,
          messages_limit: limit,
          start_date: startOfMonth,
          end_date: endOfMonth,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      usage = newUsage;
    }

    // If limits were updated in code but not in DB, optionally sync them
    if (usage.messages_limit !== limit) {
      await supabaseAdmin
        .from("whatsapp_usage")
        .update({ messages_limit: limit })
        .eq("id", usage.id);
      usage.messages_limit = limit;
    }

    const remaining = usage.messages_limit - usage.messages_sent;

    if (usage.messages_sent + count > usage.messages_limit) {
      return { 
        allowed: false, 
        remaining: remaining > 0 ? remaining : 0, 
        error: `Kuota pesan WhatsApp Anda telah habis. Sisa: ${remaining > 0 ? remaining : 0}, Dibutuhkan: ${count}` 
      };
    }

    return { allowed: true, remaining: remaining - count };
  } catch (error) {
    console.error("[WHATSAPP_USAGE] checkUsage error:", error);
    // If error, maybe fail-safe to allowed=false or allowed=true? 
    // We choose false to avoid abuse if DB is down, or we could reject cleanly.
    return { allowed: false, remaining: 0, error: "Gagal mengecek kuota WhatsApp" };
  }
}

/**
 * Increment the usage after successfully sending messages
 * @param {string} user_id 
 * @param {number} count 
 */
export async function incrementUsage(user_id, count = 1) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const { data: usage, error: fetchError } = await supabaseAdmin
      .from("whatsapp_usage")
      .select("id, messages_sent")
      .eq("user_id", user_id)
      .gte("start_date", startOfMonth)
      .lte("end_date", endOfMonth)
      .maybeSingle();

    if (fetchError || !usage) {
      console.error("[WHATSAPP_USAGE] Could not find usage record to increment");
      return false;
    }

    const { error: updateError } = await supabaseAdmin
      .from("whatsapp_usage")
      .update({ messages_sent: usage.messages_sent + count })
      .eq("id", usage.id);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error("[WHATSAPP_USAGE] incrementUsage error:", error);
    return false;
  }
}

/**
 * Get current month usage stats
 */
export async function getUsageStats(user_id) {
  try {
    const { data: user } = await supabaseAdmin.from("users").select("plan_type").eq("id", user_id).single();
    const planType = user?.plan_type || "free";
    const limit = PLAN_LIMITS[planType] || PLAN_LIMITS.free;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    let { data: usage } = await supabaseAdmin
      .from("whatsapp_usage")
      .select("*")
      .eq("user_id", user_id)
      .gte("start_date", startOfMonth)
      .lte("end_date", endOfMonth)
      .maybeSingle();

    if (!usage) {
      return { messages_sent: 0, messages_limit: limit, start_date: startOfMonth, end_date: endOfMonth };
    }

    // Always ensure the UI reflects the real-time billing limit even if DB is not updated yet
    usage.messages_limit = limit;
    
    return usage;
  } catch (error) {
    console.error("[WHATSAPP_USAGE] getUsageStats error:", error);
    return { messages_sent: 0, messages_limit: 100 }; // fallback
  }
}
