/**
 * Unit Tests for InlineEditor Class
 * Tests property editing, color application, and component manipulation
 */

// Load InlineEditor via setup helper
loadScript('editor.js');

describe('InlineEditor', () => {
    let editor;

    beforeEach(() => {
        // Mock window.builder
        window.builder = {
            updateCodePreview: jest.fn(),
            saveState: jest.fn(),
            duplicateComponent: jest.fn(),
            deleteComponent: jest.fn()
        };

        editor = new InlineEditor();
    });

    afterEach(() => {
        delete window.builder;
    });

    describe('constructor', () => {
        test('should initialize with DOM element references', () => {
            expect(editor.propertiesPanel).toBe(document.getElementById('propertiesPanel'));
            expect(editor.propertiesContent).toBe(document.getElementById('propertiesContent'));
            expect(editor.propertiesForm).toBe(document.getElementById('propertiesForm'));
        });

        test('should start with no selected component', () => {
            expect(editor.selectedComponent).toBeNull();
        });
    });

    describe('makeEditable', () => {
        test('should add contenteditable to text elements', () => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
        <div class="component-content">
          <h1>Heading</h1>
          <p>Paragraph</p>
        </div>
      `;

            editor.makeEditable(wrapper);

            expect(wrapper.querySelector('h1').getAttribute('contenteditable')).toBe('true');
            expect(wrapper.querySelector('p').getAttribute('contenteditable')).toBe('true');
        });

        test('should add editable-text class to editable elements', () => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
        <div class="component-content">
          <span>Text</span>
        </div>
      `;

            editor.makeEditable(wrapper);

            expect(wrapper.querySelector('span').classList.contains('editable-text')).toBe(true);
        });

        test('should skip form controls', () => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
        <div class="component-content">
          <input type="text" value="Input">
          <textarea>Textarea</textarea>
          <select><option>Option</option></select>
        </div>
      `;

            editor.makeEditable(wrapper);

            expect(wrapper.querySelector('input').getAttribute('contenteditable')).toBeNull();
            expect(wrapper.querySelector('textarea').getAttribute('contenteditable')).toBeNull();
            expect(wrapper.querySelector('select').getAttribute('contenteditable')).toBeNull();
        });

        test('should handle wrapper without component-content', () => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = '<h1>No content wrapper</h1>';

            expect(() => {
                editor.makeEditable(wrapper);
            }).not.toThrow();
        });
    });

    describe('showProperties', () => {
        test('should set selectedComponent', () => {
            const wrapper = createMockComponent();

            editor.showProperties(wrapper);

            expect(editor.selectedComponent).toBe(wrapper);
        });

        test('should hide empty state and show form', () => {
            const wrapper = createMockComponent();

            editor.showProperties(wrapper);

            expect(document.getElementById('propertiesForm').style.display).toBe('block');
        });

        test('should show link section when component has links', () => {
            const wrapper = createMockComponent('<a href="#">Link</a>');

            editor.showProperties(wrapper);

            expect(document.getElementById('linkSection').style.display).toBe('block');
        });

        test('should show image section when component has images', () => {
            const wrapper = createMockComponent('<img src="test.jpg" alt="Test">');

            editor.showProperties(wrapper);

            expect(document.getElementById('imageSection').style.display).toBe('block');
        });

        test('should show layout section for row components', () => {
            const wrapper = createMockComponent('<div class="row"><div class="col">Col</div></div>');

            editor.showProperties(wrapper);

            expect(document.getElementById('layoutSection').style.display).toBe('block');
        });
    });

    describe('hideProperties', () => {
        test('should clear selectedComponent', () => {
            editor.selectedComponent = document.createElement('div');

            editor.hideProperties();

            expect(editor.selectedComponent).toBeNull();
        });

        test('should show empty state and hide form', () => {
            document.getElementById('propertiesForm').style.display = 'block';

            editor.hideProperties();

            expect(document.getElementById('propertiesForm').style.display).toBe('none');
        });
    });

    describe('applyBackground', () => {
        test('should set background color on first child', () => {
            const wrapper = createMockComponent('<div class="inner">Content</div>');
            editor.selectedComponent = wrapper;

            editor.applyBackground('#ff0000');

            const firstChild = wrapper.querySelector('.component-content').firstElementChild;
            expect(firstChild.style.background).toBe('rgb(255, 0, 0)');
        });

        test('should remove existing Bootstrap bg classes', () => {
            const wrapper = createMockComponent('<div class="bg-primary inner">Content</div>');
            editor.selectedComponent = wrapper;

            editor.applyBackground('#ff0000');

            const firstChild = wrapper.querySelector('.component-content').firstElementChild;
            expect(firstChild.className).not.toContain('bg-primary');
        });

        test('should not throw if no selected component', () => {
            editor.selectedComponent = null;

            expect(() => {
                editor.applyBackground('#ff0000');
            }).not.toThrow();
        });

        test('should trigger update', () => {
            const wrapper = createMockComponent('<div>Content</div>');
            editor.selectedComponent = wrapper;

            editor.applyBackground('#ff0000');

            expect(window.builder.updateCodePreview).toHaveBeenCalled();
            expect(window.builder.saveState).toHaveBeenCalled();
        });
    });

    describe('applyGradient', () => {
        test('should apply gradient background', () => {
            const wrapper = createMockComponent('<div>Content</div>');
            editor.selectedComponent = wrapper;
            document.getElementById('bgColor').value = '#ff0000';
            document.getElementById('bgGradientEnd').value = '#0000ff';

            // applyGradient should run without error
            expect(() => {
                editor.applyGradient();
            }).not.toThrow();

            // Verify triggerUpdate was called
            expect(window.builder.updateCodePreview).toHaveBeenCalled();
            expect(window.builder.saveState).toHaveBeenCalled();
        });
    });

    describe('applyTextColor', () => {
        test('should apply text color to first child', () => {
            const wrapper = createMockComponent('<div><p>Text</p></div>');
            editor.selectedComponent = wrapper;

            editor.applyTextColor('#00ff00');

            const firstChild = wrapper.querySelector('.component-content').firstElementChild;
            expect(firstChild.style.color).toBe('rgb(0, 255, 0)');
        });

        test('should apply color to all text children', () => {
            const wrapper = createMockComponent('<div><h1>Heading</h1><p>Para</p></div>');
            editor.selectedComponent = wrapper;

            editor.applyTextColor('#00ff00');

            expect(wrapper.querySelector('h1').style.color).toBe('rgb(0, 255, 0)');
            expect(wrapper.querySelector('p').style.color).toBe('rgb(0, 255, 0)');
        });
    });

    describe('applySpacing', () => {
        test('should add padding class', () => {
            const wrapper = createMockComponent('<div>Content</div>');
            editor.selectedComponent = wrapper;

            editor.applySpacing('padding', 'p-4');

            const firstChild = wrapper.querySelector('.component-content').firstElementChild;
            expect(firstChild.classList.contains('p-4')).toBe(true);
        });

        test('should add margin class', () => {
            const wrapper = createMockComponent('<div>Content</div>');
            editor.selectedComponent = wrapper;

            editor.applySpacing('margin', 'my-3');

            const firstChild = wrapper.querySelector('.component-content').firstElementChild;
            expect(firstChild.classList.contains('my-3')).toBe(true);
        });
    });

    describe('addColumn', () => {
        test('should add column to row', () => {
            const wrapper = createMockComponent(`
        <div class="row">
          <div class="col-md-6">Col 1</div>
          <div class="col-md-6">Col 2</div>
        </div>
      `);
            editor.selectedComponent = wrapper;

            editor.addColumn();

            const cols = wrapper.querySelectorAll('[class*="col"]');
            expect(cols.length).toBe(3);
        });

        test('should not throw if no row in component', () => {
            const wrapper = createMockComponent('<div>No row</div>');
            editor.selectedComponent = wrapper;

            expect(() => {
                editor.addColumn();
            }).not.toThrow();
        });
    });

    describe('removeColumn', () => {
        test('should remove last column from row', () => {
            const wrapper = createMockComponent(`
        <div class="row">
          <div class="col">Col 1</div>
          <div class="col">Col 2</div>
          <div class="col">Col 3</div>
        </div>
      `);
            editor.selectedComponent = wrapper;

            editor.removeColumn();

            const cols = wrapper.querySelectorAll('[class*="col"]');
            expect(cols.length).toBe(2);
        });

        test('should not remove if only one column', () => {
            const wrapper = createMockComponent(`
        <div class="row">
          <div class="col">Single Col</div>
        </div>
      `);
            editor.selectedComponent = wrapper;

            editor.removeColumn();

            const cols = wrapper.querySelectorAll('[class*="col"]');
            expect(cols.length).toBe(1);
        });
    });

    describe('applyLinkUrl', () => {
        test('should update href on all links', () => {
            const wrapper = createMockComponent(`
        <div>
          <a href="#">Link 1</a>
          <a href="#">Link 2</a>
        </div>
      `);
            editor.selectedComponent = wrapper;

            editor.applyLinkUrl('https://example.com');

            const links = wrapper.querySelectorAll('a');
            links.forEach(link => {
                expect(link.getAttribute('href')).toBe('https://example.com');
            });
        });
    });

    describe('applyImageUrl', () => {
        test('should update src on all images', () => {
            const wrapper = createMockComponent(`
        <div>
          <img src="old.jpg" alt="Image 1">
          <img src="old2.jpg" alt="Image 2">
        </div>
      `);
            editor.selectedComponent = wrapper;

            editor.applyImageUrl('https://example.com/new.jpg');

            const images = wrapper.querySelectorAll('img');
            images.forEach(img => {
                expect(img.getAttribute('src')).toBe('https://example.com/new.jpg');
            });
        });
    });

    describe('rgbToHex', () => {
        test('should convert RGB to hex', () => {
            const result = editor.rgbToHex('rgb(255, 0, 0)');
            expect(result).toBe('#ff0000');
        });

        test('should handle rgba values', () => {
            const result = editor.rgbToHex('rgba(0, 255, 0, 1)');
            expect(result).toBe('#00ff00');
        });

        test('should return #ffffff for transparent', () => {
            const result = editor.rgbToHex('transparent');
            expect(result).toBe('#ffffff');
        });

        test('should return #ffffff for null/undefined', () => {
            expect(editor.rgbToHex(null)).toBe('#ffffff');
            expect(editor.rgbToHex(undefined)).toBe('#ffffff');
        });

        test('should handle rgba(0, 0, 0, 0) as transparent', () => {
            const result = editor.rgbToHex('rgba(0, 0, 0, 0)');
            expect(result).toBe('#ffffff');
        });
    });

    describe('applyProgress', () => {
        test('should update progress bar width', () => {
            const wrapper = createMockComponent(`
        <div>
          <div class="progress">
            <div class="progress-bar" style="width: 50%">50%</div>
          </div>
        </div>
      `);
            editor.selectedComponent = wrapper;

            editor.applyProgress(75);

            const bar = wrapper.querySelector('.progress-bar');
            expect(bar.style.width).toBe('75%');
            expect(bar.textContent).toBe('75%');
        });
    });
});

// Helper function to create mock component wrapper
function createMockComponent(innerHTML = '<div>Default Content</div>') {
    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-component';
    wrapper.dataset.type = 'test-component';
    wrapper.innerHTML = `
    <div class="component-content">
      ${innerHTML}
    </div>
  `;
    return wrapper;
}
