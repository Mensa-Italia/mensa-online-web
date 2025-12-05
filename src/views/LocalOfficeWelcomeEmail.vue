<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useOfficesStore } from '@/stores/offices'

const route = useRoute()
const router = useRouter()
const offices = useOfficesStore()
const code = computed(() => route.params.code)
const office = computed(() => offices.getByCode(code.value))

if (!office.value) {
  router.replace('/offices')
}

// EDITABLE BODY FIELDS (structure/style locked)
const emailSubject = ref('')
const intro = ref('Complimenti {{firstName}} per aver superato il test d’ingresso! Da oggi fai riferimento alla nostra segreteria: siamo qui per accoglierti e aiutarti a muovere i primi passi nella community.')
// Dynamic lists
const bullets = ref([
  { id: 1, text: 'Conoscere altri soci della regione' },
  { id: 2, text: 'Partecipare a eventi, cene e attività locali' },
  { id: 3, text: 'Ottenere supporto su quote, iscrizioni e domande pratiche' }
])
let bulletIdSeq = 4
const startLabel = ref('Inizia da qui:')
const links = ref([
  { id: 1, label: 'Gruppo WhatsApp', url: '#WHATSAPP#' },
  { id: 2, label: 'Gruppo Telegram', url: '#TELEGRAM#' },
  { id: 3, label: 'Bot Telegram (info rapide)', url: '#BOT#' }
])
let linkIdSeq = 4
// App link is fixed (non-editable)
const APP_URL = 'https://app.mensa.it'
const contactEmail = ref('#EMAIL#')
// Fixed site URL (non-editable)
const SITE_URL = 'https://mensa.it'
const closing = ref('Ti aspettiamo ai prossimi incontri! Per qualsiasi cosa puoi rispondere a questa mail: siamo qui per te.')
const signature = computed(() => `Segreteria Regionale ${office.value?.name || ''}`)

// TOKENIZED SAMPLE (optional tokens in text content) - only firstName now
function replaceTokens(text) {
  if (!text) return ''
  const tokens = {
    '{{firstName}}': 'Mario'
  }
  return Object.entries(tokens).reduce((acc,[k,v]) => acc.replaceAll(k,v), text)
}

// Persistence (localStorage) ---------------------------------
const STORAGE_KEY = computed(() => `welcomeEmail:v3:${office.value?.code}`)
function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY.value)
    if (!raw) { seedDefaults(); return }
    const data = JSON.parse(raw)
    Object.entries(data).forEach(([k,v]) => {
      if (k in fieldMap) fieldMap[k].value = v
      else if (k === 'bullets' && Array.isArray(v)) { bullets.value = v.map((b,i) => ({ id: b.id || i+1, text: b.text || '' })); bulletIdSeq = bullets.value.reduce((m,b)=>Math.max(m,b.id),0)+1 }
      else if (k === 'links' && Array.isArray(v)) { links.value = v.map((l,i) => ({ id: l.id || i+1, label: l.label || '', url: l.url || '' })); linkIdSeq = links.value.reduce((m,l)=>Math.max(m,l.id),0)+1 }
    })
  } catch { seedDefaults() }
}
function seedDefaults() {
  if (!office.value) return
  emailSubject.value = `Benvenuto/a in Mensa – ${office.value.name}`
  // reset lists to defaults
  bullets.value = [
    { id: 1, text: 'Conoscere altri soci della regione' },
    { id: 2, text: 'Partecipare a eventi, cene e attività locali' },
    { id: 3, text: 'Ottenere supporto su quote, iscrizioni e domande pratiche' }
  ]; bulletIdSeq = 4
  links.value = [
    { id: 1, label: 'Gruppo WhatsApp', url: '#WHATSAPP#' },
    { id: 2, label: 'Gruppo Telegram', url: '#TELEGRAM#' },
    { id: 3, label: 'Bot Telegram (info rapide)', url: '#BOT#' }
  ]; linkIdSeq = 4
}
const fieldMap = {
  emailSubject, intro, startLabel,
  closing
}
const dirty = ref(false)
const justSaved = ref(false)
watch(office, () => loadStored(), { immediate: true })
// Track dirtiness instead of auto-saving
watch(Object.values(fieldMap), () => { dirty.value = true }, { deep: true })
watch(bullets, () => { dirty.value = true }, { deep: true })
watch(links, () => { dirty.value = true }, { deep: true })

function saveTemplate() {
  try {
  const payload = Object.fromEntries(Object.entries(fieldMap).map(([k,r]) => [k, r.value]))
  payload.bullets = bullets.value
  payload.links = links.value
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(payload))
    dirty.value = false
    justSaved.value = true
    setTimeout(() => { justSaved.value = false }, 1600)
  } catch (e) {
    console.warn('Save failed', e)
  }
}

// Helpers -----------------------------------------------------
function escapeHtml(str) {
  return str.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c] || c))
}
const safe = v => escapeHtml(replaceTokens(v))

const htmlEmail = computed(() => {
  const bulletItems = bullets.value.map(b => b.text.trim()).filter(Boolean)
  const bulletBlock = bulletItems.length
    ? `<tr><td align="left" style="padding:12px 24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0F172A;"><table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border:1px solid #EEF2F7;border-radius:6px;\"><tr><td style=\"padding:14px 16px;\"><p style=\"margin:0 0 8px 0;font-size:15px;line-height:1.6;\">Con la Segreteria potrai:</p><ul style=\"margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;\">${bulletItems.map(t=>`<li>${safe(t)}</li>`).join('')}</ul></td></tr></table></td></tr>`
    : ''
  const linkItems = links.value.filter(l => l.url.trim())
  const linksRow = linkItems.length
    ? `<tr><td align=\"left\" style=\"padding:4px 24px 0 24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;\"><p style=\"margin:0 0 8px 0;font-size:14px;color:#475467;\">${safe(startLabel.value)}</p><p style=\"margin:0 0 10px 0;font-size:14px;line-height:1.7;\">${linkItems.map(l => `• ${safe(l.label)}: <a href=\\"${l.url}\\" style=\\"color:#2563EB;text-decoration:underline;\\">link</a>`).join('<br>')}</p></td></tr>`
    : ''
  const contactParts = []
  if (contactEmail.value.trim()) contactParts.push(`📧 <a href=\"mailto:${contactEmail.value}\" style=\"color:#2563EB;text-decoration:underline;\">${contactEmail.value}</a>`)
  contactParts.push(`🌐 <a href=\"${SITE_URL}\" style=\"color:#2563EB;text-decoration:underline;\">${SITE_URL}</a>`)
  const contactsLine = contactParts.length ? `<br>${contactParts.join(' &nbsp;·&nbsp; ')}` : ''
  return `<!doctype html><html lang=\"it\"><head><meta charset=\"utf-8\"><meta name=\"x-apple-disable-message-reformatting\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>${safe(emailSubject.value)}</title></head><body style=\"margin:0;padding:0;background-color:#F4F6F8;\">`
    + `<div style=\"display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;\">${safe(intro.value).slice(0,140)}</div>`
    + `<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:#F4F6F8;\"><tr><td align=\"center\" style=\"padding:24px 12px;\">`
    + `<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:600px;background:#FFFFFF;border-radius:8px;border:1px solid #E6E9EF;\">`
    + `<tr><td align=\"center\" style=\"padding:20px 24px 0 24px;\"><img src=\"https://www.mensa.it/wp-content/uploads/2019/11/2_Mensa-Italia_Logo-orizzontale-2.png\" height=\"72\" alt=\"Mensa\" style=\"display:block;border:0;outline:none;text-decoration:none;border-radius:12px;\"></td></tr>`
    + `<tr><td align=\"left\" style=\"padding:12px 24px 0 24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0F172A;\"><h1 style=\"margin:0;font-size:22px;line-height:1.3;font-weight:700;\">${safe(emailSubject.value)}</h1></td></tr>`
    + `<tr><td align=\"left\" style=\"padding:8px 24px 8px 24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#475467;\"><p style=\"margin:0;font-size:14px;line-height:1.6;\">${safe(intro.value)}</p></td></tr>`
    + bulletBlock
    + linksRow
  + `<tr><td align=\"center\" style=\"padding:0 24px;\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:12px auto 8px auto;\"><tr><td align=\"center\" bgcolor=\"#2563EB\" style=\"border-radius:6px;\"><a href=\"${APP_URL}\" style=\"display:inline-block;padding:12px 18px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;\">Apri l’app per tutte le informazioni</a></td></tr></table><p style=\"margin:0;font-size:13px;color:#64748B;line-height:1.6;\">Nell’app trovi calendario eventi, iscrizioni, documenti utili e aggiornamenti dalla Segreteria.</p></td></tr>`
    + `<tr><td style=\"padding:16px 24px;\"><hr style=\"border:0;border-top:1px solid #E6E9EF;margin:0;\"></td></tr>`
    + `<tr><td align=\"left\" style=\"padding:12px 24px 20px 24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0F172A;\"><p style=\"margin:0 0 8px 0;font-size:15px;line-height:1.7;\">${safe(closing.value)}</p><p style=\"margin:0;font-size:13px;color:#475467;line-height:1.6;\">A presto,<br><strong>${safe(signature.value)}</strong>${contactsLine}</p></td></tr>`
    + `</table>`
    + `<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:600px;margin-top:8px;\"><tr><td align=\"center\" style=\"padding:8px 12px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#94A3B8;font-size:11px;line-height:1.6;\">Ricevi questa email perché hai superato il test d’ingresso. Se non è per te, puoi ignorarla.</td></tr></table>`
    + `</td></tr></table></body></html>`
})

const textEmail = computed(() => {
  const lines = []
  lines.push(replaceTokens(emailSubject.value))
  lines.push('')
  lines.push(replaceTokens(intro.value))
  lines.push('')
  const bulletItems = bullets.value.map(b=>b.text.trim()).filter(Boolean)
  if (bulletItems.length) {
    lines.push('Con la Segreteria potrai:')
    bulletItems.forEach(t => lines.push(`- ${replaceTokens(t)}`))
    lines.push('')
  }
  const linkItems = links.value.filter(l => l.url.trim())
  if (linkItems.length) {
    lines.push(replaceTokens(startLabel.value))
    linkItems.forEach(l => lines.push(`${l.label}: ${l.url}`))
  }
  lines.push(`App: ${APP_URL}`)
  lines.push('')
  lines.push(replaceTokens(closing.value))
  lines.push('')
  lines.push(`A presto,`)
  lines.push(signature.value)
  if (contactEmail.value.trim()) lines.push(`Email: ${contactEmail.value}`)
  lines.push(`Sito: ${SITE_URL}`)
  lines.push('')
  lines.push('---')
  lines.push('Ricevi questa email perché hai superato il test d’ingresso. Se non è per te, puoi ignorarla.')
  return lines.join('\n')
})

function resetAll() { if (confirm('Ripristinare i testi predefiniti?')) { localStorage.removeItem(STORAGE_KEY.value); seedDefaults(); dirty.value=false } }

// List mutation helpers
function addBullet() { bullets.value.push({ id: bulletIdSeq++, text: '' }) }
function removeBullet(id) { bullets.value = bullets.value.filter(b => b.id !== id) }
function addLink() { links.value.push({ id: linkIdSeq++, label: '', url: '' }) }
function removeLink(id) { links.value = links.value.filter(l => l.id !== id) }
</script>

<template>
  <div v-if="office" class="welcome-email-page">
    <PageHeader :title="'Welcome Email - ' + office.name" subtitle="Composer per la mail di benvenuto" />

    <div class="toolbar">
      <RouterLink :to="{ name: 'LocalOfficeDetail', params: { code: office.code } }" class="btn btn-sm btn-outline-light">← Torna alla sezione</RouterLink>
      <div class="spacer" />
      <div class="status-pill" :class="{ dirty: dirty, saved: !dirty }">{{ dirty ? 'Modifiche non salvate' : (justSaved ? 'Salvato' : 'Nessuna modifica') }}</div>
      <button class="btn btn-sm btn-outline-light" type="button" @click="resetAll">Reset</button>
      <button class="btn btn-sm btn-outline-light" type="button" :disabled="!dirty" @click="saveTemplate">Salva</button>
    </div>

    <div class="layout">
      <div class="editor panel">
  <h3 class="panel-title">Contenuti (solo testo)</h3>
  <div class="small-hint">Struttura e stile sono fissi. Puoi usare il token <code>{{ '{' }}{{ '{' }}{{ 'firstName' }}{{ '}' }}{{ '}' }}</code>.</div>
        <label class="form-label">Oggetto</label>
        <input v-model="emailSubject" class="form-control form-control-sm" type="text" />
        <label class="form-label">Intro</label>
        <textarea v-model="intro" rows="3" class="form-control form-control-sm" />
        <label class="form-label" style="margin-top:.4rem;">Bullet Points</label>
        <div class="dyn-list">
          <div v-for="b in bullets" :key="b.id" class="dyn-row">
            <input v-model="b.text" class="form-control form-control-sm" placeholder="Testo bullet" />
            <button type="button" class="icon-btn" @click="removeBullet(b.id)" :disabled="bullets.length===1" title="Rimuovi">×</button>
          </div>
          <button type="button" class="btn btn-xs btn-outline-light add-btn" @click="addBullet">+ Aggiungi bullet</button>
        </div>
        <label class="form-label">Label sezione link</label>
        <input v-model="startLabel" class="form-control form-control-sm" />
        <label class="form-label" style="margin-top:.6rem;">Link (etichetta + URL)</label>
        <div class="dyn-list">
          <div v-for="l in links" :key="l.id" class="dyn-row link-row">
            <input v-model="l.label" class="form-control form-control-sm" placeholder="Etichetta" />
            <input v-model="l.url" class="form-control form-control-sm" placeholder="https://..." />
            <button type="button" class="icon-btn" @click="removeLink(l.id)" :disabled="links.length===0" title="Rimuovi">×</button>
          </div>
          <button type="button" class="btn btn-xs btn-outline-light add-btn" @click="addLink">+ Aggiungi link</button>
        </div>
        <label class="form-label">Chiusura</label>
        <textarea v-model="closing" rows="3" class="form-control form-control-sm" />
        <div class="links-grid">
          <div class="mini"><label class="form-label">Email contatto</label><input v-model="contactEmail" class="form-control form-control-sm" /></div>
        </div>
      </div>
      <div class="preview panel">
        <h3 class="panel-title">Anteprima HTML</h3>
        <iframe class="email-frame" :srcdoc="htmlEmail" title="Anteprima Email" />
        <h3 class="panel-title" style="margin-top:.8rem;">Anteprima Testo</h3>
        <pre class="preview-text">{{ textEmail }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-email-page { display:flex; flex-direction:column; gap:1.2rem; }
.toolbar { display:flex; align-items:center; gap:.6rem; }
.spacer { flex:1; }
.layout { display:grid; gap:1rem; grid-template-columns:1fr; }
@media (min-width: 960px) { .layout { grid-template-columns: 1fr 1fr; } }

.panel { background:rgba(15,23,42,0.82); border:1px solid rgba(96,165,250,0.35); border-radius:1rem; padding:1rem 1rem 1.2rem; backdrop-filter:blur(14px) saturate(150%); box-shadow:0 0 0 1px rgba(59,130,246,0.35), 0 6px 26px -10px rgba(29,78,216,0.65); display:flex; flex-direction:column; gap:.65rem; }
.panel-title { margin:0; font-size:.85rem; letter-spacing:.5px; font-weight:600; }
.small-hint { font-size:.55rem; opacity:.65; letter-spacing:.4px; }
.form-label { font-size:.58rem; text-transform:uppercase; letter-spacing:.55px; opacity:.7; margin:0; }
input.form-control, textarea.form-control { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.18); color:#fff; font-size:.65rem; border-radius:.5rem; padding:.45rem .6rem; }
input.form-control:focus, textarea.form-control:focus { outline:none; border-color:#60a5fa; box-shadow:0 0 0 1px #60a5fa55; }
textarea.form-control { resize:vertical; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; line-height:1.25; }

.email-frame { width:100%; min-height:480px; border:1px solid rgba(255,255,255,0.12); background:#fff; border-radius:.6rem; }
.preview-text { margin:0; font-size:.6rem; line-height:1.25; white-space:pre-wrap; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); padding:.7rem .75rem; border-radius:.6rem; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
.triple-grid { display:grid; gap:.55rem; grid-template-columns:1fr; }
@media (min-width:700px){ .triple-grid { grid-template-columns:repeat(3,1fr); } }
.links-grid { display:grid; gap:.55rem; grid-template-columns:1fr; }
@media (min-width:700px){ .links-grid { grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); } }
.mini { display:flex; flex-direction:column; gap:.3rem; }
.dyn-list { display:flex; flex-direction:column; gap:.4rem; }
.dyn-row { display:flex; gap:.4rem; align-items:center; }
.dyn-row input { flex:1; }
.dyn-row.link-row input:first-child { flex:0 0 40%; }
.icon-btn { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#fff; font-size:.7rem; line-height:1; padding:.35rem .55rem; border-radius:.45rem; cursor:pointer; }
.icon-btn:hover:not(:disabled){ background:rgba(255,255,255,0.18); }
.icon-btn:disabled { opacity:.35; cursor:not-allowed; }
.add-btn { font-size:.55rem; padding:.35rem .55rem; margin-top:.15rem; }
.fixed-app-url { font-size:.55rem; opacity:.75; margin-top:.25rem; }
</style>
