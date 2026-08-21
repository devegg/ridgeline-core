import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

/**
 * ESLint 9 flat config. `next lint` is deprecated in Next 15, so `npm run
 * lint` calls the ESLint CLI directly; eslint-config-next still supplies the
 * rules through FlatCompat.
 */
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'docs/**',
      '.claude/worktrees/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]

export default eslintConfig
