'use server'

import { execFile } from 'child_process'
import path from 'path'

const SCRIPT_PATH = path.resolve(process.cwd(), 'scripts/scaffold-project.sh')
// Projects are created as siblings of the ridgeline repo (one level up)
const PROJECTS_ROOT = path.resolve(process.cwd(), '..')

type ScaffolderResult = {
  ok: boolean
  output: string
  projectName?: string
}

function sanitizeProjectName(raw: string): string | null {
  const clean = raw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  if (!clean || clean.length < 2 || clean.length > 80) return null
  return clean
}

export async function runScaffolderAction(
  _prevState: ScaffolderResult | null,
  formData: FormData
): Promise<ScaffolderResult> {
  const rawName = formData.get('project_name') as string
  const projectName = sanitizeProjectName(rawName ?? '')

  if (!projectName) {
    return { ok: false, output: 'Error: project name must be 2–80 lowercase letters, numbers, or hyphens.' }
  }

  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''

    const child = execFile(
      'bash',
      [SCRIPT_PATH, projectName],
      {
        env: {
          ...process.env,
          TARGET_DIR: PROJECTS_ROOT,
        },
        timeout: 15_000,
      }
    )

    child.stdout?.on('data', (d: Buffer) => { stdout += d.toString() })
    child.stderr?.on('data', (d: Buffer) => { stderr += d.toString() })

    child.on('close', (code) => {
      const output = (stdout + (stderr ? `\n${stderr}` : '')).trim()
      resolve({ ok: code === 0, output, projectName })
    })

    child.on('error', (err) => {
      resolve({ ok: false, output: err.message })
    })
  })
}
