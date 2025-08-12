import { API_BASE_URL } from './config.js';

window.onload = () => {
  const borrowForm = document.getElementById('borrow-form');
  const bookTitleInput = document.getElementById('book-title');
  const formFeedback = document.getElementById('form-feedback');

  // 从localStorage读取登录用户信息
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Please login first to borrow books.');
    window.location.href = 'account.html';
    return;
  }

  // 解析URL参数
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // 请求后端接口，获取书籍详情并显示书名
  const fetchBookTitle = async (bookId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`);
      const result = await response.json();
      if (result.success && result.data) {
        bookTitleInput.value = result.data.title;
      } else {
        bookTitleInput.value = 'Book not found';
      }
    } catch (err) {
      console.error('Failed to fetch book title:', err);
      bookTitleInput.value = 'Error loading book title';
    }
  };

  // 处理表单提交
  const handleBorrowSubmit = async (event) => {
    event.preventDefault();

    const bookId = getQueryParam('id');
    if (!bookId) {
      formFeedback.textContent = "Missing book ID.";
      formFeedback.classList.remove('text-green-600');
      formFeedback.classList.add('text-red-600');
      return;
    }

    const borrowDate = new Date().toISOString().slice(0, 10);

    try {
      const response = await fetch('${API_BASE_URL}/api/borrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          book_id: bookId,
          borrow_date: borrowDate
        })
      });

      const result = await response.json();

      if (result.success) {
        formFeedback.textContent = 'Your application has been submitted successfully!';
        formFeedback.classList.remove('text-red-600');
        formFeedback.classList.add('text-green-600');
        borrowForm.reset();
      } else {
        formFeedback.textContent = result.message || 'Failed to submit borrow request.';
        formFeedback.classList.remove('text-green-600');
        formFeedback.classList.add('text-red-600');
      }
    } catch (error) {
      formFeedback.textContent = 'Network error, please try again later.';
      formFeedback.classList.remove('text-green-600');
      formFeedback.classList.add('text-red-600');
      console.error('Borrow submit error:', error);
    }
  };

  // 主流程
  const bookId = getQueryParam('id');
  if (bookId) {
    fetchBookTitle(bookId);
  } else {
    bookTitleInput.value = 'No book ID provided';
  }

  if (borrowForm) {
    borrowForm.addEventListener('submit', handleBorrowSubmit);
  }
};
