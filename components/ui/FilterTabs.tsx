import Link from 'next/link'

interface Tab {
  label: string
  value: string
}

interface FilterTabsProps {
  tabs: Tab[]
  current: string
  basePath: string
  param?: string
}

export function FilterTabs({ tabs, current, basePath, param = 'status' }: FilterTabsProps) {
  return (
    <div className="filter-tabs">
      {tabs.map((tab) => {
        const href = tab.value === 'all' ? basePath : `${basePath}?${param}=${tab.value}`
        return (
          <Link key={tab.value} href={href} className={`filter-tab ${current === tab.value ? 'active' : ''}`}>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
