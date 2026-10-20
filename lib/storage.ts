import {
  Order,
  ServiceProduct,
  ServicePackage,
  BannerItem,
  PromoCardItem,
  UserProfile,
  ActivityHistoryItem,
  NotificationItem,
  SiteSettings,
  CustomerServiceTicket,
  ProductionStage,
  DeliveryStatus,
} from './types';
import {
  INITIAL_BANNERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PACKAGES,
  INITIAL_PRODUCTS,
  INITIAL_PROMO_CARDS,
  INITIAL_SETTINGS,
} from './mock-data';
import { getNextQueueSequence, formatQueueNumber } from './queue-logic';

const STORAGE_KEYS = {
  CURRENT_USER: 'bs_current_user_v1',
  ADMIN_USER: 'bs_admin_user_v1',
  PRODUCTS: 'bs_products_v1',
  PACKAGES: 'bs_packages_v1',
  BANNERS: 'bs_banners_v1',
  PROMOS: 'bs_promos_v1',
  ORDERS: 'bs_orders_v1',
  HISTORY: 'bs_history_v1',
  NOTIFICATIONS: 'bs_notifications_v1',
  SETTINGS: 'bs_settings_v1',
  TICKETS: 'bs_tickets_v1',
  USERS_CREDENTIALS: 'bs_users_credentials_v1',
};

// Simple event dispatcher for cross-component re-renders
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyStoreChange() {
  if (typeof window !== 'undefined') {
    listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Error notifying store listener', err);
      }
    });
  }
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notifyStoreChange();
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

// ---------------- USER AUTH STORE ----------------
export function getCurrentUser(): UserProfile | null {
  return getFromStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: UserProfile | null): void {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function getAdminUser(): UserProfile | null {
  return getFromStorage<UserProfile | null>(STORAGE_KEYS.ADMIN_USER, null);
}

export function setAdminUser(user: UserProfile | null): void {
  setToStorage(STORAGE_KEYS.ADMIN_USER, user);
}

// ---------------- PRODUCTS & PACKAGES ----------------
export function getProducts(): ServiceProduct[] {
  return getFromStorage<ServiceProduct[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export function saveProducts(products: ServiceProduct[]): void {
  setToStorage(STORAGE_KEYS.PRODUCTS, products);
}

export function getPackages(): ServicePackage[] {
  return getFromStorage<ServicePackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
}

export function savePackages(packages: ServicePackage[]): void {
  setToStorage(STORAGE_KEYS.PACKAGES, packages);
}

// ---------------- BANNERS & PROMOS ----------------
export function getBanners(): BannerItem[] {
  return getFromStorage<BannerItem[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
}

export function saveBanners(banners: BannerItem[]): void {
  setToStorage(STORAGE_KEYS.BANNERS, banners);
}

export function getPromoCards(): PromoCardItem[] {
  return getFromStorage<PromoCardItem[]>(STORAGE_KEYS.PROMOS, INITIAL_PROMO_CARDS);
}

export function savePromoCards(cards: PromoCardItem[]): void {
  setToStorage(STORAGE_KEYS.PROMOS, cards);
}

// ---------------- ORDERS & QUEUE ----------------
export function getOrders(): Order[] {
  return getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}

export function saveOrders(orders: Order[]): void {
  setToStorage(STORAGE_KEYS.ORDERS, orders);
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id || o.orderNumber === id);
}

export function createNewOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'productionStage'>): Order {
  const orders = getOrders();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = (orders.length + 1).toString().padStart(3, '0');
  const orderNumber = `ORD-${dateStr}-${seq}`;

  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    productionStage: 'paid_queued', // Stage 1
  };

  // If already marked as paid (or paying immediately in simulated checkout)
  if (newOrder.paymentStatus === 'paid') {
    // Generate queue number
    const existingQueueNumbers = orders.map((o) => o.queueNumber).filter(Boolean) as string[];
    const nextSeq = getNextQueueSequence(existingQueueNumbers);
    newOrder.queueNumber = formatQueueNumber(nextSeq);
    newOrder.paidAt = new Date().toISOString();
  }

  orders.unshift(newOrder);
  saveOrders(orders);

  // Record activity history
  addActivityHistory({
    userId: newOrder.userId,
    eventType: 'order_created',
    title: `Pemesanan dibuat: ${newOrder.serviceName}`,
    description: `Nomor pesanan ${newOrder.orderNumber} dengan paket ${newOrder.packageType.toUpperCase()}`,
    targetId: newOrder.id,
  });

  // Create notifications
  addNotification({
    target: 'customer',
    userId: newOrder.userId,
    title: 'Pesanan Diterima!',
    message: `Pesanan ${newOrder.orderNumber} berhasil dibuat dan tercatat di sistem.`,
    type: 'order',
    actionUrl: `/orders/${newOrder.id}`,
  });

  addNotification({
    target: 'admin',
    title: `Pesanan Baru (${newOrder.queueNumber || 'Menunggu Pembayaran'})`,
    message: `Pelanggan ${newOrder.userName} memesan ${newOrder.serviceName}`,
    type: 'order',
    actionUrl: `/admin/orders`,
  });

  return newOrder;
}

export function updateOrderStage(
  orderId: string,
  stage: ProductionStage,
  customerNote?: string,
  internalAdminNote?: string
): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const current = orders[index];
  const updated: Order = {
    ...current,
    productionStage: stage,
    customerNote: customerNote !== undefined ? customerNote : current.customerNote,
    internalAdminNote: internalAdminNote !== undefined ? internalAdminNote : current.internalAdminNote,
  };

  if (stage === 'completed' && !updated.completedAt) {
    updated.completedAt = new Date().toISOString();
  }

  orders[index] = updated;
  saveOrders(orders);

  // Notify customer
  addNotification({
    target: 'customer',
    userId: updated.userId,
    title: `Update Pesanan (${updated.orderNumber})`,
    message: customerNote || `Status pesanan Anda kini beralih ke tahap: ${stage}`,
    type: 'order',
    actionUrl: `/orders/${updated.id}`,
  });

  return updated;
}

export function updateOrderQcChecklist(
  orderId: string,
  qcChecklist: NonNullable<Order['qcChecklist']>
): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  orders[index].qcChecklist = qcChecklist;
  saveOrders(orders);
  return orders[index];
}

export function dispatchDeliveryEmail(
  orderId: string,
  deliveryData: {
    recipient: string;
    subject: string;
    downloadUrl: string;
    fileSizeMb?: number;
  }
): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const updated: Order = {
    ...orders[index],
    productionStage: 'sent', // Stage 8
    delivery: {
      sentAt: new Date().toISOString(),
      recipient: deliveryData.recipient,
      subject: deliveryData.subject,
      downloadUrl: deliveryData.downloadUrl,
      fileSizeMb: deliveryData.fileSizeMb || 25.4,
      status: 'sent' as DeliveryStatus,
    },
    customerNote: `File hasil final telah terkirim ke Gmail (${deliveryData.recipient}). Periksa inbox/spam Anda!`,
  };

  orders[index] = updated;
  saveOrders(orders);

  addNotification({
    target: 'customer',
    userId: updated.userId,
    title: 'Hasil Musik Terkirim ke Gmail! 🎵',
    message: `File pesanan ${updated.orderNumber} telah dikirim ke ${deliveryData.recipient}. Silakan cek Gmail Anda!`,
    type: 'delivery',
    actionUrl: `/orders/${updated.id}`,
  });

  addActivityHistory({
    userId: updated.userId,
    eventType: 'delivery_opened',
    title: 'Pengiriman Hasil via Gmail Berhasil',
    description: `Subjek: ${deliveryData.subject} ke ${deliveryData.recipient}`,
    targetId: updated.id,
  });

  return updated;
}

// ---------------- ACTIVITY HISTORY ----------------
export function getActivityHistory(userId?: string): ActivityHistoryItem[] {
  const list = getFromStorage<ActivityHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
  if (!userId) return list;
  return list.filter((h) => h.userId === userId);
}

export function addActivityHistory(
  item: Omit<ActivityHistoryItem, 'id' | 'timestamp'>
): void {
  const list = getActivityHistory();
  const newItem: ActivityHistoryItem = {
    ...item,
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
  };
  list.unshift(newItem);
  // Keep last 100 entries
  setToStorage(STORAGE_KEYS.HISTORY, list.slice(0, 100));
}

// ---------------- NOTIFICATIONS ----------------
export function getNotifications(target?: 'customer' | 'admin', userId?: string): NotificationItem[] {
  const list = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  if (!target) return list;
  return list.filter((n) => {
    if (n.target === 'all') return true;
    if (n.target !== target) return false;
    if (target === 'customer' && userId && n.userId && n.userId !== userId) return false;
    return true;
  });
}

export function addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): void {
  const list = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const newItem: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newItem);
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 50));
}

export function markNotificationAsRead(id: string): void {
  const list = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
}

export function markAllNotificationsAsRead(target?: 'customer' | 'admin', userId?: string): void {
  const list = getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const updated = list.map((n) => {
    if (target && n.target !== 'all' && n.target !== target) return n;
    if (target === 'customer' && userId && n.userId && n.userId !== userId) return n;
    return { ...n, isRead: true };
  });
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
}

// ---------------- CUSTOMER SERVICE TICKETS ----------------
export function getTickets(userId?: string): CustomerServiceTicket[] {
  const list = getFromStorage<CustomerServiceTicket[]>(STORAGE_KEYS.TICKETS, [
    {
      id: 'tkt-1',
      ticketNumber: 'TKT-1001',
      userId: 'usr-customer-1',
      userEmail: 'amelcns8@gmail.com',
      orderNumber: 'ORD-202610-001',
      category: 'audio_revision',
      subject: 'Pertanyaan format file pensi',
      message: 'Halo min, nanti apakah filenya dikirim dalam bentuk MP3 dan WAV sekaligus?',
      status: 'resolved',
      createdAt: '2026-10-20T03:45:00Z',
      adminReply: 'Halo kak! Betul sekali, untuk Paket Basic kami sediakan MP3 320kbps dan WAV 16-bit ya.',
      repliedAt: '2026-10-20T03:50:00Z',
    },
  ]);
  if (!userId) return list;
  return list.filter((t) => t.userId === userId);
}

export function createTicket(data: Omit<CustomerServiceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>): CustomerServiceTicket {
  const list = getTickets();
  const newTicket: CustomerServiceTicket = {
    ...data,
    id: `tkt-${Date.now()}`,
    ticketNumber: `TKT-${1000 + list.length + 1}`,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  list.unshift(newTicket);
  setToStorage(STORAGE_KEYS.TICKETS, list);

  addNotification({
    target: 'admin',
    title: `Tiket Bantuan Baru (${newTicket.ticketNumber})`,
    message: `Pertanyaan dari ${newTicket.userEmail}: ${newTicket.subject}`,
    type: 'system',
    actionUrl: '/admin/settings',
  });

  return newTicket;
}

export function replyTicket(ticketId: string, replyText: string): CustomerServiceTicket | null {
  const list = getTickets();
  const index = list.findIndex((t) => t.id === ticketId);
  if (index === -1) return null;

  list[index].adminReply = replyText;
  list[index].repliedAt = new Date().toISOString();
  list[index].status = 'resolved';
  setToStorage(STORAGE_KEYS.TICKETS, list);

  addNotification({
    target: 'customer',
    userId: list[index].userId,
    title: `Balasan CS Ban Spesialis (${list[index].ticketNumber})`,
    message: replyText,
    type: 'system',
  });

  return list[index];
}

// ---------------- SITE SETTINGS ----------------
export function getSiteSettings(): SiteSettings {
  return getFromStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveSiteSettings(settings: SiteSettings): void {
  setToStorage(STORAGE_KEYS.SETTINGS, settings);
}

// ---------------- USER CREDENTIALS (PIN STORAGE) ----------------
interface StoredCredential {
  email: string;
  pinHash: string;
  name: string;
  updatedAt: string;
}

export function getStoredCredentials(): StoredCredential[] {
  return getFromStorage<StoredCredential[]>(STORAGE_KEYS.USERS_CREDENTIALS, [
    {
      email: 'amelcns8@gmail.com',
      pinHash: '1234', // standard demo PIN
      name: 'Amel Musisi',
      updatedAt: '2026-10-20T00:00:00Z',
    },
  ]);
}

export function saveUserCredential(email: string, pinHash: string, name?: string): void {
  const list = getStoredCredentials();
  const index = list.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  const entry: StoredCredential = {
    email: email.toLowerCase(),
    pinHash,
    name: name || (index !== -1 ? list[index].name : email.split('@')[0]),
    updatedAt: new Date().toISOString(),
  };

  if (index !== -1) {
    list[index] = entry;
  } else {
    list.push(entry);
  }
  setToStorage(STORAGE_KEYS.USERS_CREDENTIALS, list);
}

export function findUserCredential(email: string): StoredCredential | undefined {
  return getStoredCredentials().find((u) => u.email.toLowerCase() === email.toLowerCase());
}
