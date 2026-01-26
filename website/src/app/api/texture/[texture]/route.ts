import { NextResponse } from 'next/server';

// This route will generate a simple texture SVG
export async function GET(request: Request, { params }: { params: { texture: string } }) {
  const texture = params.texture;
  
  // Set color based on texture type
  let color = 'rgba(255, 255, 255, 0.5)';
  if (texture === 'bg') {
    color = 'rgba(255, 255, 255, 0.2)';
  } else if (texture === 'mg') {
    color = 'rgba(255, 255, 255, 0.4)';
  } else if (texture === 'fg') {
    color = 'rgba(255, 255, 255, 0.6)';
  }
  
  // Generate an abstract SVG texture
  const svg = `
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="${texture === 'bg' ? 1 : texture === 'mg' ? 5 : 10}" />
          <feDisplacementMap in="SourceGraphic" scale="100" />
        </filter>
        <mask id="circleMask">
          <rect width="1920" height="1080" fill="black" />
          ${Array.from({ length: 20 }, (_, i) => {
            const cx = Math.random() * 1920;
            const cy = Math.random() * 1080;
            const r = Math.random() * 300 + 100;
            return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" />`;
          }).join('')}
        </mask>
      </defs>
      <rect width="1920" height="1080" fill="transparent" />
      <rect width="1920" height="1080" fill="${color}" filter="url(#noise)" mask="url(#circleMask)" />
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
