<template>
  <div class="dashboard">

    <!-- 统计卡片 -->
    <div class="card-grid">
      <div class="card">
        <div class="label">总房间</div>
        <div class="value">{{ stats.totalRooms }}</div>
      </div>

      <div class="card">
        <div class="label">已入住</div>
        <div class="value">{{ stats.occupied }}</div>
      </div>

      <div class="card">
        <div class="label">空床位</div>
        <div class="value">{{ stats.freeBeds }}</div>
      </div>

      <div class="card">
        <div class="label">今日入住</div>
        <div class="value">{{ stats.todayCheckin }}</div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="content-grid">

      <!-- 房态 -->
      <div class="panel">
        <div class="panel-title">房态概览</div>

        <div class="room-grid">
          <div class="room" v-for="room in rooms" :key="room.roomNo">
            <div class="room-no">{{ room.roomNo }}</div>
            <div class="room-status">
              {{ room.used }}/{{ room.capacity }}
            </div>
          </div>
        </div>
      </div>

      <!-- 日志 -->
      <div class="panel">
        <div class="panel-title">今日动态</div>

        <div class="log">
          <div v-for="log in logs" :key="log.id">
            {{ log.message }}
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getDashboardStats,
  getRoomOverview,
  getRecentLogs
} from '@/api/dashboard'

// 默认值（防止空白）
const stats = ref({
  totalRooms: 0,
  occupied: 0,
  freeBeds: 0,
  todayCheckin: 0
})

const rooms = ref([])
const logs = ref([])

// 模拟数据（后面可删）
function mockData() {
  stats.value = {
    totalRooms: 128,
    occupied: 86,
    freeBeds: 42,
    todayCheckin: 12
  }

  rooms.value = Array.from({ length: 12 }).map((_, i) => ({
    roomNo: `10${i + 1}`,
    capacity: 8,
    used: Math.floor(Math.random() * 8)
  }))

  logs.value = [
    { id: 1, message: '张三 入住 101 房间' },
    { id: 2, message: '李四 退房 102 房间' }
  ]
}

async function loadData() {
  try {
    // 先用 mock（后端未接入）
    mockData()

    // 后续直接替换为：
    // const res = await getDashboardStats()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 顶部统计卡片 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.card {
  background: var(--aams-bg);
  border: 1px solid var(--aams-border);
  padding: 16px;
  border-radius: 10px;
}

.label {
  font-size: 13px;
  color: var(--aams-text-secondary);
}

.value {
  font-size: 22px;
  font-weight: bold;
  margin-top: 6px;
}

/* 中间区域 */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.panel {
  background: var(--aams-bg);
  border: 1px solid var(--aams-border);
  border-radius: 10px;
  padding: 16px;
}

.panel-title {
  font-weight: 500;
  margin-bottom: 12px;
}

/* 房态 */
.room-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.room {
  border: 1px solid var(--aams-border);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
}

.room-no {
  font-weight: bold;
}

.room-status {
  font-size: 12px;
  color: var(--aams-text-secondary);
  margin-top: 4px;
}

/* 日志 */
.log {
  font-size: 13px;
  color: var(--aams-text-secondary);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>