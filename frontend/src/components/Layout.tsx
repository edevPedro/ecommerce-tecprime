import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-24 sm:py-32">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800/50">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              TecPrime Store
            </h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Innovative solutions for modern problems. Explore our catalog and
              experience the future of digital shopping.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/tecprimesolucoes/"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-sky-600 transition-colors"
              >
                ig
              </a>
              <a
                href="https://www.github.com/edevpedro"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-sky-600 transition-colors"
              >
                gh
              </a>
              <a
                href="https://www.facebook.com/tecprimesolucao"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-sky-600 transition-colors"
              >
                fb
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-12 pt-8 border-t border-slate-800/50 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} TecPrime Store. No rights reserved
          XD.
        </div>
      </footer>
    </div>
  );
};
