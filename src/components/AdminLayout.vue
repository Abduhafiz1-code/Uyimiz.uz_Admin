<script setup>
/**
 * Admin panel qobig'i — Uyimiz Agent panelidagi `CrmLayout` bilan bir xil
 * tuzilma: chapda tor navigatsiya reyki, tepada yopishqoq topbar (qidiruv,
 * mavzu almashtirgichi, profil), pastda kontent maydoni.
 *
 * Agent panelida reyk ostida agentning reyting shkalasi turadi; bu yerda
 * uning o'rnini "moderatsiya navbati" bandi egallaydi — adminning kundalik
 * ishi aynan shu yerdan boshlanadi.
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { monthLabel } from '../lib/format'
import { logout, state } from '../store'
import ThemeToggle from './ThemeToggle.vue'
import UiIcon from './UiIcon.vue'

const route = useRoute()
const router = useRouter()

const navOpen = ref(false)
const query = ref('')

const links = [
  { to: '/', label: 'Boshqaruv paneli', icon: 'i-sq' },
  { to: '/foydalanuvchilar', label: 'Foydalanuvchilar', icon: 'i-users' },
  { to: '/agentlar', label: 'Agentlar', icon: 'i-shield-check' },
  { to: '/elonlar', label: "E'lonlar", icon: 'i-doc' },
  { to: '/moderatsiya', label: 'Moderatsiya', icon: 'i-flag' },
  { to: '/tariflar', label: "Tariflar / to'lovlar", icon: 'i-tag' },
  { to: '/rollar', label: 'Rollar va ruxsatlar', icon: 'i-key' },
  { to: '/sozlamalar', label: 'Tizim sozlamalari', icon: 'i-gear' },
  { to: '/audit', label: 'Audit jurnali', icon: 'i-history' },
]

const admin = computed(() => state.currentAdmin)
const adminInitials = computed(() => {
  const parts = String(admin.value?.name || 'Admin').trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'A'
})
const pendingCount = computed(() => state.moderation.length)

function isActive(to) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

/**
 * Tepadagi qidiruv — hozircha eng mos ro'yxatga olib o'tadi va so'rovni
 * o'sha sahifaning o'z qidiruv maydoniga uzatadi (`?q=`).
 */
function runSearch() {
  const q = query.value.trim()
  if (!q) return
  router.push({ path: '/foydalanuvchilar', query: { q } })
}

async function signOut() {
  await logout()
  router.replace({ name: 'login' })
}

// Sahifa almashganda telefon menyusi yopilsin.
watch(() => route.path, () => (navOpen.value = false))
</script>

<template>
  <div class="shell">
    <!-- ==== chap panel ==== -->
    <aside class="rail" :class="{ open: navOpen }">
      <RouterLink to="/" class="brand">
        <svg class="mark"><use href="#star" /></svg>
        <span>Uyimiz <b>Admin</b></span>
      </RouterLink>

      <nav>
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="nav-link"
          :class="{ on: isActive(l.to) }"
        >
          <UiIcon :name="l.icon" :size="16" />
          <span>{{ l.label }}</span>
          <b v-if="l.to === '/moderatsiya' && pendingCount" class="count">{{ pendingCount }}</b>
          <i v-if="isActive(l.to)" class="marker" />
        </RouterLink>
      </nav>

      <!-- Agent panelidagi reyting shkalasining admin muqobili -->
      <RouterLink to="/moderatsiya" class="queue">
        <div class="queue-top">
          <span class="dim">Moderatsiya navbati</span>
          <b class="mono" :class="{ hot: pendingCount > 0 }">{{ pendingCount }}</b>
        </div>
        <div class="bar"><i :style="{ width: Math.min(100, pendingCount * 10) + '%' }" /></div>
        <div class="queue-note mono">
          {{ pendingCount ? "Ko'rib chiqish kutilmoqda" : 'Navbat bo‘sh' }}
        </div>
      </RouterLink>

      <button class="nav-link out" @click="signOut">
        <UiIcon name="i-out" :size="16" />
        <span>Chiqish</span>
      </button>
    </aside>

    <div v-if="navOpen" class="rail-veil" @click="navOpen = false" />

    <!-- ==== o'ng tomon ==== -->
    <div class="main">
      <header class="topbar">
        <button class="btn btn-ghost btn-icon burger" aria-label="Menyu" @click="navOpen = !navOpen">
          <UiIcon name="i-list" :size="16" />
        </button>

        <label class="search">
          <UiIcon name="i-search" :size="15" />
          <input
            v-model="query"
            type="search"
            placeholder="Foydalanuvchi, agent yoki e'lon qidiring…"
            @keyup.enter="runSearch"
          />
        </label>

        <span class="spacer" />
        <span class="pill month mono">{{ monthLabel() }}</span>

        <ThemeToggle />

        <div class="me">
          <span class="ava ava-sm">{{ adminInitials }}</span>
          <span class="me-txt">
            <b>{{ admin?.name || 'Admin' }}</b>
            <small>{{ admin?.admin_title || admin?.role || 'Superadmin' }}</small>
          </span>
        </div>
      </header>

      <main class="canvas">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  align-items: flex-start;
  min-height: 100vh;
}

/* ---------- chap panel ---------- */
.rail {
  position: sticky;
  top: 0;
  z-index: 40;
  flex: none;
  width: var(--rail-w);
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 18px 12px;
  background: var(--nav-bg);
  border-right: 1px solid var(--line-soft);
  transition: background-color var(--dur-2) var(--ease-in-out);
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 10px 20px;
  text-decoration: none;
  color: var(--text);
  font-family: var(--f-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.brand b {
  color: var(--teal);
  font-weight: 800;
}
.mark {
  width: 20px;
  height: 20px;
  color: var(--teal);
  flex: none;
  transition: transform var(--dur-3) var(--ease-out);
}
.brand:hover .mark {
  transform: rotate(45deg);
}

nav {
  display: grid;
  gap: 2px;
}
.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 9px;
  background: none;
  font-family: inherit;
  font-size: 13px;
  color: var(--text-2);
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--dur-1) var(--ease-out),
    color var(--dur-1) var(--ease-out),
    padding-left var(--dur-2) var(--ease-out);
}
.nav-link span {
  flex: 1;
  min-width: 0;
}
.nav-link:hover {
  background: var(--surface-2);
  color: var(--text);
  padding-left: 14px;
}
.nav-link.on {
  background: var(--teal-glow);
  color: var(--teal);
  font-weight: 600;
}
.count {
  flex: none;
  min-width: 19px;
  padding: 1px 5px;
  border-radius: 20px;
  background: var(--brass);
  color: var(--on-brass);
  font-size: 10.5px;
  font-weight: 800;
  text-align: center;
}
.marker {
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 17px;
  border-radius: 3px;
  background: var(--teal);
  transform: translateY(-50%);
  animation: pop var(--dur-2) var(--ease-out) both;
}

.queue {
  display: block;
  margin: 18px 10px 0;
  padding-top: 14px;
  border-top: 1px solid var(--line-soft);
  text-decoration: none;
  color: inherit;
}
.queue-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 7px;
}
.queue-top b {
  color: var(--text-2);
  font-size: 11.5px;
}
.queue-top b.hot {
  color: var(--brass);
}
.queue-note {
  font-size: 10px;
  color: var(--text-3);
  margin-top: 7px;
}

.out {
  margin-top: auto;
  color: var(--text-3);
}
.out:hover {
  background: var(--rose-glow);
  color: var(--rose);
}

.rail-veil {
  display: none;
}

/* ---------- o'ng tomon ---------- */
.main {
  flex: 1;
  min-width: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--topbar-h);
  padding: 0 clamp(14px, 2.5vw, 24px);
  background: var(--topbar-bg);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line-soft);
}
.burger {
  display: none;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 340px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text-3);
  transition:
    border-color var(--dur-1) var(--ease-out),
    box-shadow var(--dur-1) var(--ease-out),
    max-width var(--dur-2) var(--ease-out);
}
.search:focus-within {
  border-color: var(--teal);
  box-shadow: 0 0 0 3px var(--teal-glow);
  max-width: 420px;
}
.search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: none;
  color: var(--text);
  font-family: inherit;
  font-size: 13px;
}
.search input::placeholder {
  color: var(--text-3);
}

.spacer {
  flex: 1;
}
.month {
  font-size: 10.5px;
}

.me {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 9px 4px 4px;
  border-radius: 30px;
  border: 1px solid var(--line);
  color: var(--text);
}
.me-txt {
  display: grid;
  line-height: 1.25;
}
.me-txt b {
  font-size: 12.5px;
  font-weight: 700;
}
.me-txt small {
  font-size: 10.5px;
  color: var(--text-3);
}

.canvas {
  position: relative;
  padding: 22px clamp(14px, 2.5vw, 26px) 70px;
}

/* ---------- moslashuvchanlik ---------- */
@media (max-width: 1080px) {
  .me-txt {
    display: none;
  }
  .me {
    padding: 4px;
  }
}
@media (max-width: 900px) {
  .rail {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    transition: transform var(--dur-2) var(--ease-out);
    z-index: 60;
    box-shadow: var(--shadow-pop);
  }
  .rail.open {
    transform: none;
  }
  .rail-veil {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.5);
    animation: fade var(--dur-2) var(--ease-out);
  }
  .burger {
    display: inline-flex;
  }
  .month {
    display: none;
  }
  .nav-link {
    padding: 12px 12px;
    font-size: 14px;
  }
}

@media (max-width: 700px) {
  .search {
    display: none;
  }
  .topbar {
    gap: 8px;
  }
}
@media (max-width: 380px) {
  .topbar {
    padding: 0 10px;
    gap: 6px;
  }
}
</style>
