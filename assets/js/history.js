// history.js - 个人借阅历史页面功能

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const historyContainer = document.getElementById('history-content');

  if (!token || !userStr) {
    historyContainer.innerHTML = '<tr><td colspan="6" class="text-red-500 text-center py-4">Please log in to view your borrowing history.</td></tr>';
    return;
  }

  const user = JSON.parse(userStr);
  const userId = user.id;

  try {
    const { response, data } = await window.apiRequest(
      window.CONFIG.BORROW_ENDPOINTS.userHistory(userId)
    );

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch borrow history.');
    }

    const borrows = data.data;

    if (!borrows || borrows.length === 0) {
      historyContainer.innerHTML = '<tr><td colspan="6" class="text-gray-500 text-center py-4">You have no borrowing history.</td></tr>';
      return;
    }

    historyContainer.innerHTML = '';
    borrows.forEach(borrow => {
      const returnDate = borrow.return_date ? window.formatDate?.(borrow.return_date) || new Date(borrow.return_date).toLocaleDateString() : 'N/A';
      const borrowDate = borrow.borrow_date ? window.formatDate?.(borrow.borrow_date) || new Date(borrow.borrow_date).toLocaleDateString() : 'N/A';

      const statusColors = {
        requested: 'bg-yellow-100 text-yellow-800',
        borrowed: 'bg-blue-100 text-blue-800',
        returned: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
      };

      const statusClass = statusColors[borrow.borrow_status] || 'bg-gray-100 text-gray-800';

      // Generate action button based on status
      let actionButton = '';
      if (borrow.borrow_status === 'borrowed') {
        actionButton = `
          <button onclick="returnBook(${borrow.id})" 
                  class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
            Return
          </button>
        `;
      } else {
        actionButton = '<span class="text-gray-400 text-sm">-</span>';
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${borrow.title}</td>
        <td class="px-6 py-4 whitespace-nowrap">${borrow.author}</td>
        <td class="px-6 py-4 whitespace-nowrap">${borrowDate}</td>
        <td class="px-6 py-4 whitespace-nowrap">${returnDate}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
            ${borrow.borrow_status.charAt(0).toUpperCase() + borrow.borrow_status.slice(1)}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${actionButton}
        </td>
      `;
      historyContainer.appendChild(row);
    });
  } catch (error) {
    historyContainer.innerHTML = `<tr><td colspan="6" class="text-red-500 text-center py-4">Error while fetching borrow history: ${error.message}</td></tr>`;
    console.error(error);
  }
});

// Return book function
async function returnBook(borrowId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    await showError('Please login first to return books');
    return;
  }

  try {
    const confirmation = await showConfirm('Are you sure you want to return this book?', 'Return Confirmation');
    if (!confirmation) {
      return;
    }

    const { response, data } = await window.apiRequest(
      window.CONFIG.BORROW_ENDPOINTS.returnBook(borrowId),
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok && data.success) {
      await showSuccess('Book returned successfully!');
      // Reload the page to show updated status
      window.location.reload();
    } else {
      await showError(data.message || 'Failed to return book, please try again');
    }
  } catch (error) {
    console.error('Error returning book:', error);
    await showError('Error occurred while returning book, please try again');
  }
}