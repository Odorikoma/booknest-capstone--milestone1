// common.js - 公共功能和导航栏管理

window.addEventListener('DOMContentLoaded', () => {
  const guestLinks = document.getElementById('guest-links');
  const userLinks = document.getElementById('user-links');
  const welcomeUser = document.getElementById('welcome-user');
  const logoutBtn = document.getElementById('logout-btn');
  const adminLink = document.getElementById('admin-link');

  try {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
      // 已登录：隐藏 guest，显示 user 和 welcome 文案
      guestLinks?.classList.add('hidden');
      userLinks?.classList.remove('hidden');
      welcomeUser && (welcomeUser.textContent = `Welcome, ${user.username}`);

      if (user.role === 'admin') {
        adminLink?.classList.remove('hidden');
      } else {
        adminLink?.classList.add('hidden');
      }
    } else {
      // 未登录
      guestLinks?.classList.remove('hidden');
      userLinks?.classList.add('hidden');
      adminLink?.classList.add('hidden');
    }

    // 绑定 logout 按钮
    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });

  } catch (e) {
    console.error('Error parsing user info from localStorage:', e);
  }
});

// 公共API请求函数 - 重写版本
window.apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  console.log('\n=== API请求开始 ===');
  console.log('URL:', url);
  console.log('方法:', options.method || 'GET');
  console.log('Token存在:', !!token);
  if (token) {
    console.log('Token前20字符:', token.substring(0, 20) + '...');
  }
  
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  // 添加认证头
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    headers: defaultHeaders,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  console.log('请求配置:', {
    url,
    method: config.method || 'GET',
    headers: config.headers,
    hasBody: !!config.body
  });

  try {
    const response = await fetch(url, config);
    
    console.log('响应状态:', response.status, response.statusText);
    
    let data;
    try {
      data = await response.json();
      console.log('响应数据:', data);
    } catch (jsonError) {
      console.error('解析JSON失败:', jsonError);
      console.log('响应文本:', await response.text());
      throw new Error('Server returned invalid JSON data');
    }

    // 如果token过期或无效，重定向到登录页
    if (response.status === 401) {
      console.log('认证失败，清除本地存储');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      if (data && data.message) {
        await showError('Authentication failed: ' + data.message);
      } else {
        await showError('Authentication failed, please login again');
      }
      
      window.location.href = 'account.html';
      return null;
    }

    console.log('=== API请求成功 ===\n');
    return { response, data };
  } catch (error) {
    console.error('API请求异常:', error);
    console.log('=== API请求失败 ===\n');
    throw error;
  }
};

// 显示加载状态
window.showLoading = (element) => {
  if (element) {
    element.innerHTML = '<div class="text-center">Loading...</div>';
  }
};

// 显示错误信息
window.showError = (element, message) => {
  if (element) {
    element.innerHTML = `<div class="text-red-500 text-center">${message}</div>`;
  }
};

// 格式化日期
window.formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 获取默认图片URL
window.getDefaultCoverUrl = () => {
  return 'assets/images/default-cover.svg';
};

// 处理图片加载错误，防止无限循环
window.handleImageError = (img) => {
  if (img.dataset.errorHandled) {
    return; // 已经处理过错误，避免无限循环
  }
  img.dataset.errorHandled = 'true';
  img.src = window.getDefaultCoverUrl();
};