import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PlotHealthLog } from '@/lib/models/PlotHealthLog';
import { FarmPlot } from '@/lib/models/FarmPlot';

/**
 * POST /api/telegram/webhook
 * Telegram sends callback_query events here when the farmer taps an inline button.
 * We parse the callback_data, update the farm status, then answer the callback.
 *
 * Set webhook via:
 * curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-ngrok>.ngrok.io/api/telegram/webhook"
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function answerCallback(callbackQueryId: string, text: string) {
    if (!BOT_TOKEN) return;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: false }),
    });
}

async function editMessage(chatId: string | number, messageId: number, text: string) {
    if (!BOT_TOKEN) return;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId, message_id: messageId,
            text, parse_mode: 'Markdown',
            // Remove the inline keyboard buttons after action is taken
            reply_markup: { inline_keyboard: [] },
        }),
    });
}

export async function POST(req: NextRequest) {
    try {
        const update = await req.json();

        // ── Handle /start command ────────────────────────────────────────────
        const msg = update.message;
        if (msg?.text?.startsWith('/start')) {
            if (BOT_TOKEN) {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: msg.chat.id,
                        text: [
                            '🌾 Namaste! Main AskSarthi hoon — NETRA.AI ka Kisan Bot!',
                            '',
                            'Jab aapka khet satellite se scan hoga, main aapko yahan alert bhejunga.',
                            '',
                            '✅ Aap "Mark Fertilized" button tap karke map update kar sakte ho — Red se Green ho jaayega!',
                            '',
                            '🛰 NETRA.AI · HackX 4.0 · Kisan Saathi',
                        ].join('\n'),
                    }),
                });
            }
            return NextResponse.json({ ok: true });
        }

        // ── Handle inline button callback ────────────────────────────────────
        const cbq = update.callback_query;
        if (!cbq) return NextResponse.json({ ok: true });

        const { id: callbackId, data: rawData, message: cbMsg, from } = cbq;
        if (!rawData) return NextResponse.json({ ok: true });

        // Parse compact format: "done:farmId:missionId"
        let farmId: string | null = null;
        let missionId = 'UNKNOWN';
        let action = '';

        if (rawData.startsWith('done:')) {
            const parts = rawData.split(':');
            action    = 'mark_done';
            farmId    = parts[1] || null;
            missionId = parts[2] || 'UNKNOWN';
        } else {
            // Fallback: try JSON parse (legacy)
            try {
                const parsed = JSON.parse(rawData);
                action    = parsed.action;
                farmId    = parsed.farmId;
                missionId = parsed.missionId || 'UNKNOWN';
            } catch {
                await answerCallback(callbackId, 'Unknown action');
                return NextResponse.json({ ok: true });
            }
        }

        if (action === 'mark_done') {
            await dbConnect();

            // Update FarmPlot to GOOD if we have a real farmId
            if (farmId && farmId !== 'na') {
                try {
                    await FarmPlot.findByIdAndUpdate(farmId, {
                        currentHealthStatus: 'GOOD',
                        lastAssessedAt: new Date(),
                    });
                    await PlotHealthLog.create({
                        farmId,
                        date: new Date(),
                        avgNDVI: 0.68,
                        avgNDMI: 0.22,
                        healthScore: 82,
                        waterDeficitLiters: 0,
                        nitrogenReqKg: 0,
                        enrichment: {},
                        metadata: { source: 'telegram_mark_done', missionId, by: from?.first_name },
                    });
                } catch (dbErr) {
                    console.warn('[TgWebhook] DB update skipped (test farmId):', dbErr);
                }
            }

            // Acknowledge on phone
            await answerCallback(callbackId, '✅ Farm marked as fertilized! Map updated to 🟢');

            // Edit the original message
            const completedText = [
                `✅ MISSION COMPLETE`,
                `Mission: ${missionId}`,
                '',
                `Status: Fertilized — Map updated to HEALTHY 🟢`,
                `Confirmed by ${from?.first_name ?? 'Farmer'} at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
                '',
                `Next satellite scan will verify in 3-5 days. 🛰`,
            ].join('\n');

            if (cbMsg?.chat?.id) {
                await editMessage(cbMsg.chat.id, cbMsg.message_id, completedText);
            }

            return NextResponse.json({ ok: true, action: 'mark_done', farmId });
        }

        await answerCallback(callbackId, 'Action received.');
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error('[TgWebhook]', err);
        return NextResponse.json({ ok: false }, { status: 200 });
    }
}

