"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Printer, Plus, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { deleteJobQueue, getJobQueueByDate, getJobQueuePrintData } from "@/api/job-queue"
import { JobQueueItem } from "@/types/job-queue"
import { toast } from "sonner"
import { LoadingIndicator } from '@/components/ui/loading-indicator'

export default function JobQueuePage() {
  const router = useRouter()
  const [date, setDate] = useState<Date>(new Date())
  const [jobQueueItems, setJobQueueItems] = useState<JobQueueItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobQueueItems()
  }, [date])

  const fetchJobQueueItems = async () => {
    try {
      setLoading(true)
      const formattedDate = format(date, "yyyy-MM-dd")
      const data = await getJobQueueByDate(formattedDate)
      
      setJobQueueItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error al consultar los trabajos en cola:", error)
      toast.error("No se pudieron cargar los trabajos en cola.")
      setJobQueueItems([])
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const printData = await getJobQueuePrintData(formattedDate)
      
      // Crear a new window for printing
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        toast.error("Permite las ventanas emergentes para imprimir la cola de trabajo.")
        return
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cola de trabajo - ${formattedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 10px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .completion-time { font-weight: bold; }
            .notes { font-style: italic; color: #555; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>PUNTO LAVANDERIA - Cola de trabajo</h1>
          <h2>Fecha: ${format(date, "dd MMMM yyyy", { locale: es })}</h2>
          <button onclick="window.print();" style="margin-bottom: 10px; padding: 5px 10px;">Imprimir</button>
          <table>
            <thead>
              <tr>
                <th>Posición</th>
                <th>N.º de pedido</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Artículos</th>
                <th>Peso (kg)</th>
                <th>Finalización estimada</th>
                <th>Finalización real</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              ${printData.map(item => `
                <tr>
                  <td>${item.queuePosition}</td>
                  <td>${item.orderNumber}</td>
                  <td>${item.customerName || 'No disponible'}</td>
                  <td>${item.status}</td>
                  <td>${item.totalItems}</td>
                  <td>${item.totalWeight || 0}</td>
                  <td class="completion-time">${item.estimatedCompletionTime}</td>
                  <td class="completion-time">${item.actualCompletionTime || '-'}</td>
                  <td class="notes">${item.notes || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `)
      
      printWindow.document.close()
    } catch (error) {
      console.error("Error al imprimir la cola de trabajo:", error)
      toast.error("No se pudieron preparar los datos para imprimir.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500'
      case 'processing': return 'bg-yellow-500'
      case 'washing': return 'bg-cyan-500'
      case 'drying': return 'bg-orange-500'
      case 'folding': return 'bg-indigo-500'
      case 'ready': return 'bg-green-500'
      case 'delivered': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "Nuevo",
      processing: "En proceso",
      washing: "En lavado",
      drying: "En secado",
      folding: "En doblado",
      ready: "Listo para entregar",
      delivered: "Entregado",
      cancelled: "Cancelado",
    }

    return labels[status] || status
  }

  const handleDeleteJobQueue = async (id: string) => {
    if (!window.confirm("¿Deseas eliminar este trabajo de la cola?")) return

    try {
      await deleteJobQueue(id)
      toast.success("El trabajo se eliminó de la cola.")
      await fetchJobQueueItems()
    } catch (error) {
      console.error("Error al eliminar el trabajo de la cola:", error)
      toast.error("No se pudo eliminar el trabajo de la cola.")
    }
  }

  const goToAddJobQueue = () => {
    router.push(`/admin/job-queue/add?date=${format(date, "yyyy-MM-dd")}`)
  }

  const goToEditJobQueue = (id: string) => {
    router.push(`/admin/job-queue/edit/${id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cola de trabajo</h1>
          <p className="text-muted-foreground">
            Gestiona la cola de trabajo diaria y consulta el avance de los pedidos.
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={goToAddJobQueue}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar trabajo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cola de trabajo diaria</CardTitle>
          <CardDescription>
            Trabajos programados para el {format(date, "dd MMMM yyyy", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingIndicator />
          ) : jobQueueItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground mb-4">No hay trabajos en cola para esta fecha</p>
              <Button onClick={goToAddJobQueue} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Agregar trabajo a la cola
              </Button>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Posición</TableHead>
                    <TableHead>N.º de pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Finalización estimada</TableHead>
                    <TableHead>Finalización real</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(jobQueueItems) && jobQueueItems.length > 0 ? (
                    jobQueueItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.queuePosition}</TableCell>
                        <TableCell>{item.order?.orderNumber || "No disponible"}</TableCell>
                        <TableCell>{item.order?.customer?.name || "No disponible"}</TableCell>
                        <TableCell>
                          {item.order?.status && (
                            <Badge 
                              className={cn("capitalize", getStatusColor(item.order.status))}
                            >
                              {getStatusLabel(item.order.status)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.estimatedCompletionTime 
                          ? new Date(item.estimatedCompletionTime).toLocaleTimeString('es-DO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "Por determinar"}
                        </TableCell>
                        <TableCell>{item.actualCompletionTime 
                          ? new Date(item.actualCompletionTime).toLocaleTimeString('es-DO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{item.notes || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => goToEditJobQueue(item.id)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editarar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteJobQueue(item.id)}
                              aria-label="Eliminar trabajo"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No hay trabajos en cola para esta fecha
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 