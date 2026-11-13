import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TextareaExampleProps {
  title?: string
  description?: string
}

export function TextareaExample({
  title = "Formulario de comentarios",
  description = "Comparte tus comentarios con nuestro equipo.",
}: TextareaExampleProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Label htmlFor="textarea-example">Tu mensaje</Label>
      <Textarea
        id="textarea-example"
        placeholder="Escribe tu mensaje aquí."
        rows={4}
      />
    </div>
  )
}
