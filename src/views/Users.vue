<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

import EmptyState from '../components/EmptyState.vue'
import ModalDialog from '../components/ModalDialog.vue'
import PageHead from '../components/PageHead.vue'
import UiIcon from '../components/UiIcon.vue'
import { initials, statusPill } from '../lib/format'
import { state, toggleUserBlock, updateUser } from '../store'

const route = useRoute()

const filters = ['Hammasi', 'Uy egalari', 'Xaridorlar', 'Ijarachilar', 'Agentlar', 'Bloklangan']
const activeFilter = ref('Hammasi')
const search = ref('')

const typeMap = {
  'Uy egalari': 'uy_egalari',
  Xaridorlar: 'xaridorlar',
  Ijarachilar: 'ijarachilar',
  Agentlar: 'agentlar',
}

// Tepadagi umumiy qidiruv `?q=` bilan yuboradi.
onMounted(() => {
  if (typeof route.query.q === 'string') search.value = route.query.q
})

const filtered = computed(() => {
  let list = state.users
  if (activeFilter.value === 'Bloklangan') {
    list = list.filter((u) => u.status === 'Bloklangan')
  } else if (activeFilter.value !== 'Hammasi') {
    list = list.filter((u) => u.typeKey === typeMap[activeFilter.value])
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (u) =>
        String(u.name || '').toLowerCase().includes(q) ||
        String(u.phone || '').toLowerCase().includes(q) ||
        String(u.id).includes(q),
    )
  }
  return list
})

/* ---- Tahrirlash ---- */
const editing = ref(null)
const form = reactive({ name: '', phone: '', type: '', status: '' })

function openEdit(u) {
  editing.value = u
  form.name = u.name
  form.phone = u.phone
  form.type = u.type
  form.status = u.status
}
function closeEdit() {
  editing.value = null
}
async function saveEdit() {
  const ok = await updateUser(editing.value, { ...form })
  if (ok) closeEdit()
}

/* ---- Ko'rish ---- */
const viewing = ref(null)
</script>

<template>
  <div>
    <PageHead
      eyebrow="Foydalanuvchilar"
      title="Foydalanuvchilar boshqaruvi"
      note="Har bir profilni ochib ma'lumotlarini tahrirlash, hisobni bloklash yoki qayta faollashtirish mumkin."
    />

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
        <input v-model="search" type="search" placeholder="Ism, telefon yoki ID bo'yicha qidirish" />
      </label>
      <span class="pill mono">{{ filtered.length }} ta</span>
    </div>

    <EmptyState
      v-if="!filtered.length"
      title="Foydalanuvchi topilmadi"
      note="Filtrni o'zgartiring yoki qidiruv so'zini qisqartiring."
    />

    <section v-else class="card card-pad">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Foydalanuvchi</th>
              <th>Turi</th>
              <th>Holat</th>
              <th>Ro'yxatdan o'tgan</th>
              <th style="text-align: right">Amallar</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list">
            <tr v-for="u in filtered" :key="u.id" class="row-link" @click="viewing = u">
              <td>
                <div class="cell-main">
                  <span class="ava ava-sm">{{ initials(u.name) }}</span>
                  <span class="cell-txt">
                    <b>{{ u.name }}</b>
                    <small>{{ u.phone }} · ID {{ u.id }}</small>
                  </span>
                </div>
              </td>
              <td>{{ u.type }}</td>
              <td><span :class="statusPill(u.status)">{{ u.status }}</span></td>
              <td class="mono">{{ u.since }}</td>
              <td @click.stop>
                <div class="acts">
                  <button class="btn btn-ghost btn-sm" @click="openEdit(u)">
                    <UiIcon name="i-pencil" :size="13" /> Tahrirlash
                  </button>
                  <button
                    v-if="u.status === 'Faol'"
                    class="btn btn-danger btn-sm"
                    @click="toggleUserBlock(u)"
                  >
                    <UiIcon name="i-ban" :size="13" /> Bloklash
                  </button>
                  <button v-else class="btn btn-sec btn-sm" @click="toggleUserBlock(u)">
                    <UiIcon name="i-check" :size="13" /> Faollashtirish
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </section>

    <!-- ── tahrirlash ── -->
    <ModalDialog
      :open="!!editing"
      title="Foydalanuvchini tahrirlash"
      :subtitle="editing ? `ID ${editing.id}` : ''"
      @close="closeEdit"
    >
      <div class="form-grid">
        <div class="form-field">
          <label>Ism</label>
          <div class="inp"><input v-model="form.name" type="text" /></div>
        </div>
        <div class="form-field">
          <label>Telefon</label>
          <div class="inp"><input v-model="form.phone" type="text" /></div>
        </div>
        <div class="form-field">
          <label>Turi</label>
          <div class="inp">
            <select v-model="form.type">
              <option>Uy egasi</option>
              <option>Xaridor</option>
              <option>Ijarachi</option>
              <option>Agent</option>
            </select>
          </div>
        </div>
        <div class="form-field">
          <label>Holati</label>
          <div class="inp">
            <select v-model="form.status">
              <option>Faol</option>
              <option>Bloklangan</option>
            </select>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-ghost btn-sm" @click="closeEdit">Bekor qilish</button>
        <button class="btn btn-pri btn-sm" @click="saveEdit">Saqlash</button>
      </template>
    </ModalDialog>

    <!-- ── ko'rish ── -->
    <ModalDialog
      :open="!!viewing"
      :title="viewing?.name || ''"
      :subtitle="viewing?.phone || ''"
      @close="viewing = null"
    >
      <dl v-if="viewing" class="kv">
        <div class="kv-row"><dt>ID</dt><dd class="mono">{{ viewing.id }}</dd></div>
        <div class="kv-row"><dt>Telefon</dt><dd class="mono">{{ viewing.phone }}</dd></div>
        <div class="kv-row"><dt>Turi</dt><dd>{{ viewing.type }}</dd></div>
        <div class="kv-row">
          <dt>Holati</dt>
          <dd><span :class="statusPill(viewing.status)">{{ viewing.status }}</span></dd>
        </div>
        <div class="kv-row"><dt>Ro'yxatdan o'tgan</dt><dd class="mono">{{ viewing.since }}</dd></div>
      </dl>

      <template #footer>
        <button class="btn btn-ghost btn-sm" @click="viewing = null">Yopish</button>
        <button
          class="btn btn-pri btn-sm"
          @click="
            () => {
              const u = viewing
              viewing = null
              openEdit(u)
            }
          "
        >
          Tahrirlash
        </button>
      </template>
    </ModalDialog>
  </div>
</template>
