/**
 * Bootstrap Builder - Drag and Drop Functionality
 * Enhanced with nested component dropping support
 */

class DragDropManager {
    constructor(canvas, onDrop, onReorder) {
        this.canvas = canvas;
        this.onDrop = onDrop;
        this.onReorder = onReorder;
        this.draggedElement = null;
        this.draggedComponentId = null;
        this.placeholder = null;
        this.currentDropTarget = null;

        // Define which component types can accept children
        this.containerTypes = [
            'container', 'container-fluid', 'section',
            'row-2col', 'row-3col', 'row-4col', 'row-sidebar'
        ];

        // Define parent-child compatibility
        // Key: parent type, Value: array of allowed child types (or 'all' for any)
        this.compatibility = {
            'container': 'all',
            'container-fluid': 'all',
            'section': 'all',
            'row-2col': ['all'], // Columns can contain anything
            'row-3col': ['all'],
            'row-4col': ['all'],
            'row-sidebar': ['all'],
            'card-basic': ['heading-h1', 'heading-h2', 'heading-h3', 'paragraph', 'lead', 'buttons', 'image'],
            'card-header': ['heading-h1', 'heading-h2', 'heading-h3', 'paragraph', 'lead', 'buttons'],
            'card-footer': ['heading-h1', 'heading-h2', 'heading-h3', 'paragraph', 'lead', 'buttons'],
        };

        // Components that should NOT be nested (they're top-level only)
        // Note: Navbars CAN be nested inside containers per user request
        this.topLevelOnly = [
            'footer-simple', 'footer-columns', 'footer-social',
            'hero-simple', 'hero-center', 'hero-gradient', 'jumbotron', 'cta-section',
            'style-modern-hero', 'style-dark-hero', 'style-feature-grid',
            'style-pricing', 'style-testimonial', 'style-stats', 'style-team',
            'style-faq', 'style-cta-banner'
        ];

        this.init();
    }

    init() {
        // Canvas drop zone events
        this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.canvas.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
    }

    // Check if a component type can accept children
    canAcceptChildren(parentType) {
        return this.containerTypes.includes(parentType) || this.compatibility[parentType];
    }

    // Check if a child can be placed inside a parent
    isCompatible(parentType, childType) {
        // Top-level only components cannot be nested
        if (this.topLevelOnly.includes(childType)) {
            return false;
        }

        const allowed = this.compatibility[parentType];
        if (!allowed) return false;
        if (allowed === 'all' || allowed.includes('all')) return true;
        return allowed.includes(childType);
    }

    // Find the droppable container at a point
    findDropTarget(x, y, excludeElement = null) {
        const elements = document.elementsFromPoint(x, y);

        for (const el of elements) {
            // Skip the dragged element itself
            if (excludeElement && el.contains(excludeElement)) continue;

            // Check if it's a canvas component
            const component = el.closest('.canvas-component');
            if (component && component !== excludeElement) {
                const componentType = component.dataset.type;

                // Check if this component can accept children
                if (this.canAcceptChildren(componentType)) {
                    // Find the actual content area to drop into
                    const contentArea = this.findContentArea(component);
                    if (contentArea) {
                        return { component, contentArea, type: componentType };
                    }
                }
            }
        }

        return null;
    }

    // Find the content area within a component where children should be added
    findContentArea(component) {
        // For nested components, find nested-content
        const nestedContent = component.querySelector('.nested-content');
        if (nestedContent) {
            // Try to find a container inside nested content
            const nestedContainer = nestedContent.querySelector('.container, .container-fluid');
            if (nestedContainer) return nestedContainer;

            // Otherwise return first element child or nested-content itself
            return nestedContent.firstElementChild || nestedContent;
        }

        const content = component.querySelector('.component-content');
        if (!content) return null;

        // For containers, find the actual container div
        const container = content.querySelector('.container, .container-fluid');
        if (container) return container;

        // For rows, find the last column
        const row = content.querySelector('.row');
        if (row) {
            const cols = row.querySelectorAll('[class*="col"]');
            if (cols.length > 0) {
                // Return the last column's inner content
                const lastCol = cols[cols.length - 1];
                return lastCol.querySelector('.p-3') || lastCol;
            }
        }

        // For cards, find the card-body
        const cardBody = content.querySelector('.card-body');
        if (cardBody) return cardBody;

        // For sections, find the container
        const sectionContainer = content.querySelector('section .container');
        if (sectionContainer) return sectionContainer;

        // Default: return the first element child
        return content.firstElementChild;
    }

    // Setup draggable component items in sidebar
    setupComponentItem(element, componentId) {
        element.setAttribute('draggable', 'true');
        element.dataset.componentId = componentId;

        element.addEventListener('dragstart', (e) => {
            this.draggedComponentId = componentId;
            this.draggedElement = null;
            element.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', componentId);
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
            this.cleanup();
        });
    }

    // Setup canvas component for reordering
    setupCanvasComponent(element) {
        element.setAttribute('draggable', 'true');

        element.addEventListener('dragstart', (e) => {
            e.stopPropagation();
            this.draggedElement = element;
            this.draggedComponentId = null;
            element.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';

            // Delay hiding to allow drag image
            setTimeout(() => {
                element.style.opacity = '0.4';
            }, 0);
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
            element.style.opacity = '1';
            this.cleanup();
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const componentType = element.dataset.type;

            // Check if this is a valid nested drop target
            if (this.draggedComponentId && this.canAcceptChildren(componentType)) {
                if (this.isCompatible(componentType, this.draggedComponentId)) {
                    element.classList.add('drop-target-valid');
                    element.classList.remove('drop-target-invalid');
                    this.currentDropTarget = element;
                    return;
                } else {
                    // Show invalid drop indicator for incompatible components
                    element.classList.add('drop-target-invalid');
                    element.classList.remove('drop-target-valid');
                    return;
                }
            }

            // Regular reordering logic
            if (this.draggedElement && this.draggedElement !== element) {
                const rect = element.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;

                // Remove previous indicators
                document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
                    el.classList.remove('drag-over-top', 'drag-over-bottom');
                });

                if (e.clientY < midY) {
                    element.classList.add('drag-over-top');
                } else {
                    element.classList.add('drag-over-bottom');
                }
            }
        });

        element.addEventListener('dragleave', (e) => {
            element.classList.remove('drag-over-top', 'drag-over-bottom', 'drop-target-valid', 'drop-target-invalid');
            if (this.currentDropTarget === element) {
                this.currentDropTarget = null;
            }
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const componentType = element.dataset.type;

            // Handle nested drop from sidebar
            if (this.draggedComponentId && this.currentDropTarget === element) {
                if (this.canAcceptChildren(componentType) &&
                    this.isCompatible(componentType, this.draggedComponentId)) {
                    // Nested drop - add inside this component
                    this.handleNestedDrop(element, this.draggedComponentId);
                    element.classList.remove('drop-target-valid');
                    return;
                }
            }

            // Regular reordering of existing canvas elements
            if (this.draggedElement && this.draggedElement !== element) {
                const rect = element.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                const insertBefore = e.clientY < midY;

                if (insertBefore) {
                    this.canvas.insertBefore(this.draggedElement, element);
                } else {
                    this.canvas.insertBefore(this.draggedElement, element.nextSibling);
                }

                if (this.onReorder) {
                    this.onReorder();
                }
            }

            element.classList.remove('drag-over-top', 'drag-over-bottom', 'drop-target-valid');
        });

        // Setup column-specific drop targets for row components
        this.setupColumnDropTargets(element);
    }

    // Setup each column in a row as a separate drop target
    setupColumnDropTargets(componentWrapper) {
        const content = componentWrapper.querySelector('.component-content');
        if (!content) return;

        const row = content.querySelector('.row');
        if (!row) return;

        const cols = row.querySelectorAll(':scope > [class*="col"]');
        cols.forEach((col, index) => {
            // Add a data attribute for identification
            col.dataset.colIndex = index;

            // Add visual drop zone class
            col.classList.add('droppable-column');

            col.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (this.draggedComponentId) {
                    // Remove highlight from other columns
                    cols.forEach(c => c.classList.remove('column-drop-target'));
                    col.classList.add('column-drop-target');
                    this.currentDropColumn = col;
                    this.currentDropTarget = componentWrapper;
                }
            });

            col.addEventListener('dragleave', (e) => {
                // Only remove if not entering a child element
                if (!col.contains(e.relatedTarget)) {
                    col.classList.remove('column-drop-target');
                    if (this.currentDropColumn === col) {
                        this.currentDropColumn = null;
                    }
                }
            });

            col.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (this.draggedComponentId && this.currentDropColumn === col) {
                    this.handleColumnDrop(col, this.draggedComponentId);
                }
                col.classList.remove('column-drop-target');
            });
        });
    }

    // Handle drop into a specific column
    handleColumnDrop(column, componentId) {
        const childComponent = this.findComponentById(componentId);
        if (!childComponent) return;

        // Find the content area inside the column
        const contentArea = column.querySelector('.p-3') || column;

        // Create nested component wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'nested-component';
        wrapper.dataset.nestedType = componentId;
        wrapper.dataset.nestedId = `nested-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        wrapper.innerHTML = `
            <div class="nested-actions">
                <button class="nested-action-btn" data-action="moveUp" title="Move Up">
                    <i class="bi bi-arrow-up"></i>
                </button>
                <button class="nested-action-btn" data-action="moveDown" title="Move Down">
                    <i class="bi bi-arrow-down"></i>
                </button>
                <button class="nested-action-btn delete" data-action="delete" title="Delete">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
            <div class="nested-content">${childComponent.html}</div>
        `;

        // Setup action handlers
        this.setupNestedActions(wrapper);
        this.setupNestedDropTarget(wrapper);

        // Add to column
        contentArea.appendChild(wrapper);

        // Make editable
        if (window.inlineEditor) {
            const parentComponent = column.closest('.canvas-component');
            if (parentComponent) {
                window.inlineEditor.makeEditable(parentComponent);
            }
        }

        // Update and notify
        this.triggerUpdate();
        if (window.toast) {
            window.toast.success('Added to Column', `${childComponent.name} added to column ${parseInt(column.dataset.colIndex) + 1}`);
        }

        this.cleanup();
    }

    // Handle nested drop (add child inside parent)
    handleNestedDrop(parentComponent, childComponentId) {
        const contentArea = this.findContentArea(parentComponent);
        if (!contentArea) {
            // Fallback to regular drop
            if (this.onDrop) {
                this.onDrop(childComponentId);
            }
            return;
        }

        // Get the child component HTML
        const childComponent = this.findComponentById(childComponentId);
        if (!childComponent) return;

        // Create a wrapper for the nested content with controls
        const wrapper = document.createElement('div');
        wrapper.className = 'nested-component';
        wrapper.dataset.nestedType = childComponentId;
        wrapper.dataset.nestedId = `nested-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Add action buttons for the nested component
        wrapper.innerHTML = `
            <div class="nested-actions">
                <button class="nested-action-btn" data-action="moveUp" title="Move Up">
                    <i class="bi bi-arrow-up"></i>
                </button>
                <button class="nested-action-btn" data-action="moveDown" title="Move Down">
                    <i class="bi bi-arrow-down"></i>
                </button>
                <button class="nested-action-btn delete" data-action="delete" title="Delete">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
            <div class="nested-content">${childComponent.html}</div>
        `;

        // Setup action button handlers
        this.setupNestedActions(wrapper);

        // Setup for nested dropping (infinite nesting)
        this.setupNestedDropTarget(wrapper);

        // Add to content area
        contentArea.appendChild(wrapper);

        // Make nested text editable
        if (window.inlineEditor) {
            window.inlineEditor.makeEditable(parentComponent);
        }

        // Update code preview and save state
        if (window.builder) {
            window.builder.updateCodePreview();
            window.builder.saveState();
        }

        // Show success toast
        if (window.toast) {
            window.toast.success('Component Added', `${childComponent.name} added inside container`);
        }

        this.cleanup();
    }

    // Setup action buttons for nested components
    setupNestedActions(wrapper) {
        wrapper.querySelectorAll('.nested-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;

                switch (action) {
                    case 'moveUp':
                        this.moveNestedUp(wrapper);
                        break;
                    case 'moveDown':
                        this.moveNestedDown(wrapper);
                        break;
                    case 'delete':
                        this.deleteNested(wrapper);
                        break;
                }
            });
        });
    }

    // Move nested component up
    moveNestedUp(wrapper) {
        const prev = wrapper.previousElementSibling;
        if (prev && prev.classList.contains('nested-component')) {
            wrapper.parentNode.insertBefore(wrapper, prev);
            this.triggerUpdate();
            if (window.toast) {
                window.toast.info('Moved', 'Component moved up');
            }
        }
    }

    // Move nested component down
    moveNestedDown(wrapper) {
        const next = wrapper.nextElementSibling;
        if (next && next.classList.contains('nested-component')) {
            wrapper.parentNode.insertBefore(next, wrapper);
            this.triggerUpdate();
            if (window.toast) {
                window.toast.info('Moved', 'Component moved down');
            }
        }
    }

    // Delete nested component
    deleteNested(wrapper) {
        wrapper.classList.add('nested-removing');
        setTimeout(() => {
            wrapper.remove();
            this.triggerUpdate();
            if (window.toast) {
                window.toast.success('Deleted', 'Nested component removed');
            }
        }, 200);
    }

    // Setup nested component as a drop target (for infinite nesting)
    setupNestedDropTarget(wrapper) {
        const nestedContent = wrapper.querySelector('.nested-content');
        if (!nestedContent) return;

        // Check if this nested item can accept children
        const nestedType = wrapper.dataset.nestedType;
        if (!this.canAcceptChildren(nestedType)) return;

        wrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.draggedComponentId && this.isCompatible(nestedType, this.draggedComponentId)) {
                wrapper.classList.add('drop-target-valid');
                this.currentDropTarget = wrapper;
            }
        });

        wrapper.addEventListener('dragleave', (e) => {
            wrapper.classList.remove('drop-target-valid', 'drop-target-invalid');
        });

        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.draggedComponentId && this.currentDropTarget === wrapper) {
                // Create a fake "component" object for recursive nesting
                const fakeComponent = { querySelector: (sel) => sel === '.component-content' ? nestedContent : null };
                this.handleNestedDrop(wrapper, this.draggedComponentId);
            }
            wrapper.classList.remove('drop-target-valid');
        });
    }

    // Trigger update helper
    triggerUpdate() {
        if (window.builder) {
            window.builder.updateCodePreview();
            window.builder.saveState();
        }
    }


    // Find component definition by ID
    findComponentById(componentId) {
        for (const category of Object.values(COMPONENTS)) {
            const item = category.items.find(i => i.id === componentId);
            if (item) return item;
        }
        return null;
    }

    handleDragOver(e) {
        e.preventDefault();
        this.canvas.classList.add('drag-over');
        e.dataTransfer.dropEffect = this.draggedElement ? 'move' : 'copy';
    }

    handleDragLeave(e) {
        // Only remove class if leaving the canvas entirely
        if (!this.canvas.contains(e.relatedTarget)) {
            this.canvas.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        this.canvas.classList.remove('drag-over');

        // If we already handled a nested drop, don't do anything else
        if (this.currentDropTarget) {
            this.currentDropTarget = null;
            this.cleanup();
            return;
        }

        // If dropping a new component from sidebar (not nested)
        if (this.draggedComponentId && this.onDrop) {
            this.onDrop(this.draggedComponentId);
        }

        this.cleanup();
    }

    cleanup() {
        this.canvas.classList.remove('drag-over');
        document.querySelectorAll('.drag-over-top, .drag-over-bottom, .drop-target-valid, .drop-target-invalid, .column-drop-target').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom', 'drop-target-valid', 'drop-target-invalid', 'column-drop-target');
        });
        this.draggedElement = null;
        this.draggedComponentId = null;
        this.currentDropTarget = null;
        this.currentDropColumn = null;
    }
}
