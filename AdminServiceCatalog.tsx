import React, { useState } from 'react';
import { Plus, Edit2, Check, X, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { Service, ServiceCategory, AppSettings } from '../../types/database';
import { SidTechDatabase } from '../../services/storage';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';

interface AdminServiceCatalogProps {
  services: Service[];
  settings: AppSettings;
  onRefresh: () => void;
}

export const AdminServiceCatalog: React.FC<AdminServiceCatalogProps> = ({
  services,
  settings,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form states
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(2000);
  const [advancePercent, setAdvancePercent] = useState<number>(settings.defaultAdvancePercent);
  const [commissionPercent, setCommissionPercent] = useState<number>(settings.defaultCommissionPercent);
  const [category, setCategory] = useState<ServiceCategory>('Website');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingService(null);
    setServiceName('');
    setDescription('');
    setPrice(2500);
    setAdvancePercent(settings.defaultAdvancePercent);
    setCommissionPercent(settings.defaultCommissionPercent);
    setCategory('Website');
    setImageUrl('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80');
    setActive(true);
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setServiceName(service.serviceName);
    setDescription(service.description);
    setPrice(service.price);
    setAdvancePercent(service.advancePercent);
    setCommissionPercent(service.commissionPercent);
    setCategory(service.category);
    setImageUrl(service.imageUrl);
    setActive(service.active);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingService) {
      SidTechDatabase.updateService(editingService.serviceId, {
        serviceName,
        description,
        price,
        advancePercent,
        commissionPercent,
        category,
        imageUrl,
        active,
      });
    } else {
      SidTechDatabase.addService({
        serviceName,
        description,
        price,
        advancePercent,
        commissionPercent,
        category,
        imageUrl,
        active,
      });
    }

    setShowModal(false);
    onRefresh();
  };

  const handleToggleActive = (service: Service) => {
    SidTechDatabase.updateService(service.serviceId, { active: !service.active });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12294A] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E86A17]" />
            Service Catalog & Pricing Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Flipkart-style grid cards, base prices, mandatory advance % and franchise commission %
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.serviceId}
            className={`bg-white rounded-2xl overflow-hidden border shadow-xs transition flex flex-col justify-between ${
              service.active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={service.imageUrl}
                  alt={service.serviceName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#12294A]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {service.category}
                </div>
                <div className="absolute top-2.5 right-2.5 font-mono text-[10px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded shadow">
                  {service.serviceId}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {service.serviceName}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Base Price</span>
                    <span className="font-mono font-bold text-[#12294A]">
                      ₹{service.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Advance</span>
                    <span className="font-bold text-[#E86A17]">{service.advancePercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Commission</span>
                    <span className="font-bold text-emerald-600">{service.commissionPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => handleToggleActive(service)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition ${
                  service.active
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                {service.active ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Active in Grid</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hidden</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => openEditModal(service)}
                className="px-3 py-1.5 bg-[#12294A] hover:bg-[#0c1c33] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-[#12294A] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#E86A17]">
              <div>
                <h3 className="font-bold text-base text-white">
                  {editingService ? `Edit Service: ${editingService.serviceId}` : 'Add New Service to Catalog'}
                </h3>
                <p className="text-xs text-orange-200">Set agency deliverable parameters</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Real Estate Portal, Hospital ERP"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  >
                    <option value="Website">Website</option>
                    <option value="App">App</option>
                    <option value="Software">Software</option>
                    <option value="ERP">ERP</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Agency Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Advance Required (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={100}
                    value={advancePercent}
                    onChange={(e) => setAdvancePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch Commission (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (shown on Flipkart grid card)
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key features, deliverables, technology stack..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#E86A17]"
                />
              </div>

              {/* Service thumbnail image upload with <= 50KB compressor */}
              <ImageUploadCompressor
                label="Service Card Thumbnail Image"
                initialImageUrl={imageUrl}
                onImageReady={(dataUrl) => setImageUrl(dataUrl)}
                targetMaxKB={50}
                aspectDesc="Banner or card format (auto-compressed ≤50KB)"
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E86A17] focus:ring-[#E86A17]"
                />
                <label htmlFor="active" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Show active in Flipkart-style catalog
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
