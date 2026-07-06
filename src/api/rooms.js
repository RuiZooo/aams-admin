/*
 * @Author: RuiZZZ 2372456234@qq.com
 * @Date: 2026-07-06 20:21:59
 * @LastEditors: RuiZZZ 2372456234@qq.com
 * @LastEditTime: 2026-07-06 20:22:10
 * @FilePath: \aams-admin\src\api\rooms.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from './request'

// 获取房间列表 (支持分页和条件查询)
export function getRoomList(params) {
  return request({
    url: '/aams/rooms',
    method: 'GET',
    params
  })
}

// 创建新房间
export function createRoom(data) {
  return request({
    url: '/aams/rooms',
    method: 'POST',
    data
  })
}

// 更新房间信息
export function updateRoom(id, data) {
  return request({
    url: `/aams/rooms/${id}`,
    method: 'PUT',
    data
  })
}

// 删除房间 (如果房间全空)
export function deleteRoom(id) {
  return request({
    url: `/aams/rooms/${id}`,
    method: 'DELETE'
  })
}