import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/home/SiteHeader'
import { SiteFooter } from '@/components/home/SiteFooter'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'

export const metadata: Metadata = {
  title: 'Papers — Ridgeline Knows',
  description: 'Written deep-dives: how the platforms on the work page actually got built, and what they say about the operations underneath.',
}

export default async function PapersPage() {
  const supabase = await createClient()
  const { data: papers, error } = await supabase
    .from('documents')
    .select('id, name, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  queryFailed('documents(public)', error)

  return (
    <div className="site-bg">
      <div className="site-root">
        <SiteHeader />
        <main>
          <section className="stories" style={{ paddingTop: 96 }}>
            <div className="container" style={{ maxWidth: 820 }}>
              <div className="eyebrow">Papers</div>
              <h1 className="section-title">
                The stories <em>behind</em> the builds.
              </h1>
              <p className="lede">
                Written deep-dives on the work: what was actually wrong, what got built, and what
                changed. Plain English, real numbers.
              </p>

              {papers && papers.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 40 }}>
                  {papers.map((p) => (
                    <li key={p.id} style={{ margin: '18px 0' }}>
                      <Link href={`/papers/${p.id}`} className="story__title">
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="story__body" style={{ marginTop: 40 }}>
                  The first papers land this weekend. In the meantime, the{' '}
                  <Link href="/work">work page</Link> has the short versions.
                </p>
              )}
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
