<script setup>
/** IconSprite'dagi `<symbol>` ga havola. Uyimiz Agent panelidagi bilan bir xil. */
defineProps({ name: { type: String, required: true }, size: { type: [Number, String], default: 16 } })
</script>

<template>
  <svg class="ico" :style="{ width: size + 'px', height: size + 'px' }" aria-hidden="true">
    <use :href="`#${name}`" />
  </svg>
</template>
