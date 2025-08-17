// admin.js - 管理员图书管理功能

window.onload = () => {
  const adminBookList = document.getElementById('admin-book-list');
  const addBookBtn = document.getElementById('add-book-btn');
  const bookModal = document.getElementById('book-modal');
  const modalTitle = document.getElementById('modal-title');
  const bookForm = document.getElementById('book-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const bookIdInput = document.getElementById('book-id');
  const titleInput = document.getElementById('modal-title-input');
  const authorInput = document.getElementById('modal-author-input');
  const descInput = document.getElementById('modal-desc-input');
  const stockInput = document.getElementById('modal-stock-input');
  const priceInput = document.getElementById('modal-price-input');
  const coverUrlInput = document.getElementById('modal-cover-url-input');

  let books = [];

  // 从后端加载图书
  const loadBooks = async () => {
    try {
      const { response, data } = await window.apiRequest(window.CONFIG.BOOK_ENDPOINTS.list);
      
      if (response.ok && data.success) {
        books = data.data;
        renderAdminBooks();
      } else {
        await showError('Failed to load books: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      await showError('Network error while loading books');
    }
  };

  // 渲染表格
  const renderAdminBooks = () => {
    if (!adminBookList) return;
    adminBookList.innerHTML = books.map(book => `
      <tr data-id="${book.id}">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <img src="${book.cover_image_url || window.getDefaultCoverUrl?.() || 'assets/images/default-cover.svg'}" 
                 alt="${book.title}" 
                 class="w-12 h-16 object-cover rounded mr-3"
                 onerror="window.handleImageError?.(this)">
            <span>${book.title}</span>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">${book.author}</td>
        <td class="px-6 py-4 whitespace-nowrap">${book.stock}</td>
        <td class="px-6 py-4 whitespace-nowrap">¥${parseFloat(book.price || 0).toFixed(2)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="text-indigo-600 hover:text-indigo-900 edit-btn">Edit</button>
          <button class="text-red-600 hover:text-red-900 ml-4 delete-btn">Delete</button>
        </td>
      </tr>
    `).join('');
  };

  const openModal = (isEdit = false, book = null) => {
    bookForm.reset();
    if (isEdit && book) {
      modalTitle.textContent = 'Edit Book';
      bookIdInput.value = book.id;
      titleInput.value = book.title;
      authorInput.value = book.author;
      descInput.value = book.description || '';
      stockInput.value = book.stock;
      priceInput.value = parseFloat(book.price || 0);
      if (coverUrlInput) {
        coverUrlInput.value = book.cover_image_url || '';
      }
    } else {
      modalTitle.textContent = 'Add New Book';
      bookIdInput.value = '';
    }
    bookModal.classList.remove('hidden');
  };

  const closeModal = () => {
    bookModal.classList.add('hidden');
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const id = bookIdInput.value;
    const payload = {
      title: titleInput.value,
      author: authorInput.value,
      description: descInput.value,
      stock: parseInt(stockInput.value, 10),
      price: parseFloat(priceInput.value) || 0.0,
      cover_image_url: coverUrlInput?.value || null
    };

    try {
      let url, method;
      if (id) {
        url = window.CONFIG.BOOK_ENDPOINTS.update(id);
        method = 'PUT';
      } else {
        url = window.CONFIG.BOOK_ENDPOINTS.create;
        method = 'POST';
      }

      const { response, data } = await window.apiRequest(url, {
        method: method,
        body: JSON.stringify(payload)
      });

      if (response.ok && data.success) {
        await loadBooks();
        closeModal();
        await showSuccess(id ? 'Book updated successfully!' : 'Book created successfully!');
      } else {
        await showError(data.message || 'Failed to save book');
      }
    } catch (err) {
      console.error('Submit error:', err);
      await showError('Error occurred while saving book');
    }
  };

  const handleBookListClick = async (event) => {
    const target = event.target;
    const row = target.closest('tr');
    if (!row) return;
    const bookId = row.dataset.id;

    if (target.classList.contains('edit-btn')) {
      const bookToEdit = books.find(b => b.id.toString() === bookId);
      openModal(true, bookToEdit);
    }

    if (target.classList.contains('delete-btn')) {
      if (await showConfirm('Are you sure you want to delete this book?', 'Delete Confirmation')) {
        try {
          const { response, data } = await window.apiRequest(
            window.CONFIG.BOOK_ENDPOINTS.delete(bookId),
            { method: 'DELETE' }
          );

          if (response.ok && data.success) {
            await loadBooks();
            await showSuccess('Book deleted successfully!');
          } else {
            await showError(data.message || 'Failed to delete book');
          }
        } catch (err) {
          console.error('Delete error:', err);
          await showError('Error occurred while deleting book');
        }
      }
    }
  };

  // 初始化
  loadBooks();
  if (addBookBtn) addBookBtn.addEventListener('click', () => openModal());
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (bookForm) bookForm.addEventListener('submit', handleFormSubmit);
  if (adminBookList) adminBookList.addEventListener('click', handleBookListClick);
};