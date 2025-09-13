// Minimal markdown renderer (safe subset) used for AI resume.
// Supports: headings (#, ##, ###), **bold**, *italic*, inline `code`, unordered lists (-, *), paragraphs.
// Escapes HTML before applying formatting.
export function renderMarkdown(src = '') {
  if (!src) return ''
  const escape = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  // Normalize line endings
  src = src.replace(/\r\n?/g, '\n')

  // Split into lines for block parsing
  const lines = src.split(/\n/) 
  const out = []
  let listOpen = false
  function closeList() { if (listOpen) { out.push('</ul>'); listOpen = false } }

  for (let raw of lines) {
    let line = raw.trimEnd()
    if (!line.trim()) { closeList(); continue }

    // Headings
    const h = /^(#{1,3})\s+(.+)$/.exec(line)
    if (h) {
      closeList()
      const level = h[1].length
      out.push(`<h${level}>${inline(h[2])}</h${level}>`)
      continue
    }

    // Unordered list item
    if (/^[*-]\s+/.test(line)) {
      if (!listOpen) { out.push('<ul>'); listOpen = true }
      line = line.replace(/^[*-]\s+/, '')
      out.push(`<li>${inline(line)}</li>`)
      continue
    }

    // Paragraph
    closeList()
    out.push(`<p>${inline(line)}</p>`)
  }
  closeList()
  return out.join('\n')

  function inline(text) {
    text = escape(text)
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
    return text
  }
}
