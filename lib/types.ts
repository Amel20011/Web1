export type ProductionStage =
  | 'paid_queued'
  | 'queued'
  | 'in_progress'
  | 'quality_control'
  | 'qc_revision'
  | 'final_review'
  | 'packing'
  | 'sent'
  | 'completed';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'refunded';

export type DeliveryStatus =
  | 'draft'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'delivery_unknown';

export interface StageInfo {
  id: ProductionStage;
  number: number;
  title: string;
  shortLabel: string;
  description: string;
  estimatedTime?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'super_admin';
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface ServiceProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  badge?: string;
  price: number;
  benefits: string[];
  estimatedDays: number;
  maxRevisions: number;
  commercialLicense: boolean;
  isActive: boolean;
  featured?: boolean;
}

export interface ServicePackage {
  id: 'basic' | 'premium';
  name: string;
  tagline: string;
  price: number;
  colorTheme: 'green' | 'blue' | 'orange';
  benefits: string[];
  limitations?: string[];
  maxRevisions: number;
  turnaroundEstimate: string;
  hasPriorityQueue: boolean;
  hasSourceFiles: boolean;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-202610-001"
  userId: string;
  userEmail: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  packageType: 'basic' | 'premium';
  projectName: string;
  projectDescription: string;
  audioReferenceUrl?: string;
  recipientGmail: string;
  notes?: string;
  priceSnapshot: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  productionStage: ProductionStage;
  queueNumber?: string; // e.g. "#BANDLAB", "#BANDLAB1"
  queuePosition?: number;
  isPriority: boolean;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  customerNote?: string;
  internalAdminNote?: string;
  qcChecklist?: {
    formatMatches: boolean;
    filenameCorrect: boolean;
    audioNotCutOff: boolean;
    transitionSmooth: boolean;
    noMissedSections: boolean;
    filePlayable: boolean;
    sourceFilesIncluded: boolean;
  };
  delivery?: {
    sentAt: string;
    recipient: string;
    subject: string;
    downloadUrl: string;
    fileSizeMb?: number;
    status: DeliveryStatus;
  };
}

export interface BannerItem {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  bgGradient: string;
  isActive: boolean;
  order: number;
}

export interface PromoCardItem {
  id: string;
  title: string;
  badge: string;
  price: number;
  benefits: string[];
  buttonText: string;
  colorScheme: 'lime' | 'blue' | 'orange' | 'yellow';
  linkTarget: string;
}

export interface ActivityHistoryItem {
  id: string;
  userId: string;
  eventType: 'product_viewed' | 'service_viewed' | 'banner_clicked' | 'order_created' | 'checkout_started' | 'delivery_opened';
  title: string;
  description: string;
  targetId?: string;
  targetUrl?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  target: 'customer' | 'admin' | 'all';
  userId?: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'queue' | 'delivery' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface CustomerServiceTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  orderNumber?: string;
  category: 'payment' | 'queue_status' | 'file_delivery' | 'audio_revision' | 'general';
  subject: string;
  message: string;
  status: 'open' | 'in_review' | 'resolved';
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  supportEmail: string;
  supportWhatsapp: string;
  operationalHours: string;
  welcomeMessage: string;
  qrisMerchantName: string;
  allowNewRegistrations: boolean;
  defaultRevisionCount: number;
}
