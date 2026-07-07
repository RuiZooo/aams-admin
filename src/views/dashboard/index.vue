<template>
  <div class="dashboard-container">
    <!-- 核心统计指标 -->
    <el-row :gutter="24" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-title">总房间资源</div>
          <div class="stat-value">{{ stats.totalRooms }} <span class="unit">间</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-title">已用床位 / 总容量</div>
          <div class="stat-value">{{ stats.usedBeds }} <span class="unit-divider">/</span> <span class="sub-value">{{
            stats.totalBeds }}</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card highlight">
          <div class="stat-title">当前空余床位</div>
          <div class="stat-value text-primary">{{ stats.freeBeds }} <span class="unit">床</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-title">今日新办入住</div>
          <div class="stat-value">{{ stats.todayCheckin }} <span class="unit">人</span></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="main-row">
      <!-- 核心：实时房态矩阵面板 -->
      <el-col :span="18">
        <div class="matrix-panel">
          <div class="panel-header">
            <h3 class="panel-title">实时房态大盘</h3>
            <div class="panel-legend">
              <span class="legend-item"><i class="dot empty"></i> 未染色(空)</span>
              <span class="legend-item"><i class="dot male"></i> 男房</span>
              <span class="legend-item"><i class="dot female"></i> 女房</span>
              <span class="legend-item"><i class="dot disabled"></i> 锁定/维修</span>
            </div>
          </div>

          <div v-loading="roomLoading" class="matrix-grid">
            <el-tooltip v-for="room in rooms" :key="room.room_no" placement="top" :show-after="200" effect="light">
              <template #content>
                <div class="tooltip-detail">
                  <div class="t-header">{{ room.room_no }} <span>({{ room.capacity }}人间)</span></div>
                  <div class="t-row"><span>状态：</span>{{ getStatusText(room.status) }}</div>
                  <div class="t-row"><span>绑定团队：</span>{{ room.team_id || '无 (全局)' }}</div>
                  <div class="t-row"><span>小组标签：</span>{{ room.tags || '无' }}</div>
                </div>
              </template>

              <div class="room-card" :class="getRoomStatusClass(room)">
                <div class="rc-header">
                  <div class="status-indicator"></div>
                  <div v-if="room.used >= room.capacity" class="full-tag">满</div>
                </div>
                <div class="rc-body">
                  <div class="room-no">{{ room.room_no }}</div>
                </div>
                <div class="rc-footer">
                  <div class="usage-text">{{ room.used }} / {{ room.capacity }}</div>
                </div>
                <div class="rc-progress">
                  <div class="progress-fill" :style="{ width: (room.used / room.capacity * 100) + '%' }"></div>
                </div>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-col>

      <!-- 侧边栏：操作流水 -->
      <el-col :span="6">
        <div class="timeline-panel">
          <div class="panel-header">
            <h3 class="panel-title">动态流水</h3>
          </div>
          <div v-loading="logLoading" class="timeline-content">
            <el-empty v-if="logs.length === 0" description="暂无动态" :image-size="60" />
            <el-timeline v-else>
              <el-timeline-item v-for="log in logs" :key="log.id" :type="getLogType(log.action)"
                :timestamp="formatTime(log.created_at)" size="large">
                <div class="log-item">
                  <div class="log-action">{{ getActionName(log.action) }}</div>
                  <div class="log-detail" :title="log.message">{{ log.message }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDashboardStats, getRoomOverview, getRecentLogs } from '@/api/dashboard'

const roomLoading = ref(false)
const logLoading = ref(false)

const stats = ref({
  totalRooms: 0,
  usedBeds: 0,
  totalBeds: 0,
  freeBeds: 0,
  todayCheckin: 0
})

const rooms = ref([])
const logs = ref([])

const loadData = async () => {
  try {
    const statsRes = await getDashboardStats()
    if (statsRes.code === 200 || statsRes.success) {
      stats.value = statsRes.data
    }

    roomLoading.value = true
    const roomRes = await getRoomOverview({ limit: 100 })
    if (roomRes.code === 200 || roomRes.success) {
      rooms.value = roomRes.data.list || roomRes.data
    }
    roomLoading.value = false

    logLoading.value = true
    const logRes = await getRecentLogs({ limit: 10 })
    if (logRes.code === 200 || logRes.success) {
      logs.value = logRes.data.list || logRes.data
    }
    logLoading.value = false

  } catch (error) {
    console.error('大盘数据加载失败:', error)
    roomLoading.value = false
    logLoading.value = false
  }
}

const getRoomStatusClass = (room) => {
  if (room.status === 'disabled' || room.status === 'locked') return 'is-disabled'
  if (room.used === 0 || room.gender === 'mixed') return 'is-empty'
  if (room.gender === 'male') return 'is-male'
  if (room.gender === 'female') return 'is-female'
  return 'is-empty'
}

const getStatusText = (status) => {
  const map = { active: '正常', locked: '锁定', disabled: '停用' }
  return map[status] || status
}

const getLogType = (action) => {
  if (!action) return 'info'
  if (action.includes('checkin')) return 'success'
  if (action.includes('checkout')) return 'warning'
  if (action.includes('transfer')) return 'primary'
  return 'info'
}

const getActionName = (action) => {
  const map = {
    'person.checkin': '办理入住',
    'person.checkin.auto': '系统自动分配',
    'person.checkout': '办理退房',
    'person.transferRoom': '人员换房',
    'room.create': '新增房间'
  }
  return map[action] || action
}

const formatTime = (dateObj) => {
  if (!dateObj) return ''
  const d = new Date(dateObj)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
/* 主题变量修复版：完全使用 --aams-* 全局变量 */
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}

.stat-row {
  margin-bottom: 8px;
}

.stat-card {
  background-color: var(--aams-bg);
  border: 1px solid var(--aams-border);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s;

  .stat-title {
    font-size: 13px;
    color: var(--aams-text-secondary);
    margin-bottom: 8px;
    font-weight: 500;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--aams-text);
    line-height: 1.2;
  }

  .sub-value {
    font-size: 20px;
    color: var(--aams-text-secondary);
  }

  .unit-divider {
    font-size: 18px;
    color: var(--aams-text-secondary);
    margin: 0 4px;
  }

  .unit {
    font-size: 13px;
    color: var(--aams-text-secondary);
    font-weight: normal;
  }

  .text-primary {
    color: var(--aams-primary);
  }
}

.main-row {
  align-items: stretch;
}

.matrix-panel,
.timeline-panel {
  background-color: var(--aams-bg);
  border: 1px solid var(--aams-border);
  border-radius: 16px;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  transition: all 0.3s;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .panel-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--aams-text);
  }
}

.panel-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--aams-text-secondary);

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    &.empty {
      background-color: var(--aams-border);
    }

    &.male {
      background-color: var(--aams-primary);
    }

    &.female {
      background-color: #f56c6c;
    }

    &.disabled {
      background-color: var(--aams-text-secondary);
      opacity: 0.5;
    }
  }
}

.matrix-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 4px;
}

.room-card {
  position: relative;
  height: 84px;
  background-color: var(--aams-bg-soft);
  border: 1px solid var(--aams-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;

  &:hover {
    border-color: var(--aams-primary);
    transform: translateY(-2px);
  }

  .rc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    height: 14px;

    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--aams-border);
    }

    .full-tag {
      font-size: 10px;
      background-color: var(--aams-text);
      color: var(--aams-bg);
      padding: 2px 6px;
      border-radius: 4px;
      line-height: 1;
      font-weight: bold;
    }
  }

  .rc-body {
    flex: 1;
    display: flex;
    align-items: center;

    .room-no {
      font-size: 16px;
      font-weight: 600;
      color: var(--aams-text);
    }
  }

  .rc-footer {
    display: flex;
    justify-content: flex-start;

    .usage-text {
      font-size: 12px;
      color: var(--aams-text-secondary);
      font-family: monospace;
    }
  }

  .rc-progress {
    position: absolute;
    bottom: 0;
    left: 8px;
    right: 8px;
    height: 2px;
    background-color: transparent;

    .progress-fill {
      height: 100%;
      border-radius: 2px 2px 0 0;
      transition: width 0.4s ease;
    }
  }

  &.is-empty {
    .progress-fill {
      background-color: transparent;
    }
  }

  &.is-male {
    border-color: var(--aams-primary);

    .status-indicator {
      background-color: var(--aams-primary);
    }

    .room-no {
      color: var(--aams-primary);
    }

    .progress-fill {
      background-color: var(--aams-primary);
    }
  }

  &.is-female {
    border-color: #f56c6c;

    .status-indicator {
      background-color: #f56c6c;
    }

    .room-no {
      color: #f56c6c;
    }

    .progress-fill {
      background-color: #f56c6c;
    }
  }

  &.is-disabled {
    opacity: 0.5;
    background-color: var(--aams-bg);

    .status-indicator {
      background-color: var(--aams-text-secondary);
    }

    .progress-fill {
      display: none;
    }

    cursor: not-allowed;

    &:hover {
      transform: none;
      border-color: var(--aams-border);
    }
  }
}

.timeline-content {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.log-item {
  background-color: var(--aams-bg-soft);
  border: 1px solid var(--aams-border);
  padding: 12px 16px;
  border-radius: 8px;

  .log-action {
    font-size: 13px;
    font-weight: 600;
    color: var(--aams-text);
    margin-bottom: 4px;
  }

  .log-detail {
    font-size: 12px;
    color: var(--aams-text-secondary);
    line-height: 1.4;
  }
}
</style>