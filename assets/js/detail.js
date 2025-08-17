// detail.js - 图书详情页面功能

document.addEventListener('DOMContentLoaded', () => {
    const bookDetailContainer = document.getElementById('book-detail-content');

    // 从URL获取图书ID
    const getBookIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    };

    // 加载图书详情
    const loadBookDetail = async (bookId) => {
        try {
            window.showLoading?.(bookDetailContainer);

            const { response, data } = await window.apiRequest(
                window.CONFIG.BOOK_ENDPOINTS.detail(bookId)
            );

            if (response.ok && data.success) {
                displayBookDetail(data.data);
            } else {
                window.showError?.(bookDetailContainer, data.message || 'Failed to load book details');
            }
        } catch (error) {
            console.error('Error loading book detail:', error);
            window.showError?.(bookDetailContainer, 'Network error while loading book details');
        }
    };

    // 显示图书详情
    const displayBookDetail = (book) => {
        const detailHTML = `
            <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="md:flex">
                    <div class="md:w-1/3">
                        <img src="${book.cover_image_url || window.getDefaultCoverUrl?.() || 'assets/images/default-cover.svg'}" 
                             alt="${book.title}" 
                             class="w-full h-96 object-cover"
                             onerror="window.handleImageError?.(this)">
                    </div>
                    <div class="md:w-2/3 p-8">
                        <h1 class="text-3xl font-bold text-gray-800 mb-4">${book.title}</h1>
                        <p class="text-xl text-gray-600 mb-2">By ${book.author}</p>
                        <p class="text-lg text-gray-700 mb-4">Stock: <span class="font-semibold ${book.stock <= 0 ? 'text-red-500' : 'text-green-600'}">${book.stock}</span></p>
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                            <p class="text-gray-700 leading-relaxed">${book.description || 'No description available'}</p>
                        </div>
                        <div class="flex space-x-4">
                            <a href="index.html" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors">
                                Back to Books
                            </a>
                            ${window.isLoggedIn?.() && !window.isAdmin?.() ? 
                                `<button onclick="borrowBook(${book.id})" 
                                         class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
                                         ${book.stock <= 0 ? 'disabled' : ''}>
                                    ${book.stock <= 0 ? 'Out of Stock' : 'Borrow This Book'}
                                 </button>` : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        bookDetailContainer.innerHTML = detailHTML;
    };

    // 借阅图书功能 - 重写版本
    window.borrowBook = async (bookId) => {
        console.log('\n=== 前端借阅请求开始 ===');
        console.log('图书ID:', bookId);
        
        // 检查登录状态
        if (!window.isLoggedIn?.()) {
            await showError('Please login first to borrow books');
            window.location.href = 'account.html';
            return;
        }

        const user = window.getCurrentUser?.();
        if (!user || !user.id) {
            await showError('Failed to get user information, please login again');
            window.location.href = 'account.html';
            return;
        }

        console.log('当前用户:', user);

        // Confirm operation
        const confirmed = await showConfirm('Are you sure you want to borrow this book?', 'Borrow Confirmation');
        if (!confirmed) {
            return;
        }

        try {
            // 简化的请求数据 - 只发送book_id
            const borrowData = {
                book_id: parseInt(bookId)
            };

            console.log('发送借阅数据:', borrowData);

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

            console.log('借阅请求结果:', result);

            if (result && result.data && result.data.success) {
                await showSuccess('Borrow request submitted successfully! Please wait for admin approval.');
                // 重新加载详情页面以更新库存
                loadBookDetail(bookId);
            } else {
                const errorMsg = result?.data?.message || 'Borrow request failed';
                await showError('Borrow failed: ' + errorMsg);
            }
        } catch (error) {
            console.error('借阅请求异常:', error);
            await showError('Network error, please check connection and try again');
        }
    };

    // 初始化页面
    const bookId = getBookIdFromUrl();
    if (bookId) {
        loadBookDetail(bookId);
    } else {
        window.showError?.(bookDetailContainer, 'Book ID not found in URL');
    }
});