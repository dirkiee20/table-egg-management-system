import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, CircleDollarSign, PlusCircle, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMarker, setErrorMarker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Point of Sale Form State
  const [customerName, setCustomerName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [address, setAddress] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState(true);
  const [lineItems, setLineItems] = useState([
    { id: 1, grade: 'Large', quantity: 10, price: 150.00 } // price changed to PHP mock default
  ]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await api.sales.getAll();
      setSales(data.reverse()); // latest first
    } catch (err) {
      console.error(err);
      setErrorMarker("Failed to retrieve sales ledger.");
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), grade: 'Medium', quantity: 1, price: 140.00 }]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  };
  
  const calculateTotalQuantity = () => {
    return lineItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMarker(null);
    
    try {
      const totalQty = calculateTotalQuantity();
      const totalAmt = calculateTotal();
      const avgPrice = totalQty > 0 ? (totalAmt / totalQty) : 0;

      await api.sales.create({
        customer_name: customerName || 'Walk-in Customer',
        contact_no: contactNo,
        address: address,
        date: saleDate,
        traysSold: totalQty,
        pricePerTray: Number(avgPrice.toFixed(2)),
        total: Number(totalAmt.toFixed(2)),
        status: isPaid ? 'Paid' : 'Unpaid'
      });

      // Reload sales to fetch new row and verify inventory deduction
      await loadSales();
      setIsModalOpen(false);
      
      // Reset form
      setCustomerName('');
      setContactNo('');
      setAddress('');
      setLineItems([{ id: Date.now(), grade: 'Large', quantity: 10, price: 150.00 }]);
    } catch (err) {
      console.error("Sale failed:", err);
      // Surface backend validation errors (like insufficient inventory)
      setErrorMarker(err.message || "Failed to process sale due to network/inventory constraints.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Sales Transactions</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <CircleDollarSign size={18} /> New Egg Sale
        </button>
      </div>

      {errorMarker && !isModalOpen && (
        <div className="alert alert-error"><AlertCircle size={16} />{errorMarker}</div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', marginBottom: '16px' }}>Invoice Ledger</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Address</th>
                <th className="text-right">Quantity</th>
                <th className="text-right">Total (₱)</th>
                <th>Payment Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 className="spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No sales recorded yet.
                  </td>
                </tr>
              ) : sales.map(sale => (
                <tr key={sale.id}>
                  <td className="font-medium text-muted">INV-{sale.id}</td>
                  <td>{sale.date}</td>
                  <td className="font-medium">{sale.customer_name || sale.customer}</td>
                  <td className="text-muted">{sale.contact_no || '-'}</td>
                  <td className="text-muted">{sale.address || '-'}</td>
                  <td className="text-right">{sale.traysSold} Trays</td>
                  <td className="text-right font-medium">₱{sale.total?.toFixed(2)}</td>
                  <td>
                    {sale.status === 'Paid' ? (
                      <span className="badge badge-success"><CheckCircle2 size={11} /> Paid</span>
                    ) : (
                      <span className="badge badge-warning">Unpaid</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn" title="View Receipt">
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Point of Sale (New Order)</h3>
              <button className="close-btn" onClick={() => !isSubmitting && setIsModalOpen(false)}><X size={20} /></button>
            </div>

            {errorMarker && (
              <div className="alert alert-error" style={{ margin: '0 0 16px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {errorMarker}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="standard-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input type="text" placeholder="Walk-in Customer" value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group">
                  <label>Sale Date</label>
                  <input type="date" required value={saleDate} onChange={e => setSaleDate(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" placeholder="e.g. 09123456789" value={contactNo} onChange={e => setContactNo(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="Customer address" value={address} onChange={e => setAddress(e.target.value)} disabled={isSubmitting} />
                </div>
              </div>

              <h4 style={{ margin: '20px 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Egg Cart</h4>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {lineItems.map((item, index) => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: index !== lineItems.length - 1 ? '12px' : '0' }}>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Select Size</label>
                      <select value={item.grade} onChange={e => updateLineItem(item.id, 'grade', e.target.value)} disabled={isSubmitting}>
                        <option value="Large">Large</option>
                        <option value="Medium">Medium</option>
                        <option value="Small">Small</option>
                      </select>
                    </div>
                    
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Trays</label>
                      <input type="number" min="1" required value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', e.target.value)} disabled={isSubmitting} />
                    </div>
                    
                    <div className="form-group" style={{ flex: 1.2, marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Price/Tray (₱)</label>
                      <input type="number" step="0.01" min="0" required value={item.price} onChange={e => updateLineItem(item.id, 'price', e.target.value)} disabled={isSubmitting} />
                    </div>

                    <div style={{ flex: 1, textAlign: 'right', fontWeight: '500', paddingBottom: '10px' }}>
                      ₱{(item.quantity * item.price).toFixed(2)}
                    </div>
                    
                    <button type="button" className="action-btn delete" onClick={() => removeLineItem(item.id)} disabled={isSubmitting} style={{ paddingBottom: '10px', opacity: isSubmitting ? 0.5 : 1 }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                
                <button type="button" onClick={addLineItem} className="btn-secondary" disabled={isSubmitting} style={{ marginTop: '16px', fontSize: '0.75rem', padding: '6px 12px' }}>
                  <PlusCircle size={14} /> Add Another Size
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} disabled={isSubmitting} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                  Mark as Paid
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>₱{calculateTotal().toFixed(2)}</div>
                  </div>
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '12px 24px', fontSize: '1rem' }}>
                    {isSubmitting ? <Loader2 className="spin" size={20} /> : <CheckCircle2 size={20} />} 
                    {isSubmitting ? 'Processing...' : 'Complete Sale'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
