import React, { useState } from 'react';
import { useTsosStore } from '../../lib/store';
import { Offer } from '../../types';
import { Tag, Plus, Check, Percent, Gift, Calendar, X } from 'lucide-react';

export const OffersScreen: React.FC = () => {
  const { offers, toggleOffer, addOffer, location } = useTsosStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'percent' | 'flat' | 'bogo'>('percent');
  const [value, setValue] = useState(15);
  const [minOrderValue, setMinOrderValue] = useState(150);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;
    addOffer({
      location_id: location.id,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      type,
      value,
      min_order_value: minOrderValue,
      valid_from: '2026-01-01',
      valid_to: '2026-12-31',
      is_active: true,
    });
    setCode('');
    setTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-[#FFF9F2]">
      <div className="p-4 bg-white border-b border-[#E9E0D6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FFF1E6] text-[#F97316] flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1917] leading-tight">
              Promotional Offers & Discounts
            </h2>
            <div className="text-xs text-[#57534E]">
              Coupon codes applied at POS and Customer QR Storefront
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                offer.is_active ? 'border-[#E9E0D6]' : 'border-[#E9E0D6] opacity-60 bg-[#FAFAFA]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF1E6] text-[#F97316] flex items-center justify-center font-bold">
                      {offer.type === 'percent' ? (
                        <Percent className="w-4 h-4" />
                      ) : (
                        <Gift className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-[#1C1917] tracking-wider px-2 py-0.5 rounded-md bg-[#F5F0EB] border border-[#E9E0D6]">
                        {offer.code}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleOffer(offer.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                      offer.is_active
                        ? 'bg-[#E8F5EC] text-[#17803D]'
                        : 'bg-[#FEF2F2] text-[#B42318]'
                    }`}
                  >
                    {offer.is_active ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <h3 className="font-bold text-sm text-[#1C1917] mt-3 leading-tight">
                  {offer.title}
                </h3>

                <div className="mt-3 space-y-1 text-xs text-[#57534E]">
                  <div className="flex justify-between">
                    <span>Discount Value:</span>
                    <strong className="text-[#1C1917] font-mono">
                      {offer.type === 'percent' ? `${offer.value}% off` : `₹${offer.value} flat`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Order Requirement:</span>
                    <span className="font-mono">₹{offer.min_order_value}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#A8A29E] pt-1">
                    <span>Valid:</span>
                    <span>Till Dec 31, 2026</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F5F0EB] flex justify-end">
                <button
                  onClick={() => toggleOffer(offer.id)}
                  className="text-xs font-semibold text-[#F97316] hover:underline"
                >
                  {offer.is_active ? 'Pause Offer' : 'Activate Offer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#E9E0D6] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#1C1917]">Create New Promo Code</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#A8A29E]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Coupon Code (uppercase)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON20"
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-[#E9E0D6] focus:border-[#F97316] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Offer Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 20% Off Weekend Specials"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E9E0D6] focus:border-[#F97316] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-[#E9E0D6] bg-white focus:outline-hidden"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Value ({type === 'percent' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#E9E0D6] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1">
                  Min Order Subtotal (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#E9E0D6] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#57534E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#F97316] text-white rounded-xl shadow-xs"
                >
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
