import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Validate URL
    const validUrl = new URL(url)
    if (!validUrl.protocol.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 })
    }

    // Fetch page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MountAdvertisingBot/1.0)'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch: ${response.status} ${response.statusText}` 
      }, { status: response.status })
    }

    const html = await response.text()
    
    // Extract basic SEO data
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    
    return NextResponse.json({
      url,
      title: titleMatch?.[1]?.trim() || null,
      description: descriptionMatch?.[1]?.trim() || null,
      h1: h1Match?.[1]?.trim() || null,
      image: imageMatch?.[1]?.trim() || null,
      status: response.status,
      contentLength: html.length,
      lastModified: response.headers.get('last-modified'),
      contentType: response.headers.get('content-type')
    })

  } catch (error) {
    return NextResponse.json({ 
      error: `Invalid URL or fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 400 })
  }
}
