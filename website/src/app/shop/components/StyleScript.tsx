'use client'

import Script from 'next/script'
import React from 'react'

export default function StyleScript() {
  return (
    <>
      {/* Regular link for browsers with JS disabled */}
      <noscript><link rel="stylesheet" href="/styles/enhanced.css" /></noscript>
      
      {/* Script to load styles asynchronously */}
      <Script id="load-enhanced-styles" strategy="afterInteractive">
        {`
          (function() {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/enhanced.css';
            document.head.appendChild(link);
          })();
        `}
      </Script>
    </>
  )
}
