"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  FileText,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useInvoices } from "@/context/InvoiceContext";
import { formatFCFA } from "@/lib/money";
import { Client } from "@/lib/data/fixtures";

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient, invoices } =
    useInvoices();

  const [searchQuery, setSearchQuery] = useState("");

  // Modal Ajout / Modification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+221 ");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dakar");

  // Modal Suppression
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Filtrage
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
    setName("");
    setEmail("");
    setPhone("+221 ");
    setAddress("");
    setCity("Dakar");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || "+221 ");
    setAddress(client.address || "");
    setCity(client.city || "Dakar");
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        name,
        email,
        phone,
        address,
        city,
      });
    } else {
      addClient({
        name,
        email,
        phone,
        address,
        city,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingClient) {
      deleteClient(deletingClient.id);
      setDeletingClient(null);
    }
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Clients
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              {clients.length} clients
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Répertoire commercial, coordonnées et historique de facturation
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm hover:shadow shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Aucun client trouvé
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Aucun client ne correspond à votre recherche. Ajoutez un nouveau client en cliquant ci-dessus.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Modifier le client"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingClient(client)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Supprimer le client"
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

            {/* Mobile View (< 768px) */}
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
                  <div key={client.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase">
                          {client.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-sm text-slate-900">
                          {client.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {formatFCFA(totalInv || client.totalInvoiced || 0)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{client.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{client.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>
                          {client.city} • {client.address}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(client)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 bg-slate-100 rounded-lg font-medium"
                      >
                        <Edit className="w-3 h-3" />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingClient(client)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 bg-rose-50 rounded-lg font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal Ajout / Modification Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {editingClient ? "Modifier le client" : "Ajouter un client"}
                </span>
              </h3>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de l&apos;entreprise ou du client *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Baobab Digital SARL"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email de facturation *
                </label>
                <input
                  type="email"
                  required
                  placeholder="compta@entreprise.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    placeholder="Dakar, Thiès..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse physique
                  </label>
                  <input
                    type="text"
                    placeholder="Quartier, rue..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                >
                  {editingClient ? "Mettre à jour" : "Ajouter le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation de Suppression Client */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Supprimer le client ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className="font-semibold text-slate-800">
                  {deletingClient.name}
                </span>{" "}
                ? Les factures associées resteront enregistrées.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

