import { API_BASE_URL } from './config.js';

window.addEventListener('DOMContentLoaded', () => {
  const guestLinks = document.getElementById('guest-links')
  const userLinks = document.getElementById('user-links')
  const welcomeUser = document.getElementById('welcome-user')
  const logoutBtn = document.getElementById('logout-btn')
  const adminLink = document.getElementById('admin-link')

  try {
    const user = JSON.parse(localStorage.getItem('user'))

    if (user) {
      // 已登录：隐藏 guest，显示 user 和 welcome 文案
      guestLinks?.classList.add('hidden')
      userLinks?.classList.remove('hidden')
      welcomeUser && (welcomeUser.textContent = `Welcome, ${user.username}`)

      if (user.role === 'admin') {
        adminLink?.classList.remove('hidden')
      } else {
        adminLink?.classList.add('hidden')
      }
    } else {
      // 未登录
      guestLinks?.classList.remove('hidden')
      userLinks?.classList.add('hidden')
      adminLink?.classList.add('hidden')
    }

    // 绑定 logout 按钮
    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem('user')
      window.location.href = '/' // 或者 reload()，看你项目需要
    })

  } catch (e) {
    console.error('Error parsing user info from localStorage:', e)
  }
})
