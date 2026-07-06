<template>
  <button class="theme-btn" @click="toggle">
    切换主题
  </button>
</template>

<script setup>
import { ThemeMode, setTheme } from '@/utils/theme'

function toggle() {
  const current = localStorage.getItem('aams-theme') || ThemeMode.LIGHT

  const next =
      current === ThemeMode.LIGHT
          ? ThemeMode.DARK
          : ThemeMode.LIGHT

  setTheme(next)
}
</script>

<style scoped lang="scss">
.theme-btn {
  padding: 6px 12px;
  border: 1px solid var(--aams-border);
  background: var(--aams-bg);
  color: var(--aams-text);
  cursor: pointer;
}
</style>