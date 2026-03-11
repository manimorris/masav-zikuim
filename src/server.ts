import { MasavReader } from "./lib/masav-reader";
import { MasavWriter } from "./lib/masav-writer";
import { OpenformatReader } from "./lib/openformat-reader";
import { getMosadProfile, saveMosadProfile, getAllMosadProfiles, deleteMosadProfile, type MosadProfile } from "./lib/mosad-store";
import type { MasavDesignedData } from "./lib/masav-types";
import { extname, join } from "node:path";

const writer = new MasavWriter();
const CLIENT_BUILD_DIR = "client/build";

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/masav/read") {
      return handleRead(req);
    }

    if (req.method === "POST" && url.pathname === "/api/masav/validate") {
      return handleValidate(req);
    }

    if (req.method === "POST" && url.pathname === "/api/masav/generate") {
      return handleGenerate(req);
    }

    if (req.method === "GET" && url.pathname === "/api/mosad-profiles") {
      return handleGetMosadProfiles();
    }

    if (req.method === "POST" && url.pathname === "/api/mosad-profiles") {
      return handleSaveMosadProfile(req);
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/api/mosad-profiles/")) {
      const employerId = url.pathname.replace("/api/mosad-profiles/", "");
      return handleDeleteMosadProfile(employerId);
    }

    if (req.method === "GET") {
      return serveClientAsset(url.pathname);
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
});

async function serveClientAsset(pathname: string): Promise<Response> {
  const normalizedPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = join(CLIENT_BUILD_DIR, normalizedPath);
  const file = Bun.file(filePath);

  if (await file.exists()) {
    return new Response(file, {
      headers: { "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream" },
    });
  }

  if (pathname.startsWith("/api/") || normalizedPath.includes(".")) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(Bun.file(join(CLIENT_BUILD_DIR, "index.html")), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function handleRead(req: Request): Promise<Response> {
  const formData = await req.formData();
  const file = formData.get("msvZfile");

  if (!(file instanceof File)) {
    return Response.json({ errors: ["ERROR: No file!"] }, { status: 400 });
  }

  // Peek at the file as UTF-8 to detect format before committing to binary
  const utf8Content = await file.text();
  const isOpenformat = isOpenformatFile(file.name, utf8Content);
  const fileContent = isOpenformat ? utf8Content : await readMasavFile(file);

  const result = isOpenformat
    ? new OpenformatReader().returnFileData(file.name, fileContent)
    : new MasavReader().returnFileData(file.name, fileContent);

  if (!result.data) {
    return Response.json({ errors: result.errorMsg }, { status: 422 });
  }

  // For openformat files, check if we have a saved mosad profile
  let needsMosadCode = false;
  const data = result.data as MasavDesignedData & { employerId?: string };

  if (isOpenformat && data.employerId) {
    const mosadProfile = await getMosadProfile(data.employerId);
    if (mosadProfile) {
      // Auto-fill mosad code from saved profile
      data.mosad.codeMosad = mosadProfile.codeMosad;
      data.mosad.codeMosadSubject = mosadProfile.codeMosadSubject;
    } else {
      // Mosad code needs to be provided
      needsMosadCode = true;
    }
  }

  return Response.json({
    ...data,
    isOpenformat,
    needsMosadCode,
  });
}

function isOpenformatFile(fileName: string, content: string): boolean {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  const trimmed = content.trim();
  return ext === "dat" || ext === "xml" || trimmed.startsWith("<?xml") || trimmed.startsWith("<MimshakMaasikim");
}

async function handleValidate(req: Request): Promise<Response> {
  const formData = await req.formData();
  const file = formData.get("msvZfile");

  if (!(file instanceof File)) {
    return Response.json({ valid: false, errors: ["ERROR: No file!"] }, { status: 400 });
  }

  const utf8Content = await file.text();
  const isOpenformat = isOpenformatFile(file.name, utf8Content);
  const fileContent = isOpenformat ? utf8Content : await readMasavFile(file);

  const result = isOpenformat
    ? new OpenformatReader().returnFileData(file.name, fileContent)
    : new MasavReader().returnFileData(file.name, fileContent);

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
  return bytes.toString("binary");
}

async function handleGetMosadProfiles(): Promise<Response> {
  const profiles = await getAllMosadProfiles();
  return Response.json(profiles);
}

async function handleSaveMosadProfile(req: Request): Promise<Response> {
  const body = (await req.json()) as MosadProfile;

  if (!body.employerId || !body.codeMosad || !body.codeMosadSubject) {
    return Response.json(
      { error: "Missing required fields: employerId, codeMosad, codeMosadSubject" },
      { status: 400 }
    );
  }

  await saveMosadProfile(body);
  return Response.json({ success: true });
}

async function handleDeleteMosadProfile(employerId: string): Promise<Response> {
  const deleted = await deleteMosadProfile(employerId);
  if (deleted) {
    return Response.json({ success: true });
  }
  return Response.json({ error: "Mosad profile not found" }, { status: 404 });
}

console.log(`MASAV API listening on http://localhost:${server.port}`);
