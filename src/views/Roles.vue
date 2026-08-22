<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ModalDialog from '../components/ModalDialog.vue'
import PageHead from '../components/PageHead.vue'
import UiIcon from '../components/UiIcon.vue'
import { initials, statusPill } from '../lib/format'
import { addAdmin, removeAdmin, state, updateAdmin } from '../store'

const route = useRoute()
const router = useRouter()

const matrix = [
  { perm: "E'lon joylash / tahrirlash (o'ziniki)", vals: [1, 1, 1, 1] },
  { perm: "Boshqa foydalanuvchi e'lonini tahrirlash / o'chirish", vals: [0, 0, 1, 1] },
  { perm: "Foydalanuvchini bloklash / o'chirish", vals: [0, 0, 1, 1] },
  { perm: 'Agentni sertifikatlash / bekor qilish', vals: [0, 0, 0, 1] },
  { perm: 'Komissiya va tarif narxlarini belgilash', vals: [0, 0, 0, 1] },
  { perm: "Boshqa adminlarni qo'shish / tizim sozlamalarini o'zgartirish", vals: [0, 0, 0, 1] },
]

/* ---- Admin qo'shish / tahrirlash ---- */
const showAdd = ref(false)
const editing = ref(null)
const showPassword = ref(false)
const form = reactive({ name: '', phone: '', role: 'Admin', status: 'Faol', password: '' })
const formError = ref('')

const modalOpen = computed(() => showAdd.value || !!editing.value)
const modalTitle = computed(() => (editing.value ? 'Adminni tahrirlash' : "Yangi admin qo'shish"))

function openAdd() {
  form.name = ''
  form.phone = ''
  form.role = 'Admin'
  form.status = 'Faol'
  form.password = ''
  formError.value = ''
  showAdd.value = true
}
function openEdit(a) {
  editing.value = a
  form.name = a.name
  form.phone = a.phone
  form.role = a.role
  form.status = a.status
  form.password = ''
  formError.value = ''
}
function closeModal() {
  showAdd.value = false
  editing.value = null
  showPassword.value = false
}

async function save() {
  formError.value = ''
  if (!form.name.trim()) {
    formError.value = 'Ismni kiriting'
    return
  }
  if (!form.phone.trim()) {
    formError.value = 'Telefon raqamini kiriting (login shu orqali amalga oshadi)'
    return
  }
  const needsPassword = !editing.value
  if ((needsPassword || form.password) && form.password.length < 6) {
    formError.value = "Parol kamida 6 belgidan iborat bo'lishi kerak"
    return
  }

  const payload = { name: form.name, phone: form.phone, role: form.role, status: form.status }
  if (form.password) payload.password = form.password

  const ok = editing.value
    ? await updateAdmin(editing.value, payload)
    : await addAdmin(payload)
  if (ok) closeModal()
}

/* ---- O'chirish (tasdiq bilan) ---- */
const confirming = ref(null)
function confirmRemove() {
  const admin = confirming.value
  confirming.value = null
  if (admin && admin.role !== 'Superadmin') removeAdmin(admin)
}

onMounted(() => {
  if (route.query.add === '1') {
    openAdd()
    router.replace({ path: '/rollar' })
  }
})
</script>

<template>
  <div>
    <PageHead
      eyebrow="Kirish nazorati"
      title="Rollar va ruxsatlar"
      note="Admin hisoblari va har bir rolning huquqlari. Login telefon raqami orqali amalga oshadi."
    >
      <button class="btn btn-pri" @click="openAdd">
        <UiIcon name="i-plus" :size="15" /> Admin qo'shish
      </button>
    </PageHead>

    <!-- ── admin hisoblari ── -->
    <section class="card card-pad">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Ism</th>
              <th>Telefon (login)</th>
              <th>Rol</th>
              <th>Holat</th>
              <th>Qo'shilgan</th>
              <th style="text-align: right">Amallar</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list">
            <tr v-for="a in state.admins" :key="a.id" class="row-link" @click="openEdit(a)">
              <td>
                <div class="cell-main">
                  <span class="ava ava-sm" :class="{ 'ava-brass': a.role === 'Superadmin' }">
                    {{ initials(a.name) }}
                  </span>
                  <span class="cell-txt"><b>{{ a.name }}</b></span>
                </div>
              </td>
              <td class="mono">{{ a.phone }}</td>
              <td>
                <span class="pill" :class="{ 'pill-vip': a.role === 'Superadmin' }">
                  {{ a.role }}
                </span>
              </td>
              <td><span :class="statusPill(a.status)">{{ a.status }}</span></td>
              <td class="mono">{{ a.since }}</td>
              <td @click.stop>
                <div class="acts">
                  <button class="btn btn-ghost btn-sm" @click="openEdit(a)">
                    <UiIcon name="i-pencil" :size="13" /> Tahrirlash
                  </button>
                  <button
                    v-if="a.role !== 'Superadmin'"
                    class="btn btn-danger btn-sm"
                    @click="confirming = a"
                  >
                    <UiIcon name="i-trash" :size="13" /> O'chirish
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </section>

    <!-- ── ruxsatlar matritsasi ── -->
    <section class="card card-pad section">
      <h2 class="h-sec" style="margin-bottom: 14px">Ruxsatlar matritsasi</h2>
      <div class="tbl-wrap">
        <table class="tbl matrix">
          <thead>
            <tr>
              <th>Ruxsat</th>
              <th>Foydalanuvchi</th>
              <th>Agent</th>
              <th>Moderator</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in matrix" :key="r.perm">
              <td>{{ r.perm }}</td>
              <td v-for="(v, i) in r.vals" :key="i">
                <span v-if="v" class="yes">✓</span>
                <span v-else class="no">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="dim" style="font-size: 11.5px; margin-top: 14px; line-height: 1.65">
        <b style="color: var(--text-2)">Superadmin</b> — eng yuqori daraja: foydalanuvchi va
        agentlarni ko'rish, tahrirlash, bloklash, o'chirishdan tortib komissiya foizi, tarif
        narxlari va tizim sozlamalarini o'zgartirishgacha hamma narsaga ruxsati bor.
        <b style="color: var(--text-2)">Moderator</b> huquqi cheklangan — faqat e'lon va
        foydalanuvchi darajasida.
      </p>
    </section>

    <!-- ── admin formasi ── -->
    <ModalDialog
      :open="modalOpen"
      :title="modalTitle"
      subtitle="Login telefon raqami orqali amalga oshadi"
      @close="closeModal"
    >
      <div class="form-grid">
        <div class="form-field">
          <label>Ism</label>
          <div class="inp"><input v-model="form.name" type="text" placeholder="F.I.Sh" /></div>
        </div>

        <div class="form-field">
          <label>Telefon (login)</label>
          <div class="inp">
            <input v-model="form.phone" type="tel" placeholder="+998 90 123 45 67" />
          </div>
        </div>

        <div class="form-field">
          <label>{{ editing ? "Yangi parol (o'zgartirmasangiz bo'sh qoldiring)" : 'Parol' }}</label>
          <div class="pw">
            <div class="inp">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="kamida 6 belgi"
                autocomplete="new-password"
              />
            </div>
            <button
              class="pw-eye"
              type="button"
              tabindex="-1"
              :aria-label="showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'"
              @click="showPassword = !showPassword"
            >
              <UiIcon :name="showPassword ? 'i-eye-off' : 'i-eye'" :size="16" />
            </button>
          </div>
        </div>

        <div class="form-field">
          <label>Rol</label>
          <div class="inp">
            <select v-model="form.role">
              <option>Moderator</option>
              <option>Admin</option>
              <option>Superadmin</option>
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

        <div v-if="formError" class="form-error">{{ formError }}</div>
      </div>

      <template #footer>
        <button class="btn btn-ghost btn-sm" @click="closeModal">Bekor qilish</button>
        <button class="btn btn-pri btn-sm" @click="save">Saqlash</button>
      </template>
    </ModalDialog>

    <!-- ── o'chirishni tasdiqlash ── -->
    <ModalDialog
      :open="!!confirming"
      title="Admin hisobini o'chirish"
      subtitle="Bu amalni qaytarib bo'lmaydi"
      @close="confirming = null"
    >
      <p style="font-size: 13px; line-height: 1.6">
        <b>{{ confirming?.name }}</b> ({{ confirming?.phone }}) admin panelga kira olmaydigan
        bo'ladi. Uning bajargan amallari audit jurnalida saqlanib qoladi.
      </p>

      <template #footer>
        <button class="btn btn-ghost btn-sm" @click="confirming = null">Bekor qilish</button>
        <button class="btn btn-danger btn-sm" @click="confirmRemove">O'chirish</button>
      </template>
    </ModalDialog>
  </div>
</template>
