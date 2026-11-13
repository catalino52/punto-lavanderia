"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getJobQueueById, updateJobQueue, deleteJobQueue } from "@/api/job-queue"
import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const formSchema = z.object({
  queuePosition: z.coerce.number().int().positive(),
  estimatedCompletionTime: z.string().optional(),
  actualCompletionTime: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export default function EditJobQueuePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [jobQueueItem, setJobQueueItem] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      queuePosition: 0,
      estimatedCompletionTime: "",
      actualCompletionTime: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (id) {
      fetchJobQueueItem(id)
    } else {
      toast.error("No se encontró el identificador del trabajo en cola.")
      router.push("/admin/job-queue")
    }
  }, [id, router])

  const fetchJobQueueItem = async (jobId: string) => {
    try {
      setLoading(true)
      const data = await getJobQueueById(jobId)
      setJobQueueItem(data)
      
      let estimatedTime = ""
      if (data.estimatedCompletionTime) {
        try {
          const date = new Date(data.estimatedCompletionTime)
          if (!isNaN(date.getTime())) {
            estimatedTime = format(date, "HH:mm")
          }
        } catch (error) {
          console.error("Error al dar formato a la hora estimada de finalización:", error)
        }
      }
      
      let actualTime = ""
      if (data.actualCompletionTime) {
        try {
          const date = new Date(data.actualCompletionTime)
          if (!isNaN(date.getTime())) {
            actualTime = format(date, "HH:mm")
          }
        } catch (error) {
          console.error("Error al dar formato a la hora real de finalización:", error)
        }
      }
      
      form.reset({
        queuePosition: data.queuePosition,
        estimatedCompletionTime: estimatedTime,
        actualCompletionTime: actualTime,
        notes: data.notes || "",
      })
    } catch (error) {
      console.error("Error al consultar el trabajo en cola:", error)
      toast.error("No se pudo cargar la información del trabajo.")
      router.push("/admin/job-queue")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true)
      
      const submitData: any = { ...values }
      
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === "") {
          submitData[key] = undefined;
        }
      });
      
      if (values.estimatedCompletionTime && jobQueueItem?.scheduledDate) {
        try {
          const [hours, minutes] = values.estimatedCompletionTime.split(':')
          const estimatedDate = new Date(jobQueueItem.scheduledDate)
          estimatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
          if (!isNaN(estimatedDate.getTime())) {
            submitData.estimatedCompletionTime = estimatedDate.toISOString()
          } else {
            submitData.estimatedCompletionTime = undefined
          }
        } catch (error) {
          console.error("Error al convertir la hora estimada de finalización:", error)
          submitData.estimatedCompletionTime = undefined
        }
      }
      
      if (values.actualCompletionTime && jobQueueItem?.scheduledDate) {
        try {
          const [hours, minutes] = values.actualCompletionTime.split(':')
          const actualDate = new Date(jobQueueItem.scheduledDate)
          actualDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
          if (!isNaN(actualDate.getTime())) {
            submitData.actualCompletionTime = actualDate.toISOString()
          } else {
            submitData.actualCompletionTime = undefined
          }
        } catch (error) {
          console.error("Error al convertir la hora real de finalización:", error)
          submitData.actualCompletionTime = undefined
        }
      }
      
      await updateJobQueue(id, submitData)
      toast.success("El trabajo se actualizó correctamente.")
      router.push("/admin/job-queue")
    } catch (error) {
      console.error("Error al actualizar el trabajo en cola:", error)
      toast.error("No se pudo actualizar el trabajo.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) {
      toast.error("Falta el identificador del trabajo en cola.")
      return
    }
    
    if (window.confirm("¿Deseas eliminar este trabajo de la cola?")) {
      try {
        setSubmitting(true)
        await deleteJobQueue(id)
        toast.success("El trabajo se eliminó de la cola.")
        router.push("/admin/job-queue")
      } catch (error) {
        console.error("Error al eliminar el trabajo de la cola:", error)
        toast.error("No se pudo eliminar el trabajo.")
        setSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar trabajo en cola</h1>
          <p className="text-muted-foreground">Cargando los detalles del trabajo...</p>
        </div>
        <Card>
          <CardContent>
            <LoadingIndicator text="Cargando los detalles del trabajo..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar trabajo en cola</h1>
          <p className="text-muted-foreground">
            Actualiza el trabajo del pedido {jobQueueItem?.order?.orderNumber}.
          </p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleDelete}
          disabled={submitting}
        >
          Eliminar trabajo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del trabajo en cola</CardTitle>
          <CardDescription>
            Edita los detalles del trabajo programado para el {
              jobQueueItem?.scheduledDate 
                ? format(new Date(jobQueueItem.scheduledDate), "dd MMMM yyyy", { locale: es })
                : "la fecha no está disponible"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="queuePosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posición en la cola</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Posición de este trabajo en la cola diaria.
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
                    <FormLabel>Hora estimada de finalización</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Hora prevista para completar este trabajo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualCompletionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora real de finalización</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Hora en que se completó el trabajo.
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
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Agrega cualquier nota especial para este trabajo"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Añade cualquier observación sobre este trabajo.
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
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <LoadingSpinner size="sm" className="mr-2" />}
                  {submitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 