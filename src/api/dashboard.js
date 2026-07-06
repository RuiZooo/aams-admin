import request from './request'

// 获取统计数据
export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'GET'
  })
}

// 获取房态数据
export function getRoomOverview() {
  return request({
    url: '/dashboard/rooms',
    method: 'GET'
  })
}

// 获取日志
export function getRecentLogs() {
  return request({
    url: '/dashboard/logs',
    method: 'GET'
  })
}