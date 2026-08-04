<script setup>
import { state, approveModeration, rejectModeration } from '../store'

function approve(m) { approveModeration(m) }
function reject(m) { rejectModeration(m) }
</script>

<template>
  <div>
    <div class="topbar">
      <div><h1>Moderatsiya</h1><p>AI filtr orqali belgilangan e'lonlar</p></div>
    </div>

    <div class="panel">
      <div v-if="state.moderation.length === 0" class="footnote">Moderatsiyada e'lon yo'q.</div>
      <table v-else>
        <thead>
          <tr><th>ID</th><th>SARLAVHA</th><th>SABAB</th><th>AI BALLI</th><th>AMALLAR</th></tr>
        </thead>
        <tbody>
          <tr v-for="m in state.moderation" :key="m.id">
            <td>{{ m.id }}</td>
            <td class="name-main">{{ m.title }}</td>
            <td>{{ m.reason }}</td>
            <td>
              <span class="badge" :style="m.score >= 80 ? 'background:var(--red-light);color:var(--red);' : 'background:var(--amber-light);color:var(--amber);'">
                {{ m.score }}/100
              </span>
            </td>
            <td>
              <div class="actions-cell">
                <button class="btn btn-sm btn-dark" @click="approve(m)">Tasdiqlash</button>
                <button class="btn btn-sm btn-outline-red" @click="reject(m)">Rad etish</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
