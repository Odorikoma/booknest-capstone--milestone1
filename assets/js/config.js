// config.js - API配置文件

// 根据环境设置API基础URL
const API_BASE_URL = 'https://booknest-capstone-milestone2-production.up.railway.app/api';

// 认证相关端点
const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`
};

// 图书相关端点
const BOOK_ENDPOINTS = {
    list: `${API_BASE_URL}/books`,
    detail: (id) => `${API_BASE_URL}/books/${id}`,
    create: `${API_BASE_URL}/books`,
    update: (id) => `${API_BASE_URL}/books/${id}`,
    delete: (id) => `${API_BASE_URL}/books/${id}`
};

// 借阅相关端点
const BORROW_ENDPOINTS = {
    list: `${API_BASE_URL}/borrows`,
    create: `${API_BASE_URL}/borrows`,
    userHistory: (userId) => `${API_BASE_URL}/borrows/user/${userId}`,
    updateStatus: (id) => `${API_BASE_URL}/borrows/${id}/borrow_status`,
    returnBook: (id) => `${API_BASE_URL}/borrows/${id}/return`,
    detail: (id) => `${API_BASE_URL}/borrows/${id}`
};

// 用户相关端点
const USER_ENDPOINTS = {
    search: `${API_BASE_URL}/users`
};

// 健康检查端点
const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

// 导出配置
window.CONFIG = {
    API_BASE_URL,
    AUTH_ENDPOINTS,
    BOOK_ENDPOINTS,
    BORROW_ENDPOINTS,
    USER_ENDPOINTS,
    HEALTH_ENDPOINT
};