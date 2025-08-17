// manage-requests.js - 管理员借阅请求管理功能

async function fetchRequests() {
  try {
    // 请求时带上status=requested，过滤出待审批的请求
    const url = `${window.CONFIG.BORROW_ENDPOINTS.list}?borrow_status=requested`;
    const { response, data } = await window.apiRequest(url);
    
    if (response.ok && data.success) {
      renderRequests(data.data);
    } else {
      throw new Error(data.message || 'Failed to load requests.');
    }
  } catch (err) {
    await showError('Failed to load requests: ' + err.message);
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
        <td class="px-6 py-4 whitespace-nowrap">${window.formatDate?.(req.borrow_date) || new Date(req.borrow_date).toLocaleDateString()}</td>
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
      // 审批操作approve：status设为borrowed，拒绝deny：status设为rejected
      let statusToSet = action === 'approve' ? 'borrowed' : 'rejected';
      
      if (!(await showConfirm(`Are you sure you want to ${action} this request?`, 'Confirm Operation'))) {
        return;
      }
      
      try {
        const { response, data } = await window.apiRequest(
          window.CONFIG.BORROW_ENDPOINTS.updateStatus(borrowId),
          {
            method: 'PUT',
            body: JSON.stringify({ borrow_status: statusToSet })
          }
        );
        
        if (response.ok && data.success) {
          await showSuccess(`Request ${action}d successfully`);
          fetchRequests(); // 操作后刷新列表
        } else {
          throw new Error(data.message || 'Failed to update status.');
        }
      } catch (err) {
        await showError('Failed to update request: ' + err.message);
      }
    };
  });
}

document.addEventListener('DOMContentLoaded', fetchRequests);