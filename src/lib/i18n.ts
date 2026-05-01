export const translations = {
  uz: {
    // Roles
    manufacturer: 'Ishlab chiqaruvchi',
    agent: 'Agent',
    
    // Navigation
    home: 'Asosiy',
    catalog: 'Katalog',
    orders: 'Buyurtmalar',
    clients: 'Mijozlar',
    cart: 'Savatcha',
    history: 'Tarix',
    dashboard: 'Panel',
    products: 'Mahsulotlar',
    agents: 'Agentlar',
    
    // General Actions
    add: 'Qo\'shish',
    save: 'Saqlash',
    delete: 'O\'chirish',
    cancel: 'Bekor qilish',
    edit: 'Tahrirlash',
    confirm: 'Tasdiqlash',
    search: 'Qidirish',
    back: 'Orqaga',
    loading: 'Yuklanmoqda...',
    error: 'Xatolik',
    success: 'Muvaffaqiyatli',
    
    // Product Related
    productName: 'Mahsulot nomi',
    price: 'Narxi',
    unit: 'Birlik',
    category: 'Toifa',
    description: 'Tavsif',
    minOrder: 'Minimal buyurtma',
    inStock: 'Omborda',
    addToCart: 'Savatchaga qo\'shish',
    medicine: 'Dori',
    drink: 'Ichimlik',
    food: 'Oziq-ovqat',
    other: 'Boshqa',
    
    // Order Related
    orderNumber: 'Buyurtma raqami',
    total: 'Jami',
    status: 'Holati',
    pending: 'Kutilmoqda',
    confirmed: 'Tasdiqlandi',
    shipped: 'Yuborildi',
    delivered: 'Yetkazildi',
    rejected: 'Rad etildi',
    cancelled: 'Bekor qilindi',
    orderItems: 'Buyurtma tovarlari',
    deliveryAddress: 'Yetkazib berish manzili',
    customerName: 'Mijoz ismi',
    customerPhone: 'Mijoz telefoni',
    notes: 'Izohlar',
    submitOrder: 'Buyurtma berish',
    orderSuccess: 'Buyurtma yuborildi!',
    orderSuccessDesc: 'Sizning buyurtmangiz ishlab chiqaruvchiga tasdiqlash uchun yuborildi.',
    trackOrder: 'Buyurtmani kuzatish',
    newOrder: 'Yangi buyurtma',
    
    // Client Management
    clientBase: 'Mijozlar bazasi',
    addClient: 'Mijoz qo\'shish',
    clientName: 'Mijoz nomi',
    noClients: 'Mijozlar hali yo\'q',
    pickClient: 'Mijozni tanlash',
    
    // Manufacturer Specific
    approveAgent: 'Agentni tasdiqlash',
    blockAgent: 'Agentni bloklash',
    activeAgents: 'Faol agentlar',
    pendingAgents: 'Kutilayotgan agentlar',
    totalSales: 'Umumiy savdo',
    activeProducts: 'Faol mahsulotlar',
  }
};

export type Language = 'uz';

export const useTranslation = () => {
  const t = (key: keyof typeof translations.uz) => {
    return translations.uz[key] || key;
  };
  return { t };
};
