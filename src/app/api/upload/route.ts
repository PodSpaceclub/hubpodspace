import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Imagem deve ter no máximo 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine upload directory.
    // Default: one level above the app directory (outside git) so files
    // persist across redeployments on Hostinger.
    // Override by setting UPLOAD_DIR env var.
    const uploadDir =
      process.env.UPLOAD_DIR ??
      path.join(process.cwd(), "..", "uploads");

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Determine public URL.
    // Default: served via /api/files/[filename] Next.js route.
    // Override by setting UPLOAD_URL_PREFIX env var.
    const urlPrefix = process.env.UPLOAD_URL_PREFIX ?? "/api/files";
    const url = `${urlPrefix}/${filename}`;

    console.log(`[upload] saved: ${filepath} → ${url}`);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[upload] error:", error);
    return NextResponse.json({ error: "Erro ao salvar imagem" }, { status: 500 });
  }
}
