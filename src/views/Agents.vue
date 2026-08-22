<script setup>
import { computed, reactive, ref } from 'vue'

import EmptyState from '../components/EmptyState.vue'
import KpiCard from '../components/KpiCard.vue'
import ModalDialog from '../components/ModalDialog.vue'
import PageHead from '../components/PageHead.vue'
import UiIcon from '../components/UiIcon.vue'
import { initials, statusPill } from '../lib/format'
import { approveAgent, rejectAgent, revokeAgent, state, updateAgent } from '../store'

const filters = ['Hammasi', 'Kutilmoqda', 'Tasdiqlangan', 'Rad etilgan']
const activeFilter = ref('Hammasi')
const search = ref('')

const filtered = computed(() => {
  let list = state.agents
  if (activeFilter.value !== 'Hammasi') {
    list = list.filter((a) => a.cert === activeFilter.value)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (a) =>
        String(a.name || '').toLowerCase().includes(q) ||
        String(a.phone || '').toLowerCase().includes(q),
    )
  }
  return list
})

const pendingCount = computed(() => state.agents.filter((a) => a.cert === 'Kutilmoqda').length)
const approvedCount = computed(() => state.agents.filter((a) => a.cert === 'Tasdiqlangan').length)
const totalDeals = computed(() => state.agents.reduce((sum, a) => sum + (a.deals || 0), 0))

/**
 * "Top Makler" — sertifikatlangan va eng ko'p bitim yopgan ikki agent.
 * Uyimiz Agent modelidagi asosiy rag'bat.
 */
const topIds = computed(() =>
  state.agents
    .filter((a) => a.cert === 'Tasdiqlangan' && a.deals > 0)
    .slice()
    .sort((a, b) => b.deals - a.deals)
    .slice(0, 2)
    .map((a) => a.id),
)
const isTop = (a) => topIds.value.includes(a.id)

/* ---- Tahrirlash ---- */
const editing = ref(null)
const form = reactive({ name: '', commission: 0 })

function openEdit(a) {
  editing.value = a
  form.name = a.name
  form.commission = a.commission
}
function closeEdit() {
  editing.value = null
}
async function saveEdit() {
  const ok = await updateAgent(editing.value, {
    name: form.name,
    commission: Number(form.commission),
  })
  if (ok) closeEdit()
}
</script>

<template>
  <div>
    <PageHead
      eyebrow="Uyimiz Agent"
      title="Agentlar va komissiya boshqaruvi"
      note="Maklerlar mustaqil emas, platforma agenti sifatida ishlaydi — 10–50% o'rniga 1–2% fiks komissiya. Tasdiqlangan agentlargina saytdagi ochiq katalogda ko'rinadi."
    />

    <div class="grid-kpi stagger" style="margin-bottom: 20px">
      <KpiCard label="Jami agentlar" :value="state.agents.length" icon="i-users" />
      <KpiCard
        label="Tasdiqlangan (katalogda ko'rinadi)"
        :value="approvedCount"
        icon="i-shield-check"
        tone="teal"
      />
      <KpiCard label="Ariza kutmoqda" :value="pendingCount" icon="i-clock" tone="brass" />
      <KpiCard label="Jami bitimlar" :value="totalDeals" icon="i-trend" />
    </div>

    <div class="seg">
      <button
        v-for="f in filters"
        :key="f"
        :class="{ on: activeFilter === f }"
        @click="activeFilter = f"
      >
        {{ f }}
      </button>
    </div>

    <div class="toolbar">
      <label class="inp">
        <UiIcon name="i-search" :size="15" />
        <input v-model="search" type="search" placeholder="Agent ismi yoki telefoni" />
      </label>
      <span class="pill mono">{{ filtered.length }} ta</span>
    </div>

    <EmptyState
      v-if="!filtered.length"
      title="Agent topilmadi"
      note="Ariza topshirgan agentlar shu yerda paydo bo'ladi. Tasdiqlangunicha ular saytdagi katalogda ko'rinmaydi."
    />

    <section v-else class="card card-pad">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Reyting</th>
              <th>Bitimlar</th>
              <th>Komissiya</th>
              <th>Sertifikat</th>
              <th style="text-align: right">Amallar</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list">
            <tr v-for="a in filtered" :key="a.id" class="row-link" @click="openEdit(a)">
              <td>
                <div class="cell-main">
                  <span class="ava ava-sm" :class="{ 'ava-brass': isTop(a) }">
                    {{ initials(a.name) }}
                  </span>
                  <span class="cell-txt">
                    <b>
                      {{ a.name }}
                      <span v-if="isTop(a)" class="pill pill-vip" style="margin-left: 5px">
                        Top Makler
                      </span>
                    </b>
                    <small>{{ a.phone }}{{ a.district ? ' · ' + a.district : '' }}</small>
                  </span>
                </div>
              </td>
              <td class="rating-cell">{{ Number(a.rating || 0).toFixed(1) }} ★</td>
              <td class="mono">{{ a.deals }}</td>
              <td><span class="pill pill-ok">{{ a.commission }}%</span></td>
              <td><span :class="statusPill(a.cert)">{{ a.cert }}</span></td>
              <td @click.stop>
                <div class="acts">
                  <template v-if="a.cert === 'Kutilmoqda'">
                    <button class="btn btn-pri btn-sm" @click="approveAgent(a)">
                      <UiIcon name="i-check" :size="13" /> Tasdiqlash
                    </button>
                    <button class="btn btn-ghost btn-sm" @click="rejectAgent(a)">Rad etish</button>
                  </template>
                  <template v-else>
                    <button class="btn btn-ghost btn-sm" @click="openEdit(a)">
                      <UiIcon name="i-pencil" :size="13" /> Tahrirlash
                    </button>
                    <button
                      v-if="a.cert === 'Tasdiqlangan'"
                      class="btn btn-danger btn-sm"
                      @click="revokeAgent(a)"
                    >
                      Bekor qilish
                    </button>
                    <button v-else class="btn btn-sec btn-sm" @click="approveAgent(a)">
                      Tasdiqlash
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </section>

    <ModalDialog
      :open="!!editing"
      title="Agentni tahrirlash"
      :subtitle="editing ? `${editing.phone} · ${editing.cert}` : ''"
      @close="closeEdit"
    >
      <div class="form-grid">
        <div class="form-field">
          <label>Ism</label>
          <div class="inp"><input v-model="form.name" type="text" /></div>
        </div>
        <div class="form-field">
          <label>Komissiya (%)</label>
          <div class="inp">
            <input v-model="form.commission" type="number" min="0" max="100" step="0.1" />
            <span class="dim" style="font-size: 11.5px">1–2% tavsiya etiladi</span>
          </div>
        </div>
      </div>

      <p class="dim" style="font-size: 11.5px; margin-top: 14px; line-height: 1.6">
        Reyting va bitimlar soni avtomatik hisoblanadi — ular bitimlar yopilgani sari
        o'zgaradi va qo'lda tahrirlanmaydi.
      </p>

      <template #footer>
        <button class="btn btn-ghost btn-sm" @click="closeEdit">Bekor qilish</button>
        <button class="btn btn-pri btn-sm" @click="saveEdit">Saqlash</button>
      </template>
    </ModalDialog>
  </div>
</template>
