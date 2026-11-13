import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historial de pagos - PUNTO LAVANDERÍA',
  description: 'Consulta tu historial de pagos y los detalles de tus transacciones.',
};

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 