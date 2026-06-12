import MainLayout from '@/components/Layout/MainLayout'

interface Section {
  title: string
  body: React.ReactNode
}

interface LegalPageProps {
  title: string
  lastUpdated?: string
  intro?: React.ReactNode
  sections: Section[]
}

export default function LegalPage({ title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-6">Last updated: {lastUpdated}</p>
        )}
        {intro && <div className="text-gray-700 mb-8 space-y-3">{intro}</div>}
        <div className="space-y-8">
          {sections.map(section => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
              <div className="text-gray-700 space-y-3 leading-relaxed">{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
