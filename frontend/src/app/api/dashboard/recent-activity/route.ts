import { NextRequest, NextResponse } from 'next/server';
import { getCookie } from '@/lib/auth-cookies';

// Get base URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get token from request
function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get from Authorization header first
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fallback to cookie
  const token = getCookie(req, 'token');
  return token || null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 10;

  const headers: Record<string, string> = {};
  const token = getTokenFromRequest(request);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/recent-activity?limit=${encodeURIComponent(String(limit))}`,
      { headers, cache: 'no-store' },
    );
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || `No se pudo cargar la actividad reciente (HTTP ${response.status}).` },
        { status: response.status },
      );
    }

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: 'El servicio devolvió un formato de actividad no válido.' },
        { status: 502 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error fetching recent activity:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'No se pudo conectar con el servicio de actividad reciente.' },
      { status: 502 },
    );
  }
} 