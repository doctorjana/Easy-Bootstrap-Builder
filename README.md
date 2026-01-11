# Bootstrap Builder - Drag & Drop Website Builder

A powerful, no-code visual website builder that leverages **Bootstrap 5.3** to create responsive, professional websites through an intuitive drag-and-drop interface.

![Bootstrap Builder](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

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

### 🔔 Toast Notifications
- Visual feedback for all user actions (save, export, errors, etc.)

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A local web server (optional, for best experience)

### Installation

1. **Clone or Download** the repository:
   ```bash
   git clone https://github.com/your-username/bootstrap-builder.git
   ```

2. **Open in Browser**:
   - Simply open `index.html` in your browser
   - Or serve via a local server for full functionality:
     ```bash
     # Using Python
     python -m http.server 5500
     
     # Using Node.js (http-server)
     npx http-server -p 5500
     
     # Using VS Code Live Server extension
     # Right-click index.html → "Open with Live Server"
     ```

3. **Start Building**:
   - Drag components from the left sidebar onto the canvas
   - Click components to edit their properties
   - Export your creation when ready!

---

## 📖 How to Use

### Building a Page

1. **Select a Category** – Click on a category in the sidebar (e.g., "Hero Sections")
2. **Drag a Component** – Drag your chosen component onto the canvas
3. **Position It** – Drop it where the blue indicator appears
4. **Customize** – Click the component to open the Properties Panel and edit text, colors, links, etc.
5. **Repeat** – Add more components to build your complete page

### Editing Components

- **Click** any component on the canvas to select it
- The **Properties Panel** (right side) shows editable options:
  - Text content
  - CSS classes
  - Link URLs
  - Image sources
  - Button variants
  - And more...

### Nesting Components

- Drag components **inside** layout containers:
  - Drop into a **Container** for centered content
  - Drop into a **Row** to utilize the grid
  - Drop into **Columns** for multi-column layouts

### Changing Themes

1. Click the **Theme Dropdown** in the top toolbar
2. Select any Bootswatch theme
3. The entire canvas updates instantly

### Exporting Your Work

1. Click the **Export** button (download icon) in the toolbar
2. Choose your export format:
   - **Download HTML** – Saves a complete HTML file
   - **Copy HTML** – Copies code to clipboard

---

## 🗂️ Project Structure

```
Bootstrap/
├── index.html          # Main application file
├── css/
│   └── builder.css     # Application styles
├── js/
│   ├── app.js          # Main application logic
│   ├── components.js   # Component definitions library
│   ├── drag-drop.js    # Drag and drop functionality
│   ├── properties.js   # Properties panel logic
│   ├── export.js       # HTML export utilities
│   └── themes.js       # Theme switching logic
└── README.md           # This file
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
