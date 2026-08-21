import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Camera photos are megabytes; the 1 MB default rejected the request
      // before saveCardAction ran, surfacing as a bare "client-side
      // exception" with nothing saved. Photos are downscaled in the browser
      // first (lib/field/downscale.ts) — this is the backstop, and it
      // matches the 12 MB check inside saveCardAction.
      bodySizeLimit: '12mb',
    },
  },
}

export default nextConfig
