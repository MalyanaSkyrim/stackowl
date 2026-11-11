'use client'

import { env } from '@/env'
import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/** Standard events this site reports. */
type PixelEvent = 'ViewContent' | 'Lead' | 'CompleteRegistration'

/**
 * Reports a conversion to the pixel.
 *
 * Safe to call unconditionally: with no pixel id configured the script was
 * never injected, `window.fbq` is undefined and this is a no-op. Lives here
 * so the `Window.fbq` declaration above stays the only one in the app.
 */
export const trackPixelEvent = (event: PixelEvent, contentName?: string) => {
  window.fbq?.('track', event, contentName ? { content_name: contentName } : {})
}

interface MetaPixelProps {
  /**
   * Standard event fired once the pixel is ready. Landing pages that
   * exist to collect leads report `ViewContent`.
   */
  event?: PixelEvent
  /** Which landing page reported the event, so campaigns stay separable. */
  contentName?: string
}

/**
 * Meta Pixel, loaded only when `NEXT_PUBLIC_META_PIXEL_ID` is configured.
 *
 * With no id set this renders nothing at all — no script tag, no network
 * request — so the site ships without tracking until an id is supplied.
 */
export const MetaPixel = ({
  event = 'ViewContent',
  contentName,
}: MetaPixelProps) => {
  const pixelId = env.NEXT_PUBLIC_META_PIXEL_ID

  useEffect(() => {
    if (!pixelId) return
    trackPixelEvent(event, contentName)
  }, [pixelId, event, contentName])

  if (!pixelId) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}
