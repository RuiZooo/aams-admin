<template>
  <div class="room-container">
    <!-- 1. 顶部筛选区 -->
    <div class="panel header-panel">
      <el-form :inline="true" :model="queryParams" @submit.prevent>
        <el-form-item label="房间号">
          <el-input v-model="queryParams.room_no" placeholder="输入房间号" clearable @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="queryParams.gender" placeholder="请选择" clearable style="width: 120px" @change="fetchData">
            <el-option label="男房" value="male" />
            <el-option label="女房" value="female" />
            <el-option label="未染色" value="mixed" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 120px" @change="fetchData">
            <el-option label="正常" value="active" />
            <el-option label="锁定" value="locked" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button type="success" @click="openAddDialog">新增房间</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 2. 卡片列表与分页 -->
    <div class="panel grid-panel" v-loading="loading">
      <div class="room-cards-wrapper">
        <el-empty v-if="roomList.length === 0" description="暂无符合条件的房间" />

        <div v-for="room in roomList" :key="room.id" class="config-card"
          :class="{ 'is-disabled': room.status !== 'active' }">
          <div class="card-header">
            <div class="room-title">
              <span class="gender-dot" :class="room.gender"></span>
              <span class="room-no">{{ room.room_no }}</span>
            </div>
            <el-tag :type="getStatusType(room.status)" size="small" effect="plain" round>{{ getStatusText(room.status)
            }}</el-tag>
          </div>

          <div class="card-body">
            <div class="info-row"><span class="info-label">属性</span><span class="info-value">{{
              getGenderText(room.gender) }}</span></div>
            <div class="info-row"><span class="info-label">密码</span><span class="info-value">{{ room.password || '未设置'
            }}</span></div>

            <div class="info-row">
              <span class="info-label">团队</span>
              <span class="info-value team-text" :title="getTeamDisplay(room.team_id)">
                {{ getTeamDisplay(room.team_id) }}
              </span>
            </div>

            <div class="info-row"><span class="info-label">标签</span><span class="info-value">{{ room.tags || '—'
            }}</span></div>

            <div class="progress-section">
              <div class="progress-label">
                <span>入住情况</span>
                <span class="fraction">{{ room.used }} / {{ room.capacity }}</span>
              </div>
              <el-progress :percentage="getOccupancyPercentage(room.used, room.capacity)" :show-text="false"
                :color="progressColors" />
            </div>
          </div>

          <div class="card-footer">
            <el-button size="small" type="primary" link @click="openManageDialog(room)">详情 / 管理</el-button>
            <el-button size="small" type="danger" link :disabled="room.used > 0"
              @click="handleDelete(room)">移除</el-button>
          </div>
        </div>
      </div>

      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total"
          layout="total, sizes, prev, pager, next" background @size-change="fetchData" @current-change="fetchData" />
      </div>
    </div>

    <!-- 3. 统一宽窗体：基础信息与床位人员同屏管理 -->
    <el-dialog v-model="manageVisible" :title="dialogType === 'add' ? '新增房间' : `管理房间 - ${form.room_no}`" width="900px"
      destroy-on-close class="unified-manage-dialog">
      <el-row :gutter="30" class="dialog-layout">

        <!-- 左侧：房间基础信息编辑 -->
        <el-col :span="9" class="left-panel">
          <div class="section-header">基础信息</div>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="75px" label-position="left">
            <el-form-item label="房间号" prop="room_no"><el-input v-model="form.room_no"
                placeholder="如: 101" /></el-form-item>
            <el-form-item label="容量" prop="capacity"><el-input-number v-model="form.capacity" :min="1"
                style="width: 100%" /></el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="mixed">未染色</el-radio>
                <el-radio label="male">男房</el-radio>
                <el-radio label="female">女房</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="门锁密码" prop="password"><el-input v-model="form.password"
                placeholder="选填" /></el-form-item>

            <el-form-item label="所属团队" prop="team_id">
              <el-select v-model="form.team_id" placeholder="请选择团队" clearable filterable style="width: 100%">
                <el-option v-for="team in teamList" :key="team.deptId" :label="team.deptName" :value="team.deptId">
                  <span style="float: left">{{ team.deptName }}</span>
                  <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">{{ team.leader
                  }}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="标签" prop="tags"><el-input v-model="form.tags" placeholder="选填, 用逗号分隔" /></el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="正常" value="active" />
                <el-option label="锁定" value="locked" />
                <el-option label="停用" value="disabled" />
              </el-select>
            </el-form-item>
            <div class="form-actions">
              <el-button type="primary" @click="handleSubmit" :loading="submitLoading"
                style="width: 100%">保存基础信息</el-button>
            </div>
          </el-form>
        </el-col>

        <!-- 右侧：床位与人员管理 -->
        <el-col :span="15" class="right-panel">
          <div class="section-header">
            床位分布
            <el-tag v-if="dialogType === 'edit'" size="small" effect="plain" type="info" style="margin-left:8px;">
              已入住 {{ form.used }} / {{ form.capacity }}
            </el-tag>
          </div>

          <div v-if="dialogType === 'add'" class="empty-bed-tips">
            <el-empty description="新增保存房间后，即可在此管理人员入住" :image-size="100" />
          </div>

          <div v-else class="bed-grid" v-loading="detailLoading">
            <div v-for="bedIndex in form.capacity" :key="bedIndex" class="bed-item"
              :class="{ 'is-occupied': roomPersons[bedIndex - 1] }">
              <div class="bed-header">
                <span class="bed-icon">🛏️ {{ bedIndex }}号床</span>
                <el-tag v-if="roomPersons[bedIndex - 1]" size="small" type="success">使用中</el-tag>
                <el-tag v-else size="small" type="info" effect="plain">空闲</el-tag>
              </div>

              <!-- 已入住展示 -->
              <div class="bed-content" v-if="roomPersons[bedIndex - 1]">
                <template v-if="!roomPersons[bedIndex - 1].isTransferring">
                  <div class="person-details">
                    <span class="person-name">
                      {{ roomPersons[bedIndex - 1].name }}
                      <span class="gender-text">({{ roomPersons[bedIndex - 1].gender === 'male' ? '男' : '女' }})</span>
                    </span>
                    <span class="person-phone">{{ roomPersons[bedIndex - 1].phone }}</span>
                  </div>
                  <el-button type="primary" size="small" link class="transfer-btn"
                    @click="startInlineTransfer(roomPersons[bedIndex - 1])">调配人员</el-button>
                </template>

                <!-- 内嵌式调配模式 -->
                <template v-else>
                  <el-select v-model="roomPersons[bedIndex - 1].targetRoomId" size="small" placeholder="选择目标房间"
                    class="inline-select">
                    <el-option v-for="r in getTransferRooms(roomPersons[bedIndex - 1])" :key="r.id"
                      :label="`${r.room_no} (余:${r.capacity - r.used})`" :value="r.id" />
                    <template #empty>
                      <div style="padding:10px;color:#999;font-size:12px;">暂无符合当前性别且有余位的房间</div>
                    </template>
                  </el-select>
                  <div class="inline-actions">
                    <el-button type="primary" size="small"
                      @click="submitTransfer(roomPersons[bedIndex - 1], bedIndex - 1)"
                      :loading="roomPersons[bedIndex - 1].transferLoading">确认</el-button>
                    <el-button size="small" @click="roomPersons[bedIndex - 1].isTransferring = false">取消</el-button>
                  </div>
                </template>
              </div>

              <!-- 空闲床位展示 -->
              <div class="bed-content empty" v-else>
                <span>当前床位空闲可用</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getRoomList, createRoom, updateRoom, deleteRoo } from '@/api/rooms'
import { getTeams } from '@/api/getTeams'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const roomList = ref([])
const total = ref(0)
const queryParams = reactive({ page: 1, pageSize: 20, room_no: '', gender: '', status: '' })

// 进度条颜色预警
const getOccupancyPercentage = (used, capacity) => (!capacity ? 0 : Math.min(100, Math.round((used / capacity) * 100)))
const progressColors = [{ color: '#67C23A', percentage: 50 }, { color: '#E6A23C', percentage: 80 }, { color: '#F56C6C', percentage: 100 }]

// === 团队映射字典逻辑 ===
const teamList = ref([])
const teamMap = ref({})

const fetchAllTeams = async () => {
  try {
    const res = await getTeams()
    if (res.code === 200) {
      teamList.value = res.data || []
      teamMap.value = teamList.value.reduce((acc, cur) => {
        acc[cur.deptId] = cur
        return acc
      }, {})
    }
  } catch (error) {
    console.error('获取团队字典失败:', error)
  }
}

const getTeamDisplay = (teamId) => {
  if (!teamId) return '—'
  const team = teamMap.value[teamId]
  if (team) return `${team.deptName} (${team.leader || '无负责人'})`
  return `未知团队(${teamId})`
}

// === 统一宽窗体管理逻辑 ===
const manageVisible = ref(false)
const dialogType = ref('add')
const submitLoading = ref(false)
const detailLoading = ref(false)
const formRef = ref(null)

const form = reactive({ id: null, room_no: '', capacity: 8, used: 0, gender: 'mixed', password: '', team_id: null, tags: '', status: 'active' })
const rules = { room_no: [{ required: true, message: '房间号不能为空', trigger: 'blur' }] }

const roomPersons = ref([])
const allActiveRooms = ref([])

const fetchData = async () => {
  loading.value = true
  const res = await getRoomList(queryParams)
  roomList.value = res.data?.list || res.data || []
  total.value = res.data?.total || res.total || 0
  loading.value = false
}

const openAddDialog = () => {
  dialogType.value = 'add'
  Object.assign(form, { id: null, room_no: '', capacity: 8, used: 0, gender: 'mixed', password: '', team_id: null, tags: '', status: 'active' })
  manageVisible.value = true
}

const openManageDialog = async (room) => {
  dialogType.value = 'edit'
  Object.assign(form, room)
  manageVisible.value = true
  detailLoading.value = true

  try {
    const roomRes = await getRoomList({ status: 'active', pageSize: 500 })
    allActiveRooms.value = roomRes.data?.list || roomRes.data || []

    await new Promise(resolve => setTimeout(resolve, 300))
    roomPersons.value = Array.from({ length: room.used }).map((_, idx) => ({
      id: `person_${idx + 1}`,
      name: `入住人 ${idx + 1}`,
      phone: '13800001111',
      gender: room.gender === 'mixed' ? 'male' : room.gender,
      isTransferring: false,
      targetRoomId: null,
      transferLoading: false
    }))
  } catch (err) {
    ElMessage.error('数据加载失败')
  } finally {
    detailLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        dialogType.value === 'add' ? await createRoom(form) : await updateRoom(form.id, form)
        ElMessage.success('基础信息保存成功')
        if (dialogType.value === 'add') manageVisible.value = false
        fetchData()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定移除该房间吗？', '提示', { type: 'warning' }).then(async () => {
    await deleteRoom(row.id)
    fetchData()
  }).catch(() => { })
}

// === 内嵌式人员调配逻辑 ===
const startInlineTransfer = (person) => { person.isTransferring = true; person.targetRoomId = null }

const getTransferRooms = (person) => {
  return allActiveRooms.value.filter(r => {
    const isNotCurrent = r.id !== form.id
    const hasCapacity = r.used < r.capacity
    const genderMatch = r.gender === 'mixed' || r.gender === person.gender
    return isNotCurrent && hasCapacity && genderMatch
  })
}

const submitTransfer = async (person, arrayIndex) => {
  if (!person.targetRoomId) return ElMessage.warning('请选择目标房间')

  person.transferLoading = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('人员调配成功！')
    person.isTransferring = false

    roomPersons.value[arrayIndex] = null
    form.used -= 1
    fetchData()
  } finally {
    person.transferLoading = false
  }
}

// 格式化函数
const getStatusType = (s) => ({ active: 'success', locked: 'warning', disabled: 'info' }[s])
const getStatusText = (s) => ({ active: '正常', locked: '锁定', disabled: '停用' }[s])
const getGenderText = (g) => ({ mixed: '未染色', male: '男房', female: '女房' }[g])

onMounted(() => {
  fetchAllTeams()
  fetchData()
})
</script>

<style scoped lang="scss">
.room-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: var(--aams-bg);
  border: 1px solid var(--aams-border);
  border-radius: 8px;
  padding: 16px;
}

.header-panel {
  display: flex;
  align-items: center;
}

/* 外部列表卡片 */
.room-cards-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.config-card {
  background: var(--aams-bg);
  border: 1px solid var(--aams-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.config-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--aams-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gender-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}

.gender-dot.male {
  background: var(--el-color-primary);
}

.gender-dot.female {
  background: #f56c6c;
}

.gender-dot.mixed {
  background: var(--el-text-color-placeholder);
}

.room-no {
  font-weight: bold;
  font-size: 16px;
}

.card-body {
  padding: 12px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-label {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.team-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  text-align: right;
}

.progress-section {
  margin-top: auto;
  padding-top: 12px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  color: var(--el-text-color-regular);
}

.fraction {
  font-family: monospace;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.card-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--aams-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: var(--aams-bg-soft);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--aams-border);
}

/* === 统一宽窗体内部布局 === */
.dialog-layout {
  display: flex;
  align-items: stretch;
}

.left-panel {
  border-right: 1px solid var(--aams-border);
  padding-right: 20px;
}

.right-panel {
  padding-left: 10px;
}

.section-header {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
}

.form-actions {
  margin-top: 24px;
}

.empty-bed-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 250px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px dashed var(--aams-border);
}

/* === 修复重点：床位网格及卡片背景自适应 === */
.bed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.bed-item {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-light);
  /* 空闲床位背景色（浅色/暗色均自适应） */
  transition: all 0.2s;
  overflow: hidden;
}

/* 已入住状态，完全移除死板的 #ffffff，采用主题自适应背景色 */
.bed-item.is-occupied {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-bg-color);
  /* 自动适配系统的背景色（浅色模式白，暗色模式黑） */
}

.bed-header {
  padding: 10px 12px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bed-icon {
  font-weight: bold;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.bed-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 75px;
}

.bed-content.empty {
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  font-style: italic;
}

.person-details {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.person-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.gender-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.person-phone {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.transfer-btn {
  align-self: flex-start;
  padding: 0;
}

/* 内嵌调换区域 */
.inline-select {
  width: 100%;
  margin-bottom: 10px;
}

.inline-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>