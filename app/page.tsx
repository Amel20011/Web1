'use client';

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Order,
  ServiceProduct,
  ServicePackage,
  BannerItem,
  PromoCardItem,
  NotificationItem,
  ActivityHistoryItem,
  SiteSettings,
} from '@/lib/types';
import {
  getCurrentUser,
  setCurrentUser,
  getOrders,
  getProducts,
  getPackages,
  getBanners,
  getPromoCards,
  getNotifications,
  getActivityHistory,
  getSiteSettings,
  subscribeToStore,
  addActivityHistory,
} from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { BottomNav, TabKey } from '@/components/BottomNav';
import { BannerCarousel } from '@/components/BannerCarousel';
import { PromoCards } from '@/components/PromoCards';
import { ServicesCatalog } from '@/components/ServicesCatalog';
import { TransactionsView } from '@/components/TransactionsView';
import { HistoryView } from '@/components/HistoryView';
import { ProfileView } from '@/components/ProfileView';
import { AuthModal } from '@/components/AuthModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderStepperModal } from '@/components/OrderStepperModal';
import { CustomerServiceModal } from '@/components/CustomerServiceModal';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Sparkles, Headphones, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

export default function Home() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Core Data States
  const [currentUser, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [products, setProducts] = useState<ServiceProduct[]>(() => getProducts());
  const [packages, setPackages] = useState<ServicePackage[]>(() => getPackages());
  const [banners, setBanners] = useState<BannerItem[]>(() => getBanners());
  const [promoCards, setPromoCards] = useState<PromoCardItem[]>(() => getPromoCards());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotifications('customer'));
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryItem[]>(() => getActivityHistory());
  const [settings, setSettings] = useState<SiteSettings | null>(() => getSiteSettings());

  // Modal Visibility States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [isCSOpen, setIsCSOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Selected entities for modals
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<ServiceProduct | null>(null);
  const [selectedPackageForOrder, setSelectedPackageForOrder] = useState<ServicePackage | null>(null);
  const [selectedOrderForStepper, setSelectedOrderForStepper] = useState<Order | null>(null);
  const [csOrderNumberPrefill, setCsOrderNumberPrefill] = useState<string>('');

  // Reload and subscription to store
  const refreshAll = () => {
    setUser(getCurrentUser());
    setOrders(getOrders());
    setProducts(getProducts());
    setPackages(getPackages());
    setBanners(getBanners());
    setPromoCards(getPromoCards());
    setNotifications(getNotifications('customer'));
    setActivityHistory(getActivityHistory());
    setSettings(getSiteSettings());
  };

  useEffect(() => {
    const unsubscribe = subscribeToStore(refreshAll);
    return () => unsubscribe();
  }, []);

  // Filter user orders
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.userId === currentUser.id ||
          o.userEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          o.recipientGmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : orders.slice(0, 2); // Show demo orders if unauthenticated so user can test tracking

  const activeOrdersCount = userOrders.filter(
    (o) => o.productionStage !== 'completed' && o.productionStage !== 'sent'
  ).length;

  // Handlers
  const handleSelectProduct = (product: ServiceProduct) => {
    setSelectedProductForOrder(product);
    setSelectedPackageForOrder(null);
    setIsCheckoutOpen(true);

    if (currentUser) {
      addActivityHistory({
        userId: currentUser.id,
        eventType: 'product_viewed',
        title: `Melihat Layanan: ${product.name}`,
        description: `Kategori ${product.category} - Rp ${product.price.toLocaleString('id-ID')}`,
        targetId: product.id,
      });
    }
  };

  const handleSelectPackage = (pkg: ServicePackage) => {
    setSelectedPackageForOrder(pkg);
    setSelectedProductForOrder(null);
    setIsCheckoutOpen(true);
  };

  const handleOpenOrderTracker = (order: Order) => {
    setSelectedOrderForStepper(order);
    setIsStepperOpen(true);
  };

  const handleOpenCSWithOrder = (orderNum?: string) => {
    setCsOrderNumberPrefill(orderNum || '');
    setIsCSOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setActiveTab('home');
  };

  // Switch to Admin Dashboard
  if (isAdminMode) {
    return <AdminDashboard onBackToCustomer={() => setIsAdminMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F8E8] pb-24 text-[#253126]">
      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        notifications={notifications}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        onGoToAdmin={() => setIsAdminMode(true)}
        brandName={settings?.brandName || 'Ban Spesialis'}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-5 sm:px-6">
        {/* ================= TAB 1: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Friendly Greeting Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#253126] tracking-tight">
                  Halo, {currentUser?.name?.trim() || 'Musisi Hebat'}! 🎵
                </h1>
                <p className="text-xs sm:text-sm text-[#526654] font-medium mt-0.5">
                  Selamat datang di Ban Spesialis — Studio produksi & editing audio berstandar komersial
                </p>
              </div>

              {/* Live Queue pill indicator */}
              <div className="badge-clay bg-white border border-[#DCE8C8] text-[#253126] text-xs py-1.5 px-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8FE000] ring-4 ring-[#8FE000]/25 animate-pulse" />
                <span>
                  Sistem Antrean: <strong>#BANDLAB</strong> Aktif
                </span>
              </div>
            </div>

            {/* Horizontal Swipeable Banner Carousel (3 Banners) */}
            <BannerCarousel
              banners={banners}
              onBannerAction={(banner) => {
                if (banner.buttonLink === '#packages') {
                  const basicPkg = packages.find((p) => p.id === 'basic') || packages[0];
                  handleSelectPackage(basicPkg);
                } else {
                  setActiveTab('services');
                }
              }}
            />

            {/* Promotional Cards (3 large puffy cards: Basic, Premium, Pensi) */}
            <PromoCards
              promoCards={promoCards}
              packages={packages}
              onSelectPromo={(promo) => {
                const prod = products.find((p) => p.id === promo.linkTarget);
                if (prod) {
                  handleSelectProduct(prod);
                } else {
                  setActiveTab('services');
                }
              }}
              onSelectPackage={handleSelectPackage}
            />

            {/* Featured Services Preview Section */}
            <div className="card-clay p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-[#253126]">
                    Layanan Musik Terpopuler
                  </h3>
                  <p className="text-xs text-[#526654]">
                    Diproses cepat dengan nomor antrean teratur & hasil dikirim ke Gmail
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('services')}
                  className="btn-clay-white px-3.5 py-1.5 text-xs font-black flex items-center gap-1"
                >
                  <span>Lihat Semua ({products.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#63C926]" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {products.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className="p-4 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] hover:border-[#63C926] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold text-[#38A9F4] uppercase tracking-wider block mb-1">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-black text-[#253126] mb-1 leading-snug">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-[#556957] line-clamp-2 mb-3">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#DEEAC4]">
                      <span className="text-xs font-black text-[#253126]">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] font-black text-[#63C926]">
                        Pesan →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Orders Tracker Card on Home (if any active) */}
            {userOrders.length > 0 && (
              <div className="card-clay-blue p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#C5E6FC] flex items-center justify-center text-[#145a88] shadow-xs shrink-0">
                    <Headphones className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="badge-clay bg-white text-[#145a88] border border-[#C5E6FC] text-[9px] mb-1">
                      Pesanan Aktif ({userOrders[0].queueNumber || 'Memproses'})
                    </span>
                    <h4 className="text-sm font-black text-[#253126]">
                      {userOrders[0].projectName || userOrders[0].serviceName}
                    </h4>
                    <p className="text-xs text-[#4f6451]">
                      Status saat ini:{' '}
                      <strong className="text-[#145a88]">
                        Tahap {userOrders[0].productionStage}
                      </strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenOrderTracker(userOrders[0])}
                  className="btn-clay-blue px-4 py-2 text-xs font-black shrink-0 w-full sm:w-auto"
                >
                  Lacak Stepper 9 Tahap
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SERVICES ================= */}
        {activeTab === 'services' && (
          <ServicesCatalog
            products={products}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* ================= TAB 3: HISTORY ================= */}
        {activeTab === 'history' && (
          <HistoryView
            historyItems={activityHistory}
            onExploreServices={() => setActiveTab('services')}
          />
        )}

        {/* ================= TAB 4: TRANSACTIONS & QUEUE ================= */}
        {activeTab === 'transactions' && (
          <TransactionsView
            orders={userOrders}
            onSelectOrder={handleOpenOrderTracker}
            onNewOrderClick={() => setActiveTab('services')}
          />
        )}

        {/* ================= TAB 5: PROFILE ================= */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            onOpenCS={() => setIsCSOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile (and responsive desktop) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => setActiveTab(t)}
        activeOrderCount={activeOrdersCount}
      />

      {/* MODALS */}
      {/* 1. Auth Modal (Gmail + 4-Digit PIN) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          refreshAll();
        }}
        welcomeMessage={settings?.welcomeMessage}
      />

      {/* 2. Checkout & Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        currentUser={currentUser}
        selectedProduct={selectedProductForOrder}
        selectedPackage={selectedPackageForOrder}
        packages={packages}
        onOrderSuccess={(order) => {
          refreshAll();
          handleOpenOrderTracker(order);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 3. 9-Stage Stepper & Queue Tracking Modal */}
      <OrderStepperModal
        order={selectedOrderForStepper}
        allOrders={orders}
        isOpen={isStepperOpen}
        onClose={() => setIsStepperOpen(false)}
        onOpenCS={handleOpenCSWithOrder}
      />

      {/* 4. Customer Service Center Modal */}
      <CustomerServiceModal
        isOpen={isCSOpen}
        onClose={() => setIsCSOpen(false)}
        currentUser={currentUser}
        initialOrderNumber={csOrderNumberPrefill}
      />

      {/* 5. Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        currentUserId={currentUser?.id}
        onNotificationClick={(n) => {
          setIsNotifDrawerOpen(false);
          if (n.actionUrl?.startsWith('/orders/')) {
            const orderId = n.actionUrl.replace('/orders/', '');
            const ord = orders.find((o) => o.id === orderId);
            if (ord) handleOpenOrderTracker(ord);
          } else {
            setActiveTab('transactions');
          }
        }}
      />
    </div>
  );
}
