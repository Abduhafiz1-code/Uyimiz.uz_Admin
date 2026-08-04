import { ref, watch } from 'vue'

/**
 * Raqamni eski qiymatdan yangi qiymatga silliq animatsiya bilan o'zgartiradi.
 * @param {Function} source - reaktiv qiymatni qaytaruvchi getter, masalan () => state.dashboard.usersTotal
 * @param {Object} opts - { duration: ms, decimals: nechta kasr xona }
 */
export function useCountUp(source, opts = {}) {
  const duration = opts.duration ?? 900
  const decimals = opts.decimals ?? 0
  const display = ref(0)
  let raf = null

  function animate(from, to) {
    const start = performance.now()
    if (raf) cancelAnimationFrame(raf)
    if (from === to) {
      display.value = to
      return
    }
    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      const val = from + (to - from) * eased
      display.value = decimals ? Math.round(val * 10 ** decimals) / 10 ** decimals : Math.round(val)
      if (t < 1) raf = requestAnimationFrame(tick)
      else display.value = to
    }
    raf = requestAnimationFrame(tick)
  }

  watch(
    source,
    (val) => {
      const num = Number(val) || 0
      animate(display.value, num)
    },
    { immediate: true }
  )

  return display
}

export default useCountUp
