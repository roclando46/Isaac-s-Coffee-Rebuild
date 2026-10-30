import { Resend } from "resend";

let client: Resend | null = null;

export type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

/** Sends with Resend. Without RESEND_API_KEY (local work), logs instead of sending. */
export async function sendMail(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email skipped, no RESEND_API_KEY] to=${mail.to} subject=${mail.subject}`);
    return;
  }
  client ??= new Resend(key);
  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM ?? "Isaac's Coffee <hello@isaacscoffee.co.uk>",
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: mail.replyTo,
  });
  if (error) throw new Error(`Email to ${mail.to} failed: ${error.message}`);
}
