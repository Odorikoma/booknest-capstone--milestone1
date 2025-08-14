// assets/js/detail.js
import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('book-detail-content');

  // 获取 URL 参数 id
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');

  if (!bookId) {
    container.innerHTML = `<p class="text-red-500">Error: Missing book ID in URL.</p>`;
    return;
  }

  try {
    // 请求后端获取书籍详情
    const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`);
    const data = await response.json();

    if (!data.success) throw new Error(data.message || 'Failed to fetch book details.');

    const book = data.data;

    console.log('Book detail data:', book);

    // 渲染书籍详情
    container.innerHTML = `
      <div class="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
        <img src="${book.cover_image_url || 'assets/images/default-cover.jpg'}" alt="${book.title}" class="w-full md:w-64 h-80 object-cover rounded-md shadow-md">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2">${book.title}</h1>
          <p class="text-gray-600 mb-4">by ${book.author}</p>
          <p class="text-gray-700 mb-4">${book.description || 'No description available.'}</p>
          <p class="text-gray-600 mb-4">Stock: <span class="font-semibold">${book.stock}</span></p>
          <div class="flex space-x-4">
            <a href="borrow.html?id=${book.id}" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Borrow</a>
            <a href="index.html" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">Back</a>
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Error fetching book details:', err);
    container.innerHTML = `<p class="text-red-500">Failed to load book details. ${err.message}</p>`;
  }
});
