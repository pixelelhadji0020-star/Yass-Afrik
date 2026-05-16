import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingBag, Phone, ArrowUpRight, Check, Plus, Trash2, Edit3, Lock, LogOut, X, Upload, Loader, Menu, Instagram } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le filtrage
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Tous');
  
  // État pour le Menu Burger sur Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // États de l'Espace Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Formulaire
