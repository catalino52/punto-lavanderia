"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUser } from '@/services/userService';
import { FormErrors, UserRole, CreateUserFormData } from '@/types/user';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define the form validation schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Nombre is required" }),
  username: z.string().min(1, { message: "Usuarioname is required" }),
  email: z.string().email({ message: "Ingresa un correo Email valid" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.STAFF, UserRole.USER]),
  status: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: UserRole.USER,
      status: true,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Crear API payload
      const userData = {
        username: data.username,
        password: data.password,
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: data.status
      };
      
      await createUser(userData);
      toast.success("Usuario created successfully!");
      
      // Redirect after a short delay al show success message
      setTimeout(() => {
        router.push('/users');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Fallido al create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Crear Nuevo Usuario</h1>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardHeader>
              <CardTitle>Information del usuario</CardTitle>
              <CardDescription>Enter the details for the new user account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuarioname</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select 
                        defaultValue={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                          <SelectItem value={UserRole.STAFF}>Personal</SelectItem>
                          <SelectItem value={UserRole.USER}>Usuario regular</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 6 characters long.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Estado del usuario</FormLabel>
                        <FormDescription>
                          Activate or deactivate this user account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline" asChild>
                <Link href="/admin/users">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">
                      ⟳
                    </span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
} 