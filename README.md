# Bootstrap Builder - Drag & Drop Website Builder

A powerful, no-code visual website builder that leverages **Bootstrap 5.3** to create responsive, professional websites through an intuitive drag-and-drop interface.

![Bootstrap Builder](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

### 🌐 [Live Demo](https://doctorjana.github.io/Easy-Bootstrap-Builder/)

---

## 🎯 What is Bootstrap Builder?

Bootstrap Builder is a browser-based visual website builder that allows users to create fully responsive websites without writing a single line of code. Simply drag components from the sidebar onto the canvas, customize their properties, and export production-ready HTML.

---

## ✨ Key Features

### 🧩 Extensive Component Library
- **150+ pre-built components** organized into categories:
  - **Premade Styles** – Complete hero sections, feature grids, testimonials, pricing tables, and more
  - **Layout** – Containers, rows, columns, and responsive grid systems
  - **Navigation** – Navbars, sidebars, headers, breadcrumbs, and pagination
  - **Typography** – Headings, paragraphs, blockquotes, and text utilities
  - **Content** – Images, videos, icons, badges, and media elements
  - **Cards** – Various card layouts with headers, footers, and image overlays
  - **Hero Sections** – Eye-catching landing page heroes and jumbotrons
  - **Forms** – Contact forms, login/signup forms, search bars, and input elements
  - **Components** – Accordions, modals, carousels, alerts, progress bars, and more
  - **Footers** – Multi-column footer layouts with social links

### 🎨 Theme Support (25+ Bootswatch Themes)
Switch between professional themes instantly:
- Default, Cerulean, Cosmo, Cyborg, Darkly, Flatly, Journal, Litera, Lumen, Lux, Materia, Minty, Morph, Pulse, Quartz, Sandstone, Simplex, Sketchy, Slate, Solar, Spacelab, Superhero, United, Vapor, Yeti, Zephyr

### 🖱️ Intuitive Drag & Drop
- Drag components directly onto the canvas
- Nested dropping into containers, rows, and columns
- Visual drop indicators for precise placement
- Reorder components by dragging within the canvas

### ✏️ Visual Properties Editor
- Click any component to reveal its editable properties
- Modify text content, classes, attributes, and styles
- Component-specific options (button colors, image sources, link URLs, etc.)
- Real-time preview of all changes

### 📐 Responsive Design Tools
- Preview your design at different breakpoints (Desktop, Tablet, Mobile)
- All exported code is fully responsive by default
- Utilizes Bootstrap's responsive grid system

### 💾 Export & Code Generation
- **Export Clean HTML** – Download production-ready HTML files
- **Live Code Preview** – Toggle the HTML preview panel to see generated code
- **Copy to Clipboard** – Quickly copy the HTML for use in other projects

### ⏪ Undo/Redo Support
- Full undo/redo history for all actions
- Keyboard shortcuts: `Ctrl+Z` (Undo), `Ctrl+Y` (Redo)

### 🧪 Comprehensive Test Suite
- **200+ Unit Tests** covering all core modules
- Validates component logic, HTML generation, drag-drop rules, and editor features
- Automated data validation for the component library

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (installed for running tests and development server)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/doctorjana/Easy-Bootstrap-Builder.git
   ```
2. Navigate into the directory:
   ```bash
   cd Easy-Bootstrap-Builder
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
Run the application locally with a development server:
```bash
npm run dev
```

### Running Tests
Execute the comprehensive test suite:
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

---

## 🗂️ Project Structure

```
Bootstrap/
├── index.html          # Main application file
├── package.json        # Project dependencies and scripts
├── jest.config.js      # Jest configuration
├── .gitignore          # Git ignore file
├── css/
│   └── builder.css     # Application styles
├── js/
│   ├── app.js          # Main application logic
│   ├── components.js   # Component library
│   ├── dragdrop.js     # Drag and drop manager
│   ├── editor.js       # Inline properties editor
│   ├── generator.js    # HTML generation & export
│   └── toast.js        # Notification manager
└── tests/
    ├── setup.js        # Test environment & mocks
    ├── unit/           # Unit test suite
    └── README.md       # Test documentation
```

---

## 🎨 Component Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Premade Styles** | Complete, production-ready sections | Modern Hero, Feature Grid, Pricing Table, FAQ |
| **Layout** | Structural elements | Container, Row, Columns (2-6), Sections |
| **Navigation** | Navigation components | Navbar, Sidebar, Headers, Breadcrumbs, Pagination |
| **Typography** | Text elements | Headings (H1-H6), Paragraphs, Blockquotes, Lists |
| **Content** | Media and visual elements | Images, Videos, Icons, Badges, Dividers |
| **Cards** | Card layouts | Basic Card, Image Card, Horizontal Card, Card Group |
| **Hero Sections** | Landing page heroes | Simple Hero, Gradient Hero, Split Jumbotron |
| **Forms** | Input and form elements | Contact Form, Login Form, Newsletter, Search |
| **Components** | Interactive UI elements | Accordion, Modal, Carousel, Alert, Progress |
| **Footers** | Page footers | Simple Footer, Multi-column Footer, Social Footer |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Delete` | Remove selected component |
| `Ctrl + S` | Export HTML |

---

## 🛠️ Technologies Used

- **Bootstrap 5.3** – CSS framework
- **Bootstrap Icons** – Icon library
- **Vanilla JavaScript** – No dependencies required
- **Bootswatch** – Theme collection

---

## 📝 Use Cases

### 1. **Rapid Prototyping**
Quickly mock up website designs for client presentations or stakeholder reviews without investing development time.

### 2. **Learning Bootstrap**
Explore Bootstrap components visually and see the generated HTML to understand how Bootstrap classes work.

### 3. **Landing Pages**
Create professional landing pages for products, services, or campaigns in minutes.

### 4. **Portfolio Websites**
Build a personal portfolio showcasing your work with drag-and-drop simplicity.

### 5. **Small Business Websites**
Create complete business websites with hero sections, about pages, contact forms, and footers.

### 6. **Email Templates**
Design responsive email-friendly layouts using Bootstrap's grid system.

### 7. **Education & Training**
Use as a teaching tool for web design courses to demonstrate responsive design concepts.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Add new components
- Improve documentation

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Bootstrap](https://getbootstrap.com/) – The world's most popular CSS framework
- [Bootswatch](https://bootswatch.com/) – Free themes for Bootstrap
- [Bootstrap Icons](https://icons.getbootstrap.com/) – Official Bootstrap icon library

---

**Happy Building! 🚀**
