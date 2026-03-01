import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Path to the python executable and our new CLI adapter
        const pythonExecutable = 'python'; // Adjust if in a virtualenv
        const scriptPath = path.join(process.cwd(), 'cosmeon', 'cli.py');

        return new Promise<NextResponse>((resolve) => {
            const pythonProcess = spawn(pythonExecutable, [scriptPath]);
            let dataString = '';
            let errorString = '';

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error("Python CLI Error:", errorString);
                    resolve(NextResponse.json({ success: false, error: 'Pipeline process exited with error', stderr: errorString }, { status: 500 }));
                    return;
                }

                try {
                    // Extract only the JSON from stdout (ignoring potential GEE logs)
                    const jsonStart = dataString.indexOf('{');
                    const jsonStr = dataString.substring(jsonStart);
                    const parsedData = JSON.parse(jsonStr);
                    resolve(NextResponse.json(parsedData));
                } catch (e) {
                    console.error("Failed to parse Python output:", e);
                    resolve(NextResponse.json({ success: false, error: 'Failed to parse pipeline output', rawOutput: dataString }, { status: 500 }));
                }
            });

            // Send JSON config via stdin
            pythonProcess.stdin.write(JSON.stringify(body));
            pythonProcess.stdin.end();
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
