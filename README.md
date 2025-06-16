# Next.js Dashboard

A modern dashboard application built with Next.js, featuring a clean interface for managing customers and invoices.

## Features

- 🏠 **Dashboard Home**: Overview of key metrics and data
- 👥 **Customer Management**: View and manage customer information
- 📄 **Invoice Management**: Handle invoices and billing
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🚀 **Fast Navigation**: Client-side routing with optimized performance

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Heroicons](https://heroicons.com/)
- **Language**: TypeScript
- **Font**: Inter (Google Fonts)

## Project Structure

```
app/
├── dashboard/           # Dashboard pages
│   ├── customers/      # Customer management
│   ├── invoices/       # Invoice management
│   └── layout.tsx      # Dashboard layout
├── ui/                 # UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── customers/      # Customer components
│   └── invoices/       # Invoice components
└── lib/                # Utilities and data
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nextjs-dashboard.git
   cd nextjs-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Course Reference

This project was developed following the [Next.js App Router Course](https://nextjs.org/learn) curriculum.

## Acknowledgments

- Built following Next.js best practices
- UI inspired by modern dashboard designs
- Icons provided by Heroicons
