// components/Footer.jsx
const Footer = () => {
  return (
    <footer className=" bg-white/20 dark:bg-gray-800/50 backdrop-blur-md border-t border-white/20 mt-auto">
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Copyright */}
          <div className="md:text-sm text-xs text-gray-600 dark:text-gray-300 text-wrap p-4">
            © {new Date().getFullYear()} Tosky Task Manager. Tous droits réservés. by Cism-Ch
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <a 
              href="#" 
              className="md:text-sm text-xs text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <a 
              href="#" 
              className="md:text-sm text-xs text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
            <a 
              href="#" 
              className="md:text-sm text-xs text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-300"
              aria-label="GitHub"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;