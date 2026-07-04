import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/home/SiteHeader'
import { SiteFooter } from '@/components/home/SiteFooter'
import { MarkdownViewer } from '@/components/documents/MarkdownViewer'
import { createClient } from '@/lib/supabase/server'
import { paperMinutes } from '@/lib/paper-preview'

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: paper } = await supabase
    .from('documents')
    .select('id, name, content, created_at')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (!paper) notFound()

  return (
    <div className="site-bg">
      <div className="site-root">
        <SiteHeader />
        <main>
          <section className="stories" style={{ paddingTop: 96 }}>
            <div className="container" style={{ maxWidth: 820 }}>
              <div className="eyebrow">Paper</div>
              <div className="story__meta" style={{ marginTop: 0, marginBottom: 28 }}>
                <span>{paperMinutes(paper.content)} min read</span>
              </div>
              <MarkdownViewer content={paper.content} />
              <div style={{ marginTop: 48 }}>
                <Link className="btn-quiet" href="/papers">
                  ← All papers
                </Link>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
