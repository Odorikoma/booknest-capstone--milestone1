import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('book-detail-content');
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');

  if (!bookId) {
    container.innerHTML = '<p class="text-red-500">No book ID provided.</p>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to load book details.');
    }

    const book = data.data;

    container.innerHTML = `
      <img src="${book.cover_image_url || 'assets/images/default-cover.jpg'}" alt="${book.title}" class="w-64 h-96 object-cover float-left mr-8 rounded-md shadow-md" />
      <h1 class="text-3xl font-bold mb-4">${book.title}</h1>
      <h2 class="text-xl text-gray-700 mb-4">by ${book.author}</h2>
      <p class="mb-4">${book.description || 'No description available.'}</p>
      <p class="mb-2">Stock: <strong>${book.stock}</strong></p>
      <a href="borrow.html?id=${book.id}" class="inline-block mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-purple-700">Borrow this book</a>
    `;
  } catch (error) {
    container.innerHTML = `<p class="text-red-500">Error loading book: ${error.message}</p>`;
    console.error(error);
  }
});
