import { Request, Response } from "express";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export async function handlePhotoUpload(req: any, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.file;
    const fileExtension = file.originalname.split(".").pop() || "jpg";
    const fileName = `order-photos/${nanoid()}.${fileExtension}`;

    // Upload to S3
    const { key, url } = await storagePut(
      fileName,
      file.buffer,
      file.mimetype
    );

    return res.json({
      success: true,
      url,
      key,
      fileName: file.originalname,
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return res.status(500).json({
      error: "Failed to upload photo",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
