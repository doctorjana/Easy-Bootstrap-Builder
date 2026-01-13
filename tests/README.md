# Bootstrap Builder Test Suite

A comprehensive test suite for the Bootstrap Builder drag-and-drop website builder.

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Running Tests

### Run All Unit Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Test Structure

```
tests/
├── setup.js              # DOM and mock configuration
├── README.md             # This file
└── unit/
    ├── app.test.js       # BootstrapBuilder tests
    ├── components.test.js # COMPONENTS validation
    ├── dragdrop.test.js  # DragDropManager tests
    ├── editor.test.js    # InlineEditor tests
    ├── generator.test.js # CodeGenerator tests
    └── toast.test.js     # ToastManager tests
```

## Test Coverage

| Module | Coverage Target |
|--------|-----------------|
| generator.js | 70%+ |
| toast.js | 80%+ |
| editor.js | 60%+ |
| dragdrop.js | 60%+ |
| app.js | 60%+ |

## Writing New Tests

1. Follow AAA pattern: Arrange, Act, Assert
2. Name tests descriptively: `should [action] when [condition]`
3. Mock external dependencies (localStorage, Bootstrap Modal)
4. Use `createBasicDOM()` helper from setup.js

## Mocked APIs

- `window.localStorage`
- `window.bootstrap.Modal`
- `navigator.clipboard`
- `URL.createObjectURL/revokeObjectURL`
