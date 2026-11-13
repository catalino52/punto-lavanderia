"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createJobQueue } from "@/api/job-queue";
import { getOrders, Order, OrderStatus } from "@/api/orders";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const formSchema = z.object({
  orderId: z.string().uuid({ message: "Selecciona un pedido." }),
  scheduledDate: z.string(),
  queuePosition: z.coerce.number().int().positive().optional(),
  estimatedCompletionTime: z.string().optional(),
  notes: z.string().max(500).optional(),
});

function AddJobQueueForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: "",
      scheduledDate: dateParam || format(new Date(), "yyyy-MM-dd"),
      queuePosition: undefined,
      estimatedCompletionTime: "",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders({ limit: 100 });
        let ordersData: Order[] = [];

        if (response?.data?.data?.items && Array.isArray(response.data.data.items)) {
          ordersData = response.data.data.items;
        } else if (response?.data && Array.isArray(response.data)) {
          ordersData = response.data;
        }

        setOrders(
          ordersData.filter(
            (order) =>
              order.status !== OrderStatus.DELIVERED &&
              order.status !== OrderStatus.CANCELLED,
          ),
        );
      } catch (error) {
        console.error("Error al consultar los pedidos:", error);
        toast.error("No se pudieron cargar los pedidos.");
        setOrders([]);
      }
    };

    void fetchOrders();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        estimatedCompletionTime: values.estimatedCompletionTime || undefined,
        notes: values.notes || undefined,
        queuePosition: values.queuePosition || undefined,
      };

      if (formattedValues.estimatedCompletionTime) {
        const [hours, minutes] = formattedValues.estimatedCompletionTime.split(":");
        const scheduledDate = new Date(formattedValues.scheduledDate);
        scheduledDate.setHours(Number(hours), Number(minutes), 0, 0);
        formattedValues.estimatedCompletionTime = scheduledDate.toISOString();
      }

      await createJobQueue(formattedValues);
      toast.success("El trabajo se agregó a la cola correctamente.");
      router.push("/admin/job-queue");
    } catch (error) {
      console.error("Error al agregar el trabajo a la cola:", error);
      toast.error("No se pudo agregar el trabajo a la cola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agregar trabajo a la cola</h1>
        <p className="text-muted-foreground">
          Añade un pedido a la cola de trabajo del día.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo trabajo en cola</CardTitle>
          <CardDescription>
            Completa los datos del trabajo que se agregará.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un pedido" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.orderNumber} -{" "}
                            {order.customer?.name || "Cliente no disponible"} (
                            {order.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecciona el pedido que deseas agregar a la cola de trabajo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha programada</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Fecha en que está programado este trabajo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="queuePosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posición en la cola (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Se asignará automáticamente si lo dejas vacío"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Si dejas este campo vacío, la posición se asignará automáticamente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedCompletionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora estimada de finalización (opcional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Si dejas este campo vacío, la hora se calculará automáticamente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Añade cualquier observación sobre este trabajo"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Añade cualquier observación relevante para este trabajo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/job-queue")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <LoadingSpinner size="sm" className="mr-2" />}
                  {loading ? "Agregando..." : "Agregar a la cola"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AddJobQueuePage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando formulario...</div>}>
      <AddJobQueueForm />
    </Suspense>
  );
}
