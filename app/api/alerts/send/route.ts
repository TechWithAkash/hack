import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, name, level, pop, lat, lng } = body;

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
- Coordinates:       ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}
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

        // Calculate Bounding Box around the coordinates for ArcGIS Export (approx 20km width)
        const centerLng = Number(lng);
        const centerLat = Number(lat);
        const bLng1 = centerLng - 0.15;
        const bLng2 = centerLng + 0.15;
        const bLat1 = centerLat - 0.075;
        const bLat2 = centerLat + 0.075;
        
        // Use Enterprise ESRI ArcGIS World Imagery mapping (highly reliable image proxy, no API key needed)
        const mapUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bLng1},${bLat1},${bLng2},${bLat2}&bboxSR=4326&size=600,300&imageSR=4326&format=png&f=image`;

        // Set to send to the provided email to ensure it's received
        const targetEmail = process.env.SMTP_USER;

        const mailOptions = {
            from: `"Netra Intelligence" <${process.env.SMTP_USER}>`,
            to: targetEmail, // Sending to yourself so you actually receive it!
            subject: `[${level} ALERT] Geospatial Anomaly in ${name}`,
            text: emailText,
            html: `
                <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; margin: 0 auto;">
                    <div style="background: ${level === 'CRITICAL' ? '#EF4444' : level === 'HIGH' ? '#F97316' : '#0D7377'}; padding: 16px; border-radius: 8px 8px 0 0; color: white;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td>
                                    <h2 style="margin: 0; font-size: 18px;">🚨 AUTOMATIC EMERGENCY ALERT</h2>
                                    <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">System: Netra.ai Pipeline</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
                        <h3 style="margin-top: 0; color: #0f172a;">Anomaly Detected: ${name}</h3>
                        
                        <div style="margin-bottom: 24px; border-radius: 8px; border: 1px solid #e2e8f0; background: #0f172a;">
                            <img src="${mapUrl}" alt="Satellite Map of ${name}" width="600" height="300" style="display: block; width: 100%; max-width: 100%; height: auto; border-radius: 8px 8px 0 0;" />
                            <div style="padding: 8px; text-align: center; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
                                📡 ESRI Live Satellite Feed · Target Centered
                            </div>
                        </div>

                        <table style="width: 100%; margin-bottom: 20px; text-align: left; border-collapse: collapse;">
                            <tr><th style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 140px;">Coordinates</th><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}</td></tr>
                            <tr><th style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Risk Level</th><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${level}</td></tr>
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
