import twilio from "twilio";
import { normalizePhone } from "@/lib/sms/phone";

type SendSmsResult = {
  sent: boolean;
  skipped?: string;
};

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) return null;

  return twilio(accountSid, authToken);
}

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  const normalized = normalizePhone(to);
  if (!normalized) {
    return { sent: false, skipped: "invalid_phone" };
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  const client = getTwilioClient();

  if (!client || !from) {
    if (process.env.NODE_ENV === "development") {
      console.log("[SMS:dev]", normalized, body);
      return { sent: true };
    }
    return { sent: false, skipped: "sms_not_configured" };
  }

  try {
    await client.messages.create({
      to: normalized,
      from,
      body,
    });
    return { sent: true };
  } catch (error) {
    console.error("[SMS:error]", error);
    return { sent: false, skipped: "send_failed" };
  }
}

export function formatBookingDateTime(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString("sq-AL"),
    time: date.toLocaleTimeString("sq-AL", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
