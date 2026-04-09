'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { 
  FolderPlus, Edit, Trash2, Tag, Plus, X, 
  Settings2, Hash, Type, List, ArrowLeft,
  ChevronRight, Sparkles, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface CategoryAttribute {
  id: number;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DROPDOWN';
  required: boolean;
  options?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  productCount: number;
  attributes: CategoryAttribute[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Single Integrated Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'GENERAL' | 'ATTRIBUTES'>('GENERAL');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  
  // Forms
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: null as File | null });
  const [attributeForm, setAttributeForm] = useState({ name: '', type: 'TEXT' as any, required: false, options: '' });
  const [editingAttrId, setEditingAttrId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data?.categories || res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSaveCategory = async () => {
    if (!categoryForm.name) return toast.error('Category name required');
    try {
      const fd = new FormData();
      fd.append('name', categoryForm.name);
      fd.append('description', categoryForm.description);
      if (categoryForm.image) fd.append('image', categoryForm.image);
      
      let res;
      if (activeCategory) {
        res = await api.put(`/categories/${activeCategory.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated');
      } else {
        res = await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created! Now define its attributes.');
      }
      
      const newCat = res.data?.category || res.data?.data || res.data;
      setActiveCategory(newCat);
      setModalMode('ATTRIBUTES'); // Automatically go to attributes
      fetchCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure? This will fail if products exist in this category.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not delete category');
    }
  };

  const handleAddAttribute = async () => {
    if (!activeCategory || !attributeForm.name) return toast.error('Name required');
    try {
      const endpoint = editingAttrId 
        ? `/categories/attributes/${editingAttrId}`
        : `/categories/${activeCategory.id}/attributes`;
      
      if (editingAttrId) {
        await api.put(endpoint, attributeForm);
        toast.success('Attribute updated');
      } else {
        await api.post(endpoint, attributeForm);
        toast.success('Attribute added');
      }
      
      setAttributeForm({ name: '', type: 'TEXT', required: false, options: '' });
      setEditingAttrId(null);
      
      // Refresh active category's attributes locally
      const updatedCat = await api.get(`/categories/${activeCategory.id}`);
      setActiveCategory(updatedCat.data?.category || updatedCat.data?.data || updatedCat.data);
      fetchCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save attribute');
    }
  };

  const handleDeleteAttribute = async (attrId: number) => {
    if (!confirm('Delete this attribute definition?')) return;
    try {
      await api.delete(`/categories/attributes/${attrId}`);
      toast.success('Attribute removed');
      if (activeCategory) {
        const updatedCat = await api.get(`/categories/${activeCategory.id}`);
        setActiveCategory(updatedCat.data?.category || updatedCat.data?.data || updatedCat.data);
      }
      fetchCategories();
    } catch (e: any) {
      toast.error('Delete failed');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const S = {
    wrap: { minHeight: '100vh', background: '#080d1a', color: '#f1f5f9', padding: '2rem 1rem' } as React.CSSProperties,
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '1.5rem', transition: 'all 0.3s' } as React.CSSProperties,
    inp: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.8rem 1rem', color: '#fff', fontSize: 14, outline: 'none' } as React.CSSProperties,
    btn: { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '0.5rem' } as React.CSSProperties,
    mContent: { background: '#0a0f1e', width: '100%', maxWidth: 700, borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' as any, maxHeight: '95vh' } as React.CSSProperties
  };

  return (
    <div style={S.wrap}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6366f1', marginBottom: 10 }}>
              <Link href="/admin/dashboard" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700 }}>
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
            </div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.025em' }}>Category Blueprints</h1>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem', maxWidth: 600 }}>
              Architect the core of your marketplace. Defined categories will dynamically generate smart forms for your sellers.
            </p>
          </div>
          <button onClick={() => { setActiveCategory(null); setCategoryForm({name:'', description:'', image:null}); setModalMode('GENERAL'); setShowModal(true); }} style={S.btn}>
            <FolderPlus size={18} /> New Architecture
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <input 
            style={{ ...S.inp, paddingLeft: '3rem', fontSize: 16, height: 60 }} 
            placeholder="Search blueprints..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Settings2 size={24} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        </div>

        {/* Category Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', gridColumn: 'span 3' }}>
               <div style={{ width: 40, height: 40, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
               <p style={{ marginTop: '1rem', color: '#6366f1' }}>Fetching systems...</p>
            </div>
          ) : filteredCategories.map(cat => (
            <div key={cat.id} style={S.card} className="blueprint-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: 15 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.imageUrl ? <img src={cat.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <Sparkles className="text-indigo-400" size={28} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#fff' }}>{cat.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{cat.productCount || 0} products active</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => { setActiveCategory(cat); setCategoryForm({ name: cat.name, description: cat.description, image: null }); setModalMode('GENERAL'); setShowModal(true); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 10, borderRadius: 12 }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: 'rgba(248,113,113,0.1)', border: 'none', color: '#f87171', cursor: 'pointer', padding: 10, borderRadius: 12 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6, minHeight: 44 }}>
                {cat.description || 'No blueprint description provided.'}
              </p>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Target Attributes ({cat.attributes?.length || 0})</h4>
                  <button onClick={() => { setActiveCategory(cat); setCategoryForm({name:cat.name, description:cat.description, image:null}); setModalMode('ATTRIBUTES'); setShowModal(true); }} style={{ color: '#6366f1', background: 'none', border: 'none', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Manage Setup</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cat.attributes?.slice(0, 4).map(attr => (
                    <span key={attr.id} style={{ fontSize: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '3px 8px', borderRadius: 6, color: '#a5b4fc', fontWeight: 600 }}>{attr.name}</span>
                  ))}
                  {(cat.attributes?.length || 0) > 4 && <span style={{ fontSize: 10, color: '#475569' }}>+{cat.attributes.length - 4} more</span>}
                  {(!cat.attributes || cat.attributes.length === 0) && <span style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>Schema undefined</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Integrated Modal */}
        {showModal && (
          <div style={S.modal}>
            <div style={S.mContent}>
              {/* Modal Header/Tabs */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ padding: 10, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}><Tag size={20} /></div>
                      <div>
                         <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{activeCategory ? 'Configure Category' : 'Architect New Category'}</h2>
                         <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{activeCategory ? `Blueprint ID: ${activeCategory.id}` : 'Drafting new system blueprint'}</p>
                      </div>
                   </div>
                   <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', gap: 20 }}>
                   <button onClick={() => setModalMode('GENERAL')} style={{ background: 'none', border: 'none', color: modalMode === 'GENERAL' ? '#fff' : '#475569', fontSize: 13, fontWeight: 700, paddingBottom: 10, borderBottom: `2px solid ${modalMode === 'GENERAL' ? '#6366f1' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s' }}>1. General Specifications</button>
                   <button onClick={() => activeCategory ? setModalMode('ATTRIBUTES') : toast.error('Save category first')} style={{ background: 'none', border: 'none', color: modalMode === 'ATTRIBUTES' ? '#fff' : '#475569', fontSize: 13, fontWeight: 700, paddingBottom: 10, borderBottom: `2px solid ${modalMode === 'ATTRIBUTES' ? '#6366f1' : 'transparent'}`, cursor: activeCategory ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>2. Dynamic Attributes {activeCategory && <span style={{ marginLeft: 6, opacity: 0.5 }}>({activeCategory.attributes?.length || 0})</span>}</button>
                </div>
              </div>
              
              <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                {modalMode === 'GENERAL' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>BluePrint Name</label>
                      <input style={S.inp} value={categoryForm.name} onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. High-End Computing" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Systems Description</label>
                      <textarea style={{ ...S.inp, minHeight: 120, lineHeight: 1.6 }} value={categoryForm.description} onChange={e => setCategoryForm(p => ({ ...p, description: e.target.value }))} placeholder="Provide details on what products fit this specific blueprint schema..." />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Visual Identity (Optional)</label>
                      <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                         {activeCategory?.imageUrl && !categoryForm.image && (
                           <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden' }}><img src={activeCategory.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /></div>
                         )}
                         <input type="file" onChange={e => setCategoryForm(p => ({ ...p, image: e.target.files?.[0] || null }))} style={{ fontSize: 13, color: '#475569' }} />
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                       <button onClick={handleSaveCategory} style={S.btn}>
                          {activeCategory ? 'Update Blueprint' : 'Create & Move to Attributes'} <ChevronRight size={18} />
                       </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Attribute Builder */}
                    <div style={{ background: 'rgba(99,102,241,0.03)', border: '1px dashed rgba(99,102,241,0.2)', borderRadius: 24, padding: '1.5rem' }}>
                       <h3 style={{ margin: '0 0 1.25rem', fontSize: 14, fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={16} /> {editingAttrId ? 'Update Definition' : 'Inject New Field Definition'}</h3>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>FIELD LABEL (Visible to Sellers)</label>
                            <input style={S.inp} value={attributeForm.name} onChange={e => setAttributeForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Battery Capacity" />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>INPUT TYPE</label>
                            <select style={S.inp} value={attributeForm.type} onChange={e => setAttributeForm(p => ({ ...p, type: e.target.value as any }))}>
                              <option value="TEXT">Short Alpha-Numeric</option>
                              <option value="NUMBER">Numeric Value Only</option>
                              <option value="DROPDOWN">User Selection (Dropdown)</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                             <div 
                                onClick={() => setAttributeForm(p => ({ ...p, required: !p.required }))}
                                style={{ width: 44, height: 24, borderRadius: 20, background: attributeForm.required ? '#6366f1' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s' }}
                             >
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: attributeForm.required ? 23 : 3, transition: 'all 0.3s' }} />
                             </div>
                             <label style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>Mandatory Field</label>
                          </div>
                          {attributeForm.type === 'DROPDOWN' && (
                            <div style={{ gridColumn: 'span 2' }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>DROPDOWN ENTRIES (Comma separated)</label>
                              <input style={S.inp} value={attributeForm.options} onChange={e => setAttributeForm(p => ({ ...p, options: e.target.value }))} placeholder="e.g. Red, Blue, Green, Space Gray" />
                            </div>
                          )}
                          <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10 }}>
                             <button onClick={handleAddAttribute} style={{ ...S.btn, flex: 1 }}>{editingAttrId ? 'Save Field Override' : 'Deploy Field to Schema'}</button>
                             {editingAttrId && <button onClick={() => { setEditingAttrId(null); setAttributeForm({name:'', type:'TEXT', required:false, options:''}); }} style={{ ...S.btn, background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>Abort</button>}
                          </div>
                       </div>
                    </div>

                    {/* Active Schema List */}
                    <div>
                      <h3 style={{ margin: '0 0 1rem', fontSize: 13, fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>ACTIVE SCHEMA DEFINITIONS <List size={14} /></h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                         {activeCategory?.attributes && activeCategory.attributes.length > 0 ? activeCategory.attributes.map(attr => (
                           <div key={attr.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                 <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                    {attr.type === 'NUMBER' ? <Hash size={16} /> : attr.type === 'DROPDOWN' ? <List size={16} /> : <Type size={16} />}
                                 </div>
                                 <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                       <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{attr.name}</span>
                                       {attr.required && <span style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>REQUIRED</span>}
                                    </div>
                                    <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>{attr.type} {attr.options && `· ${attr.options}`}</p>
                                 </div>
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                 <button onClick={() => { setEditingAttrId(attr.id); setAttributeForm({ name: attr.name, type: attr.type, required: attr.required, options: attr.options || '' }); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 8 }}><Edit size={14} /></button>
                                 <button onClick={() => handleDeleteAttribute(attr.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 8 }}><Trash2 size={14} /></button>
                              </div>
                           </div>
                         )) : (
                           <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.05)' }}>
                              <Sparkles size={32} style={{ color: '#475569', opacity: 0.3, marginBottom: 12 }} />
                              <p style={{ margin: 0, color: '#475569', fontSize: 13 }}>No fields defined. Your dynamic forms will be empty.</p>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .blueprint-card:hover {
          transform: translateY(-8px);
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(99,102,241,0.3) !important;
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.4);
        }
        .blueprint-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
