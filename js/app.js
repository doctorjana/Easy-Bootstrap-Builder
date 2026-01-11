/**
 * Bootstrap Builder - Main Application
 */

class BootstrapBuilder {
    constructor() {
        // DOM Elements
        this.canvas = document.getElementById('canvas');
        this.canvasPlaceholder = document.getElementById('canvasPlaceholder');
        this.componentsList = document.getElementById('componentsList');
        this.codePreview = document.getElementById('codePreview');
        this.componentCount = document.getElementById('componentCount');
        this.searchInput = document.getElementById('searchComponents');

        // Buttons
        this.btnUndo = document.getElementById('btnUndo');
        this.btnRedo = document.getElementById('btnRedo');
        this.btnClear = document.getElementById('btnClear');
        this.btnPreview = document.getElementById('btnPreview');
        this.btnDownload = document.getElementById('btnDownload');
        this.btnCopyCode = document.getElementById('btnCopyCode');
        this.themeSelect = document.getElementById('themeSelect');

        // Context Menu
        this.contextMenu = document.getElementById('contextMenu');

        // State
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.selectedComponent = null;
        this.componentCounter = 0;
        this.currentTheme = 'default';
        this.activePremadeTab = 'all';

        // Managers
        this.codeGenerator = new CodeGenerator();
        this.dragDropManager = new DragDropManager(
            this.canvas,
            (componentId) => this.addComponent(componentId),
            () => this.onReorder()
        );

        // UI State
        this.panels = {
            sidebar: localStorage.getItem('panel-sidebar') !== 'hidden',
            properties: localStorage.getItem('panel-properties') !== 'hidden',
            code: localStorage.getItem('panel-code') !== 'hidden'
        };

        this.init();
    }

    init() {
        this.renderComponentsList();
        this.setupEventListeners();
        this.applyInitialLayout();
        this.updateCodePreview();
        this.saveState();
    }

    // Render component categories and items in sidebar
    renderComponentsList() {
        this.componentsList.innerHTML = '';

        Object.entries(COMPONENTS).forEach(([categoryId, category]) => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'component-category';

            let headerHTML = `
                <div class="category-header" data-category="${categoryId}">
                    <i class="bi ${category.icon}"></i>
                    <span>${category.name}</span>
                </div>
            `;

            // Add tabs if category is tabbed
            if (category.isTabbed && category.tabs) {
                let tabsHTML = `<div class="category-tabs">`;
                category.tabs.forEach(tab => {
                    const isActive = this.activePremadeTab === tab.id;
                    tabsHTML += `
                        <div class="category-tab ${isActive ? 'active' : ''}" data-tab="${tab.id}">
                            <i class="bi ${tab.icon}"></i>
                            ${tab.name}
                        </div>
                    `;
                });
                tabsHTML += `</div>`;
                headerHTML += tabsHTML;
            }

            categoryEl.innerHTML = `
                ${headerHTML}
                <div class="category-items" id="category-${categoryId}"></div>
            `;

            const itemsContainer = categoryEl.querySelector('.category-items');

            // Setup tab listeners
            if (category.isTabbed) {
                categoryEl.querySelectorAll('.category-tab').forEach(tabBtn => {
                    tabBtn.addEventListener('click', (e) => {
                        this.activePremadeTab = e.currentTarget.dataset.tab;
                        this.renderComponentsList();
                    });
                });
            }

            category.items.forEach(item => {
                // Filter by tab if category is tabbed
                if (category.isTabbed && this.activePremadeTab !== 'all' && item.tab !== this.activePremadeTab) {
                    return;
                }

                const itemEl = document.createElement('div');
                itemEl.className = 'component-item';
                itemEl.innerHTML = `
                    <i class="bi ${item.icon}"></i>
                    <span>${item.name}</span>
                `;

                // Setup drag functionality
                this.dragDropManager.setupComponentItem(itemEl, item.id);

                // Double-click to add
                itemEl.addEventListener('dblclick', () => this.addComponent(item.id));

                itemsContainer.appendChild(itemEl);
            });

            this.componentsList.appendChild(categoryEl);
        });
    }

    setupEventListeners() {
        console.log('Setting up robust event listeners...');

        // Use individual listeners but add logging for debugging
        if (this.btnUndo) this.btnUndo.addEventListener('click', () => this.undo());
        if (this.btnRedo) this.btnRedo.addEventListener('click', () => this.redo());

        // Robust delegation for Clear button (handles both button and icon clicks)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btnClear')) {
                e.preventDefault();
                this.clearCanvas();
            }
        });

        if (this.btnPreview) this.btnPreview.addEventListener('click', () => this.showPreview());
        if (this.btnDownload) this.btnDownload.addEventListener('click', () => this.downloadHTML());
        if (this.btnCopyCode) this.btnCopyCode.addEventListener('click', () => this.copyCode());

        // Clear Canvas Confirmation
        const confirmClearBtn = document.getElementById('confirmClearBtn');
        if (confirmClearBtn) {
            confirmClearBtn.addEventListener('click', () => {
                this.executeClearCanvas();
                const modal = bootstrap.Modal.getInstance(document.getElementById('clearCanvasModal'));
                if (modal) modal.hide();
            });
        }

        // Theme selection
        this.themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));

        // Search
        this.searchInput.addEventListener('input', (e) => this.filterComponents(e.target.value));

        // Canvas click to deselect
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas || e.target === this.canvasPlaceholder) {
                this.deselectAll();
            }
        });

        // Context menu
        document.addEventListener('click', () => this.hideContextMenu());
        this.contextMenu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleContextAction(action);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Layout Toggles
        document.getElementById('toggleSidebar')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePanel('sidebar');
        });
        document.getElementById('toggleProperties')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePanel('properties');
        });
        document.getElementById('toggleCode')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePanel('code');
        });
        document.getElementById('btnResetLayout')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.resetLayout();
        });
    }

    // Apply layout state on boot
    applyInitialLayout() {
        if (!this.panels.sidebar) document.getElementById('componentsSidebar')?.classList.add('panel-hidden');
        if (!this.panels.properties) document.getElementById('propertiesPanel')?.classList.add('panel-hidden');
        if (!this.panels.code) document.getElementById('codePanel')?.classList.add('panel-hidden');
        this.updateViewControls();
    }

    // Toggle a layout panel
    togglePanel(type) {
        const panels = {
            sidebar: 'componentsSidebar',
            properties: 'propertiesPanel',
            code: 'codePanel'
        };

        const id = panels[type];
        const el = document.getElementById(id);
        if (!el) return;

        const isHidden = el.classList.contains('panel-hidden');
        if (isHidden) {
            el.classList.remove('panel-hidden');
            this.panels[type] = true;
            localStorage.setItem(`panel-${type}`, 'visible');
        } else {
            el.classList.add('panel-hidden');
            this.panels[type] = false;
            localStorage.setItem(`panel-${type}`, 'hidden');
        }

        this.updateViewControls();

        // Show feedback
        const action = !isHidden ? 'Hidden' : 'Showed';
        const name = type.charAt(0).toUpperCase() + type.slice(1);
        window.toast?.info(`${name} panel ${action.toLowerCase()}`);
    }

    // Update check icons in View menu
    updateViewControls() {
        const types = ['sidebar', 'properties', 'code'];
        types.forEach(type => {
            const statusIcon = document.getElementById(`${type}Status`);
            if (statusIcon) {
                if (this.panels[type]) {
                    statusIcon.classList.remove('hidden');
                } else {
                    statusIcon.classList.add('hidden');
                }
            }
        });
    }

    // Reset layout to default
    resetLayout() {
        const panels = {
            sidebar: 'componentsSidebar',
            properties: 'propertiesPanel',
            code: 'codePanel'
        };

        Object.values(panels).forEach(id => {
            document.getElementById(id)?.classList.remove('panel-hidden');
        });

        this.panels = { sidebar: true, properties: true, code: true };
        localStorage.setItem('panel-sidebar', 'visible');
        localStorage.setItem('panel-properties', 'visible');
        localStorage.setItem('panel-code', 'visible');

        this.updateViewControls();
        window.toast?.success('Layout reset to default');
    }

    // Find component definition by ID
    findComponent(componentId) {
        for (const category of Object.values(COMPONENTS)) {
            const item = category.items.find(i => i.id === componentId);
            if (item) return item;
        }
        return null;
    }

    // Add component to canvas
    addComponent(componentId) {
        const component = this.findComponent(componentId);
        if (!component) return;

        // Hide placeholder
        this.canvasPlaceholder.classList.add('hidden');

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'canvas-component slide-in';
        wrapper.dataset.id = `comp-${++this.componentCounter}`;
        wrapper.dataset.type = componentId;

        // Add action buttons
        wrapper.innerHTML = `
            <div class="component-actions">
                <button class="component-action-btn" data-action="moveUp" title="Move Up">
                    <i class="bi bi-arrow-up"></i>
                </button>
                <button class="component-action-btn" data-action="moveDown" title="Move Down">
                    <i class="bi bi-arrow-down"></i>
                </button>
                <button class="component-action-btn" data-action="duplicate" title="Duplicate">
                    <i class="bi bi-copy"></i>
                </button>
                <button class="component-action-btn delete" data-action="delete" title="Delete">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
            <div class="component-content">${component.html}</div>
        `;

        // Event listeners
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(wrapper);
        });

        wrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.selectComponent(wrapper);
            this.showContextMenu(e.clientX, e.clientY);
        });

        // Action button handlers
        wrapper.querySelectorAll('.component-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                this.selectComponent(wrapper);
                this.handleContextAction(action);
            });
        });

        // Setup for reordering
        this.dragDropManager.setupCanvasComponent(wrapper);

        // Add to canvas
        this.canvas.appendChild(wrapper);

        // Make text editable
        if (window.inlineEditor) {
            window.inlineEditor.makeEditable(wrapper);
        }

        // Update
        this.updateComponentCount();
        this.updateCodePreview();
        this.saveState();
    }

    // Select a component
    selectComponent(element) {
        this.deselectAll();
        element.classList.add('selected');
        this.selectedComponent = element;

        // Show properties panel
        if (window.inlineEditor) {
            window.inlineEditor.showProperties(element);
        }
    }

    // Deselect all components
    deselectAll() {
        document.querySelectorAll('.canvas-component.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.selectedComponent = null;
        this.hideContextMenu();

        // Hide properties panel
        if (window.inlineEditor) {
            window.inlineEditor.hideProperties();
        }
    }

    // Delete selected component
    deleteComponent(component) {
        if (!component) return;

        component.classList.add('fade-out');
        setTimeout(() => {
            component.remove();
            this.selectedComponent = null;
            this.updateComponentCount();
            this.updateCodePreview();
            this.saveState();

            // Show placeholder if empty
            if (this.canvas.querySelectorAll('.canvas-component').length === 0) {
                this.canvasPlaceholder.classList.remove('hidden');
            }
        }, 150);
    }

    // Duplicate component
    duplicateComponent(component) {
        if (!component) return;

        const clone = component.cloneNode(true);
        clone.dataset.id = `comp-${++this.componentCounter}`;
        clone.classList.remove('selected');
        clone.classList.add('slide-in');

        // Re-attach event listeners
        clone.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(clone);
        });

        clone.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.selectComponent(clone);
            this.showContextMenu(e.clientX, e.clientY);
        });

        clone.querySelectorAll('.component-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                this.selectComponent(clone);
                this.handleContextAction(action);
            });
        });

        this.dragDropManager.setupCanvasComponent(clone);

        // Insert after original
        component.after(clone);

        this.updateComponentCount();
        this.updateCodePreview();
        this.saveState();
    }

    // Move component up/down
    moveComponent(component, direction) {
        if (!component) return;

        if (direction === 'up' && component.previousElementSibling?.classList.contains('canvas-component')) {
            component.previousElementSibling.before(component);
            window.toast?.info('Moved component up');
        } else if (direction === 'down' && component.nextElementSibling?.classList.contains('canvas-component')) {
            component.nextElementSibling.after(component);
            window.toast?.info('Moved component down');
        }

        this.updateCodePreview();
        this.saveState();
    }

    // Context menu handlers
    showContextMenu(x, y) {
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.add('visible');
    }

    hideContextMenu() {
        this.contextMenu.classList.remove('visible');
    }

    handleContextAction(action) {
        if (!this.selectedComponent) return;

        switch (action) {
            case 'duplicate':
                this.duplicateComponent(this.selectedComponent);
                break;
            case 'moveUp':
                this.moveComponent(this.selectedComponent, 'up');
                break;
            case 'moveDown':
                this.moveComponent(this.selectedComponent, 'down');
                break;
            case 'delete':
                this.deleteComponent(this.selectedComponent);
                break;
            case 'addColumn':
                if (window.inlineEditor) {
                    window.inlineEditor.addColumn();
                }
                break;
        }

        this.hideContextMenu();
    }

    // Clear canvas - trigger confirmation modal
    clearCanvas() {
        console.log('clearCanvas() called - checking for components');

        const hasComponents = this.canvas.querySelector('.canvas-component, .nested-component');

        if (!hasComponents) {
            console.log('No components found to clear');
            if (window.toast) window.toast.info('Canvas is already empty');
            return;
        }

        // Show custom Bootstrap modal
        const clearModal = new bootstrap.Modal(document.getElementById('clearCanvasModal'));
        clearModal.show();
    }

    // Actual execution of clearing logic
    executeClearCanvas() {
        try {
            console.log('Executing clear canvas...');

            // Store placeholder reference
            const placeholder = this.canvasPlaceholder;

            // Clear entire canvas content
            this.canvas.innerHTML = '';

            // Re-add placeholder
            if (placeholder) {
                this.canvas.appendChild(placeholder);
                placeholder.classList.remove('hidden');
            }

            // Reset state
            this.selectedComponent = null;
            this.componentCounter = 0;

            if (window.inlineEditor) {
                window.inlineEditor.hideProperties();
            }

            // Update UI and state
            this.updateComponentCount();
            this.updateCodePreview();
            this.saveState();

            if (window.toast) {
                window.toast.success('Canvas Cleared', 'Successfully removed all components');
            }
            console.log('Canvas cleared successfully');
        } catch (error) {
            console.error('Error during executeClearCanvas:', error);
        }
    }

    // Update component count display
    updateComponentCount() {
        const count = this.canvas.querySelectorAll('.canvas-component').length;
        this.componentCount.textContent = `${count} component${count !== 1 ? 's' : ''}`;
    }

    // Update code preview panel
    updateCodePreview() {
        const html = this.codeGenerator.extractCanvasHTML(this.canvas);
        const fullHTML = this.codeGenerator.generateFullHTML(html, this.currentTheme);
        const highlighted = this.codeGenerator.generatePreviewHTML(fullHTML);
        this.codePreview.innerHTML = highlighted;
    }

    // Reorder callback
    onReorder() {
        this.updateCodePreview();
        this.saveState();
    }

    // Filter components by search
    filterComponents(query) {
        query = query.toLowerCase();

        document.querySelectorAll('.component-item').forEach(item => {
            const name = item.querySelector('span').textContent.toLowerCase();
            item.style.display = name.includes(query) ? '' : 'none';
        });

        // Hide empty categories
        document.querySelectorAll('.component-category').forEach(category => {
            const visibleItems = category.querySelectorAll('.component-item:not([style*="display: none"])');
            category.style.display = visibleItems.length > 0 ? '' : 'none';
        });
    }

    // Undo/Redo
    saveState() {
        const state = this.canvas.innerHTML;

        // Remove states after current index
        this.history = this.history.slice(0, this.historyIndex + 1);

        // Add new state
        this.history.push(state);

        // Limit history
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
        }
    }

    restoreState(state) {
        this.canvas.innerHTML = state;

        // Re-attach event listeners to components
        this.canvas.querySelectorAll('.canvas-component').forEach(wrapper => {
            wrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectComponent(wrapper);
            });

            wrapper.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.selectComponent(wrapper);
                this.showContextMenu(e.clientX, e.clientY);
            });

            wrapper.querySelectorAll('.component-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    this.selectComponent(wrapper);
                    this.handleContextAction(action);
                });
            });

            this.dragDropManager.setupCanvasComponent(wrapper);

            // Re-enable inline editing
            if (window.inlineEditor) {
                window.inlineEditor.makeEditable(wrapper);
            }
        });

        // Update placeholder visibility
        const hasComponents = this.canvas.querySelectorAll('.canvas-component').length > 0;
        this.canvasPlaceholder.classList.toggle('hidden', hasComponents);

        this.updateComponentCount();
        this.updateCodePreview();
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        this.btnUndo.disabled = this.historyIndex <= 0;
        this.btnRedo.disabled = this.historyIndex >= this.history.length - 1;
    }

    // Preview
    showPreview() {
        const html = this.codeGenerator.extractCanvasHTML(this.canvas);
        const fullHTML = this.codeGenerator.generateFullHTML(html, this.currentTheme);

        const previewFrame = document.getElementById('previewFrame');
        previewFrame.srcdoc = fullHTML;

        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        modal.show();
    }

    // Download HTML
    downloadHTML() {
        const html = this.codeGenerator.extractCanvasHTML(this.canvas);
        const fullHTML = this.codeGenerator.generateFullHTML(html, this.currentTheme);
        this.codeGenerator.downloadHTML('my-bootstrap-page.html', fullHTML);
    }

    // Copy code
    copyCode() {
        const html = this.codeGenerator.extractCanvasHTML(this.canvas);
        const fullHTML = this.codeGenerator.generateFullHTML(html, this.currentTheme);

        navigator.clipboard.writeText(fullHTML).then(() => {
            this.btnCopyCode.innerHTML = '<i class="bi bi-check2"></i>';
            this.btnCopyCode.classList.add('copied');

            setTimeout(() => {
                this.btnCopyCode.innerHTML = '<i class="bi bi-clipboard"></i>';
                this.btnCopyCode.classList.remove('copied');
            }, 2000);
        });
    }

    // Keyboard shortcuts
    handleKeyboard(e) {
        // Delete selected component
        if (e.key === 'Delete' && this.selectedComponent) {
            this.deleteComponent(this.selectedComponent);
        }

        // Ctrl+Z - Undo
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.undo();
        }

        // Ctrl+Shift+Z or Ctrl+Y - Redo
        if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
            e.preventDefault();
            this.redo();
        }

        // Ctrl+D - Duplicate
        if (e.ctrlKey && e.key === 'd' && this.selectedComponent) {
            e.preventDefault();
            this.duplicateComponent(this.selectedComponent);
        }

        // Escape - Deselect
        if (e.key === 'Escape') {
            this.deselectAll();
        }
    }

    // Set Bootswatch theme
    setTheme(theme) {
        this.currentTheme = theme;
        const link = document.getElementById('bootstrapTheme');

        let url = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
        if (theme !== 'default') {
            url = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${theme}/bootstrap.min.css`;
        }

        link.href = url;

        // Show notification
        if (window.toast) {
            window.toast.info('Theme Changed', `Switched to ${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`);
        }

        this.updateCodePreview();
        this.saveState();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.builder = new BootstrapBuilder();
});
