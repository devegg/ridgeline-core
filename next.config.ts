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
  eslint: {
    // Lint is configured (eslint.config.mjs) and runs via `npm run lint`, but
    // it does NOT gate the build yet: 11 pre-existing errors in shipped
    // marketing/dashboard files would start failing production deploys the
    // moment the config landed. Fix those, then delete this block so CI
    // enforces lint again.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
