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

/** Real at last: prints just the document (print CSS isolates .doc-viewer),
    and every browser's print dialog offers "Save as PDF" — brand typography
    intact, zero dependencies. */
export function DownloadPdfButton() {
  return (
    <button className="btn-outline" onClick={() => window.print()} style={{ fontSize: 13 }}>
      Print / PDF
    </button>
  )
}
