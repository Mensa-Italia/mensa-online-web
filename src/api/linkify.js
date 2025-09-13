// Simple linkify utility to convert URLs, emails and phone numbers into clickable links.
// Keeps original text otherwise. Performs basic HTML escaping first to avoid injection.
// Patterns kept intentionally conservative to reduce false positives.
export function linkify(text = '') {
  if (!text) return ''
  const escape = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  let out = escape(text)

  // URL pattern (http/https) - stop at whitespace or closing punctuation if trailing.
  const urlRegex = /(https?:\/\/[^\s<>()]+[^\s.,;:!?<>()\]\}])/gi
  out = out.replace(urlRegex, (m) => `<a href="${m}" target="_blank" rel="noopener">${m}</a>`)

  // Email pattern
  const emailRegex = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi
  out = out.replace(emailRegex, (m) => `<a href="mailto:${m}">${m}</a>`)

  // Phone pattern (basic international + local) – sequences of 7-15 digits with optional +, spaces, dashes, parentheses
  const phoneRegex = /(?:(?:\+\d{1,3}[\s-]?)?(?:\(\d{1,4}\)[\s-]?)*\d[\d\s-]{5,}\d)/g
  out = out.replace(phoneRegex, (m) => {
    // Strip non-digit except leading + for the tel link
    const clean = m.replace(/(?!^)\D/g, '')
    if (clean.length < 7 || clean.length > 15) return m // avoid false positives
    return `<a href="tel:${clean}">${m}</a>`
  })

  return out.replace(/\n{2,}/g, '<br/><br/>').replace(/\n/g, '<br/>')
}
