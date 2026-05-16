import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingBag, Phone, ArrowUpRight, Check, Plus, Trash2, Edit3, Lock, LogOut, X, Upload, Loader } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le filtrage responsive
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Tous');
  
  // États Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Formulaire Produit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'Chaussures',
    subcategory: 'Homme'
  });

  const WHATSAPP_NUMBER = "221778364815"; 
  const ADMIN_PASSWORD = "YassAdmin2026"; 

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

  // Fonction pour prendre une photo depuis la galerie et l'uploader sur Supabase
  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Création un nom de fichier unique pour éviter les doublons
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Envoi du fichier dans le bucket 'product-images'
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Récupération de l'URL publique de l'image stockée
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: data.publicUrl });
      alert("Image téléchargée avec succès !");
    } catch (error) {
      alert("Erreur lors de l'upload : " + error.message);
    } finally {
      setUploading(false);
    }
  };

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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: formData.image_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
      category: formData.category,
      subcategory: formData.category === 'Accessoires' ? null : formData.subcategory
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', image_url: '', category: 'Chaussures', subcategory: 'Homme' });
      fetchProducts();
    } catch (error) {
      alert("Erreur d'enregistrement : " + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Supprimer cet article définitivement ?")) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        alert("Erreur : " + error.message);
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
      category: product.category,
      subcategory: product.subcategory || 'Homme'
    });
    setShowProductModal(true);
  };

  const handleWhatsAppOrder = (product) => {
    const subtext = product.subcategory ? ` (${product.subcategory})` : '';
    const message = `Bonjour Yass'Afrik, je souhaite commander l'article suivant :\n\n🔹 *Produit :* ${product.name}${subtext}\n💰 *Prix :* ${product.price.toLocaleString()} FCFA\n\nEst-il disponible ?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Filtrage intelligent
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchSubcategory = selectedSubcategory === 'Tous' || p.subcategory === selectedSubcategory;
    return matchCategory && matchSubcategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-brandBlack antialiased font-sans">
      
      {/* Barre Admin */}
      {isAdmin && (
        <div className="bg-gold text-white px-4 py-2.5 flex justify-between items-center text-xs font-semibold sticky top-0 z-50 shadow-md">
          <span>Gestion Boutique Active</span>
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
              className="bg-brandBlack px-3 py-1.5 rounded-xl flex items-center gap-1 transition text-[11px]"
            >
              <Plus size={12} /> Ajouter
            </button>
            <button onClick={() => setIsAdmin(false)} className="text-white hover:underline flex items-center gap-1 text-[11px]">
              <LogOut size={12} /> Quitter
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`sticky ${isAdmin ? 'top-[38px]' : 'top-0'} z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4`}>
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer" onClick={() => setShowLoginModal(true)}>
            <span className="text-xl font-bold tracking-widest font-serif text-brandBlack">YASS'AFRIK</span>
            <span className="text-[8px] tracking-widest text-gold font-bold uppercase -mt-1">Made in Senegal</span>
          </div>
          <a 
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-brandBlack text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gold transition shadow-sm"
          >
            <Phone size={14} />
            <span>Contact</span>
          </a>
        </div>
      </nav>

      {/* Hero Section Mobile-First */}
      <section id="hero" className="relative bg-brandBlack text-white py-16 px-4 overflow-hidden flex flex-col items-center justify-center min-h-[55vh] text-center">
        {/* Arrière-plan filigrane corrigé pour Vercel */}
        <div 
          className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain pointer-events-none scale-125"
          style={{ backgroundImage: `url('/logo_yass.jpg')` }}
        ></div>
        
        <div className="relative max-w-xl mx-auto space-y-6 flex flex-col items-center">
          <div className="w-32 h-32 bg-white/5 p-3 rounded-full backdrop-blur-sm border border-white/10 shadow-2xl flex items-center justify-center">
            <img src="/logo_yass.jpg" alt="Logo Yass'Afrik" className="w-full h-full object-contain rounded-full" />
          </div>

          <div className="space-y-2">
            <span className="text-gold tracking-[0.25em] font-bold text-[10px] uppercase block">L'élégance Traditionnelle</span>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              Sublimez Votre Style au Quotidien
            </h1>
            <p className="text-gray-400 max-w-sm mx-auto text-xs font-light">
              Découvrez nos ensembles, chaussures et accessoires haut de gamme confectionnés au Sénégal.
            </p>
          </div>

          <div className="pt-2">
            <a 
              href="#catalogue" 
              className="inline-flex items-center gap-2 bg-white text-brandBlack px-6 py-3 rounded-full text-xs font-bold hover:bg-gold hover:text-white transition"
            >
              <span>Parcourir les modèles</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Notre Vitrine</h2>
          <div className="h-0.5 w-8 bg-gold mx-auto"></div>
        </div>

        {/* Filtres Catégories Principales */}
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {['Tous', 'Ensembles', 'Chaussures', 'Accessoires'].map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setSelectedSubcategory('Tous'); }}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition border ${
                  selectedCategory === category ? 'bg-gold text-white border-gold shadow-sm' : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Filtres Sous-Catégories Homme / Femme (Masqués si Accessoires ou Tous est sélectionné sans produits typés) */}
          {(selectedCategory === 'Tous' || selectedCategory === 'Ensembles' || selectedCategory === 'Chaussures') && (
            <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-1">
              {['Tous', 'Homme', 'Femme'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap transition ${
                    selectedSubcategory === sub ? 'bg-brandBlack text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sub === 'Tous' ? 'Tout voir' : sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grille Produits Écran Unique Mobile */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-xs flex flex-col items-center gap-2">
            <Loader className="animate-spin text-gold" size={24} />
            Chargement de la collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">Aucun article ne correspond à cette sélection.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col relative group">
                
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                    <button onClick={() => openEditModal(product)} className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-gray-50 transition">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-gray-50 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                {/* Image Pleine Largeur Mobile-friendly */}
                <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover object-center" />
                  <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                    <span className="bg-white/90 backdrop-blur-sm text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full text-gray-800 shadow-xs">
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="bg-gold text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                        {product.subcategory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900 leading-tight">{product.name}</h3>
                    <p className="text-gray-400 text-xs font-light line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-bold font-serif tracking-tight text-brandBlack">
                      {product.price.toLocaleString()} <span className="text-[10px] font-sans text-gray-400 font-normal">FCFA</span>
                    </span>
                    <button
                      onClick={() => handleWhatsAppOrder(product)}
                      className="inline-flex items-center gap-1.5 bg-brandBlack text-white active:bg-gold px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <ShoppingBag size={12} />
                      <span>Commander</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL : Login Admin */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 relative shadow-xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400">
              <X size={18} />
            </button>
            <div className="text-center space-y-1 mb-5">
              <Lock className="mx-auto text-gold" size={24} />
              <h3 className="text-base font-bold">Espace Privé</h3>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input 
                type="password" 
                placeholder="Mot de passe" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm"
                required
              />
              <button type="submit" className="w-full bg-brandBlack text-white py-2 rounded-xl font-bold text-xs">
                Se connecter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : Ajout / Modification Produit avec Galerie */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 relative shadow-xl my-auto">
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-gray-400">
              <X size={18} />
            </button>
            <h3 className="text-base font-bold mb-4">{editingProduct ? 'Modifier l\'article' : 'Ajouter un article'}</h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Nom</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Prix (FCFA)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none text-xs bg-white"
                  >
                    <option value="Chaussures">Chaussures</option>
                    <option value="Ensembles">Ensembles</option>
                    <option value="Accessoires">Accessoires</option>
                  </select>
                </div>
              </div>

              {formData.category !== 'Accessoires' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Public cible</label>
                  <select 
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none text-xs bg-white"
                  >
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
              )}

              {/* SECTION IMAGE : Galerie en Direct */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Photo de l'article</label>
                <div className="flex items-center gap-2">
                  <label className="flex-grow flex items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-xl py-2 px-3 text-xs font-semibold text-gray-600 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                    <Upload size={14} className="text-gray-400" />
                    <span>{uploading ? 'Téléchargement...' : 'Choisir de la galerie'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={uploading}
                      className="hidden" 
                    />
                  </label>
                </div>
                {formData.image_url && (
                  <p className="text-[10px] text-green-600 mt-1 truncate">✓ Image chargée : {formData.image_url}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Description</label>
                <textarea 
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none text-xs"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={uploading}
                className={`w-full bg-gold text-white py-2.5 rounded-xl font-bold transition text-xs ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brandBlack'}`}
              >
                {editingProduct ? 'Enregistrer' : 'Publier sur la boutique'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="a-propos" className="bg-brandBlack text-white border-t border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <span className="text-xl font-bold tracking-widest font-serif block">YASS'AFRIK</span>
            <p className="text-gray-400 text-xs font-light leading-relaxed">
              Vente de vêtements, chaussures et accessoires. Valoriser le savoir-faire local sénégalais à travers des collections modernes et authentiques.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-gold font-bold tracking-wider text-xs uppercase">Garanties</h4>
            <ul className="space-y-1.5 text-xs text-gray-400 font-light">
              <li className="flex items-center gap-2"><Check size={12} className="text-gold" /> Créations faites au Sénégal</li>
              <li className="flex items-center gap-2"><Check size={12} className="text-gold" /> Commande WhatsApp instantanée</li>
              <li className="flex items-center gap-2"><Check size={12} className="text-gold" /> Livraison partout</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-gold font-bold tracking-wider text-xs uppercase">Contact</h4>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="inline-flex items-center gap-1.5 text-white bg-green-600 px-4 py-2 rounded-xl text-xs font-bold shadow-xs">
              <Phone size={14} />
              <span>+221 77 836 48 15</span>
            </a>
          </div>
        </div>
        <div className="border-t border-gray-900 bg-[#050505] py-4 text-center text-[10px] text-gray-500 tracking-wider">
          © {new Date().getFullYear()} YASS'AFRIK. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
