'use client'

interface DownloadButtonProps {
  documentName: string
  content: string
}

export function DownloadMarkdownButton({ documentName, content }: DownloadButtonProps) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = documentName.endsWith('.md') ? documentName : `${documentName}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button className="btn-outline" onClick={handleDownload} style={{ fontSize: 13 }}>
      Download .md
    </button>
  )
}

// PDF download — stub until PDF generation is implemented
export function DownloadPdfButton() {
  return (
    <button
      className="btn-outline"
      disabled
      title="PDF export coming soon"
      style={{ fontSize: 13, opacity: 0.5, cursor: 'not-allowed' }}
    >
      Download PDF
    </button>
  )
}
