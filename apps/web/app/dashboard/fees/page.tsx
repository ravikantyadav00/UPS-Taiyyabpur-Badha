'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CreditCard, DollarSign, Plus, CheckCircle, Clock, AlertCircle, Loader2, Receipt, FileText, Send } from 'lucide-react';

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  description?: string;
  class?: { name: string };
  academicYear?: { name: string };
}

interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
  student: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    class?: { name: string };
  };
  feeStructure: { name: string };
  payments?: {
    id: string;
    receiptNumber: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
  }[];
}

interface FinancialStats {
  totalBilled: number;
  totalCollected: number;
  pendingDues: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  totalInvoicesCount: number;
}

export default function FeesPage() {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & State
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);

  // Structure Form
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('1500');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  // Payment Form
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [transactionRef, setTransactionRef] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'structures'>('invoices');

  const loadData = async () => {
    try {
      const [structs, invs, financialStats] = await Promise.all([
        apiFetch<FeeStructure[]>('/fees/structures'),
        apiFetch<FeeInvoice[]>('/fees/invoices'),
        apiFetch<FinancialStats>('/fees/stats'),
      ]);
      setStructures(structs);
      setInvoices(invs);
      setStats(financialStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;

    setSubmitting(true);
    try {
      const years = await apiFetch<any[]>('/academic-years');
      const currentYear = years.find((y) => y.isCurrent) || years[0];

      await apiFetch('/fees/structures', {
        method: 'POST',
        body: JSON.stringify({
          name,
          amount: Number(amount),
          dueDate,
          description,
          academicYearId: currentYear.id,
        }),
      });

      setShowStructureModal(false);
      setName('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create fee structure');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoices = async (structureId: string) => {
    setSubmitting(true);
    try {
      const res = await apiFetch('/fees/invoices/generate', {
        method: 'POST',
        body: JSON.stringify({ feeStructureId: structureId }),
      });
      alert(res.message);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoices');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPaymentModal = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    setAmountPaid((invoice.totalAmount - invoice.paidAmount).toString());
    setTransactionRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !amountPaid) return;

    setSubmitting(true);
    try {
      await apiFetch('/fees/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amountPaid: Number(amountPaid),
          paymentMethod,
          transactionRef,
        }),
      });

      setShowPaymentModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-cyan-400" />
            <span>Fee & Billing Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure fee structures, issue student invoices, record payments, and monitor collection stats
          </p>
        </div>
        <button
          onClick={() => setShowStructureModal(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Fee Category</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Billed</p>
              <p className="text-xl font-bold text-slate-100">${stats.totalBilled.toLocaleString()}</p>
            </div>
            <DollarSign className="w-6 h-6 text-slate-500/40" />
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Collected</p>
              <p className="text-xl font-bold text-emerald-400">${stats.totalCollected.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-emerald-500/40" />
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Pending Dues</p>
              <p className="text-xl font-bold text-amber-400">${stats.pendingDues.toLocaleString()}</p>
            </div>
            <Clock className="w-6 h-6 text-amber-400/40" />
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Paid Invoices</p>
              <p className="text-xl font-bold text-cyan-400">
                {stats.paidInvoicesCount} / {stats.totalInvoicesCount}
              </p>
            </div>
            <Receipt className="w-6 h-6 text-cyan-400/40" />
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`text-sm font-semibold pb-1.5 transition-all ${
            activeTab === 'invoices'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Student Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`text-sm font-semibold pb-1.5 transition-all ${
            activeTab === 'structures'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Fee Structures ({structures.length})
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Loading billing records...</span>
        </div>
      ) : activeTab === 'invoices' ? (
        /* Invoices Register */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((inv) => (
              <div key={inv.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">
                      {inv.student.firstName} {inv.student.lastName}
                    </h3>
                    <p className="text-xs text-cyan-400 font-mono">{inv.invoiceNumber}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : inv.status === 'PARTIAL'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 border-t border-b border-slate-800/80 py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-semibold text-slate-300">{inv.feeStructure.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="font-mono text-slate-100">${inv.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paid Amount:</span>
                    <span className="font-mono text-emerald-400">${inv.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Due Date:</span>
                    <span>{new Date(inv.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {inv.payments && inv.payments.length > 0 ? (
                    <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{inv.payments[0].receiptNumber}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No payments recorded</span>
                  )}

                  {inv.status !== 'PAID' && (
                    <button
                      onClick={() => handleOpenPaymentModal(inv)}
                      className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Collect Fee</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Fee Structures List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {structures.map((st) => (
            <div key={st.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h3 className="font-bold text-slate-100 text-lg">{st.name}</h3>
                <p className="text-xs text-slate-400">{st.description || 'General fee structure'}</p>
              </div>

              <div className="text-xs text-slate-400 space-y-1 py-2 border-t border-b border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Amount:</span>
                  <span className="font-bold text-cyan-400 text-base">${st.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span>{new Date(st.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleGenerateInvoices(st.id)}
                disabled={submitting}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Batch Issue Invoices</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Fee Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-100">New Fee Category</h2>

            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category Title</label>
                <input
                  type="text"
                  placeholder="Tuition Fee - Q1 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount ($)</label>
                <input
                  type="number"
                  placeholder="1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Quarterly academic tuition fee"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Collect Student Fee</h2>
              <p className="text-xs text-cyan-400 mt-1">
                Invoice #{selectedInvoice.invoiceNumber} | {selectedInvoice.student.firstName}{' '}
                {selectedInvoice.student.lastName}
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount Paid ($)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="ONLINE">Online NetBanking / Card</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transaction Ref / Receipt No</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Issue Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
