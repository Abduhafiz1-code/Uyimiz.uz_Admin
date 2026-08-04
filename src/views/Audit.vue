<script setup>
import { state } from '../store'
</script>

<template>
  <div>
    <div class="topbar"><div><h1>Audit jurnali</h1></div></div>

    <div class="panel">
      <table>
        <thead>
          <tr><th>VAQT</th><th>ADMIN</th><th>AMAL</th><th>OBYEKT</th></tr>
        </thead>
        <tbody>
          <tr v-for="(a, i) in state.audit" :key="i">
            <td>{{ a.time }}</td>
            <td>{{ a.admin }}</td>
            <td>{{ a.action }}</td>
            <td>{{ a.object }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
