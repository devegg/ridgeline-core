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
      </div>
    </div>
  )
}
