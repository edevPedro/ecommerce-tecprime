import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../contexts/CartContext';
import api from '../services/api';

export const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('default');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.categoria || 'Uncategorized')))];

  const filteredProducts = products
    .filter(product => selectedCategory === 'All' || product.categoria === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.preco - b.preco;
      if (sortBy === 'price-desc') return b.preco - a.preco;
      return 0;
    });


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-b-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-brand-gray/20 border-b-2 border-black py-24 sm:py-32 mb-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <h1 className="mt-2 text-5xl font-black tracking-tight text-black sm:text-7xl uppercase drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
              Essentials <br className="hidden sm:block" />
              <span className="bg-brand-orange px-2 inline-block transform -rotate-1 border-2 border-black shadow-neu text-white">For Everyone</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-black font-medium max-w-xl mx-auto bg-white/50 backdrop-blur-sm p-4 rounded-xl border-2 border-black shadow-neu-sm">
              Curated selection of high-quality products (hehe) designed to elevate your lifestyle. Bold. Simple. Yours.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="#catalog" className="neu-btn text-lg hover:scale-105 active:scale-95">
                Start Shopping
              </a>
              <a href="#" className="text-sm font-bold leading-6 text-black hover:underline decoration-wavy decoration-2 decoration-brand-orange underline-offset-4">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div id="catalog" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-black uppercase mb-2">Featured Items</h2>
            <div className="h-2 w-24 bg-brand-orange border-2 border-black shadow-neu-sm mb-4"></div>
            <p className="text-gray-600 font-medium max-w-2xl">
              Handpicked items available for immediate delivery (just for tecprime people).
            </p>
          </div>

          {/* Filter/Sort Controls */}
          <div className="mt-6 md:mt-0 flex gap-4">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 text-sm font-bold text-black bg-white border-2 border-black rounded-lg shadow-neu focus:outline-none focus:translate-y-[2px] focus:shadow-none transition-all cursor-pointer uppercase"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 text-sm font-bold text-black bg-white border-2 border-black rounded-lg shadow-neu focus:outline-none focus:translate-y-[2px] focus:shadow-none transition-all cursor-pointer uppercase"
              >
                <option value="default">Sort by</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 xl:gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
