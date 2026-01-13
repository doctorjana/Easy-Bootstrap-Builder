/**
 * Jest Test Setup
 * Sets up the DOM environment and mocks for testing
 */

const fs = require('fs');
const path = require('path');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Bootstrap Modal
class MockModal {
  constructor(element) {
    this.element = element;
  }
  show() { }
  hide() { }
  static getInstance() {
    return new MockModal(null);
  }
}

// Mock bootstrap object
window.bootstrap = {
  Modal: MockModal
};

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

// Sample DOM structure matching index.html
const createBasicDOM = () => {
  document.body.innerHTML = `
    <div id="toastContainer" class="toast-container"></div>
    <div id="canvas" class="canvas">
      <div id="canvasPlaceholder" class="canvas-placeholder">
        <i class="bi bi-plus-circle"></i>
        <p>Drag components here to start building</p>
      </div>
    </div>
    <div id="componentsList"></div>
    <code id="codePreview"></code>
    <span id="componentCount">0 components</span>
    <input type="text" id="searchComponents" placeholder="Search...">
    <button id="btnUndo"></button>
    <button id="btnRedo"></button>
    <button id="btnClear"></button>
    <button id="btnPreview"></button>
    <button id="btnDownload"></button>
    <button id="btnCopyCode"></button>
    <select id="themeSelect"><option value="default">Default</option></select>
    <div id="contextMenu" class="context-menu">
      <button class="context-item" data-action="duplicate"></button>
      <button class="context-item" data-action="delete"></button>
    </div>
    <div id="propertiesPanel" class="properties-panel">
      <div id="propertiesContent">
        <div class="properties-empty"></div>
      </div>
      <div id="propertiesForm" style="display:none;">
        <input type="color" id="bgColor" value="#ffffff">
        <input type="text" id="bgColorText" value="#ffffff">
        <select id="bgType"><option value="color">Color</option></select>
        <div id="gradientOptions" style="display:none;"></div>
        <input type="color" id="bgGradientEnd" value="#667eea">
        <input type="text" id="bgGradientEndText" value="#667eea">
        <input type="color" id="textColor" value="#000000">
        <input type="text" id="textColorText" value="#000000">
        <select id="padding"></select>
        <select id="margin"></select>
        <button id="btnAddColumn"></button>
        <button id="btnRemoveColumn"></button>
        <button id="btnDuplicateComp"></button>
        <button id="btnDeleteComp"></button>
        <input type="text" id="linkUrl">
        <select id="linkTarget"></select>
        <input type="text" id="imageUrl">
        <input type="text" id="imageAlt">
        <button id="btnRandomImage"></button>
        <div id="componentOptionsSection" style="display:none;">
          <div id="itemCountGroup" style="display:none;">
            <input type="number" id="itemCount" value="4">
            <button id="btnApplyItemCount"></button>
          </div>
          <div id="progressGroup" style="display:none;">
            <input type="range" id="progressPercent" value="50">
            <span id="progressValue">50</span>
          </div>
          <div id="accordionGroup" style="display:none;">
            <input type="number" id="accordionCount" value="3">
            <button id="btnApplyAccordion"></button>
          </div>
        </div>
        <div id="layoutSection" style="display:none;"></div>
        <div id="linkSection" style="display:none;"></div>
        <div id="imageSection" style="display:none;"></div>
      </div>
    </div>
    <div id="componentsSidebar"></div>
    <div id="codePanel"></div>
    <link id="bootstrapTheme" href="">
    <div id="clearCanvasModal" class="modal"></div>
    <button id="confirmClearBtn"></button>
    <iframe id="previewFrame"></iframe>
    <div id="previewModal" class="modal"></div>
    <span id="editModeBadge"></span>
  `;
};

/**
 * Load a script file and execute it, exposing classes to global scope
 * @param {string} filename - The JS file to load from js/ folder
 */
const loadScript = (filename) => {
  let code = fs.readFileSync(path.join(__dirname, `../js/${filename}`), 'utf8');

  // Remove DOMContentLoaded listeners - match complete patterns
  // Pattern 1: document.addEventListener('DOMContentLoaded', () => { ... });
  // Pattern 2: document.addEventListener('DOMContentLoaded', function() { ... });
  code = code.replace(/\/\/\s*Initialize.*\r?\n?document\.addEventListener\(['"]DOMContentLoaded['"],\s*\(\)\s*=>\s*\{[^}]*\}\);?\s*/g, '');
  code = code.replace(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*\(\)\s*=>\s*\{[^}]*\}\);?\s*/g, '');
  code = code.replace(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*function\s*\(\)\s*\{[^}]*\}\);?\s*/g, '');

  // Also remove window.X = new Class() initializers at the end if inline
  code = code.replace(/window\.\w+\s*=\s*new\s+\w+\(\);?\s*$/gm, '');

  // Extract class names to expose to global scope
  const classMatches = code.match(/^class\s+(\w+)/gm) || [];
  const classNames = classMatches.map(m => m.replace('class ', ''));

  // Extract top-level const names 
  const constMatches = code.match(/^const\s+(\w+)\s*=/gm) || [];
  const constNames = constMatches.map(m => m.replace(/^const\s+/, '').replace(/\s*=$/, ''));

  // Build list of items to expose
  const varsToExpose = [...classNames, ...constNames];

  // Wrap in IIFE and expose to globalThis
  if (varsToExpose.length > 0) {
    const exports = varsToExpose.map(name => `  globalThis.${name} = ${name};`).join('\n');
    code = `(function() {\n${code}\n${exports}\n})();`;
  }

  // Execute
  eval(code);
};

// Export helpers for tests
global.createBasicDOM = createBasicDOM;
global.localStorageMock = localStorageMock;
global.loadScript = loadScript;

// Reset DOM before each test
beforeEach(() => {
  createBasicDOM();
  jest.clearAllMocks();
});
