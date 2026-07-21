import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";

const dataFile = path.resolve(process.cwd(), "data/reading-tracker.md");

function extractJson(markdown: string) {
  const fenced = markdown.match(/```json\s*([\s\S]*?)\s*```/);
  return fenced?.[1]?.trim() || markdown.trim();
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function handleReadingState(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.method === "GET") {
      try {
        const markdown = await fs.readFile(dataFile, "utf8");
        const json = extractJson(markdown);
        sendJson(res, 200, json ? JSON.parse(json) : null);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          sendJson(res, 200, null);
          return;
        }
        throw error;
      }
      return;
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const payload = JSON.parse(body);
      await fs.mkdir(path.dirname(dataFile), { recursive: true });
      await fs.writeFile(
        dataFile,
        `# Reading Tracker State\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`\n`,
        "utf8",
      );
      sendJson(res, 200, { ok: true });
      return;
    }

    res.statusCode = 405;
    res.end("Method Not Allowed");
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown sync error",
    });
  }
}

function readingStatePlugin(): Plugin {
  return {
    name: "reading-state-markdown-api",
    configureServer(server) {
      server.middlewares.use("/api/reading-state", handleReadingState);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/reading-state", handleReadingState);
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), readingStatePlugin()],
});
