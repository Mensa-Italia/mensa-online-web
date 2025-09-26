<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import PageHeader from '@/components/PageHeader.vue'
</script>

<template>
  <div class="dashboard-placeholder">
    <PageHeader title="Dashboard" subtitle="Overview and quick access to main features">
  
    </PageHeader>
    <div class="soon-wrapper">
      <div class="soon-box">
        <h2>The dashboard will be available soon</h2>
        <p class="lead">Work in progress. New metrics, events snapshot and quick links arriveranno a breve.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-placeholder { display:flex; flex-direction:column; gap:2rem; }
.soon-wrapper { flex:1; display:flex; align-items:center; justify-content:center; padding:2rem 0; }
.soon-box { max-width:640px; text-align:center; padding:2.5rem 2rem; border:1px solid rgba(255,255,255,0.12); border-radius:14px; background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); backdrop-filter:blur(6px); box-shadow:0 4px 18px -6px rgba(0,0,0,0.55); }
.soon-box h2 { font-size:1.4rem; margin:0 0 .75rem; }
.lead { font-size:.95rem; opacity:.8; margin:0; }
</style>
