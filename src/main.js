/*
 * @Author: RuiZZZ 2372456234@qq.com
 * @Date: 2026-07-06 19:47:50
 * @LastEditors: RuiZZZ 2372456234@qq.com
 * @LastEditTime: 2026-07-07 00:33:15
 * @FilePath: \aams-admin\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

import './styles/index.scss'
import { initTheme } from '@/utils/theme'
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css'; // 加载 Element 内置暗黑变量
import './styles/theme/index.scss'; // 最后引入你的主题变量，确保覆盖！

initTheme()

const app = createApp(App)

app.use(router)

app.mount('#app')