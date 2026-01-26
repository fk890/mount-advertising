import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Contact endpoint has been removed.' },
    { status: 410 }
  );
}
