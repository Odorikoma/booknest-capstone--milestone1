import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const historyContainer = document.getElementById('history-content');

  if (!token || !userStr) {
    historyContainer.innerHTML = '<tr><td colspan="5" class="text-red-500 text-center py-4">Please log in to view your borrowing history.</td></tr>';
    return;
  }

  const user = JSON.parse(userStr);
  const userId = user.id;

  try {
    const response = await fetch(`${API_BASE_URL}/api/borrows/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch borrow history.');
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to fetch borrow history.');
    }

    const borrows = responseData.data;

    if (!borrows || borrows.length === 0) {
      historyContainer.innerHTML = '<tr><td colspan="5" class="text-gray-500 text-center py-4">You have no borrowing history.</td></tr>';
      return;
    }

    historyContainer.innerHTML = '';
    borrows.forEach(borrow => {
      const returnDate = borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : 'N/A';
      const borrowDate = borrow.borrow_date ? new Date(borrow.borrow_date).toLocaleDateString() : 'N/A';

      const statusColors = {
        requested: 'bg-yellow-100 text-yellow-800',
        borrowed: 'bg-blue-100 text-blue-800',
        returned: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
      };

      const statusClass = statusColors[borrow.borrow_status] || 'bg-gray-100 text-gray-800';

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
      `;
      historyContainer.appendChild(row);
    });
  } catch (error) {
    historyContainer.innerHTML = `<tr><td colspan="5" class="text-red-500 text-center py-4">Error while fetching borrow history: ${error.message}</td></tr>`;
    console.error(error);
  }
});
