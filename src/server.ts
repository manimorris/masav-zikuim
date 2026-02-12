import { MasavReader } from "./lib/masav-reader";
import { MasavWriter } from "./lib/masav-writer";
import type { MasavDesignedData } from "./lib/masav-types";
import iconv from "iconv-lite";

const writer = new MasavWriter();

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return new Response(Bun.file("src/public/index.html"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (req.method === "GET" && url.pathname === "/client.js") {
      return new Response(Bun.file("src/public/client.js"), { headers: { "Content-Type": "text/javascript; charset=utf-8" } });
    }

    if (req.method === "POST" && url.pathname === "/api/masav/read") {
      return handleRead(req);
    }

    if (req.method === "POST" && url.pathname === "/api/masav/validate") {
      return handleValidate(req);
    }

    if (req.method === "POST" && url.pathname === "/api/masav/generate") {
      return handleGenerate(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});

async function handleRead(req: Request): Promise<Response> {
  const formData = await req.formData();
  const file = formData.get("msvZfile");

  if (!(file instanceof File)) {
    return Response.json({ errors: ["ERROR: No file!"] }, { status: 400 });
  }

  const fileContent = await readMasavFile(file);
  const reader = new MasavReader();
  const result = reader.returnFileData(file.name, fileContent);

  if (!result.data) {
    return Response.json({ errors: result.errorMsg }, { status: 422 });
  }

  return Response.json(result.data);
}

async function handleValidate(req: Request): Promise<Response> {
  const formData = await req.formData();
  const file = formData.get("msvZfile");

  if (!(file instanceof File)) {
    return Response.json({ valid: false, errors: ["ERROR: No file!"] }, { status: 400 });
  }

  const reader = new MasavReader();
  const result = reader.returnFileData(file.name, await readMasavFile(file));
  return Response.json({ valid: !!result.data, errors: result.errorMsg });
}

async function handleGenerate(req: Request): Promise<Response> {
  const body = (await req.json()) as MasavDesignedData;
  const rawFile = writer.mkRawfile(body);
  const rawFileBase64 = Buffer.from(rawFile, "binary").toString("base64");
  const fileName = `zikuim_${new Date().toISOString().replace(/[:T]/g, "-").slice(2, 19)}.txt`;

  return Response.json({
    fileName,
    rawFileBase64,
  });
}

async function readMasavFile(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const cp862Text = iconv.decode(bytes, "cp862");
  return Buffer.from(cp862Text, "utf8").toString("binary");
}

console.log(`MASAV API listening on http://localhost:${server.port}`);
