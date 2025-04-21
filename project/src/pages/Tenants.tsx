import React, { useState } from 'react';
import TenantsList from '../components/tenants/TenantsList';
import TenantForm from '../components/tenants/TenantForm';
import { Tenant } from '../types';
import { tenants as initialTenants } from '../data/mockData';

const Tenants: React.FC = () => {
  const [allTenants, setAllTenants] = useState(initialTenants);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>();

  const handleAddTenant = () => {
    setEditingTenant(undefined);
    setShowForm(true);
  };

  const handleEditTenant = (id: string) => {
    const tenant = allTenants.find(t => t.id === id);
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleDeleteTenant = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus penyewa ini?')) {
      setAllTenants(allTenants.filter(tenant => tenant.id !== id));
    }
  };

  const handleFormSubmit = (data: Partial<Tenant>) => {
    if (editingTenant) {
      // Update existing tenant
      setAllTenants(allTenants.map(tenant => 
        tenant.id === editingTenant.id ? { ...tenant, ...data } : tenant
      ));
    } else {
      // Add new tenant
      const newTenant: Tenant = {
        id: Math.random().toString(36).substr(2, 9),
        lastPaymentDate: new Date().toISOString().split('T')[0],
        ...data as Omit<Tenant, 'id' | 'lastPaymentDate'>
      };
      setAllTenants([...allTenants, newTenant]);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Penyewa</h1>
      <TenantsList
        tenants={allTenants}
        onAddTenant={handleAddTenant}
        onEditTenant={handleEditTenant}
        onDeleteTenant={handleDeleteTenant}
      />
      {showForm && (
        <TenantForm
          tenant={editingTenant}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Tenants;