# Image Metadata Viewer 📸

A beautiful, modern web application for extracting and viewing EXIF metadata from your images. Built with React, TypeScript, and a focus on privacy and performance.

![Image Metadata Viewer](https://img.shields.io/badge/React-19-61dafb?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## ✨ Features

- **📊 Comprehensive Metadata Display** - View all EXIF data from your images including camera settings, GPS location, timestamps, and technical details
- **🎨 Beautiful UI** - Modern, responsive interface with smooth animations powered by Framer Motion
- **🔒 Privacy-First** - All processing happens client-side in your browser - your images never leave your device
- **🎯 Dual View Modes** - Toggle between formatted (human-readable) and raw (technical) metadata views
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🖼️ Format Support** - Compatible with JPEG, PNG, TIFF, and other common image formats
- **⚡ Fast & Lightweight** - Built with Vite and optimized for performance
- **🎨 Mint Theme** - Clean, modern design with a refreshing mint color palette

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/image-metadata-viewer.git
cd image-metadata-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **[React 19](https://react.dev/)** - UI library with the latest features including the React Compiler
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and better developer experience
- **[Vite](https://vite.dev/)** - Next-generation frontend build tool (using Rolldown)
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animation library
- **[ExifReader](https://github.com/mattiasw/ExifReader)** - Fast and comprehensive EXIF reader
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

## 📖 Usage

1. **Upload an Image**
   - Drag and drop an image onto the drop zone
   - Or click to browse and select a file from your device

2. **View Metadata**
   - Once loaded, the metadata will be displayed in an organized, easy-to-read format
   - Use the toggle button to switch between formatted and raw views

3. **Explore Details**
   - View camera settings (ISO, aperture, shutter speed, focal length)
   - See GPS coordinates if available
   - Check timestamps and file information
   - Access all technical EXIF data

4. **Clear & Start Over**
   - Click the "Clear" button to remove the current image and load a new one

## 🏗️ Project Structure

```
image-metadata-viewer/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx              # App header with branding
│   │   ├── ImageDropZone.tsx       # File upload interface
│   │   ├── MetadataViewer.tsx      # Main metadata display
│   │   └── DataGridItem.tsx        # Individual metadata items
│   ├── utils/           # Utility functions
│   │   └── metadata.ts             # Metadata processing utilities
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template with SEO meta tags
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the production-ready application
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run tests (if configured)

## 🎨 Customization

### Changing the Theme

The app uses a mint color theme. To customize the colors, modify the Tailwind classes in the components:

- Primary color: `teal-500` (mint)
- Background: `slate-950` (dark)
- Text: `slate-200` (light)

### Adding New Metadata Fields

To display additional metadata fields, edit `src/components/MetadataViewer.tsx` and add your custom sections or modify `src/utils/metadata.ts` for processing logic.

## 🔒 Privacy & Security

This application is designed with privacy as a top priority:

- ✅ All image processing happens **locally** in your browser
- ✅ No images are uploaded to any server
- ✅ No data is collected or stored
- ✅ Works completely offline after initial load
- ✅ Your metadata stays on your device

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

Modern browsers with ES6+ support recommended.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find a bug, please open an issue on GitHub with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Acknowledgments

- [ExifReader](https://github.com/mattiasw/ExifReader) for the excellent EXIF parsing library
- [Refactoring UI](https://www.refactoringui.com/) for design inspiration
- All the amazing open-source libraries that make this project possible

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

Made with ❤️ using React, TypeScript, and modern web technologies
