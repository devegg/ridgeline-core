import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
