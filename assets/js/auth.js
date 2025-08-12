import { API_BASE_URL } from './config.js';

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
      const response = await fetch('${API_BASE_URL}/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        alert('Login successful!');

        // 存储登录用户信息和token
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('token', data.access_token);  // 关键：存token

        // 根据角色跳转
        if (data.data.role === 'admin') {
          window.location.href = 'admin/manage-books.html';
        } else {
          window.location.href = 'index.html';
        }
      } else {
        alert('Login failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  // 注册处理
  const handleRegister = async (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await fetch('${API_BASE_URL}/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        alert('Registration successful! Please log in.');
        showLogin(); // 切回登录表单
      } else {
        alert('Registration failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Registration error: ' + error.message);
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
    localStorage.removeItem('token');   // 关键：清除token
    window.location.href = 'index.html'; // 或登录页
  };
};
