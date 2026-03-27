'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Package, ChevronDown } from 'lucide-react';

interface Product { id: number; name: string; price: number; stockQuantity: number; imageUrl: string; status: string; }
interface Category { id: number; name: string; }

const EMPTY = { name: '', description: '', price: '', stockQuantity: '', imageUrl: '', categoryId: '', variants: [] as any[] };

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
      const [pRes, cRes] = await Promise.all([api.get('/seller/products'), api.get('/categories')]);
      setProducts(pRes.data || []);
      setCategories(cRes.data?.categories || cRes.data?.data || cRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const submit = async () => {
    if (!form.name || !form.price) return toast.error('Name and price required');
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
        }))
      };

      const formData = new FormData();
      formData.append('productData', JSON.stringify(payload));
      // No file input in current UI, so we just send the JSON part

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editId) { 
        await api.put(`/products/${editId}`, formData, config); 
        toast.success('Product updated'); 
      }
      else { 
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

  const edit = (p: any) => { 
    setForm({ 
      name: p.name, 
      description: p.description || '', 
      price: String(p.price), 
      stockQuantity: String(p.stockQuantity), 
      imageUrl: p.imageUrl || '', 
      categoryId: String(p.category?.id || ''),
      variants: p.variants?.map((v: any) => ({
        ...v,
        price: v.price ? String(v.price) : '',
        stockQuantity: String(v.stockQuantity)
      })) || []
    }); 
    setEditId(p.id); 
    setShowForm(true); 
  };

  const s = { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem', fontFamily: "'Inter', sans-serif" };
  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.75rem 1rem', color: '#f1f5f9', fontSize: 15, boxSizing: 'border-box' };

  return (
    <div style={s}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>🛍️ My Products</h1>
          <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(p => !p); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#a5b4fc', fontWeight: 700 }}>{editId ? '✏️ Edit Product' : '➕ New Product'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[['name', 'Name *'], ['price', 'Price (ETB) *'], ['stockQuantity', 'Stock Quantity'], ['imageUrl', 'Image URL (Direct link)']].map(([k, l]) => (
                <div key={k}>
                  <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>{l}</label>
                  <input style={inp} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} type={k === 'price'||k==='stockQuantity' ? 'number' : 'text'} placeholder={k === 'imageUrl' ? 'https://example.com/image.jpg' : ''} />
                  {k === 'imageUrl' && form.imageUrl && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display='none')} />
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Preview (Must be a direct image link)</span>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label>
                <select style={{ ...inp }} value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label>
                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              {/* Variants Section */}
              <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Product Variants (Sizes/Colors)</h4>
                    <button 
                        type="button"
                        onClick={() => setForm(p => ({ ...p, variants: [...p.variants, { size: '', color: '', sku: '', stockQuantity: '0', price: '' }] }))}
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                        + Add Variant
                    </button>
                </div>
                
                {form.variants.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {form.variants.map((v, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 12 }}>
                        <div>
                          <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Size</label>
                          <input style={{ ...inp, padding: '0.5rem' }} value={v.size} onChange={e => { const vn = [...form.variants]; vn[i].size = e.target.value; setForm(p => ({ ...p, variants: vn })); }} placeholder="e.g. XL" />
                        </div>
                        <div>
                          <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Color</label>
                          <input style={{ ...inp, padding: '0.5rem' }} value={v.color} onChange={e => { const vn = [...form.variants]; vn[i].color = e.target.value; setForm(p => ({ ...p, variants: vn })); }} placeholder="e.g. Blue" />
                        </div>
                        <div>
                          <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>SKU (Optional)</label>
                          <input style={{ ...inp, padding: '0.5rem' }} value={v.sku} onChange={e => { const vn = [...form.variants]; vn[i].sku = e.target.value; setForm(p => ({ ...p, variants: vn })); }} placeholder="BS-001" />
                        </div>
                        <div>
                          <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Price</label>
                          <input style={{ ...inp, padding: '0.5rem' }} value={v.price} type="number" onChange={e => { const vn = [...form.variants]; vn[i].price = e.target.value; setForm(p => ({ ...p, variants: vn })); }} placeholder="Optional" />
                        </div>
                        <div>
                          <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Stock</label>
                          <input style={{ ...inp, padding: '0.5rem' }} value={v.stockQuantity} type="number" onChange={e => { 
                            const vn = [...form.variants]; 
                            vn[i].stockQuantity = e.target.value; 
                            setForm(p => {
                              const total = vn.reduce((sum, curr) => sum + parseInt(curr.stockQuantity || '0'), 0);
                              return { ...p, variants: vn, stockQuantity: String(total) };
                            }); 
                          }} />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setForm(p => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }))}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.5rem' }}
                        >
                            <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', margin: '1rem 0' }}>No variants added. Base price and stock will be used.</p>
                )}
              </div>
            </div>
            <button onClick={submit} disabled={submitting} style={{ marginTop: '1rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem 2rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 15, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Processing...' : (editId ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        )}

        {/* Table */}
        {loading ? <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '3rem' }}>Loading products…</p> : (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.12)' }}>
                  {['Image', 'Name', 'Price (ETB)', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No products yet. Add your first product!</td></tr>
                ) : products.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} onError={e => (e.currentTarget.style.display='none')} /> : <Package size={32} color="#6366f1" />}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#f1f5f9', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#10b981', fontWeight: 700 }}>{p.price?.toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 1rem', color: p.stockQuantity < 5 ? '#f59e0b' : '#94a3b8' }}>{p.stockQuantity}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === 'ACTIVE' ? '#10b981' : '#ef4444', borderRadius: 8, padding: '0.25rem 0.75rem', fontSize: 12, fontWeight: 700 }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => edit(p)} style={{ background: 'none', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', marginRight: 8 }}><Edit2 size={14} /></button>
                      <button onClick={() => del(p.id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer' }}><Trash2 size={14} /></button>
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
