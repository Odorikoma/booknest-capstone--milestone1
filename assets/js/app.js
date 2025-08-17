// app.js - 主页面应用入口文件

document.addEventListener('DOMContentLoaded', () => {
    // 检查用户登录状态
    const checkAuthStatus = () => {
        const user = window.getCurrentUser?.();
        const loginSection = document.getElementById('login-section');
        const mainContent = document.getElementById('main-content');
        
        if (user) {
            // 用户已登录，显示主要内容
            loginSection?.classList.add('hidden');
            mainContent?.classList.remove('hidden');
        } else {
            // 用户未登录，显示登录区域
            loginSection?.classList.remove('hidden');
            mainContent?.classList.add('hidden');
        }
    };

    // 健康检查
    const healthCheck = async () => {
        try {
            const response = await fetch(window.CONFIG.HEALTH_ENDPOINT);
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('API健康检查通过:', data.service);
            } else {
                console.warn('API健康检查失败');
            }
        } catch (error) {
            console.error('API连接失败:', error);
        }
    };

    // 初始化应用
    const initApp = () => {
        // 执行健康检查
        healthCheck();
        
        // 检查登录状态
        checkAuthStatus();
        
        // 如果在主页且用户已登录，加载图书列表
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            const user = window.getCurrentUser?.();
            if (user && typeof window.loadBooks === 'function') {
                // 如果books.js已加载，调用加载函数
                window.loadBooks();
            }
        }
    };

    // 启动应用
    initApp();

    // 监听storage变化，处理多标签页登录状态同步
    window.addEventListener('storage', (e) => {
        if (e.key === 'user' || e.key === 'token') {
            checkAuthStatus();
        }
    });
});