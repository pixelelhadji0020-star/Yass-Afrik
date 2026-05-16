import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingBag, Phone, ArrowUpRight, Check } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const WHATSAPP_NUMBER = "221778364815"; 

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error("Erreur Supabase :", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleWhatsAppOrder = (product) => {
    const message = `Bonjour Yass'Afrik, je souhaite commander l'article suivant :\n\n🔹 *Produit :* ${product.name}\n💰 *Prix :* ${product.price.toLocaleString()} FCFA\n\nEst-il disponible ?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  const categories = ['Tous', ...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory === 'Tous' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-brandBlack">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-widest font-serif text-brandBlack">YASS'AFRIK</span>
            <span className="text-[9px] tracking-widest text-gold font-medium uppercase -mt-1">Made in Senegal</span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-sm tracking-wider uppercase">
            <a href="#hero" className="hover:text-gold transition">Accueil</a>
            <a href="#catalogue" className="hover:text-gold transition">Collection</a>
            <a href="#a-propos" className="hover:text-gold transition">À propos</a>
          </div>
          <a 
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-brandBlack text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gold transition shadow-sm"
          >
            <Phone size={16} />
            <span>Contact</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative bg-brandBlack text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <span className="text-gold tracking-[0.3em] font-semibold text-xs uppercase block">L'élégance Traditionnelle</span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            Des Chaussures Uniques pour Sublimer Votre Style
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-base sm:text-lg font-light">
            Découvrez nos collections de chaussures traditionnelles et accessoires confectionnés avec passion au Sénégal.
          </p>
          <div className="pt-4">
            <a 
              href="#catalogue" 
              className="inline-flex items-center gap-2 bg-white text-brandBlack px-8 py-3.5 rounded-full font-bold hover:bg-gold hover:text-white transition group"
            >
              <span>Voir la collection</span>
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </a>
          </div>
        </div>
      </section>

      {/* Catalogue Section */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Notre Collection</h2>
          <div className="h-1 w-12 bg-gold mx-auto"></div>
          <p className="text-gray-500 text-sm">Sélectionnez vos articles favoris et passez commande directement via WhatsApp.</p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                selectedCategory === category
                  ? 'bg-gold text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grille de Produits */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Chargement de la collection...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 flex flex-col group">
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full text-gray-700 shadow-sm">
                    {product.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gold transition">{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-brandBlack font-serif">
                      {product.price.toLocaleString()} <span className="text-xs font-sans text-gray-500 font-normal">FCFA</span>
                    </span>
                    <button
                      onClick={() => handleWhatsAppOrder(product)}
                      className="inline-flex items-center gap-2 bg-brandBlack text-white group-hover:bg-gold px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <ShoppingBag size={14} />
                      <span>Commander</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer id="a-propos" className="bg-brandBlack text-white border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <span className="text-2xl font-bold tracking-widest font-serif block">YASS'AFRIK</span>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Vente de vêtements, chaussures et toutes autres catégories d'accessoires. Valoriser le savoir-faire local à travers des créations modernes et durables.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-gold font-semibold tracking-wider text-sm uppercase">Informations</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-light">
              <li className="flex items-center gap-2"><Check size={14} className="text-gold" /> Production locale au Sénégal</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-gold" /> Commandes sécurisées sur WhatsApp</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-gold" /> Livraison rapide</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-gold font-semibold tracking-wider text-sm uppercase">Contact direct</h4>
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer" 
              className="inline-flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 transition px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <Phone size={16} />
              <span>+221 77 836 48 15</span>
            </a>
          </div>
        </div>
        <div className="border-t border-gray-900 bg-[#050505] py-6 text-center text-xs text-gray-500 tracking-wider">
          © {new Date().getFullYear()} YASS'AFRIK. Made in Senegal. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
