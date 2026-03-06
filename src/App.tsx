import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Plus, 
  LogOut, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  Filter,
  CreditCard,
  User as UserIcon,
  Lock,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, DashboardStats, User } from './types';

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`glass rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, subValue, icon: Icon, colorClass = "neon-lime" }: any) => (
  <GlassCard className="flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">{title}</p>
      <Icon className={`w-5 h-5 ${colorClass}`} />
    </div>
    <div>
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-xs text-slate-500 font-medium">{subValue}</p>
    </div>
  </GlassCard>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'stock'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filter, setFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'payment'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saleQuantity, setSaleQuantity] = useState(1);

  useEffect(() => {
    if (user && user.is_paid) {
      fetchData();
    }
  }, [user, filter]);

  const fetchData = async () => {
    try {
      const [pRes, cRes, sRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch(`/api/dashboard?filter=${filter}`)
      ]);
      const [pData, cData, sData] = await Promise.all([
        pRes.json(),
        cRes.json(),
        sRes.json()
      ]);
      setProducts(pData);
      setCategories(cData);
      setStats(sData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      if (data.user.is_paid) {
        setUser(data.user);
      } else {
        setUser(data.user);
        setAuthMode('payment');
      }
    } else {
      setError(data.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      setUser({ id: data.userId, username, is_paid: 0 });
      setAuthMode('payment');
    } else {
      setError(data.message);
    }
  };

  const handlePayment = async () => {
    if (!user) return;
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    const data = await res.json();
    if (data.success) {
      setUser({ ...user, is_paid: 1 });
    }
  };

  const handleSale = async () => {
    if (!selectedProduct) return;
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: selectedProduct.id, quantity: saleQuantity })
    });
    const data = await res.json();
    if (data.success) {
      setShowSaleModal(false);
      fetchData();
    } else {
      alert(data.message);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = Object.fromEntries(formData.entries());
    
    const method = selectedProduct ? 'PUT' : 'POST';
    const url = selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    if (res.ok) {
      setShowProductModal(false);
      setSelectedProduct(null);
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Deseja excluir este produto?")) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (!user || !user.is_paid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ccff00] text-black font-black text-3xl mb-4 shadow-[0_0_30px_rgba(204,255,0,0.4)]">
              G
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">GymControl Pro</h1>
            <p className="text-slate-400 mt-2">Gestão de Estoque Inteligente</p>
          </div>

          <GlassCard>
            {authMode === 'payment' ? (
              <div className="text-center">
                <CreditCard className="w-12 h-12 neon-cyan mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Ative sua Assinatura</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Tenha acesso ilimitado ao sistema por apenas <span className="text-white font-bold">R$ 49,00</span>/mês.
                </p>
                <button 
                  onClick={handlePayment}
                  className="w-full py-3 rounded-xl btn-neon-lime"
                >
                  PAGAR AGORA
                </button>
                <button 
                  onClick={() => setUser(null)}
                  className="mt-4 text-slate-500 text-xs hover:text-white transition"
                >
                  Sair da conta
                </button>
              </div>
            ) : (
              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Usuário</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#ccff00] transition"
                      placeholder="ADMIN"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#ccff00] transition"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                <button type="submit" className="w-full py-3 rounded-xl btn-neon-lime mt-2">
                  {authMode === 'login' ? 'ENTRAR NO PAINEL' : 'CRIAR CONTA'}
                </button>
                <p className="text-center text-xs text-slate-500 mt-4">
                  {authMode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="ml-1 text-[#00ffff] hover:underline font-bold"
                  >
                    {authMode === 'login' ? 'Cadastre-se' : 'Faça Login'}
                  </button>
                </p>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col items-center lg:items-start p-6">
        <div className="mb-10 px-2">
          <div className="h-10 w-10 bg-[#ccff00] rounded-xl flex items-center justify-center font-black text-black text-xl shadow-[0_0_20px_rgba(204,255,0,0.3)]">
            G
          </div>
        </div>
        <nav className="space-y-4 w-full">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${view === 'dashboard' ? 'bg-white/5 text-[#ccff00]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden lg:block font-bold text-sm tracking-tight">Dashboard</span>
          </button>
          <button 
            onClick={() => setView('stock')}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${view === 'stock' ? 'bg-white/5 text-[#ccff00]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            <Package className="w-5 h-5" />
            <span className="hidden lg:block font-bold text-sm tracking-tight">Estoque</span>
          </button>
        </nav>
        <div className="mt-auto w-full">
          <button 
            onClick={() => setUser(null)}
            className="w-full flex items-center space-x-3 p-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block font-bold text-sm tracking-tight">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-1">
              {view === 'dashboard' ? 'Painel de Controle' : 'Gestão de Estoque'}
            </h1>
            <p className="text-slate-500 font-medium">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            {view === 'dashboard' ? (
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                {['today', 'yesterday', '7days', '30days'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[#ccff00] text-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    {f === 'today' ? 'Hoje' : f === 'yesterday' ? 'Ontem' : f === '7days' ? '7 Dias' : '30 Dias'}
                  </button>
                ))}
              </div>
            ) : (
              <button 
                onClick={() => { setSelectedProduct(null); setShowProductModal(true); }}
                className="btn-neon-lime px-6 py-2.5 rounded-xl text-sm tracking-wide flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> NOVO PRODUTO
              </button>
            )}
          </div>
        </header>

        {view === 'dashboard' && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard 
                title="Vendas do Período" 
                value={`R$ ${stats.sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subValue={`${stats.salesCount} transações realizadas`}
                icon={ShoppingCart}
                colorClass="neon-cyan"
              />
              <StatCard 
                title="Lucro Estimado" 
                value={`R$ ${stats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subValue="Baseado no preço de custo"
                icon={TrendingUp}
                colorClass="neon-lime"
              />
              <StatCard 
                title="Itens em Estoque" 
                value={`${stats.totalItems} un.`}
                subValue="Total de unidades físicas"
                icon={Package}
                colorClass="neon-cyan"
              />
              <StatCard 
                title="Alertas Críticos" 
                value={`${stats.lowStockCount} itens`}
                subValue="Abaixo do limite mínimo"
                icon={AlertTriangle}
                colorClass={stats.lowStockCount > 0 ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-slate-500"}
              />
            </div>

            <GlassCard className="overflow-hidden !p-0">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-pulse"></div>
                  Monitoramento em Tempo Real
                </h3>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar produto ou categoria..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-10 py-2 text-sm outline-none focus:border-[#00ffff] transition"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4 text-center">Qtd</th>
                      <th className="px-6 py-4">Preço</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          {product.quantity <= product.min_quantity ? (
                            <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">Crítico</span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">Em Dia</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-200">{product.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{product.category_name}</td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-white">{product.quantity}</td>
                        <td className="px-6 py-4 font-bold neon-cyan">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => { setSelectedProduct(product); setSaleQuantity(1); setShowSaleModal(true); }}
                            className="text-[10px] font-black uppercase tracking-widest text-[#ccff00] hover:text-white transition-colors"
                          >
                            Venda Rápida
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        )}

        {view === 'stock' && (
          <div className="grid grid-cols-1 gap-6">
            <GlassCard className="overflow-hidden !p-0">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold tracking-tight">Lista de Produtos</h3>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar no estoque..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-10 py-2 text-sm outline-none focus:border-[#ccff00] transition"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4 text-center">Qtd</th>
                      <th className="px-6 py-4 text-center">Mín</th>
                      <th className="px-6 py-4">Custo</th>
                      <th className="px-6 py-4">Venda</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-200">{product.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{product.category_name}</td>
                        <td className={`px-6 py-4 text-center font-mono font-bold ${product.quantity <= product.min_quantity ? 'text-red-500' : 'text-white'}`}>
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 font-mono">{product.min_quantity}</td>
                        <td className="px-6 py-4 font-medium text-slate-400">R$ {product.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 font-bold neon-lime">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 text-right space-x-4">
                          <button 
                            onClick={() => { setSelectedProduct(product); setShowProductModal(true); }}
                            className="text-slate-500 hover:text-[#ccff00] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-slate-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}
      </main>

      {/* Sale Modal */}
      <AnimatePresence>
        {showSaleModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowSaleModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass rounded-3xl p-8"
            >
              <h2 className="text-2xl font-black tracking-tighter mb-6">Lançar Venda</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Produto</p>
                  <p className="text-lg font-bold text-white">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantidade</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSaleQuantity(Math.max(1, saleQuantity - 1))}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold hover:bg-white/10 transition"
                    >
                      -
                    </button>
                    <span className="text-2xl font-mono font-bold w-12 text-center">{saleQuantity}</span>
                    <button 
                      onClick={() => setSaleQuantity(Math.min(selectedProduct.quantity, saleQuantity + 1))}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold hover:bg-white/10 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-slate-400 font-bold">Total</p>
                    <p className="text-2xl font-black neon-cyan">R$ {(selectedProduct.price * saleQuantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <button 
                    onClick={handleSale}
                    className="w-full py-4 rounded-2xl btn-neon-cyan text-sm tracking-widest"
                  >
                    CONFIRMAR VENDA
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-lg glass rounded-3xl p-8"
            >
              <h2 className="text-2xl font-black tracking-tighter mb-6">
                {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nome do Produto</label>
                  <input 
                    name="name"
                    defaultValue={selectedProduct?.name}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-[#ccff00] transition"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Categoria</label>
                  <select 
                    name="category_id"
                    defaultValue={selectedProduct?.category_id}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-[#ccff00] transition appearance-none"
                    required
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Quantidade Inicial</label>
                  <input 
                    type="number"
                    name="quantity"
                    defaultValue={selectedProduct?.quantity || 0}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-[#ccff00] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Estoque Mínimo</label>
                  <input 
                    type="number"
                    name="min_quantity"
                    defaultValue={selectedProduct?.min_quantity || 5}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-[#ccff00] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Preço de Custo (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    name="cost"
                    defaultValue={selectedProduct?.cost || 0}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-[#ccff00] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Preço de Venda (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    name="price"
                    defaultValue={selectedProduct?.price || 0}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-[#ccff00] transition"
                    required
                  />
                </div>
                <div className="col-span-2 pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-xl btn-neon-lime"
                  >
                    SALVAR PRODUTO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
