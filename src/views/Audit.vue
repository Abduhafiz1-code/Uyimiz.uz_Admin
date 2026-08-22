<script setup>
import { computed, ref } from 'vue'

import EmptyState from '../components/EmptyState.vue'
import PageHead from '../components/PageHead.vue'
import UiIcon from '../components/UiIcon.vue'
import { initials } from '../lib/format'
import { refreshAudit, state } from '../store'

const search = ref('')
const busy = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return state.audit
  return state.audit.filter(
    (a) =>
      String(a.admin || '').toLowerCase().includes(q) ||
      String(a.action || '').toLowerCase().includes(q) ||
      String(a.object || '').toLowerCase().includes(q),
  )
})

async function reload() {
  busy.value = true
  try {
    await refreshAudit()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <PageHead
      eyebrow="Xavfsizlik"
      title="Audit jurnali"
      note="Adminlar bajargan har bir amal shu yerda qayd etiladi — kim, qachon va nima ustida ish qilgani."
    >
      <button class="btn btn-ghost btn-sm" :disabled="busy" @click="reload">
        <span v-if="busy" class="spinner" />
        <UiIcon v-else name="i-refresh" :size="14" />
        Yangilash
      </button>
    </PageHead>

    <div class="toolbar">
      <label class="inp">
        <UiIcon name="i-search" :size="15" />
        <input v-model="search" type="search" placeholder="Admin, amal yoki obyekt bo'yicha" />
      </label>
      <span class="pill mono">{{ filtered.length }} ta yozuv</span>
    </div>

    <EmptyState
      v-if="!filtered.length"
      title="Yozuv yo'q"
      note="Admin biror amal bajargach, u shu yerda darhol paydo bo'ladi."
    />

    <section v-else class="card card-pad">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Vaqt</th>
              <th>Admin</th>
              <th>Amal</th>
              <th>Obyekt</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in filtered" :key="i">
              <td class="mono">{{ a.time }}</td>
              <td>
                <div class="cell-main">
                  <span class="ava ava-sm">{{ initials(a.admin) }}</span>
                  <span class="cell-txt"><b>{{ a.admin }}</b></span>
                </div>
              </td>
              <td>{{ a.action }}</td>
              <td>{{ a.object }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
