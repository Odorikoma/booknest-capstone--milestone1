import { API_BASE_URL } from './config.js';


window.onload = () => {
  // ---- DOM ----
  const bookGrid   = document.getElementById('book-grid');
  const searchInput = document.getElementById('search-input');
  const authorInput = document.getElementById('author-input');
  const searchBtn   = document.getElementById('search-btn');

  // 页面错误提示（如果你有单独的容器，也可以替换为那个元素）
  const showError = (msg) => {
    // 简单方式：在列表上方插入一条错误信息
    console.error(msg);
    const id = 'book-error-msg';
    let bar = document.getElementById(id);
    if (!bar) {
      bar = document.createElement('div');
      bar.id = id;
      bar.style.color = '#d32f2f';
      bar.style.margin = '12px 0';
      bookGrid?.parentElement?.insertBefore(bar, bookGrid);
    }
    bar.textContent = msg;
  };

  // 全量数据放这里
  let allBooks = [];

  // ---- 渲染一条书卡 ----
  const createBookCard = (book) => `
    <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
      <img src="${book.cover || ''}" alt="Cover of ${book.title || ''}" class="w-full h-64 object-cover">
      <div class="p-4">
        <h3 class="text-xl font-bold text-gray-800">${book.title || ''}</h3>
        <p class="text-gray-600">by ${book.author || ''}</p>
        <div class="mt-4 flex justify-between items-center">
          <span class="text-sm font-semibold ${Number(book.stock) > 0 ? 'text-green-600' : 'text-red-600'}">
            ${Number(book.stock) > 0 ? `${book.stock} in stock` : 'Out of stock'}
          </span>
          <a href="book-detail.html?id=${encodeURIComponent(book.id)}" class="text-primary hover:underline">
            View Details
          </a>
        </div>
      </div>
    </div>
  `;

  // ---- 渲染列表 ----
  const renderBooks = (list) => {
    if (!bookGrid) return;
    if (!list || list.length === 0) {
      bookGrid.innerHTML = `
        <div class="text-gray-500 col-span-full text-center py-8">
          No books found.
        </div>`;
      return;
    }
    bookGrid.innerHTML = list.map(createBookCard).join('');
  };

  // ---- 过滤逻辑（标题 + 作者，大小写不敏感）----
  const filterBooks = () => {
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const authorTerm = (authorInput?.value || '').toLowerCase();

    const filtered = allBooks.filter((b) => {
      const titleOk  = (b.title  || '').toLowerCase().includes(searchTerm);
      const authorOk = (b.author || '').toLowerCase().includes(authorTerm);
      return titleOk && authorOk;
    });

    renderBooks(filtered);
  };

  // ---- 拉取后端数据 ----
  const loadBooks = async () => {
    try {
      // 注意这里使用 /api 前缀，部署时会被替换成完整后端地址
      const res = await fetch(`${API_BASE_URL}/api/books`, {
        credentials: 'include'  // 如果你的后端需要 cookie，可保留；否则可以去掉
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      // 兼容两种返回结构：{ success, data } 或直接数组
      const payload = await res.json();
      allBooks = Array.isArray(payload) ? payload : (payload.data || []);
      renderBooks(allBooks);
    } catch (err) {
      showError('Failed to load books. Failed to fetch');
      console.error(err);
      // 防止页面空白
      renderBooks([]);
    }
  };

  // ---- 事件绑定 ----
  if (searchBtn)    searchBtn.addEventListener('click', filterBooks);
  if (searchInput)  searchInput.addEventListener('input', filterBooks);
  if (authorInput)  authorInput.addEventListener('input', filterBooks);

  // 首次加载
  loadBooks();
};
