import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// This route runs on the server (Node.js runtime) and must never expose any
// credentials to the client. It uses the standard AWS credential provider
// chain (env vars, shared config/credentials files, or IAM role).

const region = process.env.AWS_REGION;
const bucket = process.env.BACKUP_S3_BUCKET;
const prefix = process.env.BACKUP_S3_PREFIX; // optional, e.g. "nightscout/"

if (!bucket) {
  // Fail fast during development if not configured.
  // In production this will be logged server-side.
  console.warn(
    "[backups/list] BACKUP_S3_BUCKET is not set; list endpoint will return 500."
  );
}

const s3Client = new S3Client(
  region
    ? {
        region
      }
    : {}
);

export async function GET() {
  if (!bucket) {
    return NextResponse.json(
      { error: "S3 bucket not configured on server." },
      { status: 500 }
    );
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 200
    });

    const result = await s3Client.send(command);

    const files =
      result.Contents?.map((obj) => ({
        key: obj.Key ?? "",
        lastModified: obj.LastModified?.toISOString(),
        size: obj.Size ?? 0
      })).filter((f) => f.key) ?? [];

    // Sort newest first (by LastModified)
    files.sort((a, b) => {
      if (!a.lastModified || !b.lastModified) return 0;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });

    return NextResponse.json({ files });
  } catch (err) {
    console.error("[backups/list] Error listing S3 objects", err);
    return NextResponse.json(
      { error: "Failed to list backups from S3." },
      { status: 500 }
    );
  }
}

