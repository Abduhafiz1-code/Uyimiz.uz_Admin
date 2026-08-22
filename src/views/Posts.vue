<script setup>
import { computed, ref } from 'vue'

import EmptyState from '../components/EmptyState.vue'
import ModalDialog from '../components/ModalDialog.vue'
import PageHead from '../components/PageHead.vue'
import UiIcon from '../components/UiIcon.vue'
import { statusPill } from '../lib/format'
import { approvePost, removePost, state } from '../store'

const filters = ['Hammasi', 'Kutilmoqda', 'Faol', 'Sotish', 'Ijara']
const activeFilter = ref('Hammasi')
const search = ref('')

const filtered = computed(() => {
  let list = state.posts
  const f = activeFilter.value
  if (f === 'Sotish' || f === 'Ijara') {
    list = list.filter((p) => (p.dealType || 'Sotish') === f)
  } else if (f !== 'Hammasi') {
    list = list.filter((p) => p.status === f)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (p) =>
        String(p.title || '').toLowerCase().includes(q) ||
        String(p.owner || '').toLowerCase().includes(q) ||
        String(p.id).includes(q),
    )
  }
  return list
})

const viewing = ref(null)
const confirming = ref(null)

function confirmRemove() {
  const post = confirming.value
  confirming.value = null
  if (post) removePost(post)
}
</script>

<template>
  <div>
    <PageHead
      eyebrow="E'lonlar"
      title="Barcha e'lonlar"
      note="Sotish va ijara e'lonlari. Kutilmoqda holatidagilar saytda ko'rinmaydi — tasdiqlangandan keyin chiqadi."
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
        <input v-model="search" type="search" placeholder="Manzil, egasi yoki ID" />
      </label>
      <span class="pill mono">{{ filtered.length }} ta</span>
    </div>

    <EmptyState
      v-if="!filtered.length"
      title="E'lon topilmadi"
      note="Filtrni o'zgartiring yoki qidiruvni tozalang."
    />

    <section v-else class="card card-pad">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Manzil</th>
              <th>Turi</th>
              <th>Egasi</th>
              <th>Narx</th>
              <th>Holat</th>
              <th>Sana</th>
              <th style="text-align: right">Amallar</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list">
            <tr v-for="p in filtered" :key="p.id" class="row-link" @click="viewing = p">
              <td class="mono">{{ p.id }}</td>
              <td><b>{{ p.title }}</b></td>
              <td>
                <span class="pill" :class="p.dealType === 'Ijara' ? 'pill-ok' : 'pill-vip'">
                  {{ p.dealType || 'Sotish' }}
                </span>
              </td>
              <td>{{ p.owner }}</td>
              <td class="mono">{{ p.price }}</td>
              <td><span :class="statusPill(p.status)">{{ p.status }}</span></td>
              <td class="mono">{{ p.date }}</td>
              <td @click.stop>
                <div class="acts">
                  <button
                    v-if="p.status !== 'Faol'"
                    class="btn btn-pri btn-sm"
                    @click="approvePost(p)"
                  >
                    <UiIcon name="i-check" :size="13" /> Tasdiqlash
                  </button>
                  <button class="btn btn-danger btn-sm" @click="confirming = p">
                    <UiIcon name="i-trash" :size="13" /> O'chirish
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </section>

    <!-- ── e'lon tafsiloti ── -->
    <ModalDialog
      :open="!!viewing"
      :title="viewing?.title || ''"
      :subtitle="viewing ? `ID ${viewing.id}` : ''"
      @close="viewing = null"
    >
      <dl v-if="viewing" class="kv">
        <div class="kv-row"><dt>Turi</dt><dd>{{ viewing.dealType || 'Sotish' }}</dd></div>
        <div class="kv-row"><dt>Egasi</dt><dd>{{ viewing.owner }}</dd></div>
        <div class="kv-row"><dt>Narx</dt><dd class="mono">{{ viewing.price }}</dd></div>
        <div class="kv-row">
          <dt>Holati</dt>
          <dd><span :class="statusPill(viewing.status)">{{ viewing.status }}</span></dd>
        </div>
        <div class="kv-row"><dt>Sana</dt><dd class="mono">{{ viewing.date }}</dd></div>
      </dl>

      <template #footer>
        <button class="btn btn-ghost btn-sm" @click="viewing = null">Yopish</button>
        <button
          v-if="viewing && viewing.status !== 'Faol'"
          class="btn btn-pri btn-sm"
          @click="
            () => {
              approvePost(viewing)
              viewing = null
            }
          "
        >
          Tasdiqlash
        </button>
      </template>
    </ModalDialog>

    <!-- ── o'chirishni tasdiqlash ──
         Ilgari e'lon bir bosishda, ogohlantirishsiz o'chib ketardi. -->
    <ModalDialog
      :open="!!confirming"
      title="E'lonni o'chirish"
      subtitle="Bu amalni qaytarib bo'lmaydi"
      @close="confirming = null"
    >
      <p style="font-size: 13px; line-height: 1.6">
        <b>{{ confirming?.title }}</b> e'loni butunlay o'chiriladi. E'lon egasining
        boshqa e'lonlari va hisobiga ta'sir qilmaydi.
      </p>

      <template #footer>
        <button class="btn btn-ghost btn-sm" @click="confirming = null">Bekor qilish</button>
        <button class="btn btn-danger btn-sm" @click="confirmRemove">
          <UiIcon name="i-trash" :size="13" /> O'chirish
        </button>
      </template>
    </ModalDialog>
  </div>
</template>
