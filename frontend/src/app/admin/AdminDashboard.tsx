'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getTotalStorageWithAggregation, createStorageSummary } from '@/lib/storageUtils';
import { getApiUrl, getAdminApiUrl } from '@/lib/apiConfig';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}
import type { Product, Tag } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { type ProductType } from '@/lib/productSchema';
import Icon from '@/components/ui/AppIcon';
import { UploadDropzone } from '@/utils/uploadthing';
import Link from 'next/link';

import { ThemedSelect } from '@/components/ui/ThemedSelect';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CyberSwitch from '@/components/ui/CyberSwitch';
import InventoryAudit from '@/components/admin/InventoryAudit';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { AnalyticsErrorBoundary } from '@/components/error/ErrorBoundary';


type TabType = 'products' | 'orders' | 'analytics' | 'shipping';

const ORDER_STATUS_LABEL: Record<string, string> = {
  Pending: 'معلق',
  AwaitingPickup: 'في انتظار الاستلام',
  Shipping: 'جاري شحن الطلب',
  Completed: 'تم الاستلام',
  Cancelled: 'ملغي',
};

const ORDER_STATUS_STYLE: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  AwaitingPickup: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Shipping: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminDashboard() {
  const router = useRouter();
  const {
    logout,
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    isAuthenticated,
  } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [notification, setNotification] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth check on mount - simplified localStorage check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      window.location.href = '/admin/login';
    } else {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (authChecked) {
      fetchProducts();
    }
  }, [fetchProducts, authChecked]);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleLogout = () => {
    // Clear localStorage authentication
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('token');
    window.location.href = '/admin/login';
  };

  // Show loading state while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-text-muted">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base" dir="rtl">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 rounded-xl text-sm font-semibold text-text-primary shadow-glow-md"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="glass-card border-b border-border sticky top-0 z-40 shadow-glass">
        <div className="section-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-glow-sm"
            >
              <Icon name="Squares2X2Icon" size={24} className="text-text-dark-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary leading-tight font-readex tracking-tight">
                لوحة التحكم
              </h1>
              <span className="text-text-secondary text-sm opacity-80">أبوكرتونة</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="btn-ghost px-4 py-2.5 font-medium flex items-center gap-2"
              >
                <Icon name="HomeIcon" size={18} />
                <span className="hidden sm:inline">المتجر</span>
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2.5 font-medium text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2 transition-all duration-300"
            >
              <Icon name="ArrowRightOnRectangleIcon" size={18} />
              <span className="hidden sm:inline">خروج</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="section-container py-8">
        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'إجمالي المنتجات',
              value: products.length,
              icon: 'CubeIcon',
              bg: 'bg-brand/20',
              color: 'text-brand',
              trend: '+12%',
            },
            {
              label: 'متوفر في المخزن',
              value: products.filter((p) => p.stockCount > 0).length,
              icon: 'CheckCircleIcon',
              bg: 'bg-green-500/20',
              color: 'text-green-400',
              trend: '+8%',
            },
            {
              label: 'نفد المخزون',
              value: products.filter((p) => p.stockCount === 0).length,
              icon: 'ExclamationTriangleIcon',
              bg: 'bg-amber-500/20',
              color: 'text-amber-400',
              trend: '-3%',
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="stat-card glass-card p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}
                >
                  <Icon name={stat.icon as any} size={24} className={stat.color} />
                </div>
                <div>
                  <motion.p
                    className="text-3xl font-bold text-text-primary leading-none mb-1"
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.3 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-text-secondary text-sm">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-2 glass-card rounded-xl border border-border mb-8 w-fit">
          {[
            { id: 'products' as TabType, label: 'المنتجات', icon: 'CubeIcon' },
            { id: 'analytics' as TabType, label: 'التحليلات', icon: 'ChartBarIcon' },
            { id: 'orders' as TabType, label: 'الطلبات', icon: 'ShoppingBagIcon' },
            { id: 'shipping' as TabType, label: 'الشحن', icon: 'TruckIcon' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-glow-sm'
                  : 'text-text-secondary hover:text-brand hover:bg-surface-hover'
              }`}
            >
              <Icon name={tab.icon as any} size={18} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProductsManager
                products={products}
                onRefresh={fetchProducts}
                onCreate={createProduct}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
                showNotification={showNotification}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsErrorBoundary>
                <AnalyticsDashboard />
              </AnalyticsErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OrdersManager showNotification={showNotification} />
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShippingManager showNotification={showNotification} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProductsManager({
  products,
  onRefresh,
  onCreate,
  onUpdate,
  onDelete,
  showNotification,
}: {
  products: Product[];
  onRefresh: () => void;
  onCreate: (p: any) => Promise<Product>;
  onUpdate: (id: string, p: any) => Promise<Product>;
  onDelete: (id: string) => Promise<void>;
  showNotification: (msg: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'laptops' as ProductType,
    subtype: '',
    price: 0,
    oldPrice: 0,
    description: '',
    images: [] as string[],
    stockCount: 0,
    storageCapacity: 0,
    gbSize: 0,
    isSale: false,
    isBrandActive: false,
    brands: [] as string[],
    tags: [] as string[],
    dataDetails: [] as string[],
  });

  const [newDataDetail, setNewDataDetail] = useState('');

  // Dynamic subcategories state
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subCatLoading, setSubCatLoading] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState('');

  // Fetch subcategories when type changes
  useEffect(() => {
    if (!formData.type) return;
    setSubCatLoading(true);
    fetch(getApiUrl(`categories/${formData.type}/subcategories`))
      .then((res) => res.json())
      .then((data) => {
        setSubCategories(data.subCategories || []);
      })
      .catch(() => setSubCategories([]))
      .finally(() => setSubCatLoading(false));
  }, [formData.type]);

  // Initialize form data when editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        type: editingProduct.type || 'laptops',
        subtype: editingProduct.subtype || '',
        price: editingProduct.price || 0,
        oldPrice: editingProduct.oldPrice || 0,
        description: editingProduct.description || '',
        images: Array.isArray(editingProduct.images) ? [...editingProduct.images] : [],
        stockCount: editingProduct.stockCount || 0,
        storageCapacity: editingProduct.storageCapacity || 0,
        gbSize: editingProduct.gbSize || 0,
        dataDetails: Array.isArray((editingProduct as any).dataDetails) ? [...(editingProduct as any).dataDetails] : [],
        isSale: editingProduct.isSale ?? false,
        isBrandActive: editingProduct.isBrandActive ?? false,
        brands: Array.isArray(editingProduct.brands) ? [...editingProduct.brands] : [],
        tags: Array.isArray(editingProduct.tags) ? editingProduct.tags.map((t) => t.id) : [],
      });
    } else if (showForm) {
      // Reset to empty form when switching to create mode
      resetForm();
    }
  }, [editingProduct, showForm]);

  useEffect(() => {
    if (formData.type === 'data') {
      setFormData((prev) => ({ ...prev, price: prev.gbSize * 0.5 }));
    }
  }, [formData.type, formData.gbSize]);

  // Clear storage-specific fields when switching away from تخزين subcategory (only within storage type)
  useEffect(() => {
    if (formData.type === 'storage' && formData.subtype !== 'storage') {
      setFormData((prev) => {
        if (prev.storageCapacity === 0 && prev.gbSize === 0 && prev.dataDetails.length === 0) return prev;
        return { ...prev, storageCapacity: 0, gbSize: 0, dataDetails: [] };
      });
    }
  }, [formData.type, formData.subtype]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isDataProduct = formData.type === 'data';
      const submitData = {
        ...formData,
        price: isDataProduct ? formData.gbSize * 0.5 : formData.price,
        oldPrice: isDataProduct ? 0 : formData.oldPrice,
      };

      console.log('Submitting product data:', submitData);

      if (editingProduct) {
        await onUpdate(editingProduct.id, submitData);
        showNotification('تم تحديث المنتج بنجاح');
      } else {
        await onCreate(submitData);
        showNotification('تم إضافة المنتج بنجاح');
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      onRefresh();
    } catch (err) {
      console.error('Submit error:', err);
      showNotification(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    setLoading(true);
    try {
      await onDelete(id);
      showNotification('تم حذف المنتج بنجاح');
      onRefresh();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'laptops',
      subtype: '',
      price: 0,
      oldPrice: 0,
      description: '',
      images: [],
      stockCount: 0,
      storageCapacity: 0,
      gbSize: 0,
      isSale: false,
      isBrandActive: false,
      brands: [],
      tags: [],
      dataDetails: [],
    });
    setAdded(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h3 text-text-primary text-text-primary">إدارة المنتجات</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            resetForm();
          }}
          className="btn-primary px-4 py-2.5 text-body-sm flex items-center gap-2"
        >
          <Icon name="PlusIcon" size={16} />
          إضافة منتج
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-surface-secondary rounded-2xl p-6 border border-border-light border-border">
              <h3 className="text-body font-bold text-text-primary text-text-primary mb-6">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
                      الاسم
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field w-full"
                      required
                    />
                  </div>
                  <div>
                    <CustomDropdown
                      label="النوع"
                      value={formData.type}
                      onChange={(value) => setFormData({ ...formData, type: value as any })}
                      options={[
                        { value: 'laptops', label: 'لابتوب' },
                        { value: 'accessories', label: 'إكسسوار' },
                        { value: 'storage', label: 'قطع كمبيوتر' },
                        { value: 'data', label: 'داتا' },
                      ]}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <CustomDropdown
                      label="الفئة"
                      value={formData.subtype}
                      onChange={(value) => setFormData({ ...formData, subtype: value })}
                      options={
                        subCatLoading
                          ? [{ value: '', label: 'جاري التحميل...' }]
                          : subCategories.length > 0
                            ? subCategories.map((sc) => ({ value: sc.slug, label: sc.name }))
                            : [{ value: '', label: 'لا توجد فئات — أضف واحدة' }]
                      }
                      placeholder="اختر الفئة..."
                      className="w-full"
                    />
                    {/* Existing subcategories with delete buttons */}
                    {subCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {subCategories.map((sc) => (
                          <span
                            key={sc.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-secondary border border-border text-xs text-text-secondary"
                          >
                            {sc.name}
                            <button
                              type="button"
                              title="حذف"
                              onClick={async () => {
                                if (!confirm(`حذف "${sc.name}"؟`)) return;
                                try {
                                  const token = localStorage.getItem('token');
                                  const headers: Record<string, string> = {};
                                  if (token) headers.Authorization = `Bearer ${token}`;
                                  const res = await fetch(
                                    getAdminApiUrl(`categories/${formData.type}/subcategories/${sc.id}`),
                                    { method: 'DELETE', headers }
                                  );
                                  if (res.ok) {
                                    setSubCategories((prev) => prev.filter((s) => s.id !== sc.id));
                                    if (formData.subtype === sc.slug) {
                                      setFormData((prev) => ({ ...prev, subtype: '' }));
                                    }
                                    showNotification('تم حذف الفئة');
                                  } else {
                                    showNotification('خطأ في حذف الفئة');
                                  }
                                } catch {
                                  showNotification('خطأ في حذف الفئة');
                                }
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors ml-0.5"
                            >
                              <Icon name="XMarkIcon" size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newSubCatName}
                        onChange={(e) => setNewSubCatName(e.target.value)}
                        className="input-field flex-1 text-xs"
                        placeholder="أضف فئة جديدة..."
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const name = newSubCatName.trim();
                            if (!name) return;
                            try {
                              const token = localStorage.getItem('token');
                              const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                              if (token) headers.Authorization = `Bearer ${token}`;
                              const res = await fetch(getAdminApiUrl(`categories/${formData.type}/subcategories`), {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({ name }),
                              });
                              if (res.ok) {
                                const data = await res.json();
                                setSubCategories((prev) => [...prev, data.subCategory]);
                                setFormData((prev) => ({ ...prev, subtype: data.subCategory.slug }));
                                setNewSubCatName('');
                                showNotification('تم إضافة الفئة بنجاح');
                              } else {
                                showNotification('خطأ في إضافة الفئة');
                              }
                            } catch {
                              showNotification('خطأ في إضافة الفئة');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const name = newSubCatName.trim();
                          if (!name) return;
                          try {
                            const token = localStorage.getItem('token');
                            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                            if (token) headers.Authorization = `Bearer ${token}`;
                            const res = await fetch(getAdminApiUrl(`categories/${formData.type}/subcategories`), {
                              method: 'POST',
                              headers,
                              body: JSON.stringify({ name }),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setSubCategories((prev) => [...prev, data.subCategory]);
                              setFormData((prev) => ({ ...prev, subtype: data.subCategory.slug }));
                              setNewSubCatName('');
                              showNotification('تم إضافة الفئة بنجاح');
                            } else {
                              showNotification('خطأ في إضافة الفئة');
                            }
                          } catch {
                            showNotification('خطأ في إضافة الفئة');
                          }
                        }}
                        className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
                      >
                        <Icon name="PlusIcon" size={12} />
                        إضافة
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
                      السعر
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="input-field w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      disabled={formData.type === 'data'}
                      readOnly={formData.type === 'data'}
                    />
                    {formData.type === 'data' && (
                      <p className="text-caption text-brand-500 mt-1.5 flex items-center gap-1">
                        <Icon name="CalculatorIcon" size={12} />
                        تلقائي: {formData.gbSize} GB × 0.5 = {formData.gbSize * 0.5} جنيه
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
                      السعر القديم
                    </label>
                    <input
                      type="number"
                      value={formData.oldPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, oldPrice: Number(e.target.value) })
                      }
                      className="input-field w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={formData.type === 'data'}
                    />
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
                      الكمية
                    </label>
                    <input
                      type="number"
                      value={formData.stockCount}
                      onChange={(e) =>
                        setFormData({ ...formData, stockCount: Number(e.target.value) })
                      }
                      className="input-field w-full"
                    />
                  </div>
                  {/* Storage-specific fields: only show when type=storage AND subtype slug=storage */}
                  {formData.type === 'storage' && formData.subtype === 'storage' && (
                    <>
                      <div>
                        <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
                          سعة التخزين (GB)
                        </label>
                        <input
                          type="number"
                          value={formData.storageCapacity}
                          onChange={(e) =>
                            setFormData({ ...formData, storageCapacity: Number(e.target.value) })
                          }
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
                          حجم الداتا المضافة (GB)
                        </label>
                        <input
                          type="number"
                          value={formData.gbSize}
                          onChange={(e) =>
                            setFormData({ ...formData, gbSize: Number(e.target.value) })
                          }
                          className="input-field w-full"
                        />
                      </div>
                    </>
                  )}
                  {/* Data type fields */}
                  {formData.type === 'data' && (
                    <div>
                      <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
                        حجم الداتا (GB)
                      </label>
                      <input
                        type="number"
                        value={formData.gbSize}
                        onChange={(e) =>
                          setFormData({ ...formData, gbSize: Number(e.target.value) })
                        }
                        className="input-field w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Data Details (games/movies included) — only for storage > storage slug */}
                {formData.type === 'storage' && formData.subtype === 'storage' && (
                  <div>
                    <label className="text-caption font-semibold text-text-secondary mb-1.5 block">
                      الداتا المضافة (ألعاب / أفلام)
                    </label>
                    {formData.dataDetails.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {formData.dataDetails.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30 text-xs text-brand-500"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  dataDetails: prev.dataDetails.filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-red-400 hover:text-red-300 transition-colors ml-0.5"
                            >
                              <Icon name="XMarkIcon" size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDataDetail}
                        onChange={(e) => setNewDataDetail(e.target.value)}
                        className="input-field flex-1 text-xs"
                        placeholder="أضف لعبة أو فيلم..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = newDataDetail.trim();
                            if (!val) return;
                            setFormData((prev) => ({
                              ...prev,
                              dataDetails: [...prev.dataDetails, val],
                            }));
                            setNewDataDetail('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = newDataDetail.trim();
                          if (!val) return;
                          setFormData((prev) => ({
                            ...prev,
                            dataDetails: [...prev.dataDetails, val],
                          }));
                          setNewDataDetail('');
                        }}
                        className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
                      >
                        <Icon name="PlusIcon" size={12} />
                        إضافة
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-1.5 block">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full h-20 resize-none"
                  />
                </div>

                {/* Multi-Image Upload Section */}
                <div>
                  <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-2 block">
                    صور المنتج (حتى 10 صور)
                  </label>

                  {/* Horizontal scrollable previews */}
                  {formData.images.length > 0 && (
                    <div
                      className="flex gap-3 overflow-x-auto pb-3 mb-3"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {formData.images.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border-light border-border group"
                        >
                          <img
                            src={url}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon name="XMarkIcon" size={12} className="text-white" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 text-[8px] bg-brand-500 text-white px-1.5 py-0.5 rounded font-bold">
                              رئيسية
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.images.length < 10 && (
                    <UploadDropzone
                      endpoint="productImages"
                      onClientUploadComplete={(res) => {
                        if (res) {
                          const newUrls = res.map((f) => f.ufsUrl);
                          setFormData((prev) => ({
                            ...prev,
                            images: [...prev.images, ...newUrls].slice(0, 10),
                          }));
                        }
                      }}
                      onUploadError={(err) => {
                        showNotification(`خطأ في الرفع: ${err.message}`);
                      }}
                      appearance={{
                        container:
                          'border-2 border-dashed border-border border-border rounded-xl bg-surface-tertiary/30 dark:bg-white/[0.02] p-6 cursor-pointer hover:border-brand-500/40 transition-colors',
                        label: 'text-body-sm text-text-secondary text-text-secondary font-medium',
                        allowedContent: 'text-caption text-text-muted',
                        button:
                          'bg-brand-500 text-white font-semibold text-body-sm px-4 py-2 rounded-lg',
                      }}
                    />
                  )}

                  <p className="text-caption text-text-muted text-text-muted mt-1">
                    {formData.images.length}/10 صور • الصورة الأولى = الصورة الرئيسية
                  </p>
                </div>

                {/* Sales Page Toggle - Using new Switch Component */}
                <div className="flex items-center gap-4 p-4 bg-surface-secondary bg-surface-tertiary/50 rounded-xl border border-border-light border-border">
                  <div className="flex-1">
                    <h4 className="text-body-sm font-semibold text-text-primary text-text-primary mb-1">
                      إضافة لصفحة العروض
                    </h4>
                    <p className="text-caption text-text-muted text-text-muted">
                      عند التفعيل، سيظهر المنتج في صفحة العروض المخصصة بالإضافة للمتجر
                    </p>
                  </div>
                  <CyberSwitch
                    checked={formData.isSale}
                    onChange={(checked) => setFormData({ ...formData, isSale: checked })}
                    size="md"
                  />
                </div>

                {/* Brand Feature Toggle - Using new Switch Component */}
                <div className="flex items-center gap-4 p-4 bg-surface-secondary bg-surface-tertiary/50 rounded-xl border border-border-light border-border">
                  <div className="flex-1">
                    <h4 className="text-body-sm font-semibold text-text-primary text-text-primary mb-1">
                      تفعيل الماركات
                    </h4>
                    <p className="text-caption text-text-muted text-text-muted">
                      عند التفعيل، يمكن للعملاء اختيار ماركة محددة عند الشراء
                    </p>
                  </div>
                  <CyberSwitch
                    checked={formData.isBrandActive}
                    onChange={(checked) => setFormData({ ...formData, isBrandActive: checked })}
                    size="md"
                  />
                </div>

                {/* Brand Management - Only visible when isBrandActive is true */}
                {formData.isBrandActive && (
                  <div className="p-4 bg-surface-secondary bg-surface-tertiary/30 rounded-xl border border-border-light border-border">
                    <label className="text-caption font-semibold text-text-secondary text-text-secondary mb-3 block">
                      الماركات المتاحة
                    </label>

                    {/* Brand Tags Display */}
                    {formData.brands.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.brands.map((brand, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20"
                          >
                            <span className="text-body-sm font-medium text-brand-600 text-brand-400">
                              {brand}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newBrands = formData.brands.filter((_, i) => i !== idx);
                                setFormData({ ...formData, brands: newBrands });
                              }}
                              className="p-0.5 rounded-full hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
                            >
                              <Icon
                                name="XMarkIcon"
                                size={14}
                                className="text-brand-500 text-brand-400"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Brand Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="newBrandInput"
                        placeholder="أضف ماركة جديدة..."
                        className="input-field flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const value = input.value.trim();
                            if (value && !formData.brands.includes(value)) {
                              setFormData({ ...formData, brands: [...formData.brands, value] });
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(
                            'newBrandInput'
                          ) as HTMLInputElement;
                          const value = input?.value.trim();
                          if (value && !formData.brands.includes(value)) {
                            setFormData({ ...formData, brands: [...formData.brands, value] });
                            input.value = '';
                          }
                        }}
                        className="btn-secondary px-4 py-2 text-body-sm flex items-center gap-1.5"
                      >
                        <Icon name="PlusIcon" size={14} />
                        إضافة
                      </button>
                    </div>
                    <p className="text-caption text-text-muted mt-2">
                      اضغط Enter أو زر الإضافة لإضافة ماركة جديدة
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-6 py-2.5 text-body-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-text-dark-primary/30 border-t-text-dark-primary rounded-full animate-spin" />
                    ) : null}
                    {editingProduct ? 'تحديث' : 'إضافة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                    }}
                    className="btn-ghost px-6 py-2.5 text-body-sm font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-surface-secondary rounded-xl overflow-hidden group border border-border-light border-border hover:shadow-card-hover dark:hover:shadow-card-dark-hover hover:-translate-y-1 transition-all duration-200"
          >
            {/* Image */}
            <div className="relative h-36 bg-surface-tertiary overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="PhotoIcon" size={32} className="text-text-muted" />
                </div>
              )}
              <span className="absolute top-2 right-2 text-[10px] text-brand-600 text-brand-400 bg-surface/80 backdrop-blur px-2 py-0.5 rounded-md font-semibold">
                {product.type === 'laptops'
                  ? 'لابتوب'
                  : product.type === 'accessories'
                    ? 'إكسسوار'
                    : product.type === 'storage'
                      ? 'قطع كمبيوتر'
                      : 'داتا'}
              </span>
              <span
                className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-md font-semibold backdrop-blur ${
                  product.stockCount > 0
                    ? 'bg-success-light/90 text-success-dark dark:bg-success/20 dark:text-success'
                    : 'bg-error-light/90 text-error-dark dark:bg-error/20 dark:text-error'
                }`}
              >
                {product.stockCount > 0 ? `${product.stockCount} متوفر` : 'نفد'}
              </span>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-body-sm font-bold text-text-primary text-text-primary line-clamp-2 mb-1">
                {product.name}
              </p>
              {product.subtype && (
                <p className="text-caption text-text-muted text-text-muted mb-2">
                  {product.subtype}
                </p>
              )}

              <div className="flex items-baseline gap-2 mb-3">
                {product.type === 'data' ? (
                  <span className="text-body font-bold text-brand-500 flex items-center gap-1">
                    <Icon name="CalculatorIcon" size={14} />
                    {product.price.toLocaleString('ar-EG')} جنيه
                  </span>
                ) : (
                  <>
                    <span className="text-body font-bold text-brand-500">
                      {product.price.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-caption text-text-muted">جنيه</span>
                  </>
                )}
                {product.oldPrice &&
                  product.oldPrice > 0 &&
                  product.type !== 'data' && (
                    <span className="text-text-muted line-through text-body-sm">
                      {product.oldPrice.toLocaleString('ar-EG')}
                    </span>
                  )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-3 py-2 text-caption font-semibold rounded-lg bg-surface-tertiary text-text-secondary text-text-secondary hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 hover:text-brand-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icon name="PencilSquareIcon" size={14} />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-2 text-caption font-semibold rounded-lg bg-error-light dark:bg-error/10 text-error-dark dark:text-error hover:bg-error/20 flex items-center gap-1 transition-colors"
                >
                  <Icon name="TrashIcon" size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const STATUS_FILTERS = [
  { value: 'all', label: 'الكل' },
  { value: 'Pending', label: 'معلق' },
  { value: 'AwaitingPickup', label: 'في انتظار الاستلام' },
  { value: 'Shipping', label: 'جاري الشحن' },
  { value: 'Completed', label: 'تم الاستلام' },
  { value: 'Cancelled', label: 'ملغي' },
];

function OrdersManager({ showNotification }: { showNotification: (msg: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async (search: string, status: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status !== 'all') params.set('status', status);
      const qs = params.toString();
      const res = await fetch(`${getAdminApiUrl('orders')}${qs ? `?${qs}` : ''}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(searchQuery, statusFilter);
  }, [fetchOrders, searchQuery, statusFilter]);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(getAdminApiUrl(`orders/${id}`), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showNotification('تم تحديث حالة الطلب');
        fetchOrders(searchQuery, statusFilter);
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(getAdminApiUrl(`orders/${id}`), { method: 'DELETE', headers });
      if (res.ok) {
        showNotification('تم حذف الطلب بنجاح');
        fetchOrders(searchQuery, statusFilter);
      } else {
        showNotification('فشل حذف الطلب');
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 400);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
  };

  const isSearching = searchInput.trim() !== '' || statusFilter !== 'all';

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <Icon name="MagnifyingGlassIcon" size={16} className="text-text-muted" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="ابحث باسم العميل..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.05] transition-all backdrop-blur-sm"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearchQuery(''); }}
              className="absolute inset-y-0 left-3 flex items-center text-text-muted hover:text-text-primary transition-colors"
            >
              <Icon name="XMarkIcon" size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-caption font-semibold border transition-all ${
              statusFilter === f.value
                ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                : 'bg-white/[0.02] border-white/8 text-text-muted hover:border-white/20 hover:text-text-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface-secondary rounded-2xl p-12 text-center border border-border">
          <div className="w-14 h-14 rounded-2xl bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
            <Icon name={isSearching ? 'MagnifyingGlassIcon' : 'ShoppingBagIcon'} size={24} className="text-text-muted" />
          </div>
          <p className="text-body-sm font-medium text-text-muted">
            {searchInput.trim()
              ? `لا يوجد أوردرات بهذا الاسم "${searchInput.trim()}"`
              : isSearching
              ? 'لا توجد طلبات بهذه الحالة'
              : 'لا توجد طلبات بعد'}
          </p>
          {isSearching && (
            <button
              onClick={() => { setSearchInput(''); setSearchQuery(''); setStatusFilter('all'); }}
              className="mt-3 text-xs text-brand-500 hover:underline"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      ) : (
        <div className="bg-surface-secondary rounded-2xl border border-border-light border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light border-border bg-surface-secondary bg-surface-tertiary/50">
                  <th className="text-right text-caption font-semibold text-text-muted text-text-muted p-4">
                    رقم الأوردر
                  </th>
                  <th className="text-right text-caption font-semibold text-text-muted text-text-muted p-4">
                    العميل
                  </th>
                  <th className="text-right text-caption font-semibold text-text-muted text-text-muted p-4">
                    الإجمالي
                  </th>
                  <th className="text-right text-caption font-semibold text-text-muted text-text-muted p-4">
                    الحالة
                  </th>
                  <th className="text-right text-caption font-semibold text-text-muted text-text-muted p-4">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr
                    key={order._id || order.orderID}
                    className="border-b border-border-light border-border last:border-b-0 hover:bg-surface-secondary dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-body-sm font-semibold text-text-primary text-text-primary">
                          {order.orderID || order.id.slice(-6)}
                        </p>
                        <p className="text-caption text-text-muted text-text-muted">
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-body-sm text-text-primary text-text-primary">
                        {order.customerName || '—'}
                      </p>
                      <p className="text-caption text-text-muted text-text-muted">
                        {order.phone || '—'}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-body-sm font-bold text-brand-500">
                        {order.totalPrice?.toLocaleString('ar-EG')} جنيه
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-caption font-semibold border ${ORDER_STATUS_STYLE[order.status] ?? ORDER_STATUS_STYLE.Cancelled}`}>
                        {ORDER_STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/orders/${order.orderID || order.id || order._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-caption font-semibold text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                        >
                          عرض
                          <Icon name="ArrowLeftIcon" size={12} />
                        </Link>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-caption font-semibold text-error hover:bg-error-light dark:hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <Icon name="TrashIcon" size={13} />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ShippingManager({ showNotification }: { showNotification: (msg: string) => void }) {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMethod, setNewMethod] = useState({ name: '', depositType: 'shipping_only' });
  const [editMethod, setEditMethod] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newGovByMethod, setNewGovByMethod] = useState<Record<string, { name: string; cost: string }>>({});
  const [editGov, setEditGov] = useState<{ methodId: string; gov: any } | null>(null);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(getAdminApiUrl('shipping/methods'), { headers: authHeaders() });
      if (res.ok) { const d = await res.json(); setMethods(d.methods || []); }
    } finally { setLoading(false); }
  }, [authHeaders]);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  const saveMethod = async () => {
    if (!newMethod.name.trim()) return;
    const res = await fetch(getAdminApiUrl('shipping/methods'), {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(newMethod),
    });
    if (res.ok) { setNewMethod({ name: '', depositType: 'shipping_only' }); fetchMethods(); showNotification('تم إضافة طريقة الشحن'); }
  };

  const updateMethodReq = async (id: string, data: any) => {
    const res = await fetch(getAdminApiUrl(`shipping/methods/${id}`), {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
    });
    if (res.ok) { setEditMethod(null); fetchMethods(); showNotification('تم تحديث طريقة الشحن'); }
  };

  const deleteMethod = async (id: string) => {
    if (!confirm('حذف طريقة الشحن وكل محافظاتها؟')) return;
    await fetch(getAdminApiUrl(`shipping/methods/${id}`), { method: 'DELETE', headers: authHeaders() });
    fetchMethods(); showNotification('تم الحذف');
  };

  const addGov = async (methodId: string) => {
    const g = newGovByMethod[methodId];
    if (!g?.name?.trim() || !g?.cost) return;
    const res = await fetch(getAdminApiUrl(`shipping/methods/${methodId}/governorates`), {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ name: g.name, cost: Number(g.cost) }),
    });
    if (res.ok) {
      setNewGovByMethod(p => ({ ...p, [methodId]: { name: '', cost: '' } }));
      fetchMethods(); showNotification('تم إضافة المحافظة');
    }
  };

  const saveEditGov = async () => {
    if (!editGov) return;
    const res = await fetch(getAdminApiUrl(`shipping/methods/${editGov.methodId}/governorates/${editGov.gov._id}`), {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ name: editGov.gov.name, cost: Number(editGov.gov.cost) }),
    });
    if (res.ok) { setEditGov(null); fetchMethods(); showNotification('تم تحديث المحافظة'); }
  };

  const deleteGov = async (methodId: string, govId: string) => {
    await fetch(getAdminApiUrl(`shipping/methods/${methodId}/governorates/${govId}`), {
      method: 'DELETE', headers: authHeaders(),
    });
    fetchMethods(); showNotification('تم الحذف');
  };

  const depositLabel = (t: string) => t === 'shipping_only' ? 'عربون = تكلفة الشحن' : 'عربون = الإجمالي الكامل';

  return (
    <div className="space-y-4">
      {/* Header + Add Form */}
      <div className="bg-surface-secondary rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Icon name="TruckIcon" size={20} className="text-brand-500" />
          </div>
          <div>
            <h2 className="text-h3 text-text-primary font-bold">طرق الشحن</h2>
            <p className="text-caption text-text-muted">كل طريقة شحن لها قائمة محافظات وتكاليف مستقلة</p>
          </div>
        </div>
        <div className="p-6 bg-surface-tertiary/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="اسم طريقة الشحن (مثال: Bosta، شركة محلية)"
              value={newMethod.name}
              onChange={(e) => setNewMethod(p => ({ ...p, name: e.target.value }))}
              className="input-field flex-1"
            />
            <select
              value={newMethod.depositType}
              onChange={(e) => setNewMethod(p => ({ ...p, depositType: e.target.value }))}
              className="input-field sm:w-56"
            >
              <option value="shipping_only">عربون = تكلفة الشحن</option>
              <option value="total_amount">عربون = الإجمالي الكامل</option>
            </select>
            <button onClick={saveMethod} className="btn-primary px-6 py-2 font-semibold flex items-center gap-2 whitespace-nowrap">
              <Icon name="PlusIcon" size={16} />
              إضافة طريقة
            </button>
          </div>
        </div>
      </div>

      {/* Methods + Their Governorates */}
      {loading ? (
        <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin mx-auto" /></div>
      ) : methods.length === 0 ? (
        <div className="p-8 text-center text-text-muted text-sm bg-surface-secondary rounded-2xl border border-border">لا توجد طرق شحن مضافة بعد</div>
      ) : (
        <div className="space-y-4">
          {methods.map((m) => {
            const isExpanded = expandedId === m._id;
            const ngov = newGovByMethod[m._id] || { name: '', cost: '' };
            return (
              <div key={m._id} className="bg-surface-secondary rounded-2xl border border-border overflow-hidden">
                {/* Method Header */}
                <div className="p-4 flex items-center gap-3">
                  {editMethod?._id === m._id ? (
                    <div className="flex flex-1 flex-col sm:flex-row gap-2">
                      <input value={editMethod.name} onChange={(e) => setEditMethod((p: any) => ({ ...p, name: e.target.value }))} className="input-field flex-1 py-2 text-sm" />
                      <select value={editMethod.depositType} onChange={(e) => setEditMethod((p: any) => ({ ...p, depositType: e.target.value }))} className="input-field sm:w-48 py-2 text-sm">
                        <option value="shipping_only">عربون = تكلفة الشحن</option>
                        <option value="total_amount">عربون = الإجمالي الكامل</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => updateMethodReq(m._id, editMethod)} className="btn-primary px-4 py-2 text-sm font-semibold">حفظ</button>
                        <button onClick={() => setEditMethod(null)} className="btn-ghost px-4 py-2 text-sm">إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setExpandedId(isExpanded ? null : m._id)} className="flex-1 flex items-center gap-3 text-right min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="TruckIcon" size={16} className="text-brand-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm font-bold text-text-primary">{m.name}</p>
                          <p className="text-caption text-text-muted">{depositLabel(m.depositType)} · {m.governorates?.length || 0} محافظة</p>
                        </div>
                        <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={16} className="text-text-muted flex-shrink-0" />
                      </button>
                      <button onClick={() => setEditMethod({ ...m })} className="p-2 hover:bg-brand-500/10 rounded-lg transition-colors flex-shrink-0">
                        <Icon name="PencilIcon" size={15} className="text-brand-500" />
                      </button>
                      <button onClick={() => deleteMethod(m._id)} className="p-2 hover:bg-error-light dark:hover:bg-error/10 rounded-lg transition-colors flex-shrink-0">
                        <Icon name="TrashIcon" size={15} className="text-error" />
                      </button>
                    </>
                  )}
                </div>

                {/* Governorates Panel */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Add Governorate */}
                    <div className="p-4 bg-surface-tertiary/30 border-b border-border flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="اسم المحافظة"
                        value={ngov.name}
                        onChange={(e) => setNewGovByMethod(p => ({ ...p, [m._id]: { ...ngov, name: e.target.value } }))}
                        className="input-field flex-1 py-2 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="التكلفة (جنيه)"
                        value={ngov.cost}
                        min={0}
                        onChange={(e) => setNewGovByMethod(p => ({ ...p, [m._id]: { ...ngov, cost: e.target.value } }))}
                        className="input-field sm:w-36 py-2 text-sm"
                      />
                      <button onClick={() => addGov(m._id)} className="btn-primary px-4 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap">
                        <Icon name="PlusIcon" size={14} />
                        إضافة
                      </button>
                    </div>

                    {/* Governorates List */}
                    {!m.governorates?.length ? (
                      <div className="p-4 text-center text-sm text-text-muted">لا توجد محافظات — أضف أولى المحافظات أعلاه</div>
                    ) : (
                      <div className="divide-y divide-border">
                        {m.governorates.map((g: any) => (
                          <div key={g._id} className="px-4 py-3 flex items-center gap-3">
                            {editGov?.methodId === m._id && editGov?.gov?._id === g._id ? (
                              <div className="flex flex-1 gap-2">
                                <input value={editGov!.gov.name} onChange={(e) => setEditGov(p => p ? { ...p, gov: { ...p.gov, name: e.target.value } } : null)} className="input-field flex-1 py-1.5 text-sm" />
                                <input type="number" value={editGov!.gov.cost} min={0} onChange={(e) => setEditGov(p => p ? { ...p, gov: { ...p.gov, cost: e.target.value } } : null)} className="input-field w-28 py-1.5 text-sm" />
                                <button onClick={saveEditGov} className="btn-primary px-3 py-1.5 text-xs font-semibold">حفظ</button>
                                <button onClick={() => setEditGov(null)} className="btn-ghost px-3 py-1.5 text-xs">إلغاء</button>
                              </div>
                            ) : (
                              <>
                                <Icon name="MapPinIcon" size={14} className="text-text-muted flex-shrink-0" />
                                <span className="flex-1 text-sm text-text-primary font-medium">{g.name}</span>
                                <span className="text-sm font-bold text-brand-500">{g.cost} جنيه</span>
                                <button onClick={() => setEditGov({ methodId: m._id, gov: { ...g } })} className="p-1.5 hover:bg-brand-500/10 rounded-lg transition-colors">
                                  <Icon name="PencilIcon" size={13} className="text-brand-500" />
                                </button>
                                <button onClick={() => deleteGov(m._id, g._id)} className="p-1.5 hover:bg-error-light dark:hover:bg-error/10 rounded-lg transition-colors">
                                  <Icon name="TrashIcon" size={13} className="text-error" />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
