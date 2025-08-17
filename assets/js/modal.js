// 自定义弹窗模块
class CustomModal {
    constructor() {
        this.currentModal = null;
        this.init();
    }

    // 初始化弹窗HTML结构
    init() {
        // 如果已存在弹窗，不重复创建
        if (document.getElementById('customModal')) {
            return;
        }

        const modalHTML = `
            <div id="customModal" class="custom-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-icon" id="modalIcon"></div>
                        <h3 class="modal-title" id="modalTitle"></h3>
                    </div>
                    <div class="modal-message" id="modalMessage"></div>
                    <div class="modal-actions" id="modalActions"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 点击背景关闭弹窗
        document.getElementById('customModal').addEventListener('click', (e) => {
            if (e.target.id === 'customModal') {
                this.close();
            }
        });

        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
    }

    // 显示弹窗
    show(options) {
        const {
            title = '提示',
            message = '',
            type = 'info', // info, warning, error, success
            buttons = [{ text: '确定', class: 'modal-btn-primary', callback: () => this.close() }]
        } = options;

        this.currentModal = options;

        const modal = document.getElementById('customModal');
        const icon = document.getElementById('modalIcon');
        const titleEl = document.getElementById('modalTitle');
        const messageEl = document.getElementById('modalMessage');
        const actionsEl = document.getElementById('modalActions');

        // 设置图标
        const icons = {
            info: '💬',
            warning: '⚠️',
            error: '❌',
            success: '✅'
        };

        icon.textContent = icons[type] || icons.info;
        icon.className = `modal-icon ${type}`;

        // 设置标题和消息
        titleEl.textContent = title;
        messageEl.textContent = message;

        // 清空并创建按钮
        actionsEl.innerHTML = '';
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.textContent = button.text;
            btn.className = `modal-btn ${button.class || 'modal-btn-secondary'}`;
            btn.onclick = () => {
                if (button.callback) {
                    button.callback();
                } else {
                    this.close();
                }
            };
            actionsEl.appendChild(btn);
        });

        // 显示弹窗
        modal.classList.add('show');
        
        // 聚焦到第一个按钮
        setTimeout(() => {
            const firstBtn = actionsEl.querySelector('.modal-btn');
            if (firstBtn) {
                firstBtn.focus();
            }
        }, 100);
    }

    // 关闭弹窗
    close() {
        const modal = document.getElementById('customModal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.currentModal = null;
    }

    // Alert替代函数
    showAlert(message, type = 'info', title = '提示') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type,
                buttons: [{
                    text: '确定',
                    class: 'modal-btn-primary',
                    callback: () => {
                        this.close();
                        resolve();
                    }
                }]
            });
        });
    }

    // Confirm替代函数
    showConfirm(message, title = 'Confirm', options = {}) {
        const {
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'warning'
        } = options;

        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type,
                buttons: [
                    {
                        text: cancelText,
                        class: 'modal-btn-secondary',
                        callback: () => {
                            this.close();
                            resolve(false);
                        }
                    },
                    {
                        text: confirmText,
                        class: 'modal-btn-primary',
                        callback: () => {
                            this.close();
                            resolve(true);
                        }
                    }
                ]
            });
        });
    }

    // 成功提示
    showSuccess(message, title = '成功') {
        return this.showAlert(message, 'success', title);
    }

    // 错误提示
    showError(message, title = '错误') {
        return this.showAlert(message, 'error', title);
    }

    // 警告提示
    showWarning(message, title = '警告') {
        return this.showAlert(message, 'warning', title);
    }
}

// 创建全局实例
const customModal = new CustomModal();

// 全局函数，替代原生alert和confirm
window.showAlert = (message, type, title) => customModal.showAlert(message, type, title);
window.showConfirm = (message, title, options) => customModal.showConfirm(message, title, options);
window.showSuccess = (message, title) => customModal.showSuccess(message, title);
window.showError = (message, title) => customModal.showError(message, title);
window.showWarning = (message, title) => customModal.showWarning(message, title);

// 兼容性：重写原生函数（可选）
window.customAlert = window.alert;
window.customConfirm = window.confirm;

// If you need to completely replace native functions, uncomment the code below
/*
window.alert = (message) => customModal.showAlert(message);
window.confirm = (message) => customModal.showConfirm(message);
*/
