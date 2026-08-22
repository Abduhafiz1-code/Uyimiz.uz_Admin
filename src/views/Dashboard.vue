<script setup>
import { computed } from 'vue'

import KpiCard from '../components/KpiCard.vue'
import PageHead from '../components/PageHead.vue'
import UiIcon from '../components/UiIcon.vue'
import { nf } from '../lib/format'
import { state } from '../store'

/* ---- Strategik reja bo'yicha KPI maqsadlari (3 / 6 / 12 oy) ---- */
const kpiTargets = [
  { stage: 1, label: '1-bosqich · 3 oy', users: 10000, posts: 2000, deals: 200, revenue: '0 (bepul)' },
  { stage: 2, label: '2-bosqich · 6 oy', users: 50000, posts: 10000, deals: 1000, revenue: '80 mln' },
  { stage: 3, label: '3-bosqich · 12 oy', users: 200000, posts: 50000, deals: 5000, revenue: '500 mln+' },
]
const stageLabels = {
  1: 'Maklersiz pilot',
  2: 'Tizimlashtirish va monetizatsiya',
  3: 'Uyimiz Agent integratsiyasi',
}

const d = computed(() => state.dashboard || {})
const currentStage = computed(() => d.value.stage || 1)
const currentTarget = computed(
  () => kpiTargets.find((t) => t.stage === currentStage.value) || kpiTargets[0],
)

function pct(current, target) {
  if (!target) return 0
  return Math.min(100, Math.round(((current || 0) / target) * 100))
}

const goals = computed(() => [
  {
    key: 'users',
    label: 'Foydalanuvchilar',
    now: d.value.usersTotal || 0,
    target: currentTarget.value.users,
  },
  {
    key: 'posts',
    label: "E'lonlar",
    now: d.value.postsTotal || 0,
    target: currentTarget.value.posts,
  },
  {
    key: 'deals',
    label: 'Bitimlar',
    now: d.value.dealsTotal || 0,
    target: currentTarget.value.deals,
  },
])
</script>

<template>
  <div>
    <PageHead
      eyebrow="Boshqaruv paneli"
      title="Platformaning umumiy holati"
      note="Foydalanuvchilar, agentlar, e'lonlar va moderatsiya navbati — bir ekranda. Kartani bosib tegishli ro'yxatga o'ting."
    >
      <RouterLink to="/rollar?add=1" class="btn btn-pri">
        <UiIcon name="i-plus" :size="15" /> Admin qo'shish
      </RouterLink>
    </PageHead>

    <!-- ── asosiy ko'rsatkichlar ── -->
    <div class="grid-kpi stagger">
      <KpiCard
        label="Jami foydalanuvchilar"
        :value="d.usersTotal || 0"
        icon="i-users"
        tone="teal"
        to="/foydalanuvchilar"
      />
      <KpiCard
        label="Faol agentlar"
        :value="d.activeAgents || 0"
        icon="i-shield-check"
        tone="teal"
        to="/agentlar"
      />
      <KpiCard
        label="Bugungi e'lonlar"
        :value="d.postsToday || 0"
        icon="i-doc"
        to="/elonlar"
      />
      <KpiCard
        label="Moderatsiyada"
        :value="d.moderationCount || 0"
        icon="i-flag"
        tone="brass"
        to="/moderatsiya"
      />
    </div>

    <div class="grid-kpi stagger section">
      <KpiCard label="Jami e'lonlar" :value="d.postsTotal || 0" icon="i-list" to="/elonlar" />
      <KpiCard
        label="Jami bitimlar (agentlar orqali)"
        :value="d.dealsTotal || 0"
        icon="i-trend"
        to="/agentlar"
      />
      <KpiCard
        label="Tariflar va to'lovlar"
        :value="state.tariffs.length"
        unit="tarif"
        icon="i-wallet"
        to="/tariflar"
      />
    </div>

    <!-- ── strategik reja ── -->
    <section class="card card-pad section">
      <div class="row-between" style="margin-bottom: 14px">
        <div>
          <span class="eyebrow">Strategik reja</span>
          <h2 class="h-sec" style="margin-top: 3px">Rivojlanish bosqichlari</h2>
          <p class="dim" style="font-size: 12px; margin-top: 2px">
            Joriy bosqich — <b style="color: var(--teal)">{{ currentStage }}-bosqich: {{ stageLabels[currentStage] }}</b>
          </p>
        </div>
        <RouterLink to="/sozlamalar" class="btn btn-ghost btn-sm">
          Sozlamalarga o'tish <UiIcon name="i-arrow" :size="13" />
        </RouterLink>
      </div>

      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Bosqich</th>
              <th>Foydalanuvchilar</th>
              <th>E'lonlar</th>
              <th>Bitimlar</th>
              <th>Daromad (maqsad)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in kpiTargets" :key="t.stage">
              <td>
                <b>{{ t.label }}</b>
                <span v-if="t.stage === currentStage" class="pill pill-ok" style="margin-left: 7px">
                  Joriy
                </span>
              </td>
              <td class="mono">{{ nf(t.users) }}</td>
              <td class="mono">{{ nf(t.posts) }}</td>
              <td class="mono">{{ nf(t.deals) }}</td>
              <td class="mono">{{ t.revenue }} so'm</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sep" style="margin: 18px 0 16px" />

      <div style="display: grid; gap: 16px">
        <div v-for="g in goals" :key="g.key" class="goal">
          <div class="goal-top">
            <span>{{ g.label }}</span>
            <b>{{ pct(g.now, g.target) }}%</b>
          </div>
          <div class="bar"><i :style="{ width: pct(g.now, g.target) + '%' }" /></div>
          <div class="goal-note mono">{{ nf(g.now) }} / {{ nf(g.target) }}</div>
        </div>
      </div>

      <p class="dim" style="font-size: 11.5px; margin-top: 16px">
        Ko'rsatkichlar {{ currentTarget.label }} maqsadiga nisbatan hisoblangan.
      </p>
    </section>
  </div>
</template>
