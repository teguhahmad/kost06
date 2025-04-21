import React, { useState } from 'react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import RoomForm from '../components/rooms/RoomForm';
import { Room, Tenant } from '../types';
import { rooms as initialRooms, tenants as initialTenants } from '../data/mockData';
import { formatCurrency, getRoomStatusColor } from '../utils/formatters';
import { Plus, Search, X, User } from 'lucide-react';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [tenants, setTenants] = useState(initialTenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [showTenantDetails, setShowTenantDetails] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>();
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(searchQuery) || 
                         room.floor.includes(searchQuery);
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && room.status === filter;
  });

  const handleAddRoom = () => {
    setEditingRoom(undefined);
    setShowRoomForm(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  };

  const handleRoomFormSubmit = (data: Partial<Room>) => {
    if (editingRoom) {
      setRooms(rooms.map(room => 
        room.id === editingRoom.id ? { ...room, ...data } : room
      ));
    } else {
      const newRoom: Room = {
        id: Math.random().toString(36).substr(2, 9),
        ...data as Omit<Room, 'id'>
      };
      setRooms([...rooms, newRoom]);
    }
    setShowRoomForm(false);
  };

  const handleViewTenant = (room: Room) => {
    if (room.tenantId) {
      const tenant = tenants.find(t => t.id === room.tenantId);
      if (tenant) {
        setSelectedTenant(tenant);
        setSelectedRoom(room);
        setShowTenantDetails(true);
      }
    }
  };

  const handleAssignTenant = (room: Room) => {
    setSelectedRoom(room);
    setShowTenantSelector(true);
  };

  const handleTenantSelection = (tenantId: string) => {
    if (selectedRoom) {
      // Update room status and tenant ID
      setRooms(rooms.map(room => 
        room.id === selectedRoom.id 
          ? { ...room, status: 'occupied', tenantId }
          : room
      ));

      // Update tenant's room assignment
      setTenants(tenants.map(tenant =>
        tenant.id === tenantId
          ? { ...tenant, roomId: selectedRoom.id }
          : tenant
      ));

      // Close the modal and reset selection
      setShowTenantSelector(false);
      setSelectedRoom(undefined);
    }
  };

  const handleRemoveTenant = (room: Room) => {
    if (room.tenantId) {
      // Update room status
      setRooms(rooms.map(r => 
        r.id === room.id 
          ? { ...r, status: 'vacant', tenantId: undefined }
          : r
      ));

      // Update tenant's room assignment
      setTenants(tenants.map(tenant =>
        tenant.id === room.tenantId
          ? { ...tenant, roomId: undefined }
          : tenant
      ));

      // Close the details modal
      setShowTenantDetails(false);
      setSelectedTenant(undefined);
      setSelectedRoom(undefined);
    }
  };

  const availableTenants = tenants.filter(tenant => 
    tenant.status === 'active' && !tenant.roomId
  );

  const getRoomTypeLabel = (type: string): string => {
    switch (type) {
      case 'single':
        return 'Kamar Single';
      case 'double':
        return 'Kamar Double';
      case 'deluxe':
        return 'Kamar Deluxe';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Kamar</h1>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Manajemen Kamar</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari kamar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <Button icon={<Plus size={16} />} onClick={handleAddRoom}>
              Tambah Kamar
            </Button>
          </div>
        </CardHeader>

        <div className="px-6 pb-2 flex flex-wrap gap-2">
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('all')}
          >
            Semua
          </Button>
          <Button 
            variant={filter === 'occupied' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('occupied')}
          >
            Terisi
          </Button>
          <Button 
            variant={filter === 'vacant' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('vacant')}
          >
            Kosong
          </Button>
          <Button 
            variant={filter === 'maintenance' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('maintenance')}
          >
            Perbaikan
          </Button>
        </div>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <div 
                key={room.id} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className={`h-2 ${
                    room.status === 'occupied' 
                      ? 'bg-blue-500' 
                      : room.status === 'vacant' 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                  }`}
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">Kamar {room.number}</h3>
                      <p className="text-sm text-gray-500">Lantai {room.floor}</p>
                    </div>
                    <Badge className={getRoomStatusColor(room.status)}>
                      {room.status === 'occupied' ? 'Terisi' : 
                       room.status === 'vacant' ? 'Kosong' : 'Perbaikan'}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-600">{getRoomTypeLabel(room.type)}</p>
                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(room.price)}/bulan</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {room.facilities.map((facility, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {facility}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>
                      Ubah
                    </Button>
                    {room.status === 'occupied' ? (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleViewTenant(room)}
                      >
                        Detail Penyewa
                      </Button>
                    ) : room.status === 'vacant' ? (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleAssignTenant(room)}
                      >
                        Tambah Penyewa
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                      >
                        Dalam Perbaikan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showRoomForm && (
        <RoomForm
          room={editingRoom}
          onSubmit={handleRoomFormSubmit}
          onClose={() => setShowRoomForm(false)}
        />
      )}

      {/* Tenant Selector Modal */}
      {showTenantSelector && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pilih Penyewa</h2>
              <button 
                onClick={() => {
                  setShowTenantSelector(false);
                  setSelectedRoom(undefined);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            {availableTenants.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableTenants.map(tenant => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSelection(tenant.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-sm text-gray-500">{tenant.email}</div>
                    <div className="text-sm text-gray-500">{tenant.phone}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada penyewa yang tersedia.</p>
            )}
          </div>
        </div>
      )}

      {/* Tenant Details Modal */}
      {showTenantDetails && selectedTenant && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Detail Penyewa</h2>
              <button 
                onClick={() => {
                  setShowTenantDetails(false);
                  setSelectedTenant(undefined);
                  setSelectedRoom(undefined);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={40} className="text-blue-600" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Nama Lengkap</h3>
                <p className="text-lg font-medium text-gray-900">{selectedTenant.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-gray-900">{selectedTenant.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Nomor Telepon</h3>
                <p className="text-gray-900">{selectedTenant.phone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Periode Sewa</h3>
                <p className="text-gray-900">
                  {new Date(selectedTenant.startDate).toLocaleDateString('id-ID')} - {' '}
                  {new Date(selectedTenant.endDate).toLocaleDateString('id-ID')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status Pembayaran</h3>
                <Badge 
                  className={
                    selectedTenant.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : selectedTenant.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {selectedTenant.paymentStatus === 'paid' ? 'Lunas' :
                   selectedTenant.paymentStatus === 'pending' ? 'Menunggu' : 'Terlambat'}
                </Badge>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="danger"
                onClick={() => handleRemoveTenant(selectedRoom)}
              >
                Hapus Penyewa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;