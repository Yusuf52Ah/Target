import { NextResponse } from "next/server";

import { createUploadSignature } from "@/lib/cloudinary";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";
import { cloudinarySignSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Rasm yuklash uchun tizimga kiring." }, { status: 401 });
  }

  if (session.user.role !== "SPECIALIST" && session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Rasm yuklash huquqi faqat mutaxassislar uchun." }, { status: 403 });
  }

  const rateKey = getRateLimitKey(request, "api:upload:signature", session.user.id);
  const rateState = checkRateLimit(rateKey, { windowMs: 60_000, maxRequests: 40 });
  if (!rateState.allowed) {
    return NextResponse.json(
      { message: "So'rovlar soni juda ko'p. Bir ozdan keyin qayta urinib ko'ring." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateState.retryAfterSeconds),
        },
      },
    );
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

  try {
    const signature = createUploadSignature({
      folder: payload.data.folder,
      timestamp: payload.data.timestamp,
    });

    return NextResponse.json({
      message: "Yuklash imzosi yaratildi.",
      data: signature,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Cloudinary imzosini yaratishda xatolik yuz berdi.",
      },
      { status: 500 },
    );
  }
}
