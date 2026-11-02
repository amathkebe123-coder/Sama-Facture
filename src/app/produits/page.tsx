"use client";

import React, { useState } from "react";
import { Package, Plus, Trash2, Edit } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { useInvoices } from "@/context/InvoiceContext";
import { formatFCFA } from "@/lib/money";
import { ProductItem } from "@/lib/supabase-db";

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useInvoices();

  // Modal d'ajout / édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Services");
  const [unitPrice, setUnitPrice] = useState("");
  const [unit, setUnit] = useState("Prestation");

  // Détection des doublons & mise à jour
  const [savedProduct, setSavedProduct] = useState<{ id: string; name: string } | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    variant: FeedbackModalVariant;
    title: string;
    description: string;
  }>({
    isOpen: false,
    variant: "info",
    title: "",
    description: "",
  });

  const getProductSnapshot = () =>
    JSON.stringify({
      name: name.trim(),
      category: category.trim(),
      unitPrice: unitPrice.trim(),
      unit: unit.trim(),
    });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setSavedProduct(null);
    setSavedSnapshot(null);
    setName("");
    setCategory("Services");
    setUnitPrice("");
    setUnit("Prestation");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: ProductItem) => {
    setEditingId(p.id);
    setSavedProduct({ id: p.id, name: p.name });
    setName(p.name);
    setCategory(p.category);
    setUnitPrice(String(p.unitPrice));
    setUnit(p.unit);
    setSavedSnapshot(
      JSON.stringify({
        name: p.name.trim(),
        category: p.category.trim(),
        unitPrice: String(p.unitPrice).trim(),
        unit: p.unit.trim(),
      })
    );
    setIsModalOpen(true);
  };

  const handleDeleteClick = (p: ProductItem) => {
    setProductToDelete(p);
    setDialogState({
      isOpen: true,
      variant: "confirm",
      title: "Supprimer cette prestation ?",
      description: `Êtes-vous sûr de vouloir supprimer "${p.name}" de votre catalogue ? Cette action est irréversible.`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Produit supprimé",
        description: "La prestation a bien été retirée de votre catalogue.",
      });
    } catch (err: any) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur de suppression",
        description: err?.message || "Impossible de supprimer ce produit.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitPrice.trim()) return;

    const currentSnapshot = getProductSnapshot();

    // Mode édition directe
    if (editingId) {
      if (currentSnapshot === savedSnapshot) {
        setDialogState({
          isOpen: true,
          variant: "info",
          title: "Aucune modification",
          description: "Vous n'avez modifié aucune information sur ce produit.",
        });
        return;
      }
      setIsSubmitting(true);
      (async () => {
        try {
          const parsedPrice = parseInt(unitPrice.replace(/\s/g, ""), 10) || 0;
          await updateProduct(editingId, {
            name: name.trim(),
            category: category.trim(),
            unitPrice: parsedPrice,
            unit: unit.trim(),
          });
          setIsSubmitting(false);
          setIsModalOpen(false);
          setEditingId(null);
          setDialogState({
            isOpen: true,
            variant: "success",
            title: "Produit mis à jour",
            description: "La prestation a été mise à jour avec succès dans Supabase.",
          });
        } catch (err: any) {
          setIsSubmitting(false);
          setDialogState({
            isOpen: true,
            variant: "error",
            title: "Erreur de mise à jour",
            description: err?.message || "Impossible de mettre à jour le produit.",
          });
        }
      })();
      return;
    }

    // Si le produit est déjà enregistré
    if (savedProduct) {
      if (currentSnapshot === savedSnapshot) {
        setDialogState({
          isOpen: true,
          variant: "info",
          title: "Aucune modification",
          description: "Vous n'avez modifié aucune information sur ce produit depuis le dernier enregistrement.",
        });
        return;
      }
      setDialogState({
        isOpen: true,
        variant: "confirm",
        title: "Cet élément est déjà enregistré",
        description: `Voulez-vous mettre à jour le produit ${savedProduct.name} avec les nouvelles informations ?`,
      });
      return;
    }

    // PREMIER clic sur Enregistrer : création normale
    setIsSubmitting(true);
    (async () => {
      try {
        const parsedPrice = parseInt(unitPrice.replace(/\s/g, ""), 10) || 0;
        const newProd = await addProduct({
          name: name.trim(),
          category: category.trim(),
          unitPrice: parsedPrice,
          taxRate: 18,
          unit: unit.trim(),
        });

        setSavedProduct({ id: newProd.id, name: newProd.name });
        setSavedSnapshot(currentSnapshot);
        setIsSubmitting(false);
        setIsModalOpen(false);
        setDialogState({
          isOpen: true,
          variant: "success",
          title: "Produit enregistré",
          description: `Le produit ${newProd.name} a été enregistré avec succès dans Supabase.`,
        });
      } catch (err: any) {
        setIsSubmitting(false);
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Erreur d'enregistrement",
          description: err?.message || "Impossible d'enregistrer le produit dans Supabase.",
        });
      }
    })();
  };

  const handleConfirmUpdate = async () => {
    if (!savedProduct) return;
    setIsSubmitting(true);

    try {
      const parsedPrice = parseInt(unitPrice.replace(/\s/g, ""), 10) || 0;
      await updateProduct(savedProduct.id, {
        name: name.trim(),
        category: category.trim(),
        unitPrice: parsedPrice,
        unit: unit.trim(),
      });

      setSavedSnapshot(getProductSnapshot());
      setIsSubmitting(false);
      setIsModalOpen(false);
      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Modifications enregistrées",
        description: `Le produit ${savedProduct.name} a été mis à jour avec succès dans Supabase.`,
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur de mise à jour",
        description: err?.message || "Impossible de mettre à jour le produit dans Supabase.",
      });
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Produits & Services
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              {products.length} {products.length <= 1 ? "article" : "articles"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gérez vos prestations pour accélérer la rédaction de factures
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau produit</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden w-full">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Prestations actives
            </h3>
          </div>
        </div>

        {/* Desktop Table View (>= 768px) */}
        {products.length === 0 ? (
          <div className="py-14 text-center px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Aucun produit ou service pour le moment
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Créez vos prestations pour accélérer la rédaction de vos factures.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un produit</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Unité</th>
                <th className="py-3 px-4 text-center">Taux TVA</th>
                <th className="py-3 px-4 text-right">Prix Unitaire HT</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {p.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {p.unit}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600">
                    {typeof p.taxRate === "number" ? `${p.taxRate}%` : p.taxRate}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {typeof p.unitPrice === "number" ? formatFCFA(p.unitPrice) : p.unitPrice}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {products.map((p) => (
            <div key={p.id} className="p-3.5 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-xs text-slate-900">
                  {p.name}
                </span>
                <span className="font-bold text-xs text-emerald-700 tabular-nums shrink-0">
                  {typeof p.unitPrice === "number" ? formatFCFA(p.unitPrice) : p.unitPrice}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {p.category}
                </span>
                <span>Unité : {p.unit} • TVA {typeof p.taxRate === "number" ? `${p.taxRate}%` : p.taxRate}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(p)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[32px]"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(p)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors min-h-[32px]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Modal Création Produit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {editingId ? "Modifier la prestation" : "Ajouter une prestation au catalogue"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Définissez la tarification standard en FCFA
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom ou intitulé du service *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Infogérance & Maintenance Cloud"
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] bg-white"
                >
                  <option value="Ingénierie Logicielle">Ingénierie Logicielle</option>
                  <option value="Paiement & Fintech">Paiement & Fintech</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cybersécurité">Cybersécurité</option>
                  <option value="Services">Services divers</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prix HT (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="Ex: 500000"
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unité facturée
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] bg-white"
                  >
                    <option value="Projet / Forfait">Projet / Forfait</option>
                    <option value="Mois">Mois</option>
                    <option value="Module">Module</option>
                    <option value="Audit">Audit</option>
                    <option value="Prestation">Prestation</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? "Enregistrement..." : editingId ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Boîte de dialogue de retour */}
      <FeedbackModal
        isOpen={dialogState.isOpen}
        onClose={() => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          setProductToDelete(null);
        }}
        onConfirm={productToDelete ? handleConfirmDelete : handleConfirmUpdate}
        confirmLabel={productToDelete ? "Supprimer" : "Mettre à jour"}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
      />
    </AppShell>
  );
}
