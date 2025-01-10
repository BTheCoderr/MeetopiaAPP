import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    // Check authentication with authOptions
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("Upload error: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request data
    const { filename, contentType, title, description } = await req.json();
    
    if (!filename || !contentType || !title) {
      console.error("Upload error: Missing fields", { filename, contentType, title });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log environment variables (without sensitive data)
    console.log("AWS Config:", {
      region: process.env.AWS_REGION,
      bucketName: process.env.AWS_BUCKET_NAME,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    // Generate unique key for the video
    const key = `videos/${Date.now()}-${filename}`;

    // Create presigned URL for upload
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 3600,
      });

      // Create video record in database with the user ID from the session
      const video = await prisma.video.create({
        data: {
          title,
          description: description || "",
          url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
          userId: session.user.id,
        },
      });

      console.log("Successfully created video record:", video.id);

      // Return the presigned URL
      return NextResponse.json({
        url: presignedUrl,
        fields: {},
      });
    } catch (s3Error: any) {
      console.error("S3 Error details:", {
        message: s3Error.message,
        code: s3Error.code,
        requestId: s3Error.$metadata?.requestId,
      });
      return NextResponse.json(
        { error: `Failed to generate upload URL: ${s3Error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error details:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Failed to process upload: ${error.message}` },
      { status: 500 }
    );
  }
} 