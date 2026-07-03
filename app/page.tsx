import { SiteHeader } from '@/components/home/SiteHeader'
import { Hero } from '@/components/home/Hero'
import { Problems } from '@/components/home/Problems'
import { ClientsSection } from '@/components/home/ClientsSection'
import { Stories } from '@/components/home/Stories'
import { Origin } from '@/components/home/Origin'
import { Engagement } from '@/components/home/Engagement'
import { Contact } from '@/components/home/Contact'
import { SiteFooter } from '@/components/home/SiteFooter'

export default function Home() {
  return (
    <div className="site-bg">
      <div className="site-root">
        <SiteHeader />
        <main>
          <Hero />
          <Problems />
          <ClientsSection />
          <Stories />
          <Origin />
          <Engagement />
          <Contact />
        </main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'Ridgeline Knows',
              url: 'https://ridgelineknows.com',
              email: 'hello@ridgelineknows.com',
              telephone: '+1-843-425-7030',
              description:
                'Operations counsel for small business owners. I help businesses eliminate hours lost to tasks that can run automatically.',
              address: { '@type': 'PostalAddress', addressLocality: 'Myrtle Beach', addressRegion: 'SC', addressCountry: 'US' },
              areaServed: 'The Lowcountry to Myrtle Beach and beyond — clients nationwide',
              founder: { '@type': 'Person', name: 'Brian Boyd' },
            }),
          }}
        />
      </div>
    </div>
  )
}
