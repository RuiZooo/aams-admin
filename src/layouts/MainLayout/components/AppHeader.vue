<template>
  <div class="header">
    <div class="left">房间管理系统</div>

    <div class="right">
      <button @click="toggleTheme">切换主题</button>
    </div>
  </div>
</template>

<script setup>
import { ThemeMode, setTheme } from '@/utils/theme'

function toggleTheme() {
  const current = localStorage.getItem('aams-theme')

  const next =
      current === ThemeMode.DARK
          ? ThemeMode.LIGHT
          : ThemeMode.DARK

  setTheme(next)
}
</script>

<style scoped lang="scss">
.header {
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--aams-border);
  background: var(--aams-bg);
}
</style>