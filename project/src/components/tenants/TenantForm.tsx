import React, { useState, useEffect } from 'react';
import { Tenant, Room } from '../../types';
import Button from '../ui/Button';
import { X, Loader2 } from 'lucide-react';
import { useProperty } from '../../contexts/PropertyContext';
import { supabase } from '../../lib/supabase';

interface TenantFormProps {
  tenant?: Tenant;
  onSubmit: (data: Partial<Tenant>) => void;
  onClose: () => void;
}

const TenantForm: React.FC<TenantFormProps> = ({ tenant, onSubmit, onClose }) => {
  const { selectedProperty } = useProperty();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Tenant>>({
    name: tenant?.name || '',
    phone: tenant?.phone || '',
    email: tenant?.email || '',
    room_id: tenant?.roomId || '',
    start_date: tenant?.startDate || new Date().toISOString().split('T')[0],
    end_date: tenant?.endDate || '',
    status: tenant?.status || 'active',
    payment_status: tenant?.paymentStatus || 'pending',
    property_id: selectedProperty?.id
  });

  useEffect(() => {
    const loadAvailableRooms = async () => {
      if (!selectedProperty?.id) return;

      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', selectedProperty.id)
          .eq('status', 'vacant');

        if (error) throw error;
        setRooms(data || []);
      } catch (err) {
        console.error('Error loading rooms:', err);
        setError('Failed to load available rooms');
      }
    };

    loadAvailableRooms();
  }, [selectedProperty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!selectedProperty) {
        throw new Error('No property selected');
      }

      // Update room status to occupied
      if (formData.room_id) {
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .eq('id', formData.room_id);

        if (roomError) throw roomError;
      }

      // Create or update tenant
      const tenantData = {
        ...formData,
        property_id: selectedProperty.id
      };

      if (tenant) {
        // Update existing tenant
        const { error: updateError } = await supabase
          .from('tenants')
          .update(tenantData)
          .eq('id', tenant.id);

        if (updateError) throw updateError;
      } else {
        // Create new tenant
        const { error: insertError } = await supabase
          .from('tenants')
          .insert([tenantData]);

        if (insertError) throw insertError;
      }

      onSubmit(tenantData);
    } catch (err) {
      console.error('Error saving tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to save tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {tenant ? 'Ubah Data Penyewa' : 'Tambah Penyewa Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Telepon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kamar
            </label>
            <select
              name="room_id"
              value={formData.room_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            >
              <option value="">Pilih kamar</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  Kamar {room.number} - {room.type} - {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  }).format(room.price)}/bulan
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Pembayaran
            </label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            >
              <option value="paid">Lunas</option>
              <option value="pending">Menunggu</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : tenant ? (
                'Simpan Perubahan'
              ) : (
                'Tambah Penyewa'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantForm;