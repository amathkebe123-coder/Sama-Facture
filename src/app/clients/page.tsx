"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { useInvoices } from "@/context/InvoiceContext";
import { formatFCFA } from "@/lib/money";
import { Client } from "@/lib/data/fixtures";

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient, invoices } =
    useInvoices();

  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+221 ");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dakar");

  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Détection des doublons et confirmation de mise à jour
  const [savedClient, setSavedClient] = useState<Client | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Boîte de dialogue centrée (modale unique officielle)
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    variant: FeedbackModalVariant;
    title: string;
    description: string;
  }>({
    isOpen: false,
    variant: "success",
    title: "",
    description: "",
  });

  const getClientFormSnapshot = () =>
    JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
    });

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setSavedClient(null);
    setSavedSnapshot(null);
    setName("");
    setEmail("");
    setPhone("+221 ");
    setAddress("");
    setCity("Dakar");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setSavedClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || "+221 ");
    setAddress(client.address || "");
    setCity(client.city || "Dakar");
    setSavedSnapshot(
      JSON.stringify({
        name: client.name.trim(),
        email: client.email.trim().toLowerCase(),
        phone: (client.phone || "+221 ").trim(),
        address: (client.address || "").trim(),
        city: (client.city || "Dakar").trim(),
      })
    );
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const currentSnapshot = getClientFormSnapshot();

    // Cas d'un client déjà enregistré ou en cours d'édition
    const targetClient = editingClient || savedClient;
    if (targetClient) {
      if (currentSnapshot === savedSnapshot) {
        setDialogState({
          isOpen: true,
          variant: "info",
          title: "Aucune modification",
          description: "Vous n'avez modifié aucune information depuis le dernier enregistrement.",
        });
        return;
      }

      // Si des champs ont été modifiés, ouvrir la boîte de confirmation
      setDialogState({
        isOpen: true,
        variant: "confirm",
        title: "Cet élément est déjà enregistré",
        description: `Voulez-vous mettre à jour le client ${targetClient.name} avec les nouvelles informations ?`,
      });
      return;
    }

    // PREMIER clic sur Enregistrer : création normale
    setIsSubmitting(true);
    (async () => {
      try {
        const newClient = await addClient({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
        });

        setSavedClient(newClient);
        setSavedSnapshot(currentSnapshot);
        setIsSubmitting(false);
        setIsModalOpen(false);
        setDialogState({
          isOpen: true,
          variant: "success",
          title: "Enregistré avec succès",
          description: `Le client ${newClient.name} a été enregistré avec succès dans Supabase.`,
        });
      } catch (err: any) {
        setIsSubmitting(false);
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Erreur d'enregistrement",
          description: err?.message || "Impossible d'enregistrer le client dans Supabase.",
        });
      }
    })();
  };

  const handleConfirmUpdate = async () => {
    const targetClient = editingClient || savedClient;
    if (!targetClient) return;

    setIsSubmitting(true);
    try {
      await updateClient(targetClient.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
      });

      setSavedSnapshot(getClientFormSnapshot());
      setIsSubmitting(false);
      setIsModalOpen(false);
      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Modifications enregistrées",
        description: `Les informations du client ${targetClient.name} ont été mises à jour avec succès.`,
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur de mise à jour",
        description: err?.message || "Impossible de mettre à jour le client dans Supabase.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingClient) {
      try {
        await deleteClient(deletingClient.id);
      } catch (err) {
        console.error("Erreur suppression client:", err);
      }
      setDeletingClient(null);
    }
  };

  return (
    <AppShell>
      {/* Top Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Clients
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              {clients.length} {clients.length <= 1 ? "client" : "clients"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Répertoire commercial et coordonnées
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 min-h-[44px]"
          />
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden w-full">
        {filteredClients.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Aucun client trouvé
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Ajoutez un nouveau client avec le bouton ci-dessus.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Coordonnées</th>
                    <th className="py-3 px-4">Localisation</th>
                    <th className="py-3 px-4 text-center">Factures</th>
                    <th className="py-3 px-4 text-right">Total Facturé</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredClients.map((client) => {
                    const clientInvoices = invoices.filter(
                      (i) => i.client.id === client.id
                    );
                    const totalInv = clientInvoices.reduce(
                      (acc, i) => acc + i.total,
                      0
                    );

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {client.name.substring(0, 2)}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-900">
                                {client.name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                ID: {client.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 text-slate-600">
                            <p className="flex items-center gap-1.5 text-slate-800">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{client.email}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{client.phone}</span>
                            </p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <p className="font-medium text-slate-800">{client.city}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {client.address}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-slate-100">
                            {clientInvoices.length}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatFCFA(totalInv || client.totalInvoiced || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(client)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingClient(client)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View (< 768px) - 100% Mobile First */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredClients.map((client) => {
                const clientInvoices = invoices.filter(
                  (i) => i.client.id === client.id
                );
                const totalInv = clientInvoices.reduce(
                  (acc, i) => acc + i.total,
                  0
                );

                return (
                  <div key={client.id} className="p-3.5 sm:p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {client.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {client.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 tabular-nums shrink-0">
                        {formatFCFA(totalInv || client.totalInvoiced || 0)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{client.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{client.city}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(client)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 active:bg-slate-200 rounded-xl min-h-[44px]"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        <span>Modifier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingClient(client)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 active:bg-rose-100 rounded-xl min-h-[44px]"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal Ajout / Modification Client (Bottom sheet on mobile) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm safe-bottom">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {editingClient ? "Modifier le client" : "Nouveau client"}
                </span>
              </h3>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom ou Entreprise *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Baobab Digital SARL"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email de facturation *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@entreprise.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Téléphone (Wave / OM)
                </label>
                <input
                  type="text"
                  placeholder="+221 77 000 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    placeholder="Dakar, Thiès..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse physique
                  </label>
                  <input
                    type="text"
                    placeholder="Quartier..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px] disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl min-h-[44px] shadow-sm disabled:opacity-50"
                >
                  {editingClient ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Boîte de dialogue centrée réutilisable (modale officielle) */}
      <FeedbackModal
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
        closeLabel="Fermer"
        confirmLabel="Mettre à jour"
        cancelLabel="Annuler"
        onConfirm={handleConfirmUpdate}
        isLoading={isSubmitting}
      />

      {/* Modal Confirmation de Suppression Client */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm safe-bottom">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Supprimer le client ?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className="font-bold text-slate-800">
                  {deletingClient.name}
                </span>{" "}
                ?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl min-h-[44px] shadow-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
