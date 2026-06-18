import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get("file") as File | null
  const uploadUrl = form.get("uploadUrl") as string | null
  const mimeType = form.get("mimeType") as string | null

  if (!file || !uploadUrl) {
    return NextResponse.json({ error: "Missing file or uploadUrl" }, { status: 400 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  // Only send Content-Type — x-amz-* headers must be signed in the presigned URL
  // to be included in the PUT. The checksum query param in the URL is sufficient.
  const headers: HeadersInit = {}
  if (mimeType) headers["Content-Type"] = mimeType

  console.log("[s3-upload] PUT to S3", {
    fileName: file.name,
    size: bytes.byteLength,
    mimeType,
    headers,
    url: uploadUrl.split("?")[0],
  })

  const s3Res = await fetch(uploadUrl, {
    method: "PUT",
    body: bytes,
    headers,
  })

  if (!s3Res.ok) {
    const body = await s3Res.text()
    console.error("[s3-upload] S3 PUT failed", { status: s3Res.status, body })
    return NextResponse.json({ error: body }, { status: s3Res.status })
  }

  console.log("[s3-upload] S3 PUT success", { key: new URL(uploadUrl).pathname })
  return NextResponse.json({ ok: true })
}
