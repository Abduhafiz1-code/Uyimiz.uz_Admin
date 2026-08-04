<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import { state } from '../store'
import { useCountUp } from '../composables/useCountUp'

const router = useRouter()
function openAddAdmin() {
  router.push({ path: '/rollar', query: { add: '1' } })
}

/* ---- Animatsiyali raqamlar ---- */
const nUsers = useCountUp(() => state.dashboard.usersTotal)
const nAgents = useCountUp(() => state.dashboard.activeAgents)
const nPostsToday = useCountUp(() => state.dashboard.postsToday)
const nModeration = useCountUp(() => state.dashboard.moderationCount)
const nPostsTotal = useCountUp(() => state.dashboard.postsTotal)
const nDealsTotal = useCountUp(() => state.dashboard.dealsTotal)
const nRevenue = useCountUp(() => 84.2, { decimals: 1 })

const stats = computed(() => [
  { lbl: 'Jami foydalanuvchilar', val: nUsers.value, to: '/foydalanuvchilar' },
  { lbl: 'Faol agentlar', val: nAgents.value, to: '/agentlar' },
  { lbl: "Bugungi e'lonlar", val: nPostsToday.value, to: '/elonlar' },
  { lbl: 'Moderatsiyada', val: nModeration.value, gold: true, to: '/moderatsiya' },
])

function goTo(path) {
  router.push(path)
}

// Strategik reja bo'yicha KPI maqsadlari (3 / 6 / 12 oy)
const kpiTargets = [
  { stage: 1, label: '1-bosqich · 3 oy', users: 10000, posts: 2000, deals: 200, revenue: '0 (bepul)' },
  { stage: 2, label: '2-bosqich · 6 oy', users: 50000, posts: 10000, deals: 1000, revenue: '80 mln' },
  { stage: 3, label: '3-bosqich · 12 oy', users: 200000, posts: 50000, deals: 5000, revenue: '500 mln+' },
]
const stageLabels = { 1: 'Maklersiz pilot', 2: 'Tizimlashtirish va monetizatsiya', 3: 'Uyimiz Agent integratsiyasi' }
const currentStage = computed(() => state.dashboard.stage || 1)
const currentTarget = computed(() => kpiTargets.find(t => t.stage === currentStage.value) || kpiTargets[0])

function pctRaw(current, target) {
  if (!target) return 0
  return Math.min(100, Math.round((current / target) * 100))
}
const pctUsers = useCountUp(() => pctRaw(state.dashboard.usersTotal, currentTarget.value.users))
const pctPosts = useCountUp(() => pctRaw(state.dashboard.postsTotal, currentTarget.value.posts))
const pctDeals = useCountUp(() => pctRaw(state.dashboard.dealsTotal, currentTarget.value.deals))
</script>

<template>
  <div>
    <div class="topbar">
      <div>
        <h1>Xayrli kun, Superadmin</h1>
        <p>Barcha foydalanuvchi, agent, e'lon va tizim sozlamalari — bir joyda</p>
      </div>
      <div class="top-actions">
        <button class="btn btn-live">✓ Jonli</button>
        <button class="btn btn-primary" @click="openAddAdmin">
          <Icon name="plus" :size="15" /> Admin qo'shish
        </button>
      </div>
    </div>

    <div class="stat-grid">
      <div
        class="card neon clickable"
        :class="{ gold: s.gold }"
        v-for="s in stats" :key="s.lbl"
        role="button" tabindex="0"
        @click="goTo(s.to)" @keyup.enter="goTo(s.to)"
      >
        <Icon name="arrow-right" :size="14" class="goto-hint" />
        <div class="lbl">{{ s.lbl }}</div>
        <div class="val">
          <span class="num">{{ s.val.toLocaleString('ru-RU') }}</span>
        </div>
      </div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(190px,260px));">
      <div class="card neon neon-pink clickable" role="button" tabindex="0" @click="goTo('/tariflar')" @keyup.enter="goTo('/tariflar')">
        <Icon name="arrow-right" :size="14" class="goto-hint" />
        <div class="lbl">Oylik daromad</div>
        <div class="val"><span class="num">{{ nRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 1 }) }}</span> <span class="unit">mln</span></div>
      </div>
      <div class="card neon neon-purple clickable" role="button" tabindex="0" @click="goTo('/elonlar')" @keyup.enter="goTo('/elonlar')">
        <Icon name="arrow-right" :size="14" class="goto-hint" />
        <div class="lbl">Jami e'lonlar</div>
        <div class="val"><span class="num">{{ nPostsTotal.toLocaleString('ru-RU') }}</span></div>
      </div>
      <div class="card neon neon-purple clickable" role="button" tabindex="0" @click="goTo('/agentlar')" @keyup.enter="goTo('/agentlar')">
        <Icon name="arrow-right" :size="14" class="goto-hint" />
        <div class="lbl">Jami bitimlar (agentlar orqali)</div>
        <div class="val"><span class="num">{{ nDealsTotal.toLocaleString('ru-RU') }}</span></div>
      </div>
    </div>

    <div class="panel neon-panel" style="margin-top:20px;">
      <div class="topbar" style="margin-bottom:14px;">
        <div>
          <h1 style="font-size:16px;">Strategik reja: rivojlanish bosqichlari</h1>
          <p>Joriy bosqich — <b class="glow-text">{{ currentStage }}-bosqich: {{ stageLabels[currentStage] }}</b></p>
        </div>
        <div class="top-actions">
          <button class="btn btn-sm" @click="goTo('/sozlamalar')">
            Sozlamalarga o'tish <Icon name="arrow-right" :size="13" />
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr><th>BOSQICH</th><th>FOYDALANUVCHILAR</th><th>E'LONLAR</th><th>BITIMLAR</th><th>DAROMAD (maqsad)</th></tr>
        </thead>
        <tbody>
          <tr
            v-for="t in kpiTargets" :key="t.stage"
            :class="{ 'name-main': t.stage === currentStage }"
            style="cursor:pointer;"
            @click="goTo('/sozlamalar')"
          >
            <td>
              {{ t.label }}
              <span v-if="t.stage === currentStage" class="badge faol neon-badge">Joriy</span>
            </td>
            <td>{{ t.users.toLocaleString('ru-RU') }}</td>
            <td>{{ t.posts.toLocaleString('ru-RU') }}</td>
            <td>{{ t.deals.toLocaleString('ru-RU') }}</td>
            <td>{{ t.revenue }} so'm</td>
          </tr>
        </tbody>
      </table>

      <div class="progress-group">
        <div class="progress-row">
          <div class="progress-lbl"><span>Foydalanuvchilar</span><span class="glow-text">{{ pctUsers }}%</span></div>
          <div class="progress"><div class="progress-fill cyan" :style="{ width: pctUsers + '%' }"></div></div>
        </div>
        <div class="progress-row">
          <div class="progress-lbl"><span>E'lonlar</span><span class="glow-text">{{ pctPosts }}%</span></div>
          <div class="progress"><div class="progress-fill pink" :style="{ width: pctPosts + '%' }"></div></div>
        </div>
        <div class="progress-row">
          <div class="progress-lbl"><span>Bitimlar</span><span class="glow-text">{{ pctDeals }}%</span></div>
          <div class="progress"><div class="progress-fill purple" :style="{ width: pctDeals + '%' }"></div></div>
        </div>
      </div>
      <div class="footnote">Ko'rsatkichlar {{ currentTarget.label }} maqsadiga nisbatan hisoblangan.</div>
    </div>
  </div>
</template>
