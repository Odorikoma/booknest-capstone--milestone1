import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const bookGrid = document.getElementById('book-grid');
  const searchInput = document.getElementById('search-input');
  const authorInput = document.getElementById('author-input');
  const searchBtn = document.getElementById('search-btn');

  const fetchBooks = async (title = '', author = '') => {
    try {
      const params = new URLSearchParams();
      if (title) params.append('title', title);
      if (author) params.append('author', author);

      const response = await fetch(`${API_BASE_URL}/api/books?${params.toString()}`);
      const data = await response.json();

      if (!data.success) throw new Error(data.message || 'Failed to fetch books.');

      renderBooks(data.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      bookGrid.innerHTML = `<p class="text-red-500 col-span-full">Failed to load books. ${error.message}</p>`;
    }
  };

  const renderBooks = (books) => {
  bookGrid.innerHTML = '';

  if (!books || books.length === 0) {
    bookGrid.innerHTML = '<p class="col-span-full text-gray-600 text-center">No books found.</p>';
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';

    card.innerHTML = `
      <img src="${book.cover_image_url || 'assets/images/default-cover.jpg'}" alt="${book.title}" class="w-full h-60 object-cover">
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800">${book.title}</h3>
        <p class="text-sm text-gray-600">by ${book.author}</p>
        <p class="mt-2 text-sm text-gray-700">${book.description || ''}</p>
        <p class="mt-2 text-sm text-gray-600">Stock: <span class="font-semibold">${book.stock}</span></p>
        <div class="mt-4 flex justify-between">
          <a href="/borrow.html?id=${book.id}" class="text-indigo-600 hover:underline text-sm font-medium">Borrow</a>
          <a href="/book-detail.html?id=${book.id}" class="text-blue-600 hover:underline text-sm font-medium">Detail</a>
        </div>
      </div>
    `;

    bookGrid.appendChild(card);
  });
};

  // Initial load
  fetchBooks();

  // Search handler
  searchBtn.addEventListener('click', () => {
    const title = searchInput.value.trim();
    const author = authorInput.value.trim();
    fetchBooks(title, author);
  });
});
