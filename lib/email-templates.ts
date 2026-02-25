export function verificationEmailHtml(url: string) {
  return `
    <div style="background:#06070d;padding:28px;font-family:Arial,sans-serif;color:#f5f5f5;">
      <h1 style="font-size:22px;margin:0 0 12px;">TargetUZ platformasiga kirish</h1>
      <p style="font-size:14px;line-height:1.5;margin:0 0 16px;">
        Hisobingizga kirish uchun quyidagi tugmani bosing. Havola faqat bir martalik va xavfsiz.
      </p>
      <a href="${url}" style="display:inline-block;background:#22c55e;color:#07110a;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700;">
        Tasdiqlash va kirish
      </a>
      <p style="font-size:12px;opacity:.75;margin-top:16px;">
        Agar bu so'rov sizga tegishli bo'lmasa, ushbu xatni e'tiborsiz qoldiring.
      </p>
    </div>
  `;
}

export function verificationEmailText(url: string) {
  return `TargetUZ platformasiga kirish uchun havola: ${url}\nAgar bu so'rov sizga tegishli bo'lmasa, e'tiborsiz qoldiring.`;
}
