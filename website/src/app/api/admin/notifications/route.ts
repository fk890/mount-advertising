import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock notifications data
    const notifications = [
      {
        id: '1',
        type: 'order',
        message: 'New order received',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'stock',
        message: 'Low stock alert for Diamond Ring',
        timestamp: new Date().toISOString(),
        read: false
      }
    ]

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle marking notifications as read
    if (body.action === 'mark_read') {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
