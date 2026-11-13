import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import { APP_NAME } from "@/config";
import { ThemeProvider } from "@/components/ui/theme-provider";
import '../styles/calendar-styles.css';
import '../styles/cursor-fixes.css';
import '../styles/calendar-fixes.css';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Sistema de gestión para pedidos, clientes, pagos y servicios de PUNTO LAVANDERIA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-DO" suppressHydrationWarning>
      <head />
      <body className="font-sans">
        <Providers>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
