"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Upload, Building, Mail, Phone, MapPin, Globe, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Form schemas
const businessFormSchema = z.object({
  name: z.string().min(2, { message: "Negocio name must be at least 2 characters." }),
  email: z.string().email({ message: "Ingresa un correo Email valid." }),
  phone: z.string().min(6, { message: "Phone number must be at least 6 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "Ciudad must be at least 2 characters." }),
  postalCode: z.string().min(4, { message: "Postal code must be at least 4 characters." }),
  website: z.string().optional(),
  taxId: z.string().optional(),
  logo: z.any().optional(),
})

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Nombre must be at least 2 characters." }),
  email: z.string().email({ message: "Ingresa un correo Email valid." }),
  phone: z.string().min(6, { message: "Phone number must be at least 6 characters." }),
  role: z.string().min(2, { message: "Rol must be at least 2 characters." }),
  avatar: z.any().optional(),
})

const securityFormSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const notificationsFormSchema = z.object({
  newOrder: z.boolean().default(true),
  orderUpdates: z.boolean().default(true),
  paymentReceived: z.boolean().default(true),
  customerMessaged: z.boolean().default(false),
  stockAlerts: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  marketingUpdates: z.boolean().default(false),
})

// Mock data
const businessData = {
  name: "LaundryCare Pro",
  email: "info@laundrycarepro.com",
  phone: "+6281234567890",
  address: "Jl. Laundry Raya No. 123",
  city: "Jakarta",
  postalCode: "12345",
  website: "https://laundrycarepro.com",
  taxId: "123456789012345",
  logo: "/logo.png"
}

const profileData = {
  name: "Ahmad Fauzi",
  email: "ahmad.fauzi@laundrycarepro.com",
  phone: "+6287654321098",
  role: "Administradoristrator",
  avatar: "/avatars/05.png"
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business")
  
  // Negocio form
  const businessForm = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: businessData,
  })

  // Perfil form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileData,
  })

  // Seguridad form
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Notificaciones form
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      newOrder: true,
      orderUpdates: true,
      paymentReceived: true,
      customerMessaged: false,
      stockAlerts: true,
      securityAlerts: true,
      marketingUpdates: false,
    },
  })

  // Form submission handlers
  function onBusinessSubmit(values: z.infer<typeof businessFormSchema>) {
    console.log(values)
    // Here you would typically send data al your API
    alert("Negocio settings saved!")
  }

  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    console.log(values)
    alert("Perfil settings saved!")
  }

  function onSecuritySubmit(values: z.infer<typeof securityFormSchema>) {
    console.log(values)
    alert("Seguridad settings saved!")
  }

  function onNotificationsSubmit(values: z.infer<typeof notificationsFormSchema>) {
    console.log(values)
    alert("?La configuraci?n de notificaciones se guard? correctamente!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="business" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Negocio</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        {/* Negocio Settings */}
        <TabsContent value="business" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Negocio Information
              </CardTitle>
              <CardDescription>
                Actualizar your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex flex-col items-center justify-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={businessData.logo} alt="Negocio Logo" />
                        <AvatarFallback>{businessData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Button>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={businessForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Negocio Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Escribe el nombre del negocio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={businessForm.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RNC</FormLabel>
                            <FormControl>
                              <Input placeholder="Escribe el RNC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={businessForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Mail className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                              <Input placeholder="Escribe el correo Email" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Phone className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                              <Input placeholder="Escribe el n?mero de tel?fono" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sitio web</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Globe className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                              <Input placeholder="Escribe la direcci?n del sitio web" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={businessForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <MapPin className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                            <Textarea placeholder="Escribe la direcci?n del negocio" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={businessForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Escribe la ciudad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>C?digo postal</FormLabel>
                          <FormControl>
                            <Input placeholder="Escribe el c?digo postal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Perfil Settings */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Perfil
              </CardTitle>
              <CardDescription>
                Actualizar your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex flex-col items-center justify-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.avatar} alt={profileData.name} />
                        <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Upload className="mr-2 h-4 w-4" />
                        Change Avatar
                      </Button>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Escribe tu nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <FormControl>
                              <Input placeholder="Escribe tu cargo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Escribe tu correo Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Escribe tu n?mero de tel?fono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad Settings */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Actualizar your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Escribe tu contrase?a actual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Escribe una contrase?a nueva" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters, include an uppercase letter and a number.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirma la contrase?a nueva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Actualizar Password
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configure what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Order Notificaciones</h3>
                    <div className="space-y-3">
                      <FormField
                        control={notificationsForm.control}
                        name="newOrder"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Nuevo Pedidos</FormLabel>
                              <FormDescription>
                                Receive notifications when a new order is placed
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
                      <FormField
                        control={notificationsForm.control}
                        name="orderUpdates"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Order Actualizars</FormLabel>
                              <FormDescription>
                                Receive notifications when order status changes
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
                      <FormField
                        control={notificationsForm.control}
                        name="paymentReceived"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Pago recibido</FormLabel>
                              <FormDescription>
                                Receive notifications when payments are received
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
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notificaciones del sistema</h3>
                    <div className="space-y-3">
                      <FormField
                        control={notificationsForm.control}
                        name="customerMessaged"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Mensajes de clientes</FormLabel>
                              <FormDescription>
                                Recibe notificaciones cuando los clientes env?en mensajes
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
                      <FormField
                        control={notificationsForm.control}
                        name="stockAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Alertas de inventario</FormLabel>
                              <FormDescription>
                                Receive notifications about inventory levels
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
                      <FormField
                        control={notificationsForm.control}
                        name="securityAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Seguridad Alerts</FormLabel>
                              <FormDescription>
                                Receive notifications about security events
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
                      <FormField
                        control={notificationsForm.control}
                        name="marketingUpdates"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Marketing Actualizars</FormLabel>
                              <FormDescription>
                                Receive notifications about marketing and promotions
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
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar preferencias
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 