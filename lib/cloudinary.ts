import crypto from "crypto";

import { v2 as cloudinary } from "cloudinary";

import { hasEnv, requireEnv } from "@/lib/env";

const hasCloudinaryConfig =
  hasEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME") && hasEnv("CLOUDINARY_API_KEY") && hasEnv("CLOUDINARY_API_SECRET");

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
  });
}

function getCloudinarySecrets() {
  return {
    cloudName: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "required for Cloudinary upload signatures"),
    apiKey: requireEnv("CLOUDINARY_API_KEY", "required for Cloudinary upload signatures"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET", "required for Cloudinary upload signatures"),
  };
}

export function createUploadSignature({
  folder,
  timestamp,
}: {
  folder: string;
  timestamp: number;
}) {
  const { cloudName, apiKey, apiSecret } = getCloudinarySecrets();
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
