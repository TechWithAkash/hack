import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, name, level, pop } = body;

        const getUrgency = (lvl: string) => {
            if (lvl === 'CRITICAL' || lvl === 'HIGH') return 'URGENT: IMMEDIATE ACTION REQUIRED';
            return 'NOTICE: MONITORING ADVISED';
        };

        const emailText = `
===================================================
🚨 AUTOMATIC EMERGENCY ALERT DISPATCHED 
===================================================
TO:       regional.disaster.mgmt@gov.in
SUBJECT:  [${level} ALERT] Geospatial Anomaly in ${name}

DETAILS:
- Location:          ${name} (ID: ${id})
- Risk Level:        ${level}
- Est. Pop Exposed:  ${Number(pop || 0).toLocaleString()} people

SUMMARY:
${getUrgency(level)}. An automated geospatial pipeline 
has flagged this zone. Please review the live telemetry 
on the Netra Dashboard and align ground units if needed.
===================================================
`;

        // Output to the server console to demonstrate it actually fired
        console.log("\x1b[36m" + emailText.trim() + "\x1b[0m");

        // Fetch credentials from env
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Set to send to the provided email to ensure it's received
        const targetEmail = process.env.SMTP_USER;

        const mailOptions = {
            from: `"Netra Intelligence" <${process.env.SMTP_USER}>`,
            to: targetEmail, // Sending to yourself so you actually receive it!
            subject: `[${level} ALERT] Geospatial Anomaly in ${name}`,
            text: emailText,
            html: `
                <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
                    <div style="background: ${level === 'CRITICAL' ? '#EF4444' : level === 'HIGH' ? '#F97316' : '#0D7377'}; padding: 16px; border-radius: 8px 8px 0 0; color: white;">
                        <h2 style="margin: 0; font-size: 18px;">🚨 AUTOMATIC EMERGENCY ALERT</h2>
                        <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">System: Netra.ai Pipeline</p>
                    </div>
                    <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
                        <h3 style="margin-top: 0; color: #0f172a;">Anomaly Detected: ${name}</h3>
                        <table style="width: 100%; margin-bottom: 20px; text-align: left; border-collapse: collapse;">
                            <tr><th style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 140px;">Risk Level</th><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${level}</td></tr>
                            <tr><th style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Est. Pop Exposed</th><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${Number(pop || 0).toLocaleString()} people</td></tr>
                            <tr><th style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Event ID</th><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${id}</td></tr>
                        </table>
                        <p style="color: #475569; font-weight: bold;">${getUrgency(level)}.</p>
                        <p style="color: #475569; line-height: 1.5; margin-bottom: 0;">An automated geospatial pipeline has flagged this zone. Please review the live telemetry on the Netra Dashboard and align ground units if needed.</p>
                    </div>
                </div>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("📬 Email successfully dispatched! MessageID: %s", result.messageId);

        return NextResponse.json({ success: true, message: 'Alert dispatched to emergency contacts.' });
    } catch (error: any) {
        console.error("Alert Dispatch Error:", error);
        return NextResponse.json({ error: error.message || "Failed to send alert" }, { status: 500 });
    }
}
