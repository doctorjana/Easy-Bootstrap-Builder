/**
 * Unit Tests for DragDropManager Class
 * Tests drag-drop functionality, compatibility checks, and nested dropping
 */

// Load dependencies via setup helper
loadScript('components.js');
loadScript('dragdrop.js');

describe('DragDropManager', () => {
    let manager;
    let canvas;
    let onDropMock;
    let onReorderMock;

    beforeEach(() => {
        canvas = document.getElementById('canvas');
        onDropMock = jest.fn();
        onReorderMock = jest.fn();

        // Mock window.builder
        window.builder = {
            updateCodePreview: jest.fn(),
            saveState: jest.fn()
        };

        // Mock window.toast
        window.toast = {
            success: jest.fn(),
            info: jest.fn()
        };

        // Mock window.inlineEditor
        window.inlineEditor = {
            makeEditable: jest.fn()
        };

        manager = new DragDropManager(canvas, onDropMock, onReorderMock);
    });

    afterEach(() => {
        delete window.builder;
        delete window.toast;
        delete window.inlineEditor;
    });

    describe('constructor', () => {
        test('should store canvas reference', () => {
            expect(manager.canvas).toBe(canvas);
        });

        test('should store callbacks', () => {
            expect(manager.onDrop).toBe(onDropMock);
            expect(manager.onReorder).toBe(onReorderMock);
        });

        test('should initialize drag state to null', () => {
            expect(manager.draggedElement).toBeNull();
            expect(manager.draggedComponentId).toBeNull();
            expect(manager.placeholder).toBeNull();
            expect(manager.currentDropTarget).toBeNull();
        });

        test('should define container types', () => {
            expect(manager.containerTypes).toContain('container');
            expect(manager.containerTypes).toContain('section');
            expect(manager.containerTypes).toContain('row-2col');
        });

        test('should define compatibility rules', () => {
            expect(manager.compatibility).toBeDefined();
            expect(manager.compatibility['container']).toBe('all');
        });

        test('should define topLevelOnly components', () => {
            expect(manager.topLevelOnly).toContain('footer-simple');
            expect(manager.topLevelOnly).toContain('hero-simple');
        });
    });

    describe('canAcceptChildren', () => {
        test('should return true for container types', () => {
            expect(manager.canAcceptChildren('container')).toBe(true);
            expect(manager.canAcceptChildren('container-fluid')).toBe(true);
            expect(manager.canAcceptChildren('section')).toBe(true);
        });

        test('should return true for row types', () => {
            expect(manager.canAcceptChildren('row-2col')).toBeTruthy();
            expect(manager.canAcceptChildren('row-3col')).toBeTruthy();
            expect(manager.canAcceptChildren('row-4col')).toBeTruthy();
        });

        test('should return false for non-container types', () => {
            expect(manager.canAcceptChildren('heading-h1')).toBeFalsy();
            expect(manager.canAcceptChildren('paragraph')).toBeFalsy();
            expect(manager.canAcceptChildren('buttons')).toBeFalsy();
        });

        test('should return truthy for types with compatibility rules', () => {
            expect(manager.canAcceptChildren('card-basic')).toBeTruthy();
        });
    });

    describe('isCompatible', () => {
        test('should return true for container accepting any component', () => {
            expect(manager.isCompatible('container', 'heading-h1')).toBe(true);
            expect(manager.isCompatible('container', 'paragraph')).toBe(true);
            expect(manager.isCompatible('container', 'buttons')).toBe(true);
        });

        test('should return false for topLevelOnly components', () => {
            expect(manager.isCompatible('container', 'footer-simple')).toBe(false);
            expect(manager.isCompatible('container', 'hero-simple')).toBe(false);
            expect(manager.isCompatible('section', 'style-modern-hero')).toBe(false);
        });

        test('should return false for undefined parent type', () => {
            expect(manager.isCompatible('unknown-type', 'heading-h1')).toBe(false);
        });

        test('should respect specific compatibility rules', () => {
            expect(manager.isCompatible('card-basic', 'heading-h1')).toBe(true);
            expect(manager.isCompatible('card-basic', 'paragraph')).toBe(true);
            expect(manager.isCompatible('card-basic', 'buttons')).toBe(true);
        });
    });

    describe('findComponentById', () => {
        test('should find component in COMPONENTS object', () => {
            const result = manager.findComponentById('container');

            expect(result).toBeDefined();
            expect(result.id).toBe('container');
            expect(result.html).toBeDefined();
        });

        test('should find component in nested categories', () => {
            const result = manager.findComponentById('navbar-dark');

            expect(result).toBeDefined();
            expect(result.name).toBe('Navbar Dark');
        });

        test('should return null for non-existent component', () => {
            const result = manager.findComponentById('non-existent-id');

            expect(result).toBeNull();
        });

        test('should find premade style components', () => {
            const result = manager.findComponentById('style-modern-hero');

            expect(result).toBeDefined();
            expect(result.name).toBe('Modern Hero');
        });
    });

    describe('findContentArea', () => {
        test('should find container inside component', () => {
            const component = createMockCanvasComponent(`
        <div class="container">
          <p>Content</p>
        </div>
      `);

            const result = manager.findContentArea(component);

            expect(result).not.toBeNull();
            expect(result.classList.contains('container')).toBe(true);
        });

        test('should find last column in row component', () => {
            const component = createMockCanvasComponent(`
        <div class="row">
          <div class="col-md-6"><div class="p-3">Col 1</div></div>
          <div class="col-md-6"><div class="p-3">Col 2</div></div>
        </div>
      `);

            const result = manager.findContentArea(component);

            expect(result).not.toBeNull();
        });

        test('should find card-body in card component', () => {
            const component = createMockCanvasComponent(`
        <div class="card">
          <div class="card-body">Card content</div>
        </div>
      `);

            const result = manager.findContentArea(component);

            expect(result).not.toBeNull();
            expect(result.classList.contains('card-body')).toBe(true);
        });

        test('should return null for component without content', () => {
            const component = document.createElement('div');
            component.className = 'canvas-component';

            const result = manager.findContentArea(component);

            expect(result).toBeNull();
        });
    });

    describe('cleanup', () => {
        test('should reset all drag state', () => {
            manager.draggedElement = document.createElement('div');
            manager.draggedComponentId = 'test';
            manager.currentDropTarget = document.createElement('div');
            manager.currentDropColumn = document.createElement('div');

            manager.cleanup();

            expect(manager.draggedElement).toBeNull();
            expect(manager.draggedComponentId).toBeNull();
            expect(manager.currentDropTarget).toBeNull();
            expect(manager.currentDropColumn).toBeNull();
        });

        test('should remove drag classes from canvas', () => {
            canvas.classList.add('drag-over');

            manager.cleanup();

            expect(canvas.classList.contains('drag-over')).toBe(false);
        });

        test('should remove all drop indicator classes', () => {
            const el1 = document.createElement('div');
            el1.className = 'drag-over-top drop-target-valid';
            document.body.appendChild(el1);

            manager.cleanup();

            expect(el1.classList.contains('drag-over-top')).toBe(false);
            expect(el1.classList.contains('drop-target-valid')).toBe(false);

            document.body.removeChild(el1);
        });
    });

    describe('setupComponentItem', () => {
        test('should set draggable attribute', () => {
            const item = document.createElement('div');

            manager.setupComponentItem(item, 'test-id');

            expect(item.getAttribute('draggable')).toBe('true');
        });

        test('should store component id in dataset', () => {
            const item = document.createElement('div');

            manager.setupComponentItem(item, 'my-component');

            expect(item.dataset.componentId).toBe('my-component');
        });
    });

    describe('setupCanvasComponent', () => {
        test('should set draggable attribute', () => {
            const component = createMockCanvasComponent('<div>Content</div>');

            manager.setupCanvasComponent(component);

            expect(component.getAttribute('draggable')).toBe('true');
        });
    });

    describe('triggerUpdate', () => {
        test('should call builder methods', () => {
            manager.triggerUpdate();

            expect(window.builder.updateCodePreview).toHaveBeenCalled();
            expect(window.builder.saveState).toHaveBeenCalled();
        });

        test('should not throw if builder not available', () => {
            delete window.builder;

            expect(() => {
                manager.triggerUpdate();
            }).not.toThrow();
        });
    });

    describe('moveNestedUp', () => {
        test('should move component before previous sibling', () => {
            const container = document.createElement('div');
            const nested1 = document.createElement('div');
            nested1.className = 'nested-component';
            nested1.textContent = 'First';
            const nested2 = document.createElement('div');
            nested2.className = 'nested-component';
            nested2.textContent = 'Second';

            container.appendChild(nested1);
            container.appendChild(nested2);

            manager.moveNestedUp(nested2);

            expect(container.firstChild).toBe(nested2);
        });

        test('should not move if no previous sibling', () => {
            const container = document.createElement('div');
            const nested = document.createElement('div');
            nested.className = 'nested-component';
            container.appendChild(nested);

            expect(() => {
                manager.moveNestedUp(nested);
            }).not.toThrow();
        });
    });

    describe('moveNestedDown', () => {
        test('should move component after next sibling', () => {
            const container = document.createElement('div');
            const nested1 = document.createElement('div');
            nested1.className = 'nested-component';
            const nested2 = document.createElement('div');
            nested2.className = 'nested-component';

            container.appendChild(nested1);
            container.appendChild(nested2);

            manager.moveNestedDown(nested1);

            expect(container.lastChild).toBe(nested1);
        });
    });

    describe('deleteNested', () => {
        test('should add removing class', () => {
            jest.useFakeTimers();

            const container = document.createElement('div');
            const nested = document.createElement('div');
            nested.className = 'nested-component';
            container.appendChild(nested);

            manager.deleteNested(nested);

            expect(nested.classList.contains('nested-removing')).toBe(true);

            jest.useRealTimers();
        });

        test('should remove element after delay', () => {
            jest.useFakeTimers();

            const container = document.createElement('div');
            const nested = document.createElement('div');
            nested.className = 'nested-component';
            container.appendChild(nested);

            manager.deleteNested(nested);

            expect(container.contains(nested)).toBe(true);

            jest.advanceTimersByTime(200);

            expect(container.contains(nested)).toBe(false);

            jest.useRealTimers();
        });
    });
});

// Helper function to create mock canvas component
function createMockCanvasComponent(innerHTML = '<div>Default</div>') {
    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-component';
    wrapper.dataset.type = 'container';
    wrapper.innerHTML = `
    <div class="component-content">
      ${innerHTML}
    </div>
  `;
    return wrapper;
}
