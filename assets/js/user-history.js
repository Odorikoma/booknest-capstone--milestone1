// user-history.js - 用户借阅历史查询功能

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('user-search-input');
  const searchBtn = document.getElementById('user-search-btn');
  const usersListDiv = document.getElementById('users-list'); // 显示搜索用户列表
  const historyTitleSpan = document.querySelector('h2 span.text-primary');
  const historyTableBody = document.querySelector('tbody.bg-white');

  function clearTable() {
    historyTableBody.innerHTML = '';
  }

  function clearUsersList() {
    usersListDiv.innerHTML = '';
  }

  function renderUsers(users) {
    clearUsersList();
    if (users.length === 0) {
      usersListDiv.innerHTML = '<p class="text-gray-600 p-2">No users found.</p>';
      return;
    }

    users.forEach(user => {
      const btn = document.createElement('button');
      btn.textContent = `${user.username} (${user.email})`;
      btn.className = 'block w-full text-left px-4 py-2 hover:bg-gray-200 cursor-pointer';
      btn.addEventListener('click', () => {
        clearUsersList();
        loadUserHistory(user.id, user.username);
      });
      usersListDiv.appendChild(btn);
    });
  }

  async function fetchUsers(query) {
    try {
      const url = `${window.CONFIG.USER_ENDPOINTS.search}?query=${encodeURIComponent(query)}`;
      const { response, data } = await window.apiRequest(url);
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.error('Failed to fetch users:', data.message);
        return [];
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  }

  async function fetchUserHistory(userId) {
    try {
      const { response, data } = await window.apiRequest(
        window.CONFIG.BORROW_ENDPOINTS.userHistory(userId)
      );
      
      if (response.ok && data.success) {
        // 只显示 borrowed 和 returned 状态的记录，忽略请求状态等
        return data.data.filter(record => ['borrowed', 'returned'].includes(record.borrow_status));
      } else {
        console.error('Failed to fetch borrowing history:', data.message);
        return [];
      }
    } catch (err) {
      console.error('Error fetching borrowing history:', err);
      return [];
    }
  }

  function renderHistory(records) {
    clearTable();
    if (records.length === 0) {
      historyTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-600">No borrowing history found.</td></tr>`;
      return;
    }

    records.forEach(record => {
      const borrowDate = record.borrow_date ? window.formatDate?.(record.borrow_date) || new Date(record.borrow_date).toLocaleDateString() : '-';
      const returnDate = record.return_date ? window.formatDate?.(record.return_date) || new Date(record.return_date).toLocaleDateString() : '-';

      let statusClass = 'bg-yellow-100 text-yellow-800'; // 默认 borrowed 样式
      if(record.borrow_status === 'returned'){
        statusClass = 'bg-green-100 text-green-800';
      }

      const statusText = record.borrow_status.charAt(0).toUpperCase() + record.borrow_status.slice(1);

      const rowHTML = `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">${record.title || 'Unknown'}</td>
          <td class="px-6 py-4 whitespace-nowrap">${borrowDate}</td>
          <td class="px-6 py-4 whitespace-nowrap">${returnDate}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
              ${statusText}
            </span>
          </td>
        </tr>
      `;
      historyTableBody.insertAdjacentHTML('beforeend', rowHTML);
    });
  }

  async function loadUserHistory(userId, username) {
    historyTitleSpan.textContent = username || 'User';
    const records = await fetchUserHistory(userId);
    renderHistory(records);
  }

  async function handleSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      await showWarning('Please enter username or email to search');
      return;
    }
    clearTable();
    historyTitleSpan.textContent = '';
    clearUsersList();

    const users = await fetchUsers(keyword);
    renderUsers(users);
  }

  searchBtn.addEventListener('click', handleSearch);

  // 支持回车触发搜索
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  // 初始化清理
  clearTable();
  historyTitleSpan.textContent = '';
  clearUsersList();
});