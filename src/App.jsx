import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingBag, Phone, ArrowUpRight, Check, Plus, Trash2, Edit3, Lock, LogOut, X, Upload, Loader, Menu, Instagram } from 'lucide-react';

// Icône TikTok personnalisée en SVG pour correspondre au design Lucide
const TikTokIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le filtrage de la vitrine
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Tous');
  
  // État pour l'ouverture du Menu Mobile (Burger)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // États de l'Espace Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Formulaire Produit avec tableau d'images (Max 4 photos)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_urls: [], // Contiendra les liens des 4 photos
    category: 'Chaussures',
    subcategory: 'Homme'
  });

  // Index de l'image active pour chaque produit affiché dans la vitrine
  const [activeImageIndex, setActiveImageIndex] = useState({});

  const WHATSAPP_NUMBER = "221778364815"; 
  const ADMIN_PASSWORD = "YassAdmin2026"; 
  const INSTAGRAM_URL = "https://www.instagram.com/yassafrik";
  const TIKTOK_URL = "https://www.tiktok.com/@yassafrik?is_from_webapp=1&sender_device=pc";

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

  // Système de téléchargement multi-images à la racine du bucket (Contournement de l'erreur Invalid Path)
  const handleImagesUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const files = Array.from(e.target.files);
      
      // Limite stricte à 4 images au total
      if (formData.image_urls.length + files.length > 4) {
        throw new Error("Vous ne pouvez pas ajouter plus de 4 photos par produit.");
      }

      const uploadedUrls = [...formData.image_urls];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const cleanedTime = Date.now();
        const randomId = Math.floor(Math.random() * 1000);
        
        // SOLUTION RADICALE : On enregistre directement le fichier à la racine du bucket
        // Plus aucun sous-dossier, ce qui élimine l'erreur 'Invalid path specified in request URL'
        const fileName = `yass-${cleanedTime}-${randomId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        if (data && data.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      }

      setFormData(prev => ({ ...prev, image_urls: uploadedUrls }));
    } catch (error) {
      alert("Erreur lors de l'upload : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une image de la prévisualisation avant validation
  const removeImageUrl = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, index) => index !== indexToRemove)
    }));
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
    if (formData.image_urls.length === 0) {
      alert("Veuillez ajouter au moins une photo pour ce produit.");
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image_urls: formData.image_urls,
      category: formData.category,
      subcategory: formData.category === 'Accessoires' ? null : formData.subcategory
    };

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', image_urls: [], category: 'Chaussures', subcategory: 'Homme' });
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
      image_urls: product.image_urls || [],
      category: product.category,
      subcategory: product.subcategory || 'Homme'
    });
    setShowProductModal(true);
  };

  const handleWhatsAppOrder = (product) => {
    const subtext = product.subcategory ? ` (${product.subcategory})` : '';
    const message = `Bonjour Yass'Afrik, je souhaite commander :\n\n🔹 *Article :* ${product.name}${subtext}\n💰 *Prix :* ${product.price.toLocaleString()} FCFA\n\nEst-il disponible ?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchSubcategory = selectedSubcategory === 'Tous' || p.subcategory === selectedSubcategory;
    return matchCategory && matchSubcategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-brandBlack antialiased font-sans">
      
      {/* TopBar Admin */}
      {isAdmin && (
        <div className="bg-gold text-white px-4 py-2.5 flex justify-between items-center text-xs font-semibold sticky top-0 z-50 shadow-md">
          <span>Gestion active (Yass'Afrik)</span>
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: '', image_urls: [], category: 'Chaussures', subcategory: 'Homme' }); setShowProductModal(true); }}
              className="bg-brandBlack px-3 py-1.5 rounded-xl flex items-center gap-1 text-[11px]"
            >
              <Plus size={12} /> Ajouter un produit
            </button>
            <button onClick={() => setIsAdmin(false)} className="text-white hover:underline flex items-center gap-1 text-[11px]">
              <LogOut size={12} /> Quitter
            </button>
          </div>
        </div>
      )}

      {/* Navbar Responsive avec Menu et Réseaux */}
      <nav className={`sticky ${isAdmin ? 'top-[38px]' : 'top-0'} z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4`}>
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 text-gray-700 hover:text-gold md:hidden">
            <Menu size={24} />
          </button>

          <div className="flex flex-col items-center md:items-start cursor-pointer" onClick={() => setShowLoginModal(true)}>
            <span className="text-xl font-bold tracking-widest font-serif text-brandBlack">YASS'AFRIK</span>
            <span className="text-[8px] tracking-widest text-gold font-bold uppercase -mt-1">Made in Senegal</span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-wider uppercase">
            <a href="#hero" className="hover:text-gold transition">Accueil</a>
            <a href="#catalogue" className="hover:text-gold transition">Collection</a>
            <a href="#a-propos" className="hover:text-gold transition">À propos</a>
            <div className="h-4 w-px bg-gray-200"></div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gold transition"><Instagram size={16} /></a>
            <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gold transition"><TikTokIcon size={16} /></a>
          </div>

          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-brandBlack text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gold transition shadow-sm">
            <Phone size={14} /> <span className="hidden sm:inline">Contact</span>
          </a>
        </div>

        {/* Menu Mobile Burger */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-64 bg-white h-full p-6 space-y-8 flex flex-col justify-between shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <span className="font-serif font-bold text-lg">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
                </div>
                <div className="flex flex-col space-y-4 text-sm font-semibold tracking-wide uppercase">
                  <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition py-1">Accueil</a>
                  <a href="#catalogue" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition py-1">Collection</a>
                  <a href="#a-propos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gold transition py-1">À propos</a>
                </div>
              </div>
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Suivez-nous</span>
                <div className="flex flex-col gap-3">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gold">
                    <Instagram size={18} /> <span>Instagram</span>
                  </a>
                  <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gold">
                    <TikTokIcon size={18} /> <span>TikTok</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative bg-brandBlack text-white py-16 px-4 overflow-hidden flex flex-col items-center justify-center min-h-[55vh] text-center">
        <div className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain pointer-events-none scale-125" style={{ backgroundImage: `url('/logo_yass.jpg')` }}></div>
        <div className="relative max-w-xl mx-auto space-y-6 flex flex-col items-center">
          <div className="w-32 h-32 bg-white/5 p-3 rounded-full backdrop-blur-sm border border-white/10 shadow-2xl flex items-center justify-center">
            <img src="/logo_yass.jpg" alt="Logo Yass'Afrik" className="w-full h-full object-contain rounded-full" />
          </div>
          <div className="space-y-2">
            <span className="text-gold tracking-[0.25em] font-bold text-[10px] uppercase block">L'élégance Traditionnelle</span>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">Sublimez Votre Style au Quotidien</h1>
            <p className="text-gray-400 max-w-sm mx-auto text-xs font-light">Découvrez nos ensembles, chaussures et accessoires haut de gamme confectionnés au Sénégal.</p>
          </div>
          <div className="pt-2">
            <a href="#catalogue" className="inline-flex items-center gap-2 bg-white text-brandBlack px-6 py-3 rounded-full text-xs font-bold hover:bg-gold hover:text-white transition">
              <span>Parcourir les modèles</span> <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Catalogue Vitrine */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Notre Vitrine</h2>
          <div className="h-0.5 w-8 bg-gold mx-auto"></div>
        </div>

        {/* Filtres Catégories */}
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {['Tous', 'Ensembles', 'Chaussures', 'Accessoires'].map((category) => (
              <button key={category} onClick={() => { setSelectedCategory(category); setSelectedSubcategory('Tous'); }} className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition border ${selectedCategory === category ? 'bg-gold text-white border-gold shadow-sm' : 'bg-white text-gray-500 border-gray-200'}`}>
                {category}
              </button>
            ))}
          </div>

          {/* Filtres Public Cible */}
          {(selectedCategory === 'Tous' || selectedCategory === 'Ensembles' || selectedCategory === 'Chaussures') && (
            <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-1">
              {['Tous', 'Homme', 'Femme'].map((sub) => (
                <button key={sub} onClick={() => setSelectedSubcategory(sub)} className={`px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap transition ${selectedSubcategory === sub ? 'bg-brandBlack text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {sub === 'Tous' ? 'Tout voir' : sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grille d'affichage des articles */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-xs flex flex-col items-center gap-2">
            <Loader className="animate-spin text-gold" size={24} /> Chargement de la collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">Aucun article ne correspond.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const currentImages = product.image_urls && product.image_urls.length > 0 ? product.image_urls : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'];
              const activeIndex = activeImageIndex[product.id] || 0;

              return (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col relative group">
                  {isAdmin && (
                    <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                      <button onClick={() => openEditModal(product)} className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-gray-50"><Edit3 size={12} /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-gray-50"><Trash2 size={12} /></button>
                    </div>
                  )}

                  {/* Image Carrousel dynamique */}
                  <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
                    <img src={currentImages[activeIndex]} alt={product.name} className="w-full h-full object-cover object-center transition-all duration-300" />
                    
                    <div className="absolute top-3 left-3 flex gap-1 flex-wrap z-10">
                      <span className="bg-white/90 backdrop-blur-sm text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full text-gray-800">{product.category}</span>
                      {product.subcategory && <span className="bg-gold text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">{product.subcategory}</span>}
                    </div>

                    {/* Navigation par points si plusieurs photos */}
                    {currentImages.length > 1 && (
                      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                        {currentImages.map((_, idx) => (
                          <button 
                            key={idx} 
                            type="button"
                            onClick={() => setActiveImageIndex(prev => ({ ...prev, [product.id]: idx }))}
                            className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-gold scale-120' : 'bg-white/60 hover:bg-white'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-900 leading-tight">{product.name}</h3>
                      <p className="text-gray-400 text-xs font-light line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-base font-bold font-serif text-brandBlack">{product.price.toLocaleString()} <span className="text-[10px] font-sans text-gray-400 font-normal">FCFA</span></span>
                      <button onClick={() => handleWhatsAppOrder(product)} className="inline-flex items-center gap-1.5 bg-brandBlack text-white px-3.5 py-2 rounded-xl text-xs font-bold"><ShoppingBag size={12} /><span>Commander</span></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL : Login Admin */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 relative shadow-xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={18} /></button>
            <div className="text-center space-y-1 mb-5"><Lock className="mx-auto text-gold" size={24} /><h3 className="text-base font-bold">Espace Privé</h3></div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-gold text-sm" required />
              <button type="submit" className="w-full bg-brandBlack text-white py-2 rounded-xl font-bold text-xs">Se connecter</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : Ajouter / Modifier un article (Gestion Multi-Photos) */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 relative shadow-xl my-auto">
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={18} /></button>
            <h3 className="text-base font-bold mb-4">{editingProduct ? 'Modifier l\'article' : 'Ajouter un article'}</h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Nom</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none" required />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Prix (FCFA)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Catégorie</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none">
                    <option value="Chaussures">Chaussures</option>
                    <option value="Ensembles">Ensembles</option>
                    <option value="Accessoires">Accessoires</option>
                  </select>
                </div>
              </div>

              {formData.category !== 'Accessoires' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Public cible</label>
                  <select value={formData.subcategory} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none">
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
              )}

              {/* Module de Téléchargement Multi-Photos Galerie */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Photos de l'article ({formData.image_urls.length}/4)</label>
                <label className="flex items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-xl py-3 px-3 text-xs font-semibold text-gray-600 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                  <Upload size={14} className="text-gray-400" />
                  <span>{uploading ? 'Téléchargement...' : 'Ajouter des photos depuis la galerie'}</span>
                  <input type="file" accept="image/*" multiple onChange={handleImagesUpload} disabled={uploading || formData.image_urls.length >= 4} className="hidden" />
                </label>

                {/* Miniatures de prévisualisation des photos chargées */}
                {formData.image_urls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {formData.image_urls.map((url, index) => (
                      <div key={index} className="relative aspect-square border border-gray-100 rounded-lg overflow-hidden">
                        <img src={url} alt="Aperçu" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImageUrl(index)} 
                          className="absolute top-0.5 right-0.5 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 transition"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Description</label>
                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"></textarea>
              </div>

              <button type="submit" disabled={uploading || formData.image_urls.length === 0} className={`w-full bg-gold text-white py-2.5 rounded-xl font-bold text-xs ${uploading || formData.image_urls.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brandBlack'}`}>
                {editingProduct ? 'Enregistrer les modifications' : 'Publier sur la boutique'}
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
            <p className="text-gray-400 text-xs font-light leading-relaxed">Vente de vêtements, chaussures et accessoires. Valoriser le savoir-faire local sénégalais.</p>
            <div className="flex gap-4 pt-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold transition"><Instagram size={20} /></a>
              <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold transition"><TikTokIcon size={20} /></a>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-gold font-bold tracking-wider text-xs uppercase">Garanties</h4>
            <ul className="space-y-1.5 text-xs text-gray-400 font-light">
              <li className="flex items-center gap-2"><Check size={12} className="text-gold" /> Créations faites au Sénégal</li>
              <li className="flex items-center gap-2"><Check size={12} className="text-gold" /> Commande WhatsApp instantanée</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-gold font-bold tracking-wider text-xs uppercase">Contact</h4>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="inline-flex items-center gap-1.5 text-white bg-green-600 px-4 py-2 rounded-xl text-xs font-bold"><Phone size={14} /><span>+221 77 836 48 15</span></a>
          </div>
        </div>
        <div className="border-t border-gray-900 bg-[#050505] py-4 text-center text-[10px] text-gray-500 tracking-wider">
          © {new Date().getFullYear()} YASS'AFRIK. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
