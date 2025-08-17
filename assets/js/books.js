// books.js - 图书管理功能

document.addEventListener('DOMContentLoaded', () => {
    const booksContainer = document.getElementById('book-grid');
    const searchInput = document.getElementById('search-input');
    const authorInput = document.getElementById('author-input');
    const searchButton = document.getElementById('search-btn');

    // 加载图书列表
    const loadBooks = async (searchParams = {}) => {
        try {
            window.showLoading?.(booksContainer);

            const url = new URL(window.CONFIG.BOOK_ENDPOINTS.list);
            if (searchParams.title) {
                url.searchParams.append('title', searchParams.title);
            }
            if (searchParams.author) {
                url.searchParams.append('author', searchParams.author);
            }

            const { response, data } = await window.apiRequest(url.toString());

            if (response.ok && data.success) {
                displayBooks(data.data);
            } else {
                window.showError?.(booksContainer, data.message || 'Failed to load books');
            }
        } catch (error) {
            console.error('Error loading books:', error);
            window.showError?.(booksContainer, 'Network error while loading books');
        }
    };

    // 显示图书列表
    const displayBooks = (books) => {
        if (!books || books.length === 0) {
            booksContainer.innerHTML = '<div class="text-center text-gray-500">No books found</div>';
            return;
        }

        const booksHTML = books.map(book => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img src="${book.cover_image_url || window.getDefaultCoverUrl?.() || 'assets/images/default-cover.svg'}" 
                     alt="${book.title}" 
                     class="w-full h-48 object-cover"
                     onerror="window.handleImageError?.(this)">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${book.title}</h3>
                    <p class="text-gray-600 mb-1">Author: ${book.author}</p>
                    <p class="text-gray-600 mb-2">Stock: ${book.stock}</p>
                    <p class="text-gray-700 text-sm mb-3">${book.description || 'No description available'}</p>
                    <div class="flex justify-between items-center">
                        <a href="book-detail.html?id=${book.id}" 
                           class="bg-primary text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                            View Details
                        </a>
                        ${window.isLoggedIn?.() && !window.isAdmin?.() ? 
                            `<button onclick="borrowBook(${book.id})" 
                                     class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                                     ${book.stock <= 0 ? 'disabled' : ''}>
                                ${book.stock <= 0 ? 'Out of Stock' : 'Borrow'}
                             </button>` : ''
                        }
                    </div>
                </div>
            </div>
        `).join('');

        booksContainer.innerHTML = booksHTML;
    };

    // 搜索功能
    const performSearch = () => {
        const titleTerm = searchInput?.value.trim();
        const authorTerm = authorInput?.value.trim();
        
        const searchParams = {};
        if (titleTerm) {
            searchParams.title = titleTerm;
        }
        if (authorTerm) {
            searchParams.author = authorTerm;
        }
        
        loadBooks(searchParams);
    };

    // 借阅图书 - 重写版本
    window.borrowBook = async (bookId) => {
        console.log('\n=== 图书列表借阅请求开始 ===');
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
                loadBooks(); // 重新加载图书列表更新库存
            } else {
                const errorMsg = result?.data?.message || 'Borrow request failed';
                await showError('Borrow failed: ' + errorMsg);
            }
        } catch (error) {
            console.error('借阅请求异常:', error);
            await showError('Network error, please check connection and try again');
        }
    };

    // 绑定事件
    searchButton?.addEventListener('click', performSearch);
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    authorInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 初始加载
    loadBooks();
});