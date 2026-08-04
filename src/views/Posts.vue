<script setup>
import { ref, computed } from 'vue'
import Modal from '../components/Modal.vue'
import { state, removePost, approvePost } from '../store'

const statusClass = { Faol: 'faol', Kutilmoqda: 'kutilmoqda', 'Rad etilgan': 'bloklangan' }

function remove(p) { removePost(p) }
function approve(p) { approvePost(p) }

const filters = ['Hammasi', 'Sotish', 'Ijara']
const activeFilter = ref('Hammasi')
const filtered = computed(() => {
  if (activeFilter.value === 'Hammasi') return state.posts
  return state.posts.filter(p => (p.dealType || 'Sotish') === activeFilter.value)
})

const viewing = ref(null)
function openView(p) { viewing.value = p }
</script>

<template>
  <div>
    <div class="topbar">
      <div><h1>E'lonlar</h1><p>Barcha joylangan e'lonlar ro'yxati — sotish va ijara</p></div>
    </div>

    <div class="pillbar">
      <div v-for="f in filters" :key="f" class="pill" :class="{ active: activeFilter === f }" @click="activeFilter = f">
        {{ f }}
      </div>
    </div>

    <div class="panel">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>SARLAVHA</th><th>TURI</th><th>EGASI</th><th>NARX</th><th>HOLAT</th><th>SANA</th><th>AMALLAR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered" :key="p.id" style="cursor:pointer;" @click="openView(p)">
            <td>{{ p.id }}</td>
            <td class="name-main">{{ p.title }}</td>
            <td><span class="badge" :style="p.dealType === 'Ijara' ? 'background:var(--teal-lighter);color:var(--teal);' : 'background:var(--amber-light);color:var(--amber);'">{{ p.dealType || 'Sotish' }}</span></td>
            <td>{{ p.owner }}</td>
            <td>{{ p.price }}</td>
            <td><span class="badge" :class="statusClass[p.status]">{{ p.status }}</span></td>
            <td>{{ p.date }}</td>
            <td @click.stop>
              <div class="actions-cell">
                <button v-if="p.status !== 'Faol'" class="btn btn-sm btn-dark" @click="approve(p)">Tasdiqlash</button>
                <button class="btn btn-sm btn-outline-red" @click="remove(p)">O'chirish</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-if="viewing" :title="viewing.title" @close="viewing = null">
      <div class="form-row"><label>ID</label><div>{{ viewing.id }}</div></div>
      <div class="form-row"><label>Turi</label><div>{{ viewing.dealType || 'Sotish' }}</div></div>
      <div class="form-row"><label>Egasi</label><div>{{ viewing.owner }}</div></div>
      <div class="form-row"><label>Narx</label><div>{{ viewing.price }}</div></div>
      <div class="form-row"><label>Holati</label><div>{{ viewing.status }}</div></div>
      <div class="form-row"><label>Sana</label><div>{{ viewing.date }}</div></div>
      <div class="form-actions">
        <button v-if="viewing.status !== 'Faol'" class="btn btn-sm btn-dark" type="button" @click="approve(viewing); viewing = null">Tasdiqlash</button>
        <button class="btn btn-sm btn-primary" type="button" @click="viewing = null">Yopish</button>
      </div>
    </Modal>
  </div>
</template>
