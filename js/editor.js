/**
 * Bootstrap Builder - Inline Editor
 * Handles text editing, background changes, and row/column management
 */

class InlineEditor {
    constructor() {
        this.selectedComponent = null;
        this.propertiesPanel = document.getElementById('propertiesPanel');
        this.propertiesContent = document.getElementById('propertiesContent');
        this.propertiesForm = document.getElementById('propertiesForm');

        this.init();
    }

    init() {
        this.setupPropertyListeners();
    }

    // Make all text elements in a component editable
    makeEditable(componentWrapper) {
        const content = componentWrapper.querySelector('.component-content');
        if (!content) return;

        // Editable text elements
        const editableSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'a', 'li', 'td', 'th',
            'label', 'button', '.card-title', '.card-text',
            '.navbar-brand', '.nav-link', '.btn',
            '.alert', '.badge', '.list-group-item',
            'figcaption', 'blockquote'
        ];

        editableSelectors.forEach(selector => {
            content.querySelectorAll(selector).forEach(el => {
                // Skip elements that contain other editable elements
                if (el.querySelector(editableSelectors.join(','))) return;
                // Skip form controls
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return;
                // Skip icons
                if (el.classList.contains('bi') || el.querySelector('.bi')) {
                    // Only skip if ONLY contains icon
                    if (el.textContent.trim() === '') return;
                }

                el.setAttribute('contenteditable', 'true');
                el.classList.add('editable-text');

                // Prevent drag when editing
                el.addEventListener('mousedown', (e) => e.stopPropagation());
                el.addEventListener('focus', (e) => {
                    el.classList.add('editing');
                    e.stopPropagation();
                });
                el.addEventListener('blur', () => {
                    el.classList.remove('editing');
                    // Trigger code update
                    if (window.builder) {
                        window.builder.updateCodePreview();
                        window.builder.saveState();
                    }
                });
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        el.blur();
                    }
                    e.stopPropagation();
                });
            });
        });
    }

    // Show properties panel for selected component
    showProperties(componentWrapper) {
        this.selectedComponent = componentWrapper;
        const content = componentWrapper.querySelector('.component-content');
        if (!content) return;

        // Get first child element for styling
        const firstChild = content.firstElementChild;
        if (!firstChild) return;

        // Show form, hide empty state
        this.propertiesContent.querySelector('.properties-empty').style.display = 'none';
        this.propertiesForm.style.display = 'block';

        // Get computed styles
        const styles = window.getComputedStyle(firstChild);

        // Background color
        const bgColor = this.rgbToHex(styles.backgroundColor) || '#ffffff';
        document.getElementById('bgColor').value = bgColor;
        document.getElementById('bgColorText').value = bgColor;

        // Text color
        const textColor = this.rgbToHex(styles.color) || '#000000';
        document.getElementById('textColor').value = textColor;
        document.getElementById('textColorText').value = textColor;

        // Check if layout component (has .row)
        const hasRow = content.querySelector('.row');
        const layoutSection = document.getElementById('layoutSection');
        if (hasRow) {
            layoutSection.style.display = 'block';
        } else {
            layoutSection.style.display = 'none';
        }

        // Check if has links/buttons
        const linkSection = document.getElementById('linkSection');
        const firstLink = content.querySelector('a');
        if (firstLink) {
            linkSection.style.display = 'block';
            document.getElementById('linkUrl').value = firstLink.getAttribute('href') || '#';
            document.getElementById('linkTarget').value = firstLink.getAttribute('target') || '_self';
        } else {
            linkSection.style.display = 'none';
        }

        // Check if has images
        const imageSection = document.getElementById('imageSection');
        const firstImage = content.querySelector('img');
        if (firstImage) {
            imageSection.style.display = 'block';
            document.getElementById('imageUrl').value = firstImage.getAttribute('src') || '';
            document.getElementById('imageAlt').value = firstImage.getAttribute('alt') || '';
        } else {
            imageSection.style.display = 'none';
        }

        // Component-specific options
        this.showComponentOptions(componentWrapper);

        // Gradient options
        document.getElementById('bgType').value = 'color';
        document.getElementById('gradientOptions').style.display = 'none';
    }

    // Hide properties panel
    hideProperties() {
        this.selectedComponent = null;
        this.propertiesContent.querySelector('.properties-empty').style.display = 'flex';
        this.propertiesForm.style.display = 'none';
    }

    // Setup property change listeners
    setupPropertyListeners() {
        // Background color
        const bgColor = document.getElementById('bgColor');
        const bgColorText = document.getElementById('bgColorText');

        bgColor?.addEventListener('input', (e) => {
            bgColorText.value = e.target.value;
            this.applyBackground(e.target.value);
        });

        bgColorText?.addEventListener('change', (e) => {
            bgColor.value = e.target.value;
            this.applyBackground(e.target.value);
        });

        // Background type
        document.getElementById('bgType')?.addEventListener('change', (e) => {
            const gradientOptions = document.getElementById('gradientOptions');
            if (e.target.value === 'gradient') {
                gradientOptions.style.display = 'block';
                this.applyGradient();
            } else if (e.target.value === 'transparent') {
                gradientOptions.style.display = 'none';
                this.applyBackground('transparent');
            } else {
                gradientOptions.style.display = 'none';
                this.applyBackground(document.getElementById('bgColor').value);
            }
        });

        // Gradient end color
        const bgGradientEnd = document.getElementById('bgGradientEnd');
        const bgGradientEndText = document.getElementById('bgGradientEndText');

        bgGradientEnd?.addEventListener('input', (e) => {
            bgGradientEndText.value = e.target.value;
            this.applyGradient();
        });

        bgGradientEndText?.addEventListener('change', (e) => {
            bgGradientEnd.value = e.target.value;
            this.applyGradient();
        });

        // Text color
        const textColor = document.getElementById('textColor');
        const textColorText = document.getElementById('textColorText');

        textColor?.addEventListener('input', (e) => {
            textColorText.value = e.target.value;
            this.applyTextColor(e.target.value);
        });

        textColorText?.addEventListener('change', (e) => {
            textColor.value = e.target.value;
            this.applyTextColor(e.target.value);
        });

        // Padding
        document.getElementById('padding')?.addEventListener('change', (e) => {
            this.applySpacing('padding', e.target.value);
        });

        // Margin
        document.getElementById('margin')?.addEventListener('change', (e) => {
            this.applySpacing('margin', e.target.value);
        });

        // Add column
        document.getElementById('btnAddColumn')?.addEventListener('click', () => {
            this.addColumn();
        });

        // Remove column
        document.getElementById('btnRemoveColumn')?.addEventListener('click', () => {
            this.removeColumn();
        });

        // Duplicate from properties
        document.getElementById('btnDuplicateComp')?.addEventListener('click', () => {
            if (window.builder && this.selectedComponent) {
                window.builder.duplicateComponent(this.selectedComponent);
            }
        });

        // Delete from properties
        document.getElementById('btnDeleteComp')?.addEventListener('click', () => {
            if (window.builder && this.selectedComponent) {
                window.builder.deleteComponent(this.selectedComponent);
                this.hideProperties();
            }
        });

        // Link URL
        document.getElementById('linkUrl')?.addEventListener('change', (e) => {
            this.applyLinkUrl(e.target.value);
        });

        // Link Target
        document.getElementById('linkTarget')?.addEventListener('change', (e) => {
            this.applyLinkTarget(e.target.value);
        });

        // Image URL
        document.getElementById('imageUrl')?.addEventListener('change', (e) => {
            this.applyImageUrl(e.target.value);
        });

        // Image Alt
        document.getElementById('imageAlt')?.addEventListener('change', (e) => {
            this.applyImageAlt(e.target.value);
        });

        // Random Image button
        document.getElementById('btnRandomImage')?.addEventListener('click', () => {
            this.applyRandomImage();
        });

        // Component Options - Item Count
        document.getElementById('btnApplyItemCount')?.addEventListener('click', () => {
            const count = parseInt(document.getElementById('itemCount').value) || 4;
            this.applyItemCount(count);
        });

        // Component Options - Progress
        document.getElementById('progressPercent')?.addEventListener('input', (e) => {
            document.getElementById('progressValue').textContent = e.target.value;
            this.applyProgress(parseInt(e.target.value));
        });

        // Component Options - Accordion Items
        document.getElementById('btnApplyAccordion')?.addEventListener('click', () => {
            const count = parseInt(document.getElementById('accordionCount').value) || 3;
            this.applyAccordionCount(count);
        });
    }

    // Apply background color
    applyBackground(color) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const firstChild = content?.firstElementChild;
        if (firstChild) {
            firstChild.style.background = color;
            // Remove Bootstrap bg classes
            firstChild.className = firstChild.className.replace(/\bbg-\w+\b/g, '').trim();
            this.triggerUpdate();
        }
    }

    // Apply gradient
    applyGradient() {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const firstChild = content?.firstElementChild;
        if (firstChild) {
            const color1 = document.getElementById('bgColor').value;
            const color2 = document.getElementById('bgGradientEnd').value;
            firstChild.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
            this.triggerUpdate();
        }
    }

    // Apply text color
    applyTextColor(color) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const firstChild = content?.firstElementChild;
        if (firstChild) {
            firstChild.style.color = color;
            // Also apply to all text children
            firstChild.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li').forEach(el => {
                el.style.color = color;
            });
            // Remove Bootstrap text color classes
            firstChild.className = firstChild.className.replace(/\btext-\w+\b/g, '').trim();
            this.triggerUpdate();
        }
    }

    // Apply spacing classes
    applySpacing(type, value) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const firstChild = content?.firstElementChild;
        if (firstChild) {
            // Remove existing padding/margin classes
            const prefix = type === 'padding' ? 'p-' : 'my-';
            firstChild.className = firstChild.className.replace(new RegExp(`\\b${prefix}\\d\\b`, 'g'), '').trim();
            if (value) {
                firstChild.classList.add(value);
            }
            this.triggerUpdate();
        }
    }

    // Add column to row
    addColumn() {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const row = content?.querySelector('.row');
        if (!row) return;

        // Get existing column structure
        const existingCol = row.querySelector('[class*="col"]');
        const colClass = existingCol ? existingCol.className.match(/col(-\w+)?(-\d+)?/)?.[0] || 'col-md-4' : 'col-md-4';

        // Create new column
        const newCol = document.createElement('div');
        newCol.className = colClass;
        newCol.innerHTML = '<div class="p-3 border rounded bg-light">New Column</div>';

        row.appendChild(newCol);
        this.makeEditable(this.selectedComponent);
        this.triggerUpdate();
    }

    // Remove last column from row
    removeColumn() {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const row = content?.querySelector('.row');
        if (!row) return;

        const cols = row.querySelectorAll('[class*="col"]');
        if (cols.length > 1) {
            cols[cols.length - 1].remove();
            this.triggerUpdate();
        }
    }

    // Apply link URL to all links in component
    applyLinkUrl(url) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const links = content?.querySelectorAll('a');
        links?.forEach(link => {
            link.setAttribute('href', url);
        });
        this.triggerUpdate();
    }

    // Apply link target to all links in component
    applyLinkTarget(target) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const links = content?.querySelectorAll('a');
        links?.forEach(link => {
            if (target === '_blank') {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            } else {
                link.removeAttribute('target');
                link.removeAttribute('rel');
            }
        });
        this.triggerUpdate();
    }

    // Apply image URL to all images in component
    applyImageUrl(url) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const images = content?.querySelectorAll('img');
        images?.forEach(img => {
            img.setAttribute('src', url);
        });
        this.triggerUpdate();
    }

    // Apply alt text to all images in component
    applyImageAlt(alt) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const images = content?.querySelectorAll('img');
        images?.forEach(img => {
            img.setAttribute('alt', alt);
        });
        this.triggerUpdate();
    }

    // Apply random Picsum image
    applyRandomImage() {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const firstImage = content?.querySelector('img');
        if (!firstImage) return;

        // Get current dimensions from the image or use defaults
        const width = firstImage.naturalWidth || 800;
        const height = firstImage.naturalHeight || 400;

        // Generate random Picsum URL with random seed for variety
        const randomSeed = Math.floor(Math.random() * 1000);
        const url = `https://picsum.photos/seed/${randomSeed}/${width}/${height}`;

        // Update all images in component
        const images = content?.querySelectorAll('img');
        images?.forEach(img => {
            img.setAttribute('src', url);
        });

        // Update the URL input field
        document.getElementById('imageUrl').value = url;

        this.triggerUpdate();
    }

    // Convert RGB to Hex
    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';

        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return '#ffffff';

        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);

        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Show component-specific options based on component type
    showComponentOptions(componentWrapper) {
        const componentType = componentWrapper.dataset.type;
        const optionsSection = document.getElementById('componentOptionsSection');
        const itemCountGroup = document.getElementById('itemCountGroup');
        const progressGroup = document.getElementById('progressGroup');
        const accordionGroup = document.getElementById('accordionGroup');

        // Hide all first
        optionsSection.style.display = 'none';
        itemCountGroup.style.display = 'none';
        progressGroup.style.display = 'none';
        accordionGroup.style.display = 'none';

        const content = componentWrapper.querySelector('.component-content');
        if (!content) return;

        // Horizontal scroll items
        if (componentType === 'scroll-x' || componentType === 'scroll-cards') {
            optionsSection.style.display = 'block';
            itemCountGroup.style.display = 'block';
            const items = content.querySelectorAll('.d-flex > div, .d-flex > .card');
            document.getElementById('itemCount').value = items.length || 4;
        }

        // Nav pills/tabs
        if (componentType === 'nav-pills' || componentType === 'nav-tabs') {
            optionsSection.style.display = 'block';
            itemCountGroup.style.display = 'block';
            const items = content.querySelectorAll('.nav-item');
            document.getElementById('itemCount').value = items.length || 4;
        }

        // List groups
        if (componentType === 'list-group' || componentType === 'list-group-flush') {
            optionsSection.style.display = 'block';
            itemCountGroup.style.display = 'block';
            const items = content.querySelectorAll('.list-group-item');
            document.getElementById('itemCount').value = items.length || 3;
        }

        // Progress bars
        if (componentType === 'progress' || componentType === 'progress-striped') {
            optionsSection.style.display = 'block';
            progressGroup.style.display = 'block';
            const progressBar = content.querySelector('.progress-bar');
            if (progressBar) {
                const width = parseInt(progressBar.style.width) || 50;
                document.getElementById('progressPercent').value = width;
                document.getElementById('progressValue').textContent = width;
            }
        }

        // Accordion
        if (componentType === 'accordion' || componentType === 'style-faq') {
            optionsSection.style.display = 'block';
            accordionGroup.style.display = 'block';
            const items = content.querySelectorAll('.accordion-item');
            document.getElementById('accordionCount').value = items.length || 2;
        }
    }

    // Apply item count for scrollable/nav components
    applyItemCount(count) {
        if (!this.selectedComponent) return;
        const componentType = this.selectedComponent.dataset.type;
        const content = this.selectedComponent.querySelector('.component-content');
        if (!content) return;

        // Handle horizontal scroll
        if (componentType === 'scroll-x') {
            const container = content.querySelector('.d-flex');
            if (!container) return;
            const items = container.querySelectorAll(':scope > div');
            const currentCount = items.length;

            if (count > currentCount) {
                // Add items
                const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-secondary'];
                for (let i = currentCount; i < count; i++) {
                    const newItem = document.createElement('div');
                    newItem.className = `p-4 ${colors[i % colors.length]} ${i % 6 > 2 ? '' : 'text-white'} rounded`;
                    newItem.textContent = `Item ${i + 1}`;
                    container.appendChild(newItem);
                }
            } else if (count < currentCount) {
                // Remove items
                for (let i = currentCount - 1; i >= count; i--) {
                    items[i]?.remove();
                }
            }
        }

        // Handle scroll cards
        if (componentType === 'scroll-cards') {
            const container = content.querySelector('.d-flex');
            if (!container) return;
            const cards = container.querySelectorAll('.card');
            const currentCount = cards.length;

            if (count > currentCount) {
                for (let i = currentCount; i < count; i++) {
                    const seed = Math.floor(Math.random() * 1000);
                    const newCard = document.createElement('div');
                    newCard.className = 'card flex-shrink-0';
                    newCard.style.width = '250px';
                    newCard.innerHTML = `<img src="https://picsum.photos/seed/${seed}/250/150" class="card-img-top" alt="Card"><div class="card-body"><h6 class="card-title">Card ${i + 1}</h6></div>`;
                    container.appendChild(newCard);
                }
            } else if (count < currentCount) {
                for (let i = currentCount - 1; i >= count; i--) {
                    cards[i]?.remove();
                }
            }
        }

        // Handle nav pills/tabs
        if (componentType === 'nav-pills' || componentType === 'nav-tabs') {
            const nav = content.querySelector('.nav');
            if (!nav) return;
            const items = nav.querySelectorAll('.nav-item');
            const currentCount = items.length;

            if (count > currentCount) {
                for (let i = currentCount; i < count; i++) {
                    const newItem = document.createElement('li');
                    newItem.className = 'nav-item';
                    newItem.innerHTML = `<a class="nav-link" href="#">Tab ${i + 1}</a>`;
                    nav.appendChild(newItem);
                }
            } else if (count < currentCount && count >= 1) {
                for (let i = currentCount - 1; i >= count; i--) {
                    items[i]?.remove();
                }
            }
        }

        // Handle list groups
        if (componentType === 'list-group' || componentType === 'list-group-flush') {
            const list = content.querySelector('.list-group');
            if (!list) return;
            const items = list.querySelectorAll('.list-group-item');
            const currentCount = items.length;

            if (count > currentCount) {
                for (let i = currentCount; i < count; i++) {
                    const newItem = document.createElement('li');
                    newItem.className = 'list-group-item';
                    newItem.textContent = `Item ${i + 1}`;
                    list.appendChild(newItem);
                }
            } else if (count < currentCount && count >= 1) {
                for (let i = currentCount - 1; i >= count; i--) {
                    items[i]?.remove();
                }
            }
        }

        this.triggerUpdate();
        if (window.toast) {
            window.toast.success('Updated', `Item count set to ${count}`);
        }
    }

    // Apply progress percentage
    applyProgress(percent) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const progressBars = content?.querySelectorAll('.progress-bar');

        progressBars?.forEach(bar => {
            bar.style.width = `${percent}%`;
            bar.textContent = `${percent}%`;
        });

        this.triggerUpdate();
    }

    // Apply accordion item count
    applyAccordionCount(count) {
        if (!this.selectedComponent) return;
        const content = this.selectedComponent.querySelector('.component-content');
        const accordion = content?.querySelector('.accordion');
        if (!accordion) return;

        const items = accordion.querySelectorAll('.accordion-item');
        const currentCount = items.length;
        const accordionId = accordion.id || 'acc' + Date.now();
        accordion.id = accordionId;

        if (count > currentCount) {
            for (let i = currentCount; i < count; i++) {
                const itemId = `collapse${accordionId}${i}`;
                const newItem = document.createElement('div');
                newItem.className = 'accordion-item';
                newItem.innerHTML = `
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${itemId}">
                            Item #${i + 1}
                        </button>
                    </h2>
                    <div id="${itemId}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                        <div class="accordion-body">Content for item ${i + 1}.</div>
                    </div>
                `;
                accordion.appendChild(newItem);
            }
        } else if (count < currentCount && count >= 1) {
            for (let i = currentCount - 1; i >= count; i--) {
                items[i]?.remove();
            }
        }

        this.triggerUpdate();
        if (window.toast) {
            window.toast.success('Updated', `Accordion now has ${count} items`);
        }
    }

    // Trigger code update
    triggerUpdate() {
        if (window.builder) {
            window.builder.updateCodePreview();
            window.builder.saveState();
        }
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.inlineEditor = new InlineEditor();
});
