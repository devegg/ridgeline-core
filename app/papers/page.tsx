import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/home/SiteHeader'
import { SiteFooter } from '@/components/home/SiteFooter'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { paperExcerpt, paperMinutes } from '@/lib/paper-preview'

export const metadata: Metadata = {
  title: 'Papers — Ridgeline Knows',
  description: 'Written deep-dives: how the platforms on the work page actually got built, and what they say about the operations underneath.',
}

export default async function PapersPage() {
  const supabase = await createClient()
  const { data: papers, error } = await supabase
    .from('documents')
    .select('id, name, content, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  queryFailed('documents(public)', error)

  return (
    <div className="site-bg">
      <div className="site-root">
        <SiteHeader />
        <main>
          <section className="stories" style={{ paddingTop: 96 }}>
            <div className="container">
              <div className="eyebrow">Papers</div>
              <h1 className="section-title">
                The stories <em>behind</em> the builds.
              </h1>
              <p className="lede">
                Written deep-dives on the work: what was actually wrong, what got built, and what
                changed. Plain English, real numbers.
              </p>

              {papers && papers.length > 0 ? (
                papers.map((p, i) => (
                  <article className="story" key={p.id}>
                    <div>
                      <div className="story__num">{String(i + 1).padStart(2, '0')}</div>
                      <div className="story__meta">
                        <span>
                          {new Date(p.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {paperMinutes(p.content)} minute read
                      </div>
                    </div>
                    <div>
                      <h3 className="story__title">
                        <Link href={`/papers/${p.id}`} style={{ color: 'inherit' }}>
                          {p.name}
                        </Link>
                      </h3>
                      <p className="story__body">{paperExcerpt(p.content)}</p>
                    </div>
                    <div>
                      <p className="story__go">
                        <Link href={`/papers/${p.id}`}>Read the paper →</Link>
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="story__body" style={{ marginTop: 40 }}>
                  The first papers land this weekend. In the meantime, the{' '}
                  <Link href="/work">work page</Link> has the short versions.
                </p>
              )}

              <p className="lede" style={{ marginTop: 56 }}>
                The short versions live on the <Link href="/work">work page</Link>.
              </p>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
