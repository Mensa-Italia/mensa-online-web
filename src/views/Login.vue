<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const justLogged = ref(false)

async function submit() {
  if (auth.loading) return
  try {
    await auth.login(email.value.trim(), password.value)
    justLogged.value = true
    const redirect = (route.query.redirect && typeof route.query.redirect === 'string') ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (_) {
    // error already set in store
  }
}

// If user somehow is already authenticated (persisted session), redirect immediately
watch(
  () => auth.authenticated,
  (val) => {
    if (val && !justLogged.value) {
      const redirect = (route.query.redirect && typeof route.query.redirect === 'string') ? route.query.redirect : '/'
      router.replace(redirect)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="login-wrapper">
    <div class="brand-outer">
      <img class="brand-logo" src="@/assets/logo_horizontal.png" alt="App logo" height="72" />
    </div>
    <form class="login-form" @submit.prevent="submit" novalidate>
      <h2 class="title">Sign In</h2>
      <p v-if="auth.error" class="error" role="alert">{{ auth.error }}</p>
      <div class="field">
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="Email"
          aria-label="Email address"
          inputmode="email"
        />
      </div>
      <div class="field">
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          placeholder="Password"
          aria-label="Password"
        />
      </div>
      <button class="submit" type="submit" aria-label="Sign in" :disabled="auth.loading">
        <span v-if="auth.loading">Signing in…</span>
        <span v-else>Sign In</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  padding: 2.25rem 1.25rem 2.75rem;
  background:
    radial-gradient(circle at 75% 25%, rgba(120, 119, 198, 0.15), transparent 60%),
    radial-gradient(circle at 25% 75%, rgba(56, 189, 248, 0.12), transparent 55%),
    linear-gradient(145deg, #0d1117, #111827 45%, #0f172a);
  color: #f1f5f9;
}
.login-form {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
  backdrop-filter: blur(18px) saturate(130%);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.025));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 1.9rem 1.65rem 1.6rem;
  box-shadow:
    0 10px 25px -8px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  position: relative;
}
.login-form::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.5),
    rgba(59, 130, 246, 0.4),
    rgba(16, 185, 129, 0.35)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}
.title {
  margin: 0 0 0.35rem;
  font-size: 1.55rem;
  font-weight: 600;
  text-align: center;
  background: linear-gradient(90deg, #60a5fa, #818cf8 45%, #34d399);
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: 0.6px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #cbd5e1;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.brand-outer {
  animation: fadeSlide 0.8s ease;
}
.brand-logo {
  display: block;
  border-radius: 24%;
  height: 72px;
}
@keyframes fadeSlide {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.field input {
  font: inherit;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(17, 24, 39, 0.85), rgba(30, 41, 59, 0.85));
  color: #f1f5f9;
  outline: none;
  transition:
    border-color 0.18s,
    box-shadow 0.18s,
    background 0.25s;
}
.field input::placeholder {
  color: #64748b;
}
.field input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.25);
  background: linear-gradient(145deg, rgba(24, 33, 50, 0.92), rgba(45, 55, 72, 0.92));
}
.submit {
  margin-top: 0.65rem;
  padding: 0.7rem 0.85rem;
  font: inherit;
  font-weight: 600;
  letter-spacing: 0.4px;
  background: linear-gradient(92deg, #6366f1, #3b82f6 40%, #0ea5e9 75%);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 11px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    filter 0.25s,
    transform 0.2s,
    box-shadow 0.25s;
  box-shadow: 0 4px 14px -4px rgba(59, 130, 246, 0.55);
}
.submit::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.4), transparent 60%);
  opacity: 0;
  transition: opacity 0.35s;
}
.submit:hover::after {
  opacity: 0.9;
}
.submit:hover {
  filter: brightness(1.08) saturate(1.15);
}
.submit:active {
  transform: translateY(1px);
}
.submit[disabled] {
  opacity: 0.65;
  cursor: not-allowed;
}
.error {
  margin: 0 0 .25rem;
  font-size: .7rem;
  color: #f87171;
  text-align: center;
  font-weight: 500;
}
</style>
