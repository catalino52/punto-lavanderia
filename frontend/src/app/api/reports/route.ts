import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = new URL(
      '/reports',
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    );
    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = request.cookies.get('token')?.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(backendUrl, {
      headers,
      cache: 'no-store',
    });
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al consultar los informes:', error);
    return NextResponse.json(
      { message: 'No se pudieron consultar los informes.' },
      { status: 500 },
    );
  }
}
