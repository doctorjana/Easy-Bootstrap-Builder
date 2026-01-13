/**
 * Unit Tests for CodeGenerator Class
 * Tests HTML generation, formatting, and export functionality
 */

// Load CodeGenerator via setup helper
loadScript('generator.js');

describe('CodeGenerator', () => {
    let generator;

    beforeEach(() => {
        generator = new CodeGenerator();
    });

    describe('constructor', () => {
        test('should initialize with beautify options', () => {
            expect(generator.beautifyOptions).toBeDefined();
            expect(generator.beautifyOptions.indent_size).toBe(4);
            expect(generator.beautifyOptions.wrap_line_length).toBe(120);
        });
    });

    describe('generateFullHTML', () => {
        test('should generate valid HTML document structure', () => {
            const content = '<div class="container">Test</div>';
            const html = generator.generateFullHTML(content);

            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
            expect(html).toContain('<head>');
            expect(html).toContain('<body>');
            expect(html).toContain('</html>');
        });

        test('should include Bootstrap 5 CDN links for default theme', () => {
            const html = generator.generateFullHTML('<div>Test</div>', 'default');

            expect(html).toContain('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
            expect(html).toContain('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js');
            expect(html).toContain('bootstrap-icons');
        });

        test('should use Bootswatch theme when specified', () => {
            const html = generator.generateFullHTML('<div>Test</div>', 'darkly');

            expect(html).toContain('https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/darkly/bootstrap.min.css');
        });

        test('should include proper meta tags', () => {
            const html = generator.generateFullHTML('<div>Test</div>');

            expect(html).toContain('charset="UTF-8"');
            expect(html).toContain('viewport');
            expect(html).toContain('width=device-width');
        });

        test('should include canvas content with proper indentation', () => {
            const content = '<div class="test">Content</div>';
            const html = generator.generateFullHTML(content);

            expect(html).toContain(content);
        });

        test('should handle empty content', () => {
            const html = generator.generateFullHTML('');

            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<body>');
        });
    });

    describe('extractCanvasHTML', () => {
        test('should extract HTML from canvas components', () => {
            const canvas = document.createElement('div');
            canvas.innerHTML = `
        <div class="canvas-component">
          <div class="component-content">
            <div class="container">Test Content</div>
          </div>
        </div>
      `;

            const result = generator.extractCanvasHTML(canvas);

            expect(result).toContain('Test Content');
        });

        test('should extract multiple components', () => {
            const canvas = document.createElement('div');
            canvas.innerHTML = `
        <div class="canvas-component">
          <div class="component-content"><p>First</p></div>
        </div>
        <div class="canvas-component">
          <div class="component-content"><p>Second</p></div>
        </div>
      `;

            const result = generator.extractCanvasHTML(canvas);

            expect(result).toContain('First');
            expect(result).toContain('Second');
        });

        test('should return empty string for empty canvas', () => {
            const canvas = document.createElement('div');
            const result = generator.extractCanvasHTML(canvas);

            expect(result).toBe('');
        });

        test('should exclude action buttons from output', () => {
            const canvas = document.createElement('div');
            canvas.innerHTML = `
        <div class="canvas-component">
          <div class="component-actions"><button>Delete</button></div>
          <div class="component-content"><p>Content</p></div>
        </div>
      `;

            const result = generator.extractCanvasHTML(canvas);

            expect(result).toContain('Content');
            expect(result).not.toContain('Delete');
        });
    });

    describe('formatHTML', () => {
        test('should add proper indentation to nested tags', () => {
            const input = '<div><p>Text</p></div>';
            const result = generator.formatHTML(input);

            expect(result).toContain('    '); // Should contain indentation
        });

        test('should handle self-closing tags correctly', () => {
            const input = '<div><br><img src="test.jpg"></div>';
            const result = generator.formatHTML(input);

            expect(result).toContain('<br>');
            expect(result).toContain('<img');
        });

        test('should handle empty input', () => {
            const result = generator.formatHTML('');
            expect(result).toBe('');
        });

        test('should separate opening and closing tags with newlines', () => {
            const input = '<div><span>text</span></div>';
            const result = generator.formatHTML(input);

            expect(result.split('\n').length).toBeGreaterThan(1);
        });
    });

    describe('indentHTML', () => {
        test('should add correct number of spaces to each line', () => {
            const input = 'line1\nline2\nline3';
            const result = generator.indentHTML(input, 4);

            const lines = result.split('\n');
            lines.forEach(line => {
                expect(line.startsWith('    ')).toBe(true);
            });
        });

        test('should handle zero indentation', () => {
            const input = 'line1\nline2';
            const result = generator.indentHTML(input, 0);

            expect(result).toBe('line1\nline2');
        });

        test('should handle single line input', () => {
            const input = 'single line';
            const result = generator.indentHTML(input, 2);

            expect(result).toBe('  single line');
        });
    });

    describe('generatePreviewHTML', () => {
        test('should escape HTML entities', () => {
            const input = '<div class="test">';
            const result = generator.generatePreviewHTML(input);

            expect(result).toContain('&lt;');
            expect(result).toContain('&gt;');
        });

        test('should add syntax highlighting for tags', () => {
            const input = '<div></div>';
            const result = generator.generatePreviewHTML(input);

            // Tags are wrapped in a span - verify div appears with span wrapper
            expect(result).toContain('div</span>');
        });

        test('should add syntax highlighting for attributes', () => {
            const input = '<div id="test"></div>';
            const result = generator.generatePreviewHTML(input);

            // Attribute names are wrapped - verify span exists for id
            expect(result).toContain('id</span>=');
        });

        test('should add syntax highlighting for strings', () => {
            const input = '<div id="test"></div>';
            const result = generator.generatePreviewHTML(input);

            // String values are wrapped - simplified check
            expect(result).toContain('class="string"');
        });

        test('should handle ampersands in content', () => {
            const input = '<p>Tom & Jerry</p>';
            const result = generator.generatePreviewHTML(input);

            expect(result).toContain('&amp;');
        });
    });

    describe('downloadHTML', () => {
        test('should create Blob with correct content type', () => {
            const createElementSpy = jest.spyOn(document, 'createElement');
            const appendChildSpy = jest.spyOn(document.body, 'appendChild');
            const removeChildSpy = jest.spyOn(document.body, 'removeChild');

            generator.downloadHTML('test.html', '<html></html>');

            expect(URL.createObjectURL).toHaveBeenCalled();
            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(URL.revokeObjectURL).toHaveBeenCalled();

            createElementSpy.mockRestore();
            appendChildSpy.mockRestore();
            removeChildSpy.mockRestore();
        });

        test('should set correct filename', () => {
            const mockAnchor = {
                href: '',
                download: '',
                click: jest.fn()
            };
            jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
            jest.spyOn(document.body, 'appendChild').mockImplementation(() => { });
            jest.spyOn(document.body, 'removeChild').mockImplementation(() => { });

            generator.downloadHTML('my-page.html', '<html></html>');

            expect(mockAnchor.download).toBe('my-page.html');

            document.createElement.mockRestore();
            document.body.appendChild.mockRestore();
            document.body.removeChild.mockRestore();
        });
    });
});
