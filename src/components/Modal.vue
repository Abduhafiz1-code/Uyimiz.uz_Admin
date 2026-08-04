<script setup>
defineProps({ title: { type: String, default: '' } })
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-box">
        <div class="modal-head">
          <h2>{{ title }}</h2>
          <button class="modal-close" type="button" @click="emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
