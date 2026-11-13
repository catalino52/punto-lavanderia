'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "El nombre del cliente es obligatorio." }),
  phone: z.string().min(1, { message: "El teléfono es obligatorio." }).regex(/^[0-9]{10,15}$/, { message: "El número de teléfono no es válido." }),
  email: z.string().email({ message: "El correo electrónico no es válido." }).optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof formSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function CustomerForm({ initialData, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      notes: initialData?.notes || "",
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del cliente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Escribe el nombre del cliente" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ejemplo: 8095551234" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cliente@ejemplo.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Dirección completa del cliente" 
                      {...field} 
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Preferencias del cliente, indicaciones especiales, etc."
                      {...field}
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Información adicional que conviene conocer sobre el cliente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2 border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
} 