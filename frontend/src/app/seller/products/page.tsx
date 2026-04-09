'use client';
import { useEffect, useState, useMemo } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Package, ChevronDown, Info } from 'lucide-react';

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
  attributes?: CategoryAttribute[];
}

interface ProductAttributeValue {
  attributeId: number;
  attributeName: string;
  value: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  status: string;
  category?: Category;
  categoryName?: string;
  attributeValues?: ProductAttributeValue[];
}

const EMPTY = {
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  imageUrl: '',
  categoryId: '',
  variants: [] as any[],
  attributeValues: [] as ProductAttributeValue[]
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/seller/products'),
        api.get('/categories')
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data?.categories || cRes.data?.data || cRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchAll(); }, []);

  // Get attributes for currently selected category
  const activeCategory = useMemo(() => {
    return categories.find(c => String(c.id) === String(form.categoryId));
  }, [form.categoryId, categories]);

  const activeCategoryAttributes = useMemo(() => {
    return activeCategory?.attributes || [];
  }, [activeCategory]);

  const supportsVariants = useMemo(() => {
    if (!activeCategory) return false;
    const name = activeCategory.name.toLowerCase();
    return name.includes('clothing') || name.includes('shoes') || name.includes('apparel');
  }, [activeCategory]);

  // Update attribute value
  const handleAttributeChange = (attrId: number, attrName: string, val: string) => {
    setForm(prev => {
      const existing = prev.attributeValues.find(av => av.attributeId === attrId);
      let newValues;
      if (existing) {
        newValues = prev.attributeValues.map(av => av.attributeId === attrId ? { ...av, value: val } : av);
      } else {
        newValues = [...prev.attributeValues, { attributeId: attrId, attributeName: attrName, value: val }];
      }
      return { ...prev, attributeValues: newValues };
    });
  };

  const submit = async () => {
    if (!form.name || !form.price) return toast.error('Name and price required');
    
    // Check required attributes
    for (const attr of activeCategoryAttributes) {
      if (attr.required) {
        const val = form.attributeValues.find(av => av.attributeId === attr.id)?.value;
        if (!val) return toast.error(`Required: ${attr.name}`);
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity || '0'),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        variants: form.variants.map(v => ({
          ...v,
          price: v.price ? parseFloat(v.price) : null,
          stockQuantity: parseInt(v.stockQuantity || '0')
        })),
        attributeValues: form.attributeValues.filter(av => activeCategoryAttributes.some(aa => aa.id === av.attributeId))
      };

      const formData = new FormData();
      formData.append('productData', JSON.stringify(payload));

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (editId) {
        await api.put(`/products/${editId}`, formData, config);
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, config);
        toast.success('Product created!');
      }
      setForm(EMPTY); setEditId(null); setShowForm(false); fetchAll();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to submit product');
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Deleted'); fetchAll(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const edit = (p: Product) => {
    setForm({
      name: p.name,
      description: (p as any).description || '',
      price: String(p.price),
      stockQuantity: String(p.stockQuantity),
      imageUrl: p.imageUrl || '',
      categoryId: String(p.category?.id || ''),
      variants: (p as any).variants?.map((v: any) => ({
        ...v,
        price: v.price ? String(v.price) : '',
        stockQuantity: String(v.stockQuantity)
      })) || [],
      attributeValues: p.attributeValues || []
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const s = { padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif", color: '#fff' };
  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.875rem 1rem', color: '#f1f5f9', fontSize: 15, boxSizing: 'border-box', outline: 'none' };

  return (
    <div style={s}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Inventory Management</h1>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Manage your category-specific products and stock.</p>
          </div>
          <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(p => !p); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ margin: '0 0 2rem', color: '#a5b4fc', fontSize: '1.25rem' }}>{editId ? '✏️ Edit Product' : '🚀 Create New Listing'}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Product Category *</label>
                <select style={inp} value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value, attributeValues: [] }))}>
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {activeCategoryAttributes.length > 0 && (
                  <div style={{ marginTop: 12, padding: '10px 15px', background: 'rgba(99,102,241,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Info size={16} className="text-indigo-400" />
                    <span style={{ fontSize: 12, color: '#a5b4fc' }}>Dynamic attributes enabled for <b>{categories.find(c => String(c.id) === String(form.categoryId))?.name}</b></span>
                  </div>
                )}
              </div>

              {/* Dynamic Attributes Section */}
              {activeCategoryAttributes.length > 0 && (
                <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ gridColumn: 'span 2', margin: '0 0 0.5rem', fontSize: 14, color: '#f8fafc', opacity: 0.8 }}>Category Specific Details</h4>
                  {activeCategoryAttributes.map(attr => (
                    <div key={attr.id} style={{ gridColumn: attr.type === 'TEXT' && attr.name.length > 15 ? 'span 2' : 'auto' }}>
                      <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                        {attr.name} {attr.required ? '*' : '(Optional)'}
                      </label>
                      {attr.type === 'DROPDOWN' ? (
                        <select 
                          style={inp} 
                          value={form.attributeValues.find(av => av.attributeId === attr.id)?.value || ''}
                          onChange={e => handleAttributeChange(attr.id, attr.name, e.target.value)}
                        >
                          <option value="">Select...</option>
                          {attr.options?.split(',').map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input 
                          type={attr.type === 'NUMBER' ? 'number' : 'text'} 
                          style={inp} 
                          placeholder={`Enter ${attr.name.toLowerCase()}...`}
                          value={form.attributeValues.find(av => av.attributeId === attr.id)?.value || ''}
                          onChange={e => handleAttributeChange(attr.id, attr.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {[['name', 'Product Name *'], ['price', 'Base Price (ETB) *'], ['stockQuantity', 'Initial Stock'], ['imageUrl', 'Featured Image URL']].map(([k, l]) => (
                <div key={k}>
                  <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>{l}</label>
                  <input style={inp} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} type={k === 'price' || k === 'stockQuantity' ? 'number' : 'text'} />
                </div>
              ))}
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Product Description</label>
                <textarea style={{ ...inp, minHeight: 100 }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              {/* Variants Section - Only show for Clothing/Shoes */}
              {supportsVariants && (
                <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Inventory Variants (Optional)</h4>
                    <button type="button" onClick={() => setForm(p => ({ ...p, variants: [...p.variants, { size: '', color: '', sku: '', stockQuantity: '0', price: '' }] }))} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Variant</button>
                  </div>
                  {form.variants.map((v, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '10px', alignItems: 'end', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 12 }}>
                      <div><label style={{ color: '#64748b', fontSize: 10 }}>Size</label><input style={{...inp, padding: '0.5rem'}} value={v.size} onChange={e => { const vn=[...form.variants]; vn[i].size=e.target.value; setForm(p=>({...p, variants:vn})) }} /></div>
                      <div><label style={{ color: '#64748b', fontSize: 10 }}>Color</label><input style={{...inp, padding: '0.5rem'}} value={v.color} onChange={e => { const vn=[...form.variants]; vn[i].color=e.target.value; setForm(p=>({...p, variants:vn})) }} /></div>
                      <div><label style={{ color: '#64748b', fontSize: 10 }}>SKU</label><input style={{...inp, padding: '0.5rem'}} value={v.sku} onChange={e => { const vn=[...form.variants]; vn[i].sku=e.target.value; setForm(p=>({...p, variants:vn})) }} /></div>
                      <div><label style={{ color: '#64748b', fontSize: 10 }}>Price</label><input style={{...inp, padding: '0.5rem'}} type="number" value={v.price} onChange={e => { const vn=[...form.variants]; vn[i].price=e.target.value; setForm(p=>({...p, variants:vn})) }} /></div>
                      <div><label style={{ color: '#64748b', fontSize: 10 }}>Stock</label><input style={{...inp, padding: '0.5rem'}} type="number" value={v.stockQuantity} onChange={e => { const vn=[...form.variants]; vn[i].stockQuantity=e.target.value; setForm(p=>({...p, variants:vn})) }} /></div>
                      <button type="button" onClick={() => setForm(p => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }))} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button onClick={submit} disabled={submitting} style={{ marginTop: '2rem', width: '100%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 14, padding: '1rem', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 16 }}>
              {submitting ? 'Saving changes...' : (editId ? '💾 Update Product' : '🚀 Publish Product')}
            </button>
          </div>
        )}

        {/* Inventory List */}
        {!showForm && loading ? <div style={{ textAlign: 'center', padding: '100px 0' }}><span style={{ color: '#64748b' }}>Initializing system...</span></div> : !showForm && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '1.25rem 1.5rem', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                          <img src={p.imageUrl || '/placeholder.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8' }}>{p.categoryName || 'Uncategorized'}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#10b981' }}>{p.price.toLocaleString()} ETB</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: p.stockQuantity < 10 ? '#f59e0b' : '#94a3b8' }}>{p.stockQuantity}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: p.status === 'ACTIVE' ? '#10b981' : '#f87171', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => edit(p)} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={14} /></button>
                        <button onClick={() => del(p.id)} style={{ background: 'rgba(239,68,68,0.05)', color: '#f87171', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
