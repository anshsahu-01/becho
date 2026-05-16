import { Readable } from "stream";
import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { AppError } from "./AppError";

const PRODUCT_IMAGES_FOLDER = "becho/products";

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string = PRODUCT_IMAGES_FOLDER
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function uploadImages(
  files: Express.Multer.File[],
  folder: string = PRODUCT_IMAGES_FOLDER
): Promise<string[]> {
  try {
    return await Promise.all(
      files.map((file) => uploadImageBuffer(file.buffer, folder))
    );
  } catch {
    throw new AppError("Failed to upload images", 500);
  }
}
