import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatRupiah = formatCurrency

export function formatDate(date: string | Date): string {
  if (!date) return "-"
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export function formatShortDate(date: string | Date): string {
  if (!date) return "-"
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
