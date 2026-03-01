import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

const TIMEOUT_MS = 90_000; // 90 second max

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Backend safety: auto-scale resolution for large AOIs
        const minLon = body.min_lon || 0;
        const minLat = body.min_lat || 0;
        const maxLon = body.max_lon || 0;
        const maxLat = body.max_lat || 0;
        const wKm = (maxLon - minLon) * 111 * Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
        const hKm = (maxLat - minLat) * 111;
        const areaKm2 = wKm * hKm;

        if (areaKm2 > 50000 && (body.scale || 150) < 300) {
            body.scale = areaKm2 > 100000 ? 1000 : 500;
        }

        const pythonExecutable = 'python';
        const scriptPath = path.join(process.cwd(), 'cosmeon', 'cli.py');

        return new Promise<NextResponse>((resolve) => {
            const pythonProcess = spawn(pythonExecutable, [scriptPath]);
            let dataString = '';
            let errorString = '';
            let timedOut = false;

            // Kill after timeout
            const timer = setTimeout(() => {
                timedOut = true;
                pythonProcess.kill('SIGKILL');
                resolve(NextResponse.json({
                    success: false,
                    error: `Pipeline timed out after ${TIMEOUT_MS / 1000}s. Draw a smaller AOI or increase resolution.`
                }, { status: 504 }));
            }, TIMEOUT_MS);

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                clearTimeout(timer);
                if (timedOut) return;

                if (code !== 0) {
                    console.error("Python CLI Error:", errorString);
                    resolve(NextResponse.json({ success: false, error: 'Pipeline process exited with error', stderr: errorString }, { status: 500 }));
                    return;
                }

                try {
                    const jsonStart = dataString.indexOf('{');
                    const jsonStr = dataString.substring(jsonStart);
                    const parsedData = JSON.parse(jsonStr);
                    resolve(NextResponse.json(parsedData));
                } catch (e) {
                    console.error("Failed to parse Python output:", e);
                    resolve(NextResponse.json({ success: false, error: 'Failed to parse pipeline output', rawOutput: dataString }, { status: 500 }));
                }
            });

            pythonProcess.stdin.write(JSON.stringify(body));
            pythonProcess.stdin.end();
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
