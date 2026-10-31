"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Invoice,
  Client,
  INITIAL_INVOICES,
  INITIAL_CLIENTS,
  InvoiceLine,
} from "@/lib/data/fixtures";
import { InvoiceStatus } from "@/lib/invoice-status";

interface InvoiceContextType {
  invoices: Invoice[];
  clients: Client[];
  addInvoice: (data: Omit<Invoice, "id" | "invoiceNumber">) => Invoice;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  addClient: (data: Omit<Client, "id">) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
  getClient: (id: string) => Client | undefined;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const LOCAL_STORAGE_INVOICES_KEY = "sama_facture_invoices_v1";
const LOCAL_STORAGE_CLIENTS_KEY = "sama_facture_clients_v1";

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger depuis le localStorage après le montage client
  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem(LOCAL_STORAGE_INVOICES_KEY);
      const savedClients = localStorage.getItem(LOCAL_STORAGE_CLIENTS_KEY);

      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      }
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }
    } catch {
      // Si localStorage indisponible, conserver les fixtures
    }
    setIsInitialized(true);
  }, []);

  // Sauvegarder dans le localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.error(e);
    }
  }, [invoices, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error(e);
    }
  }, [clients, isInitialized]);

  const addInvoice = (data: Omit<Invoice, "id" | "invoiceNumber">): Invoice => {
    const nextNumber = invoices.length + 43; // format séquentiel
    const invoiceNumber = `FAC-2026-${String(nextNumber).padStart(4, "0")}`;
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Mettre à jour les totaux du client correspondant
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === data.client.id) {
          return {
            ...c,
            totalInvoiced: (c.totalInvoiced || 0) + data.total,
            invoiceCount: (c.invoiceCount || 0) + 1,
            totalPaid:
              data.status === "paid"
                ? (c.totalPaid || 0) + data.total
                : c.totalPaid || 0,
          };
        }
        return c;
      })
    );

    return newInvoice;
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv))
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          return { ...inv, status };
        }
        return inv;
      })
    );
  };

  const addClient = (data: Omit<Client, "id">): Client => {
    const newClient: Client = {
      ...data,
      id: `cli-${Date.now()}`,
      totalInvoiced: 0,
      totalPaid: 0,
      invoiceCount: 0,
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    // Répercuter le nom sur les factures existantes du client
    if (data.name || data.email) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.client.id === id) {
            return {
              ...inv,
              client: {
                ...inv.client,
                name: data.name ?? inv.client.name,
                email: data.email ?? inv.client.email,
              },
            };
          }
          return inv;
        })
      );
    }
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const getInvoice = (id: string) => {
    return invoices.find((inv) => inv.id === id);
  };

  const getClient = (id: string) => {
    return clients.find((c) => c.id === id);
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        clients,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateInvoiceStatus,
        addClient,
        updateClient,
        deleteClient,
        getInvoice,
        getClient,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoices doit être utilisé dans un InvoiceProvider");
  }
  return context;
}

