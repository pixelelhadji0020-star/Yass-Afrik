import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingBag, Phone, ArrowUpRight, Check, Plus, Trash2, Edit3, Lock, LogOut, X, Upload } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  
  // États pour la gestion Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Formulaire Produit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'Chaussures'
  });

  const WHATSAPP_NUMBER = "221778364815"; 
  const ADMIN_PASSWORD = "YassAdmin2026"; // Code d'accès pour ta sœur

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error("Erreur Supabase :", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Connexion Admin
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassword('');
    } else {
      alert("Mot de passe incorrect !");
    }
  };

  // Ajouter ou Modifier un produit
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: formData.image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
      category: formData.category
    };

    try {
      if (editingProduct) {
        // Mode Modification
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        // Mode Ajout
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', image_url: '', category: 'Chaussures' });
      fetchProducts();
    } catch (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    }
  };

  // Supprimer un produit
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer cet article ?")) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        alert("Erreur de suppression : " + error.message);
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category: product.category
    });
    setShowProductModal(true);
  };

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
      
      {/* Barre Admin si connectée */}
      {isAdmin && (
        <div className="bg-gold text-white px-4 py-2 flex justify-between items-center text-sm font-semibold sticky top-0 z-50 shadow-md">
          <span>Mode Administratrice Activé (Yass'Afrik)</span>
          <div className="flex gap-4">
            <button 
              onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
              className="bg-brandBlack px-3 py-1 rounded hover:bg-opacity-80 flex items-center gap-1 transition"
            >
              <Plus size={14} /> Ajouter un produit
            </button>
            <button onClick={() => setIsAdmin(false)} className="text-white hover:underline flex items-center gap-1">
              <LogOut size={14} /> Quitter
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`sticky ${isAdmin ? 'top-9' : 'top-0'} z-40 bg-white/80 backdrop-blur-md border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer" onClick={() => setShowLoginModal(true)}>
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

      {/* Hero Section avec Logo en Arrière-plan */}
      <section id="hero" className="relative bg-brandBlack text-white py-28 px-4 overflow-hidden flex flex-col items-center justify-center min-h-[70vh]">
        {/* Filigrane géant en tâche de fond */}
        <div 
          className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain pointer-events-none scale-125"
          style={{ backgroundImage: `url('/New logo Yass.jpg')` }}
        ></div>
        
        <div className="relative max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center">
          {/* Logo central principal */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white/5 p-4 rounded-full backdrop-blur-sm border border-white/10 shadow-2xl flex items-center justify-center">
            <img src="/New logo Yass.jpg" alt="Logo Yass'Afrik" className="w-full h-full object-contain rounded-full" />
          </div>

          <div className="space-y-4">
            <span className="text-gold tracking-[0.3em] font-semibold text-xs uppercase block">L'élégance Traditionnelle</span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
              Des Chaussures Uniques pour Sublimer Votre Style
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto text-base sm:text-lg font-light">
              Découvrez les collections exclusives confectionnées avec passion et authenticité au Sénégal.
            </p>
          </div>

          <div className="pt-2">
            <a 
              href="#catalogue" 
              className="inline-flex items-center gap-2 bg-white text-brandBlack px-8 py-3.5 rounded-full font-bold hover:bg-gold hover:text-white transition group"
            >
              <span>Découvrir la vitrine</span>
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </a>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Notre Collection</h2>
          <div className="h-1 w-12 bg-gold mx-auto"></div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                selectedCategory === category ? 'bg-gold text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grille de Produits */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Chargement des modèles...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 flex flex-col group relative">
                
                {/* Actions Administrateur directement sur la carte */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <button onClick={() => openEditModal(product)} className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-gray-100 transition">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-gray-100 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" />
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

      {/* MODAL : Connexion Admin (Déclenchée en cliquant sur le texte de la Navbar) */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="text-center space-y-2 mb-6">
              <Lock className="mx-auto text-gold" size={32} />
              <h3 className="text-xl font-bold">Espace de Gestion</h3>
              <p className="text-xs text-gray-400">Entre le mot de passe pour gérer les articles.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Mot de passe" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                required
              />
              <button type="submit" className="w-full bg-brandBlack text-white py-2.5 rounded-xl font-bold hover:bg-gold transition">
                Se connecter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : Ajouter / Modifier un Produit */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl my-8">
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Modifier l\'article' : 'Ajouter un nouvel article'}</h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nom du produit</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Prix (FCFA)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm bg-white"
                  >
                    <option value="Chaussures">Chaussures</option>
                    <option value="Accessoires">Accessoires</option>
                    <option value="Vêtements">Vêtements</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">URL de l'image (Lien internet)</label>
                <input 
                  type="text" 
                  value={formData.image_url}
                  placeholder="https://images.unsplash.com/..."
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-gold text-white py-3 rounded-xl font-bold hover:bg-brandBlack transition text-sm">
                {editingProduct ? 'Sauvegarder les modifications' : 'Ajouter au catalogue'}
              </button>
            </form>
          </div>
        </div>
      )}

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
