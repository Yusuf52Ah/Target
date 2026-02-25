import crypto from "crypto";

import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export function createUploadSignature({
  folder,
  timestamp,
}: {
  folder: string;
  timestamp: number;
}) {
  const signPayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signPayload).digest("hex");

  return {
    signature,
    apiKey,
    cloudName,
    timestamp,
    folder,
  };
}

export { cloudinary };
