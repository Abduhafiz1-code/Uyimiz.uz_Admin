<script setup>
import { ref, reactive, computed } from 'vue'
import Modal from '../components/Modal.vue'
import { state, approveAgent, rejectAgent, revokeAgent, updateAgent } from '../store'

function approve(a) { approveAgent(a) }
function reject(a) { rejectAgent(a) }
function revoke(a) { revokeAgent(a) }

// "Top Makler" maqomi — eng ko'p bitim qilgan, sertifikatlangan agentlar (Uyimiz Agent modeli)
const topAgentNames = computed(() => {
  return state.agents
    .filter(a => a.cert === 'Tasdiqlangan')
    .slice()
    .sort((a, b) => b.deals - a.deals)
    .slice(0, 2)
    .map(a => a.name)
})
function isTop(a) {
  return a.cert === 'Tasdiqlangan' && a.deals > 0 && topAgentNames.value.includes(a.name)
}

function certClass(cert) {
  if (cert === 'Tasdiqlangan') return 'tasdiqlangan'
  if (cert === 'Kutilmoqda') return 'kutilmoqda'
  return 'bloklangan'
}

/* ---- Tahrirlash modali ---- */
const editing = ref(null)
const form = reactive({ name: '', rating: 0, deals: 0, commission: 0 })

function openEdit(a) {
  editing.value = a
  form.name = a.name
  form.rating = a.rating
  form.deals = a.deals
  form.commission = a.commission
}
function closeEdit() { editing.value = null }
async function saveEdit() {
  const ok = await updateAgent(editing.value, {
    name: form.name,
    rating: Number(form.rating),
    deals: Number(form.deals),
    commission: Number(form.commission),
  })
  if (ok) closeEdit()
}
</script>

<template>
  <div>
    <div class="topbar">
      <div>
        <h1>Uyimiz Agent — komissiya boshqaruvi</h1>
        <p>Maklerlar endi mustaqil emas, balki platforma agenti sifatida ishlaydi — 10-50% o'rniga 1-2% fiks komissiya</p>
      </div>
    </div>

    <div class="panel">
      <table>
        <thead>
          <tr>
            <th>AGENT</th><th>REYTING</th><th>BITIM (OY)</th><th>KOMISSIYA</th><th>SERTIFIKAT</th><th>AMALLAR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in state.agents" :key="a.name" style="cursor:pointer;" @click="openEdit(a)">
            <td class="name-main">
              {{ a.name }}
              <span v-if="isTop(a)" class="badge" style="background:var(--amber-light);color:var(--amber);margin-left:6px;">⭐ Top Makler</span>
            </td>
            <td class="rating">{{ a.rating.toFixed(1) }} <span class="star">★</span></td>
            <td>{{ a.deals }}</td>
            <td><span class="badge" style="background:var(--teal-lighter);color:var(--teal);">{{ a.commission }}%</span></td>
            <td><span class="badge" :class="certClass(a.cert)">{{ a.cert }}</span></td>
            <td @click.stop>
              <div class="actions-cell" v-if="a.cert === 'Kutilmoqda'">
                <button class="btn btn-sm btn-dark" @click="approve(a)">Tasdiqlash</button>
                <button class="btn btn-sm" @click="reject(a)">Rad etish</button>
              </div>
              <div class="actions-cell" v-else>
                <button class="btn btn-sm" @click="openEdit(a)">Tahrirlash</button>
                <button class="btn btn-sm btn-outline-red" @click="revoke(a)">Sertifikatni bekor qilish</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="editing" title="Agentni tahrirlash" @close="closeEdit">
      <div class="form-row">
        <label>Ism</label>
        <input v-model="form.name" type="text" />
      </div>
      <div class="form-row">
        <label>Reyting (0–5)</label>
        <input v-model="form.rating" type="number" min="0" max="5" step="0.1" />
      </div>
      <div class="form-row">
        <label>Bitimlar (oy)</label>
        <input v-model="form.deals" type="number" min="0" />
      </div>
      <div class="form-row">
        <label>Komissiya (%)</label>
        <input v-model="form.commission" type="number" min="0" max="100" step="0.1" />
      </div>
      <div class="form-actions">
        <button class="btn btn-sm" type="button" @click="closeEdit">Bekor qilish</button>
        <button class="btn btn-sm btn-primary" type="button" @click="saveEdit">Saqlash</button>
      </div>
    </Modal>
  </div>
</template>
