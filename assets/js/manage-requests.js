const apiBase = '${API_BASE_URL}/api';

async function fetchRequests() {
  try {
    // 请求时带上status=requested，过滤出待审批的请求
    const res = await fetch(`${apiBase}/borrows?status=requested`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to load requests.');
    renderRequests(data.data);
  } catch (err) {
    alert('Error loading requests: ' + err.message);
  }
}

function renderRequests(requests) {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = '';
  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-600">No pending requests</td></tr>`;
    return;
  }
  requests.forEach(req => {
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">${req.username || 'User #' + req.user_id}</td>
        <td class="px-6 py-4 whitespace-nowrap">${req.title || 'Book #' + req.book_id}</td>
        <td class="px-6 py-4 whitespace-nowrap">${new Date(req.borrow_date).toLocaleDateString()}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button data-id="${req.id}" data-action="approve" class="text-green-600 hover:text-green-900">Approve</button>
          <button data-id="${req.id}" data-action="deny" class="text-red-600 hover:text-red-900 ml-4">Deny</button>
        </td>
      </tr>
    `);
  });

  // 按钮事件监听
  tbody.querySelectorAll('button').forEach(btn => {
    btn.onclick = async () => {
      const borrowId = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      // 审批操作approve：status设为borrowed，拒绝deny：status设为returned（逻辑可改）
      let statusToSet = action === 'approve' ? 'borrowed' : 'returned';
      try {
        const res = await fetch(`${apiBase}/borrows/${borrowId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: statusToSet })
        });
        const resp = await res.json();
        if (!resp.success) throw new Error(resp.message || 'Failed to update status.');
        alert(`Request ${action}d successfully.`);
        fetchRequests(); // 操作后刷新列表
      } catch (err) {
        alert('Error updating request: ' + err.message);
      }
    };
  });
}

document.addEventListener('DOMContentLoaded', fetchRequests);
