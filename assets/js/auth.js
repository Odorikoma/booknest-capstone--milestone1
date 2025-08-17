// auth.js - 认证相关功能

window.onload = () => {
  const showLoginBtn = document.getElementById('show-login-btn');
  const showRegisterBtn = document.getElementById('show-register-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // 切换到登录视图
  const showLogin = () => {
    registerForm.classList.add('hidden');
    showLoginBtn.classList.add('text-primary', 'border-b-2', 'border-primary');
    showRegisterBtn.classList.remove('text-primary', 'border-b-2', 'border-primary');
    loginForm.classList.remove('hidden');
  };

  // 切换到注册视图
  const showRegister = () => {
    loginForm.classList.add('hidden');
    showRegisterBtn.classList.add('text-primary', 'border-b-2', 'border-primary');
    showLoginBtn.classList.remove('text-primary', 'border-b-2', 'border-primary');
    registerForm.classList.remove('hidden');
  };

  // 登录处理
  const handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(window.CONFIG.AUTH_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        await showSuccess('Login successful!');

        // 存储登录用户信息和token
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('token', data.access_token);

        // 根据角色跳转
        if (data.data.role === 'admin') {
          window.location.href = 'admin/manage-books.html';
        } else {
          window.location.href = 'index.html';
        }
      } else {
        await showError('Login failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      await showError('Login error: ' + error.message);
    }
  };

  // 注册处理
  const handleRegister = async (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role')?.value || 'user';

    try {
      const response = await fetch(window.CONFIG.AUTH_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        await showSuccess('Registration successful! Please login.');
        showLogin(); // 切回登录表单
      } else {
        await showError('Registration failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      await showError('Registration error: ' + error.message);
    }
  };

  if (showLoginBtn && showRegisterBtn) {
    showLoginBtn.addEventListener('click', showLogin);
    showRegisterBtn.addEventListener('click', showRegister);
  }

  if (loginForm && registerForm) {
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
  }

  // 登出函数，清除token和用户信息
  window.logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  };
};

// 获取认证头部信息
window.getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 检查用户是否已登录
window.isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

// 获取当前用户信息
window.getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 检查用户是否为管理员
window.isAdmin = () => {
  const user = window.getCurrentUser();
  return user && user.role === 'admin';
};