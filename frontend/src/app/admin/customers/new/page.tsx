'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import CustomerForm from '@/components/customers/CustomerForm';
import { createAuthHeaders } from '@/lib/api-utils';

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: CustomerFormData) => {
    setIsLoading(true);
    try {
      // Use the Siguiente.js API proxy
      const apiUrl = '/api/customers';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fallido al create customer');
      }

      const data = await response.json();
      toast.success('El cliente se cre? correctamente');
      router.push(`/customers/${data.id}`);
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Fallido al create customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Cliente</h1>
      <CustomerForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        isLoading={isLoading} 
      />
    </div>
  );
} 