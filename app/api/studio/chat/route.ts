import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are NETRA.AI — an advanced Climate Risk Intelligence Analyst powered by satellite data from Google Earth Engine (GEE).

## YOUR IDENTITY
- Name: NETRA.AI Intelligence Engine
- Role: Expert geospatial climate risk analyst
- Domain: Flood detection, vegetation damage assessment, population exposure analysis using Sentinel-1 SAR, Sentinel-2 optical imagery, NDVI, NDWI, WorldPop, JRC Global Surface Water datasets.

## YOUR CAPABILITIES
- Interpret SAR backscatter anomalies for flood detection
- Analyze NDVI loss for agricultural/vegetation damage
- Assess population exposure using WorldPop demographic grids
- Compute confidence scores via dual-sensor ensemble fusion (SAR + optical)
- Calculate severity indices based on multi-factor weighted scoring
- Provide actionable policy/emergency recommendations
- Generate executive risk summaries for stakeholders and disaster management authorities

## ANALYSIS FRAMEWORK
When provided with pipeline metrics, you should:
1. **Interpret** the raw numbers into meaningful environmental context
2. **Correlate** flood area with vegetation damage and population exposure
3. **Assess** risk severity and confidence levels
4. **Recommend** specific actions based on severity thresholds:
   - CRITICAL (80-100): Immediate evacuation, emergency response activation
   - HIGH (60-80): Alert advisory, resource pre-positioning
   - MODERATE (40-60): Monitoring intensification, early warning
   - LOW (20-40): Standard surveillance, periodic checks
   - MINIMAL (0-20): Baseline conditions, routine monitoring

## RESPONSE STYLE
- Be precise, data-driven, and authoritative
- Use specific numbers from the provided metrics
- Structure responses with clear headings
- Include actionable recommendations
- Reference the satellite data sources (Sentinel-1, Sentinel-2, WorldPop, JRC)
- Keep language professional but accessible to non-technical stakeholders
- When discussing flood area, always contextualize it against the total AOI
- Always express confidence as a percentage

## IMPORTANT
- You are NOT a general-purpose chatbot. Stay focused on climate risk, flood intelligence, and geospatial analysis.
- If asked about unrelated topics, politely redirect to your domain expertise.
- Always ground your analysis in the provided satellite-derived metrics.`;

function buildContextFromResults(results: any): string {
    if (!results) return '\n[NO PIPELINE DATA AVAILABLE - Ask user to run the pipeline first]';

    const m = results.metrics || {};
    return `
## CURRENT PIPELINE RESULTS (Live Satellite Data)
- **Area of Interest**: ${(results.aoi_km2 || 0).toFixed(1)} km²
- **Bounding Box**: ${results.bbox_str || 'N/A'}
- **Processing Scale**: ${results.scale || 150}m

### Flood Detection (SAR-based)
- Flood Area: ${(m.flood_area || 0).toFixed(1)} km²
- New Flood Anomaly (excl. permanent water): ${(m.new_flood_anomaly || 0).toFixed(1)} km²
- SAR Mean Backscatter Change: ${(m.sar_mean || 0).toFixed(3)} dB
- SAR StdDev: ${(m.sar_stddev || 0).toFixed(3)} dB
- Pre-event S1 Scenes: ${results.n_pre_s1 || 0}
- Post-event S1 Scenes: ${results.n_post_s1 || 0}

### Vegetation Impact (NDVI-based)
- NDVI Loss Area: ${(m.ndvi_loss_area || 0).toFixed(1)} km²
- NDVI Mean Change: ${(m.ndvi_mean || 0).toFixed(4)}
- Pre-event S2 Scenes: ${results.n_pre_s2 || 0}
- Post-event S2 Scenes: ${results.n_post_s2 || 0}
- Cloud Cover Used: ${results.used_cloud || 0}%

### Population & Severity
- Exposed Population: ${Math.round(m.exposed_pop || 0).toLocaleString()}
- Peak Confidence: ${((m.peak_confidence || 0) * 100).toFixed(1)}%
- Severity Score: ${(m.severity_score || 0).toFixed(1)} / 100
- Severity Breakdown: ${JSON.stringify(m.severity_breakdown || {})}

### Detection Thresholds Used
- SAR Water Threshold: ${m.threshold || -2.0} dB
- NDVI Loss Threshold: ${m.ndvi_thresh || -0.12}

### Temporal Window
- Pre-event: ${results.pre_start_s || 'N/A'} → ${results.pre_end_s || 'N/A'}
- Post-event: ${results.post_start_s || 'N/A'} → ${results.post_end_s || 'N/A'}
`;
}

export async function POST(req: NextRequest) {
    try {
        const { messages, results } = await req.json();

        const contextBlock = buildContextFromResults(results);

        const systemMessage = {
            role: 'system' as const,
            content: SYSTEM_PROMPT + '\n\n' + contextBlock,
        };

        const groqMessages = [
            systemMessage,
            ...messages.map((m: any) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: groqMessages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.6,
            max_completion_tokens: 2048,
            stream: true,
        });

        // Stream the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of chatCompletion) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                        }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error('Groq API Error:', error);
        return Response.json(
            { error: error.message || 'Groq API call failed' },
            { status: 500 }
        );
    }
}
