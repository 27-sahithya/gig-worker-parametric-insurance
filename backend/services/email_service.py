import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@rakshak.ai")

def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email. Returns True on success, False on failure (silently)."""
    if not SMTP_USER or not SMTP_PASS:
        # Demo mode: just print to console
        print(f"[EMAIL DEMO] To: {to_email} | Subject: {subject}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")
        return False


def send_approval_email(to_email: str, name: str) -> bool:
    subject = "✅ Your Rakshak AI Profile is Activated!"
    html = f"""
    <div style="font-family: Inter, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #f97316, #0ea5e9); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚡ Rakshak AI</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Gig Worker Income Protection</p>
      </div>
      <h2 style="color: #f97316;">Welcome, {name}! Your profile is approved 🎉</h2>
      <p style="color: #94a3b8;">Your identity has been verified by our admin team. You can now log in and purchase your first weekly income protection policy.</p>
      <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #f1f5f9;"><strong>Next Steps:</strong></p>
        <ul style="color: #94a3b8; padding-left: 20px;">
          <li>Log in at <a href="http://localhost:5173" style="color: #f97316;">Rakshak AI Portal</a></li>
          <li>Buy your first weekly plan (as low as ₹20/week)</li>
          <li>Your AI-powered protection starts immediately</li>
        </ul>
      </div>
      <p style="color: #475569; font-size: 12px;">Rakshak AI · AI-Powered Parametric Insurance · Guidewire DEVTrails 2026</p>
    </div>
    """
    return send_email(to_email, subject, html)


def send_claim_notification_email(to_email: str, name: str, amount: float, trigger: str, claim_id: str) -> bool:
    subject = f"💰 Claim Auto-Approved — ₹{amount} Credited | {claim_id}"
    html = f"""
    <div style="font-family: Inter, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
      <h2 style="color: #22c55e;">Great news, {name}! Your claim was auto-approved ✅</h2>
      <p style="color: #94a3b8;">Our AI system detected an income disruption in your area and automatically processed your claim.</p>
      <div style="background: #1e293b; border-radius: 8px; padding: 16px;">
        <p style="color: #94a3b8; margin: 4px 0;">Claim ID: <strong style="color: white;">{claim_id}</strong></p>
        <p style="color: #94a3b8; margin: 4px 0;">Trigger: <strong style="color: white;">{trigger}</strong></p>
        <p style="color: #94a3b8; margin: 4px 0;">Amount Credited: <strong style="color: #22c55e; font-size: 20px;">₹{amount}</strong></p>
      </div>
      <p style="color: #475569; font-size: 12px; margin-top: 20px;">No action needed — this was fully automated by Rakshak AI.</p>
    </div>
    """
    return send_email(to_email, subject, html)


def send_payment_confirmation(to_email: str, name: str, amount: float, week_start: str, week_end: str) -> bool:
    subject = f"✅ Payment Confirmed — ₹{amount} | Rakshak AI"
    html = f"""
    <div style="font-family: Inter, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto;">
      <div style="background: linear-gradient(135deg, #f97316, #0ea5e9); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚡ Rakshak AI</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Payment Confirmed</p>
      </div>
      <h2 style="color: #22c55e;">Hi {name}, your payment was received! 💸</h2>
      <p style="color: #94a3b8;">Your weekly protection is now active. You are fully covered for income disruptions this week.</p>
      <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <p style="color: #94a3b8; margin: 6px 0;">Amount Paid: <strong style="color: #22c55e; font-size: 22px;">₹{amount}</strong></p>
        <p style="color: #94a3b8; margin: 6px 0;">Coverage Period: <strong style="color: white;">{week_start} → {week_end}</strong></p>
        <p style="color: #94a3b8; margin: 6px 0;">Status: <strong style="color: #22c55e;">ACTIVE ✓</strong></p>
      </div>
      <p style="color: #94a3b8;">If a parametric event is detected in your zone (heavy rain, AQI spike etc.), your claim will be auto-processed instantly.</p>
      <p style="color: #475569; font-size: 12px; margin-top: 20px;">Rakshak AI · Guidewire DEVTrails 2026 · This is an automated message</p>
    </div>
    """
    return send_email(to_email, subject, html)


def send_rejection_email(to_email: str, name: str) -> bool:
    subject = "❌ Rakshak AI — Profile Verification Update"
    html = f"""
    <div style="font-family: Inter, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto;">
      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚡ Rakshak AI</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Verification Update</p>
      </div>
      <h2 style="color: #ef4444;">Hi {name}, we couldn't verify your documents.</h2>
      <p style="color: #94a3b8;">Unfortunately, our admin team was unable to approve your registration at this time. This may be due to unclear documents or missing information.</p>
      <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #f1f5f9;"><strong>What you can do:</strong></p>
        <ul style="color: #94a3b8; padding-left: 20px;">
          <li>Contact our support team</li>
          <li>Re-register with clearer document scans</li>
          <li>Ensure your government ID is valid and legible</li>
        </ul>
      </div>
      <p style="color: #475569; font-size: 12px;">Rakshak AI · Guidewire DEVTrails 2026</p>
    </div>
    """
    return send_email(to_email, subject, html)
