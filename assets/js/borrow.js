// borrow.js - 借阅申请页面功能

window.onload = async () => {
  const borrowForm = document.getElementById('borrow-form');
  const bookTitleInput = document.getElementById('book-title');
  const formFeedback = document.getElementById('form-feedback');

  // 从localStorage读取登录用户信息
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    await showError('Please login first to borrow books');
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
      const { response, data } = await window.apiRequest(
        window.CONFIG.BOOK_ENDPOINTS.detail(bookId)
      );
      
      if (response.ok && data.success && data.data) {
        bookTitleInput.value = data.data.title;
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
      console.log('=== 借阅表单提交 ===');
      
      const borrowData = {
        book_id: parseInt(bookId)
      };
      
      console.log('借阅数据:', borrowData);
      
      const result = await window.apiRequest(
        window.CONFIG.BORROW_ENDPOINTS.create,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(borrowData)
        }
      );

      console.log('借阅表单请求结果:', result);

      if (result && result.data && result.data.success) {
        formFeedback.textContent = 'Borrow request submitted successfully! Please wait for admin approval.';
        formFeedback.classList.remove('text-red-600');
        formFeedback.classList.add('text-green-600');
        borrowForm.reset();
        
        // 3秒后跳转回首页
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 3000);
      } else {
        const errorMsg = result?.data?.message || 'Failed to submit borrow request';
        formFeedback.textContent = errorMsg;
        formFeedback.classList.remove('text-green-600');
        formFeedback.classList.add('text-red-600');
      }
    } catch (error) {
      formFeedback.textContent = 'Network error, please try again later';
      formFeedback.classList.remove('text-green-600');
      formFeedback.classList.add('text-red-600');
      console.error('借阅提交异常:', error);
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