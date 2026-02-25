import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { createUploadSignature } from "@/lib/cloudinary";
import { cloudinarySignSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Rasm yuklash uchun tizimga kiring." }, { status: 401 });
  }

  const raw = await request.json().catch(() => ({}));
  const payload = cloudinarySignSchema.safeParse({
    timestamp: raw.timestamp ?? Math.floor(Date.now() / 1000),
    folder: raw.folder ?? "target-portfolio",
    publicId: raw.publicId,
    expireAt: raw.expireAt,
  });

  if (!payload.success) {
    return NextResponse.json(
      { message: payload.error.issues[0]?.message ?? "Yuklash ma'lumoti noto'g'ri." },
      { status: 400 },
    );
  }

  const signature = createUploadSignature({
    folder: payload.data.folder,
    timestamp: payload.data.timestamp,
  });

  return NextResponse.json({
    message: "Yuklash imzosi yaratildi.",
    data: signature,
  });
}
