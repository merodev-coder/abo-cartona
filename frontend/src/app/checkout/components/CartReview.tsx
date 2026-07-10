'use client';

import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  type: 'laptops' | 'accessories' | 'storage' | 'data' | 'games';
  size?: string;
  specs?: string;
  images?: string[];
  image?: string;
  selectedBrand?: string;
}

interface CartReviewProps {
  items: CartItem[];
  driveItems: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  storageTotal: number;
  storageUsed: number;
}

export default function CartReview({
  items,
  driveItems,
  onUpdateQty,
  onRemove,
  storageTotal,
  storageUsed,
}: CartReviewProps) {
  const storagePercent = storageTotal > 0 ? Math.round((storageUsed / storageTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Paid Products */}
      {items.length > 0 && (
        <div>
          <h3 className="text-base font-black text-text-primary mb-4 flex items-center gap-2">
            <Icon name="ShoppingBagIcon" size={18} className="text-brand-500" />
            المنتجات المدفوعة
          </h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-secondary border border-white/5 group hover:border-brand-500/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.images?.[0] || item.image ? (
                    <div className="w-14 h-14 rounded-xl bg-surface-tertiary overflow-hidden relative flex-shrink-0">
                      <AppImage
                        src={item.images?.[0] || item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                      <Icon name="PhotoIcon" size={20} className="text-text-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                      {item.name}
                      {item.selectedBrand && (
                        <span className="text-text-muted font-normal mr-1">
                          ({item.selectedBrand})
                        </span>
                      )}
                    </h4>
                    {item.specs && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.specs}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {item.type === 'data' ? (
                        <>
                          {item.size && <span className="badge-size text-[9px]">{item.size}</span>}
                          <p className="text-sm font-bold text-brand-500">
                            {item.price === 0 ? 'مجاناً 🎁' : `${item.price.toLocaleString('ar-EG')} جنيه`}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-brand-500">
                            {item.price.toLocaleString('ar-EG')} جنيه
                          </p>
                          {item.oldPrice && item.oldPrice > 0 && (
                            <p className="text-xs text-text-muted line-through">
                              {item.oldPrice.toLocaleString('ar-EG')} جنيه
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-surface-tertiary hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <Icon name="MinusIcon" size={14} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-surface-tertiary hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <Icon name="PlusIcon" size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <Icon name="TrashIcon" size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drive Items (Free Data) */}
      {driveItems.length > 0 && (
        <div>
          <h3 className="text-base font-black text-text-primary mb-3 flex items-center gap-2">
            <Icon name="CircleStackIcon" size={18} className="text-brand-500" />
            داتا مجانية مع الهارد
          </h3>

          {/* Storage Bar */}
          <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/15 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-500">سعة الهارد المستخدمة</span>
              <span className="text-xs font-black text-text-primary">
                {storageUsed}/{storageTotal} GB
              </span>
            </div>
            <div className="storage-bar-track h-2 rounded-full overflow-hidden">
              <div
                className={`storage-bar-fill h-full ${storagePercent > 85 ? 'warning' : ''}`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">
              {storageTotal - storageUsed} GB متبقي
            </p>
          </div>

          <div className="space-y-2">
            {driveItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary border border-brand-500/10 group"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                    {item.name}
                    {item.selectedBrand && (
                      <span className="text-text-muted font-normal mr-1">
                        ({item.selectedBrand})
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.size && <span className="badge-size text-[9px]">{item.size}</span>}
                    <span className="text-xs text-brand-500 font-bold">مجاناً</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 flex items-center justify-center transition-all"
                >
                  <Icon name="TrashIcon" size={12} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && driveItems.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
            <Icon name="ShoppingCartIcon" size={28} className="text-text-muted" />
          </div>
          <p className="text-text-muted font-bold">السلة فاضية</p>
          <p className="text-sm text-text-secondary mt-1">أضف منتجات من المتجر</p>
        </div>
      )}
    </div>
  );
}
