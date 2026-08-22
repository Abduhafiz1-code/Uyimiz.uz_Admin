<script setup>
import EmptyState from '../components/EmptyState.vue'
import PageHead from '../components/PageHead.vue'
import UiIcon from '../components/UiIcon.vue'
import { approveModeration, rejectModeration, state } from '../store'

/** AI balli qanchalik yuqori bo'lsa, shubha shunchalik kuchli. */
function scorePill(score) {
  if (score >= 80) return 'pill pill-hot'
  if (score >= 50) return 'pill pill-vip'
  return 'pill'
}
</script>

<template>
  <div>
    <PageHead
      eyebrow="Moderatsiya"
      title="Ko'rib chiqish navbati"
      :note="`AI filtr shubhali deb belgilagan e'lonlar. Tasdiqlansa e'lon saytda darhol ko'rinadi, rad etilsa egasiga qaytariladi.`"
    />

    <EmptyState
      v-if="!state.moderation.length"
      title="Navbat bo'sh"
      note="Hozircha ko'rib chiqishni kutayotgan e'lon yo'q. AI filtr shubhali e'lonni belgilaganda u shu yerda paydo bo'ladi."
    />

    <section v-else class="card card-pad">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>E'lon</th>
              <th>Sabab</th>
              <th>AI balli</th>
              <th style="text-align: right">Amallar</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="list">
            <tr v-for="m in state.moderation" :key="m.id">
              <td class="mono">{{ m.id }}</td>
              <td><b>{{ m.title }}</b></td>
              <td>{{ m.reason }}</td>
              <td><span :class="scorePill(m.score)">{{ m.score }}/100</span></td>
              <td>
                <div class="acts">
                  <button class="btn btn-pri btn-sm" @click="approveModeration(m)">
                    <UiIcon name="i-check" :size="13" /> Tasdiqlash
                  </button>
                  <button class="btn btn-danger btn-sm" @click="rejectModeration(m)">
                    <UiIcon name="i-x" :size="13" /> Rad etish
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </section>
  </div>
</template>
