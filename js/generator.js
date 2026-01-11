/**
 * Bootstrap Builder - Code Generator
 */

class CodeGenerator {
    constructor() {
        this.beautifyOptions = {
            indent_size: 4,
            wrap_line_length: 120
        };
    }

    // Generate complete HTML document
    generateFullHTML(canvasContent, theme = 'default') {
        let bootstrapCSS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';

        if (theme !== 'default') {
            bootstrapCSS = `https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${theme}/bootstrap.min.css`;
        }

        const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Bootstrap Website</title>
    <!-- Bootstrap 5 CSS -->
    <link href="${bootstrapCSS}" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
</head>
<body>
${this.indentHTML(canvasContent, 4)}
    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"><\/script>
</body>
</html>`;

        return template;
    }

    // Extract clean HTML from canvas
    extractCanvasHTML(canvas) {
        const components = canvas.querySelectorAll('.canvas-component');
        let html = '';

        components.forEach(wrapper => {
            // Get the actual content, excluding action buttons
            const content = wrapper.querySelector('.component-content');
            if (content) {
                html += content.innerHTML.trim() + '\n\n';
            }
        });

        return html.trim();
    }

    // Beautify/format HTML
    formatHTML(html) {
        // Simple HTML formatting
        let formatted = '';
        let indent = 0;
        const tab = '    ';

        // Split by tags
        const tokens = html.replace(/>\s*</g, '>\n<').split('\n');

        tokens.forEach(token => {
            token = token.trim();
            if (!token) return;

            // Check if closing tag
            if (token.match(/^<\/\w/)) {
                indent = Math.max(0, indent - 1);
            }

            formatted += tab.repeat(indent) + token + '\n';

            // Check if opening tag (not self-closing, not closing)
            if (token.match(/^<\w[^>]*[^\/]>$/) && !token.match(/^<(br|hr|img|input|meta|link)/i)) {
                indent++;
            }
        });

        return formatted.trim();
    }

    // Indent HTML content
    indentHTML(html, spaces) {
        const indent = ' '.repeat(spaces);
        return html.split('\n').map(line => indent + line).join('\n');
    }

    // Generate preview HTML for syntax highlighting
    generatePreviewHTML(html) {
        // Escape HTML entities
        let escaped = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Basic syntax highlighting
        escaped = escaped
            // Tags
            .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="tag">$2</span>')
            // Attributes
            .replace(/([\w-]+)(=)/g, '<span class="attr">$1</span>$2')
            // Strings
            .replace(/"([^"]*)"/g, '"<span class="string">$1</span>"');

        return escaped;
    }

    // Download HTML file
    downloadHTML(filename, content) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
