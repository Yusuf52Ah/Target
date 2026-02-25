import type { ConversationMessage, DashboardStats, OrderCardData, SpecialistCardData, SpecialistDetailData } from "@/types";

export const mockSpecialists: SpecialistCardData[] = [
  {
    id: "mutaxassis-1",
    username: "behruz-ads",
    ism: "Behruz Akbarov",
    avatarUrl: "https://res.cloudinary.com/demo/image/upload/v1700000000/samples/man-portrait.jpg",
    bio: "5 yillik tajriba. E-commerce va lokal xizmatlar uchun Meta Ads skalasi.",
    hourlyRate: 220000,
    projectRate: 3200000,
    rating: 4.9,
    reviewsCount: 47,
    tajribaDarajasi: "EKSPERT",
    biznesNisha: "Onlayn do'kon",
    skills: ["Instagram Ads", "Meta Ads", "Lead Generation"],
    portfolioNatijalar: [
      { ctr: 3.8, cpc: 2200, roi: 4.9, budget: 12000000 },
      { ctr: 4.2, cpc: 2100, roi: 5.4, budget: 9000000 },
    ],
  },
  {
    id: "mutaxassis-2",
    username: "sarvinoz-target",
    ism: "Sarvinoz Ismoilova",
    avatarUrl: "https://res.cloudinary.com/demo/image/upload/v1700000000/samples/woman-on-a-football-field.jpg",
    bio: "Ta'lim va xizmat sektorida lidlar oqimini barqaror oshirish bo'yicha mutaxassis.",
    hourlyRate: 180000,
    projectRate: 2500000,
    rating: 4.8,
    reviewsCount: 33,
    tajribaDarajasi: "YUQORI",
    biznesNisha: "Ta'lim markazlari",
    skills: ["Meta Ads", "Lead Generation", "Lokal Biznes"],
    portfolioNatijalar: [
      { ctr: 3.1, cpc: 1900, roi: 4.2, budget: 7000000 },
      { ctr: 2.8, cpc: 2300, roi: 3.7, budget: 6000000 },
    ],
  },
  {
    id: "mutaxassis-3",
    username: "azizbek-performance",
    ism: "Azizbek Qodirov",
    avatarUrl: "https://res.cloudinary.com/demo/image/upload/v1700000000/samples/smile.jpg",
    bio: "Lokal bizneslar uchun tez test, aniq analitika va ROI markazli strategiya.",
    hourlyRate: 145000,
    projectRate: 1700000,
    rating: 4.6,
    reviewsCount: 18,
    tajribaDarajasi: "ORTA",
    biznesNisha: "Lokal biznes",
    skills: ["Instagram Ads", "Lokal Biznes"],
    portfolioNatijalar: [{ ctr: 2.7, cpc: 1700, roi: 3.1, budget: 4000000 }],
  },
];

export const mockSpecialistDetails: SpecialistDetailData[] = mockSpecialists.map((specialist, index) => ({
  ...specialist,
  userId: specialist.id,
  portfolios: [
    {
      id: `${specialist.id}-portfolio-${index + 1}`,
      title: "Sotuvni oshirish kampaniyasi",
      description:
        "Meta Ads orqali auditoriya segmentatsiyasi va kreatif test natijasida stabil lead oqimi yaratildi.",
      imageUrl:
        "https://res.cloudinary.com/demo/image/upload/v1700000000/samples/coffee.jpg",
      ctr: specialist.portfolioNatijalar[0]?.ctr ?? null,
      cpc: specialist.portfolioNatijalar[0]?.cpc ?? null,
      roi: specialist.portfolioNatijalar[0]?.roi ?? null,
      budget: specialist.portfolioNatijalar[0]?.budget ?? null,
      createdAt: new Date("2025-11-01"),
    },
  ],
  sharhlar: [
    {
      id: `${specialist.id}-sharh-1`,
      rating: 5,
      comment: "Natija tez chiqdi, hisobotlar aniq va tushunarli bo'ldi.",
      clientName: "Diyor Market",
      createdAt: new Date("2026-01-12"),
    },
    {
      id: `${specialist.id}-sharh-2`,
      rating: 4,
      comment: "Lid narxi oldingiga nisbatan sezilarli pasaydi.",
      clientName: "Samandar Education",
      createdAt: new Date("2025-12-21"),
    },
  ],
}));

export const mockOrders: OrderCardData[] = [
  {
    id: "buyurtma-1",
    title: "Onlayn do'kon uchun lid kampaniyasi",
    description: "30 kunlik test va optimizatsiya paketi.",
    budget: 3200000,
    escrowAmount: 3200000,
    status: "QABUL_QILINDI",
    paymentStatus: "ESCROWDA",
    commissionRate: 12,
    clientId: "mijoz-1",
    clientName: "Asror Savdo",
    specialistId: "mutaxassis-1",
    specialistName: "Behruz Akbarov",
    createdAt: new Date("2026-02-01"),
    provider: "PAYME",
  },
  {
    id: "buyurtma-2",
    title: "Ta'lim markazi uchun registratsiya oqimi",
    description: "Kursga yozilish uchun konversiya kampaniyasi.",
    budget: 2500000,
    escrowAmount: 0,
    status: "KUTILMOQDA",
    paymentStatus: "TOLANMAGAN",
    commissionRate: 12,
    clientId: "mijoz-1",
    clientName: "Asror Savdo",
    specialistId: "mutaxassis-2",
    specialistName: "Sarvinoz Ismoilova",
    createdAt: new Date("2026-02-10"),
    provider: null,
  },
];

export const mockMessages: ConversationMessage[] = [
  {
    id: "xabar-1",
    orderId: "buyurtma-1",
    content: "Assalomu alaykum, kreativlar tayyormi?",
    createdAt: new Date("2026-02-03T09:30:00"),
    senderId: "mijoz-1",
    senderName: "Asror Savdo",
    receiverId: "mutaxassis-1",
    receiverName: "Behruz Akbarov",
    isRead: true,
  },
  {
    id: "xabar-2",
    orderId: "buyurtma-1",
    content: "Va alaykum assalom, bugun 3 ta variant yuboraman.",
    createdAt: new Date("2026-02-03T10:10:00"),
    senderId: "mutaxassis-1",
    senderName: "Behruz Akbarov",
    receiverId: "mijoz-1",
    receiverName: "Asror Savdo",
    isRead: false,
  },
];

export const mockDashboardStats: DashboardStats = {
  jamiBuyurtma: 8,
  faolBuyurtma: 3,
  yakunlanganBuyurtma: 5,
  hamyonBalansi: 5800000,
  daromad: 12300000,
};
