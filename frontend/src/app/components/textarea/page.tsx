import { TextareaExample } from "@/components/TextareaExample"

export default function TextareaComponentPage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-4">Componente de texto multilínea</h1>
        <p className="text-muted-foreground mb-6">
          Campo de texto multilínea que permite escribir y editar mensajes.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Ejemplo de formulario de comentarios</h2>
          <TextareaExample />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Ejemplo de solicitud de asistencia</h2>
          <TextareaExample 
            title="Solicitud de asistencia" 
            description="Describe el inconveniente con todos los detalles posibles." 
          />
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Ejemplo de uso</h2>
        <div className="bg-muted p-4 rounded-md overflow-auto">
          <pre className="text-sm">
{`import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function TextareaWithLabel() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Tu mensaje</Label>
      <Textarea
        placeholder="Escribe tu mensaje aquí."
        id="message"
      />
    </div>
  )
}`}
          </pre>
        </div>
      </div>
    </div>
  )
} 