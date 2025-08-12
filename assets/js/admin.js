import { API_BASE_URL } from './config.js';

window.onload = () => {
  const adminBookList = document.getElementById('admin-book-list')
  const addBookBtn = document.getElementById('add-book-btn')
  const bookModal = document.getElementById('book-modal')
  const modalTitle = document.getElementById('modal-title')
  const bookForm = document.getElementById('book-form')
  const cancelBtn = document.getElementById('cancel-btn')
  const bookIdInput = document.getElementById('book-id')
  const titleInput = document.getElementById('modal-title-input')
  const authorInput = document.getElementById('modal-author-input')
  const descInput = document.getElementById('modal-desc-input')
  const stockInput = document.getElementById('modal-stock-input')

  let books = []

  // 从后端加载图书
  const loadBooks = async () => {
    try {
      const res = await fetch('${API_BASE_URL}/api/books')
      const data = await res.json()
      if (data.success) {
        books = data.data
        renderAdminBooks()
      } else {
        alert('Failed to load books.')
      }
    } catch (err) {
      console.error('Error fetching books:', err)
    }
  }

  // 渲染表格
  const renderAdminBooks = () => {
    if (!adminBookList) return
    adminBookList.innerHTML = books.map(book => `
      <tr data-id="${book.id}">
        <td class="px-6 py-4 whitespace-nowrap">${book.title}</td>
        <td class="px-6 py-4 whitespace-nowrap">${book.author}</td>
        <td class="px-6 py-4 whitespace-nowrap">${book.stock}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="text-indigo-600 hover:text-indigo-900 edit-btn">Edit</button>
          <button class="text-red-600 hover:text-red-900 ml-4 delete-btn">Delete</button>
        </td>
      </tr>
    `).join('')
  }

  const openModal = (isEdit = false, book = null) => {
    bookForm.reset()
    if (isEdit && book) {
      modalTitle.textContent = 'Edit Book'
      bookIdInput.value = book.id
      titleInput.value = book.title
      authorInput.value = book.author
      descInput.value = book.description
      stockInput.value = book.stock
    } else {
      modalTitle.textContent = 'Add New Book'
      bookIdInput.value = ''
    }
    bookModal.classList.remove('hidden')
  }

  const closeModal = () => {
    bookModal.classList.add('hidden')
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    const id = bookIdInput.value
    const payload = {
      title: titleInput.value,
      author: authorInput.value,
      description: descInput.value,
      stock: parseInt(stockInput.value, 10),
      cover_image_url: 'assets/images/cover-placeholder.jpg'
    }

    try {
      let response
      if (id) {
        response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('${API_BASE_URL}/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const result = await response.json()
      if (result.success) {
        await loadBooks()
        closeModal()
      } else {
        alert(result.message || 'Failed to save book')
      }
    } catch (err) {
      console.error('Submit error:', err)
      alert('Error saving book.')
    }
  }

  const handleBookListClick = async (event) => {
    const target = event.target
    const row = target.closest('tr')
    if (!row) return
    const bookId = row.dataset.id

    if (target.classList.contains('edit-btn')) {
      const bookToEdit = books.find(b => b.id.toString() === bookId)
      openModal(true, bookToEdit)
    }

    if (target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this book?')) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, { method: 'DELETE' })
          const result = await response.json()
          if (result.success) {
            await loadBooks()
          } else {
            alert(result.message || 'Failed to delete')
          }
        } catch (err) {
          console.error('Delete error:', err)
          alert('Error deleting book.')
        }
      }
    }
  }

  // 初始化
  loadBooks()
  if (addBookBtn) addBookBtn.addEventListener('click', () => openModal())
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal)
  if (bookForm) bookForm.addEventListener('submit', handleFormSubmit)
  if (adminBookList) adminBookList.addEventListener('click', handleBookListClick)
}
