/**
 * Unit Tests for BootstrapBuilder Class (app.js)
 * Tests main application orchestration
 */

// Load dependencies first
loadScript('components.js');
loadScript('generator.js');
loadScript('dragdrop.js');
loadScript('app.js');

describe('BootstrapBuilder', () => {
    let builder;

    beforeEach(() => {
        // Mock window.toast
        window.toast = {
            success: jest.fn(),
            info: jest.fn(),
            warning: jest.fn(),
            error: jest.fn()
        };

        // Mock window.inlineEditor
        window.inlineEditor = {
            makeEditable: jest.fn(),
            showProperties: jest.fn(),
            hideProperties: jest.fn()
        };

        builder = new BootstrapBuilder();
    });

    afterEach(() => {
        delete window.toast;
        delete window.inlineEditor;
        delete window.builder;
    });

    describe('constructor', () => {
        test('should initialize DOM element references', () => {
            expect(builder.canvas).toBe(document.getElementById('canvas'));
            expect(builder.canvasPlaceholder).toBe(document.getElementById('canvasPlaceholder'));
            expect(builder.componentsList).toBe(document.getElementById('componentsList'));
            expect(builder.codePreview).toBe(document.getElementById('codePreview'));
        });

        test('should initialize with empty history', () => {
            expect(builder.history.length).toBeGreaterThanOrEqual(1);
        });

        test('should initialize with no selected component', () => {
            expect(builder.selectedComponent).toBeNull();
        });

        test('should initialize with default theme', () => {
            expect(builder.currentTheme).toBe('default');
        });

        test('should create CodeGenerator instance', () => {
            expect(builder.codeGenerator).toBeInstanceOf(CodeGenerator);
        });

        test('should create DragDropManager instance', () => {
            expect(builder.dragDropManager).toBeInstanceOf(DragDropManager);
        });
    });

    describe('findComponent', () => {
        test('should find component by ID in layout category', () => {
            const result = builder.findComponent('container');

            expect(result).toBeDefined();
            expect(result.id).toBe('container');
        });

        test('should find component in navigation category', () => {
            const result = builder.findComponent('navbar-dark');

            expect(result).toBeDefined();
            expect(result.name).toBe('Navbar Dark');
        });

        test('should find component in premadeStyles category', () => {
            const result = builder.findComponent('style-modern-hero');

            expect(result).toBeDefined();
            expect(result.name).toBe('Modern Hero');
        });

        test('should return null for non-existent component', () => {
            const result = builder.findComponent('non-existent-id');

            expect(result).toBeNull();
        });
    });

    describe('addComponent', () => {
        test('should add component wrapper to canvas', () => {
            const initialCount = builder.canvas.querySelectorAll('.canvas-component').length;

            builder.addComponent('container');

            const newCount = builder.canvas.querySelectorAll('.canvas-component').length;
            expect(newCount).toBe(initialCount + 1);
        });

        test('should hide canvas placeholder', () => {
            builder.addComponent('container');

            expect(builder.canvasPlaceholder.classList.contains('hidden')).toBe(true);
        });

        test('should increment component counter', () => {
            const initialCounter = builder.componentCounter;

            builder.addComponent('container');

            expect(builder.componentCounter).toBe(initialCounter + 1);
        });

        test('should set component data attributes', () => {
            builder.addComponent('container');

            const component = builder.canvas.querySelector('.canvas-component');
            expect(component.dataset.type).toBe('container');
            expect(component.dataset.id).toContain('comp-');
        });

        test('should call inlineEditor.makeEditable', () => {
            builder.addComponent('container');

            expect(window.inlineEditor.makeEditable).toHaveBeenCalled();
        });

        test('should not add component if ID is invalid', () => {
            const initialCount = builder.canvas.querySelectorAll('.canvas-component').length;

            builder.addComponent('invalid-component-id');

            const newCount = builder.canvas.querySelectorAll('.canvas-component').length;
            expect(newCount).toBe(initialCount);
        });

        test('should save state after adding', () => {
            const saveSpy = jest.spyOn(builder, 'saveState');

            builder.addComponent('container');

            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe('selectComponent', () => {
        test('should add selected class to component', () => {
            builder.addComponent('container');
            const component = builder.canvas.querySelector('.canvas-component');

            builder.selectComponent(component);

            expect(component.classList.contains('selected')).toBe(true);
        });

        test('should set selectedComponent reference', () => {
            builder.addComponent('container');
            const component = builder.canvas.querySelector('.canvas-component');

            builder.selectComponent(component);

            expect(builder.selectedComponent).toBe(component);
        });

        test('should call inlineEditor.showProperties', () => {
            builder.addComponent('container');
            const component = builder.canvas.querySelector('.canvas-component');

            builder.selectComponent(component);

            expect(window.inlineEditor.showProperties).toHaveBeenCalledWith(component);
        });

        test('should deselect previously selected component', () => {
            builder.addComponent('container');
            builder.addComponent('section');
            const components = builder.canvas.querySelectorAll('.canvas-component');

            builder.selectComponent(components[0]);
            builder.selectComponent(components[1]);

            expect(components[0].classList.contains('selected')).toBe(false);
            expect(components[1].classList.contains('selected')).toBe(true);
        });
    });

    describe('deselectAll', () => {
        test('should remove selected class from all components', () => {
            builder.addComponent('container');
            builder.addComponent('section');
            const components = builder.canvas.querySelectorAll('.canvas-component');
            components.forEach(c => c.classList.add('selected'));

            builder.deselectAll();

            components.forEach(c => {
                expect(c.classList.contains('selected')).toBe(false);
            });
        });

        test('should clear selectedComponent reference', () => {
            builder.addComponent('container');
            builder.selectedComponent = builder.canvas.querySelector('.canvas-component');

            builder.deselectAll();

            expect(builder.selectedComponent).toBeNull();
        });

        test('should call inlineEditor.hideProperties', () => {
            builder.deselectAll();

            expect(window.inlineEditor.hideProperties).toHaveBeenCalled();
        });
    });

    describe('deleteComponent', () => {
        test('should remove component from canvas', () => {
            jest.useFakeTimers();

            builder.addComponent('container');
            const component = builder.canvas.querySelector('.canvas-component');

            builder.deleteComponent(component);

            jest.advanceTimersByTime(200);

            expect(builder.canvas.contains(component)).toBe(false);

            jest.useRealTimers();
        });

        test('should show placeholder when canvas is empty', () => {
            jest.useFakeTimers();

            builder.addComponent('container');
            const component = builder.canvas.querySelector('.canvas-component');

            builder.deleteComponent(component);
            jest.advanceTimersByTime(200);

            expect(builder.canvasPlaceholder.classList.contains('hidden')).toBe(false);

            jest.useRealTimers();
        });

        test('should not throw for null component', () => {
            expect(() => {
                builder.deleteComponent(null);
            }).not.toThrow();
        });
    });

    describe('duplicateComponent', () => {
        test('should create copy of component', () => {
            builder.addComponent('container');
            const component = builder.canvas.querySelector('.canvas-component');
            const initialCount = builder.canvas.querySelectorAll('.canvas-component').length;

            builder.duplicateComponent(component);

            const newCount = builder.canvas.querySelectorAll('.canvas-component').length;
            expect(newCount).toBe(initialCount + 1);
        });

        test('should insert clone after original', () => {
            builder.addComponent('container');
            const original = builder.canvas.querySelector('.canvas-component');

            builder.duplicateComponent(original);

            expect(original.nextElementSibling.classList.contains('canvas-component')).toBe(true);
        });

        test('should give clone new ID', () => {
            builder.addComponent('container');
            const original = builder.canvas.querySelector('.canvas-component');
            const originalId = original.dataset.id;

            builder.duplicateComponent(original);

            const clone = original.nextElementSibling;
            expect(clone.dataset.id).not.toBe(originalId);
        });

        test('should not throw for null component', () => {
            expect(() => {
                builder.duplicateComponent(null);
            }).not.toThrow();
        });
    });

    describe('moveComponent', () => {
        test('should move component up', () => {
            builder.addComponent('container');
            builder.addComponent('section');
            const components = builder.canvas.querySelectorAll('.canvas-component');
            const second = components[1];

            builder.moveComponent(second, 'up');

            expect(builder.canvas.firstElementChild.nextElementSibling).toBe(second);
        });

        test('should move component down', () => {
            builder.addComponent('container');
            builder.addComponent('section');
            const components = builder.canvas.querySelectorAll('.canvas-component');
            const first = components[0];

            builder.moveComponent(first, 'down');

            const allComponents = builder.canvas.querySelectorAll('.canvas-component');
            expect(allComponents[1]).toBe(first);
        });
    });

    describe('updateComponentCount', () => {
        test('should display correct singular count', () => {
            builder.addComponent('container');

            builder.updateComponentCount();

            expect(builder.componentCount.textContent).toBe('1 component');
        });

        test('should display correct plural count', () => {
            builder.addComponent('container');
            builder.addComponent('section');

            builder.updateComponentCount();

            expect(builder.componentCount.textContent).toBe('2 components');
        });

        test('should display zero count', () => {
            builder.updateComponentCount();

            expect(builder.componentCount.textContent).toBe('0 components');
        });
    });

    describe('filterComponents', () => {
        test('should hide non-matching components', () => {
            builder.renderComponentsList();

            builder.filterComponents('navbar');

            const hiddenItems = document.querySelectorAll('.component-item[style*="display: none"]');
            expect(hiddenItems.length).toBeGreaterThan(0);
        });

        test('should show matching components', () => {
            builder.renderComponentsList();

            builder.filterComponents('container');

            const visibleItems = document.querySelectorAll('.component-item:not([style*="display: none"])');
            expect(visibleItems.length).toBeGreaterThan(0);
        });

        test('should be case insensitive', () => {
            builder.renderComponentsList();

            builder.filterComponents('CONTAINER');

            const visibleItems = document.querySelectorAll('.component-item:not([style*="display: none"])');
            expect(visibleItems.length).toBeGreaterThan(0);
        });
    });

    describe('undo/redo', () => {
        test('should restore previous state on undo', () => {
            builder.addComponent('container');
            const stateAfterFirst = builder.history.length;
            builder.addComponent('section');

            builder.undo();

            expect(builder.historyIndex).toBe(stateAfterFirst - 1);
        });

        test('should restore next state on redo', () => {
            builder.addComponent('container');
            builder.addComponent('section');
            const currentIndex = builder.historyIndex;
            builder.undo();

            builder.redo();

            expect(builder.historyIndex).toBe(currentIndex);
        });

        test('should not undo past beginning', () => {
            builder.historyIndex = 0;

            builder.undo();

            expect(builder.historyIndex).toBe(0);
        });

        test('should not redo past end', () => {
            builder.addComponent('container');
            const maxIndex = builder.historyIndex;

            builder.redo();

            expect(builder.historyIndex).toBe(maxIndex);
        });
    });

    describe('setTheme', () => {
        test('should update currentTheme', () => {
            builder.setTheme('darkly');

            expect(builder.currentTheme).toBe('darkly');
        });

        test('should update stylesheet href for Bootswatch theme', () => {
            builder.setTheme('flatly');

            const link = document.getElementById('bootstrapTheme');
            expect(link.href).toContain('bootswatch');
            expect(link.href).toContain('flatly');
        });

        test('should use default Bootstrap CSS for default theme', () => {
            builder.setTheme('darkly');
            builder.setTheme('default');

            const link = document.getElementById('bootstrapTheme');
            expect(link.href).toContain('bootstrap@5.3.2/dist/css/bootstrap.min.css');
        });

        test('should show toast notification', () => {
            builder.setTheme('cosmo');

            expect(window.toast.info).toHaveBeenCalled();
        });
    });

    describe('togglePanel', () => {
        test('should hide visible panel', () => {
            const sidebar = document.getElementById('componentsSidebar');
            builder.panels.sidebar = true;

            builder.togglePanel('sidebar');

            expect(sidebar.classList.contains('panel-hidden')).toBe(true);
            expect(builder.panels.sidebar).toBe(false);
        });

        test('should show hidden panel', () => {
            const sidebar = document.getElementById('componentsSidebar');
            sidebar.classList.add('panel-hidden');
            builder.panels.sidebar = false;

            builder.togglePanel('sidebar');

            expect(sidebar.classList.contains('panel-hidden')).toBe(false);
            expect(builder.panels.sidebar).toBe(true);
        });

        test('should save state to localStorage', () => {
            builder.togglePanel('sidebar');

            expect(localStorage.setItem).toHaveBeenCalledWith('panel-sidebar', expect.any(String));
        });
    });

    describe('resetLayout', () => {
        test('should show all panels', () => {
            const sidebar = document.getElementById('componentsSidebar');
            const properties = document.getElementById('propertiesPanel');
            const code = document.getElementById('codePanel');

            sidebar.classList.add('panel-hidden');
            properties.classList.add('panel-hidden');
            code.classList.add('panel-hidden');

            builder.resetLayout();

            expect(sidebar.classList.contains('panel-hidden')).toBe(false);
            expect(properties.classList.contains('panel-hidden')).toBe(false);
            expect(code.classList.contains('panel-hidden')).toBe(false);
        });

        test('should update panels state', () => {
            builder.panels = { sidebar: false, properties: false, code: false };

            builder.resetLayout();

            expect(builder.panels).toEqual({ sidebar: true, properties: true, code: true });
        });
    });

    describe('showPreview', () => {
        test('should set previewFrame srcdoc', () => {
            builder.addComponent('container');

            builder.showPreview();

            const frame = document.getElementById('previewFrame');
            expect(frame.srcdoc).toContain('<!DOCTYPE html>');
        });
    });

    describe('copyCode', () => {
        test('should copy to clipboard', async () => {
            builder.addComponent('container');

            await builder.copyCode();

            expect(navigator.clipboard.writeText).toHaveBeenCalled();
        });
    });
});
