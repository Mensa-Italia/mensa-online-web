<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { storeToRefs } from 'pinia'
import { useEventsStore } from '@/stores/events'
import { useDocumentsStore } from '@/stores/documents'
import PageHeader from '@/components/PageHeader.vue'

const eventsStore = useEventsStore()
const docsStore = useDocumentsStore()

const { currentEvent, territoryEvents, italyEvents, totalEvents } = storeToRefs(eventsStore)
const { userDocuments, membershipDocuments, totalDocuments } = storeToRefs(docsStore)
</script>

<template>
  <div class="dashboard-root">
    <PageHeader title="Dashboard" subtitle="Your Mensa membership hub">
      <template #actions>
        <div class="stats-bar ms-auto">
          <div class="stat-chip">
            Events <strong>{{ totalEvents }}</strong>
          </div>
          <div class="stat-chip">
            Docs <strong>{{ totalDocuments }}</strong>
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="panels-grid">
      <!-- Current Event -->
      <section class="panel glass-panel">
        <div class="panel-header">
          <span>Current Event</span>
          <span v-if="currentEvent" class="badge-soft">Active</span>
        </div>
        <template v-if="currentEvent">
          <h3 class="h6 m-0">{{ currentEvent.title }}</h3>
          <p class="meta small">
            {{ currentEvent.date }} · {{ currentEvent.location }} · {{ currentEvent.territory }}
          </p>
          <p class="small dim">{{ currentEvent.description }}</p>
          <div class="panel-footer">
            <button class="btn btn-sm btn-outline-light" disabled>Details (Soon)</button>
          </div>
        </template>
        <p v-else class="small dim">No active event right now.</p>
      </section>

      <!-- Territory Events -->
      <section class="panel glass-panel">
        <div class="panel-header">
          <span>Territory Events</span>
          <span class="badge-soft">{{ territoryEvents.length }}</span>
        </div>
        <ul v-if="territoryEvents.length" class="list-reset">
          <li v-for="ev in territoryEvents" :key="ev.id" class="event-item">
            <strong class="small">{{ ev.title }}</strong>
            <span class="mini dim">{{ ev.date }} · {{ ev.location }}</span>
          </li>
        </ul>
        <p v-else class="small dim">No territory events.</p>
      </section>

      <!-- Italy Events -->
      <section class="panel glass-panel">
        <div class="panel-header">
          <span>Italy Events</span>
          <span class="badge-soft">{{ italyEvents.length }}</span>
        </div>
        <ul v-if="italyEvents.length" class="list-reset">
          <li v-for="ev in italyEvents" :key="ev.id" class="event-item">
            <strong class="small">{{ ev.title }}</strong>
            <span class="mini dim">{{ ev.date }} · {{ ev.location }}</span>
          </li>
        </ul>
        <p v-else class="small dim">No national events listed.</p>
      </section>

      <!-- User Documents -->
      <section class="panel glass-panel">
        <div class="panel-header">
          <span>Your Documents</span>
          <span class="badge-soft">{{ userDocuments.length }}</span>
        </div>
        <ul v-if="userDocuments.length" class="list-reset">
          <li v-for="doc in userDocuments" :key="doc.id" class="doc-item">
            <span class="truncate">{{ doc.name }}</span>
            <button class="btn btn-sm btn-outline-light" disabled>Open</button>
          </li>
        </ul>
        <p v-else class="small dim">No user documents.</p>
      </section>

      <!-- Membership Documents -->
      <section class="panel glass-panel">
        <div class="panel-header">
          <span>Membership Docs</span>
          <span class="badge-soft">{{ membershipDocuments.length }}</span>
        </div>
        <ul v-if="membershipDocuments.length" class="list-reset">
          <li v-for="doc in membershipDocuments" :key="doc.id" class="doc-item">
            <span class="truncate">{{ doc.name }}</span>
            <button class="btn btn-sm btn-outline-light" disabled>Open</button>
          </li>
        </ul>
        <p v-else class="small dim">No shared membership docs.</p>
      </section>

      <!-- Boutique -->
      <section class="panel glass-panel boutique-banner">
        <div class="panel-header">
          <span>Boutique</span>
          <span class="badge-soft">Soon</span>
        </div>
        <p class="small dim">Explore branded apparel & accessories.</p>
        <div class="panel-footer">
          <router-link to="/boutique" class="btn btn-sm btn-outline-light"
            >Enter Boutique</router-link
          >
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard-root {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.header-bar {
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.subtitle {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}
.meta {
  color: var(--color-text-secondary);
}
.dim {
  opacity: 0.75;
}
.truncate {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mini {
  font-size: 0.65rem;
}
@media (max-width: 720px) {
}
</style>
