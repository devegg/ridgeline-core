import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { queryFailed } from '@/lib/supabase/errors'
import { StatusBadge } from '@/components/ui/StatusBadge'

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: activeClients, error: clientCountError },
    { count: openProjects, error: projectCountError },
    { count: pendingProposals, error: proposalCountError },
    { data: outstandingInvoices, error: invoicesError },
    { data: recentClients, error: recentClientsError },
    { data: recentProjects, error: recentProjectsError },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).in('status', ['active', 'on_hold']),
    supabase.from('proposals').select('*', { count: 'exact', head: true }).in('status', ['draft', 'pending']),
    supabase.from('invoices').select('total, status').in('status', ['sent', 'overdue']),
    supabase.from('clients').select('id, name, status, created_at').neq('status', 'scheduled_delete').order('created_at', { ascending: false }).limit(5),
    supabase.from('projects').select('id, name, status, created_at').neq('status', 'scheduled_delete').order('created_at', { ascending: false }).limit(5),
  ])

  const clientCountFailed = queryFailed('clients', clientCountError)
  const projectCountFailed = queryFailed('projects', projectCountError)
  const proposalCountFailed = queryFailed('proposals', proposalCountError)
  const invoicesFailed = queryFailed('invoices', invoicesError)
  const recentClientsFailed = queryFailed('clients', recentClientsError)
  const recentProjectsFailed = queryFailed('projects', recentProjectsError)

  const outstanding = (outstandingInvoices ?? []).reduce((s, i) => s + Number(i.total), 0)
  const overdueCount = (outstandingInvoices ?? []).filter(i => i.status === 'overdue').length

  const firstName = user?.email?.split('@')[0] ?? 'there'

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Dashboard</div>
        <h1 className="page-title">Overview</h1>
        <p className="page-description">Good to see you, {firstName}.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'var(--rule)', border: '1px solid var(--rule)', marginTop: 32 }}>
        <StatCard
          label="Active Clients"
          value={clientCountFailed ? '—' : (activeClients ?? 0)}
          sub={clientCountFailed ? 'failed to load' : undefined}
          href="/clients?status=active"
          warn={clientCountFailed}
        />
        <StatCard
          label="Open Projects"
          value={projectCountFailed ? '—' : (openProjects ?? 0)}
          sub={projectCountFailed ? 'failed to load' : undefined}
          href="/projects?status=active"
          warn={projectCountFailed}
        />
        <StatCard
          label="Proposals in Flight"
          value={proposalCountFailed ? '—' : (pendingProposals ?? 0)}
          sub={proposalCountFailed ? 'failed to load' : undefined}
          href="/proposals?status=pending"
          warn={proposalCountFailed}
        />
        <StatCard
          label="Outstanding"
          value={invoicesFailed ? '—' : `$${outstanding.toLocaleString()}`}
          sub={invoicesFailed ? 'failed to load' : overdueCount > 0 ? `${overdueCount} overdue` : undefined}
          href="/billing/invoices?status=sent"
          warn={invoicesFailed || overdueCount > 0}
        />
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
        {/* Recent clients */}
        <div className="section-card">
          <div className="section-card__head">
            <span className="section-card__label">Recent Clients</span>
            <Link href="/clients" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>All →</Link>
          </div>
          <div className="section-card__body">
            {recentClientsFailed ? (
              <div className="section-card__error">Clients failed to load.</div>
            ) : !recentClients?.length ? (
              <div className="section-card__empty">No clients yet. <Link href="/clients/new" style={{ color: 'var(--blue)' }}>Add one →</Link></div>
            ) : (
              <table className="data-table">
                <tbody>
                  {recentClients.map(c => (
                    <tr key={c.id}>
                      <td><Link href={`/clients/${c.id}`}>{c.name}</Link></td>
                      <td><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent projects */}
        <div className="section-card">
          <div className="section-card__head">
            <span className="section-card__label">Recent Projects</span>
            <Link href="/projects" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>All →</Link>
          </div>
          <div className="section-card__body">
            {recentProjectsFailed ? (
              <div className="section-card__error">Projects failed to load.</div>
            ) : !recentProjects?.length ? (
              <div className="section-card__empty">No projects yet. <Link href="/projects/new" style={{ color: 'var(--blue)' }}>Add one →</Link></div>
            ) : (
              <table className="data-table">
                <tbody>
                  {recentProjects.map(p => (
                    <tr key={p.id}>
                      <td><Link href={`/projects/${p.id}`}>{p.name}</Link></td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, href, warn }: {
  label: string
  value: string | number
  sub?: string
  href: string
  warn?: boolean
}) {
  return (
    <Link href={href} style={{ display: 'block', background: 'var(--paper)', padding: '24px 22px', textDecoration: 'none', transition: 'background 150ms' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: '32px', color: warn ? '#8B2A1E' : 'var(--ink)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: warn ? '#8B2A1E' : 'var(--ink-soft)', marginTop: 6, letterSpacing: '0.1em' }}>
          {sub}
        </div>
      )}
    </Link>
  )
}
