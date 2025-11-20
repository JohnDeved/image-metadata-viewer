# Image Metadata Viewer 🖼️✨

A web application for extracting and viewing comprehensive metadata from your images. Features AI-generated image detection, interactive WebGL shader effects, GPS mapping, and complete EXIF data analysis. Built with React, TypeScript, and a focus on privacy and performance.

![Image Metadata Viewer](https://img.shields.io/badge/React-19-61dafb?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## ✨ Features

- **🤖 AI Image Detection** - Automatically detect and display metadata from AI-generated images (Stable Diffusion, DALL-E, Midjourney, etc.)
- **🎨 Interactive WebGL Background** - Shader effects that react to mouse movement and UI interactions
- **📊 Comprehensive Metadata Display** - View all EXIF data including camera settings, GPS location, timestamps, and technical details
- **🌍 GPS Mapping** - Parse and display geographic coordinates with hemisphere indicators
- **🎭 Animated UI** - Responsive interface with smooth Framer Motion animations
- **🔒 Privacy-First** - All processing happens client-side in your browser - your images never leave your device
- **🎯 Dual View Modes** - Toggle between formatted (human-readable) and raw (technical) metadata views
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🖼️ Format Support** - Compatible with JPEG, PNG, TIFF, and other common image formats
- **⚡ Fast & Lightweight** - Built with Vite and optimized for performance with Zustand state management
- **🎨 Mint Theme** - Clean, modern design with a refreshing mint color palette and dark mode

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
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management solution
- **[ExifReader](https://github.com/mattiasw/ExifReader)** - Fast and comprehensive EXIF reader
- **[Lucide React](https://lucide.dev/)** - Icon library
- **WebGL** - Hardware-accelerated shader effects

## 📖 Usage

1. **Upload an Image**
   - Drag and drop an image onto the drop zone
   - Or click to browse and select a file from your device
   - Enjoy the interactive WebGL shader background that reacts to your movements

2. **View Metadata**
   - Once loaded, the metadata will be displayed in an organized, easy-to-read format
   - Use the toggle button to switch between formatted and raw views
   - AI-generated images will show an additional "AI Data" tab with generation parameters

3. **Explore Details**
   - View camera settings (ISO, aperture, shutter speed, focal length)
   - See GPS coordinates with parsed latitude/longitude if available
   - Check timestamps and file information
   - Access AI generation parameters (prompts, models, settings) from supported tools
   - Access all technical EXIF data

4. **Clear & Start Over**
   - Click the "Clear" button to remove the current image and load a new one

## 🏗️ Project Structure

```
image-metadata-viewer/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx                # App header with branding
│   │   ├── ImageDropZone.tsx         # File upload interface with WebGL background
│   │   ├── ShaderBackground.tsx      # Interactive WebGL shader component
│   │   ├── MetadataViewer.tsx        # Main metadata display
│   │   ├── FormattedMetadataView.tsx # Human-readable metadata view
│   │   ├── RawMetadataView.tsx       # Technical raw data view
│   │   ├── AIMetadataSection.tsx     # AI-generated image metadata
│   │   ├── GPSMetadataSection.tsx    # GPS coordinate display
│   │   ├── MetadataSection.tsx       # Reusable section component
│   │   ├── MetadataGrid.tsx          # Grid layout for metadata
│   │   ├── DataGridItem.tsx          # Individual metadata items
│   │   └── StatCard.tsx              # Statistic card component
│   ├── utils/           # Utility functions
│   │   ├── metadata.ts               # Metadata processing utilities
│   │   ├── metadataHelpers.ts        # Helper functions for formatting
│   │   ├── shaders.ts                # WebGL shader code
│   │   └── errors.ts                 # Error handling utilities
│   ├── store.ts         # Zustand state management
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
