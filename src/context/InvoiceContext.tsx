"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Invoice, Client } from "@/lib/data/fixtures";
import { InvoiceStatus } from "@/lib/invoice-status";
import { CompanySettings, DEFAULT_COMPANY_SETTINGS } from "@/lib/company";
import {
  ProductItem,
  PaymentItem,
  fetchClients,
  createClientInDb,
  updateClientInDb,
  deleteClientFromDb,
  fetchInvoices,
  createInvoiceInDb,
  updateInvoiceInDb,
  updateInvoiceStatusInDb,
  deleteInvoiceFromDb,
  fetchProducts,
  createProductInDb,
  updateProductInDb,
  deleteProductFromDb,
  fetchPayments,
  createPaymentInDb,
  updatePaymentInDb,
  deletePaymentFromDb,
  fetchCompanySettingsFromDb,
  updateCompanySettingsInDb,
} from "@/lib/supabase-db";

interface UserProfile {
  fullName: string;
  companyName: string;
  email: string;
}

interface InvoiceContextType {
  user: User | null;
  userProfile: UserProfile;
  signOut: () => Promise<void>;
  invoices: Invoice[];
  clients: Client[];
  products: ProductItem[];
  payments: PaymentItem[];
  companySettings: CompanySettings;
  isLoading: boolean;
  addInvoice: (data: Omit<Invoice, "id" | "invoiceNumber">) => Promise<Invoice>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  addClient: (data: Omit<Client, "id">) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addProduct: (data: Omit<ProductItem, "id">) => Promise<ProductItem>;
  updateProduct: (id: string, data: Partial<ProductItem>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addPayment: (data: Omit<PaymentItem, "id">) => Promise<PaymentItem>;
  updatePayment: (id: string, data: Partial<PaymentItem>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  updateSettings: (settings: CompanySettings) => Promise<void>;
  getInvoice: (id: string) => Invoice | undefined;
  getClient: (id: string) => Client | undefined;
  refreshAll: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const userProfile: UserProfile = {
    fullName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Utilisateur",
    companyName: user?.user_metadata?.company_name || companySettings.companyName || "Mon Entreprise",
    email: user?.email || "",
  };

  const refreshAll = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        setInvoices([]);
        setClients([]);
        setProducts([]);
        setPayments([]);
        setIsLoading(false);
        return;
      }

      const [settingsData, clientsData, invoicesData, productsData, paymentsData] =
        await Promise.all([
          fetchCompanySettingsFromDb(),
          fetchClients(),
          fetchInvoices(),
          fetchProducts(),
          fetchPayments(),
        ]);

      setCompanySettings(settingsData);
      setClients(clientsData);
      setInvoices(invoicesData);
      setProducts(productsData);
      setPayments(paymentsData);
    } catch (err) {
      console.error("Erreur chargement Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        refreshAll();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setInvoices([]);
        setClients([]);
        setProducts([]);
        setPayments([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAll]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setInvoices([]);
    setClients([]);
    setProducts([]);
    setPayments([]);
    if (typeof window !== "undefined") {
      window.location.href = "/connexion";
    }
  };

  // ---------------------------------------------------------------------------
  // FACTURES
  // ---------------------------------------------------------------------------

  const addInvoice = async (data: Omit<Invoice, "id" | "invoiceNumber">): Promise<Invoice> => {
    const prefix = companySettings.prefix || "FAC-2026-";
    const nextSeq = invoices.length + 1;
    const invoiceNumber = `${prefix}${String(nextSeq).padStart(4, "0")}`;

    const newInvoice = await createInvoiceInDb(data, invoiceNumber, user?.id);

    setInvoices((prev) => [newInvoice, ...prev]);

    // Mettre à jour les compteurs du client localement
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

  const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<void> => {
    await updateInvoiceInDb(id, data, user?.id);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv))
    );
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    await deleteInvoiceFromDb(id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<void> => {
    await updateInvoiceStatusInDb(id, status);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
  };

  // ---------------------------------------------------------------------------
  // CLIENTS
  // ---------------------------------------------------------------------------

  const addClient = async (data: Omit<Client, "id">): Promise<Client> => {
    const newClient = await createClientInDb(data, user?.id);
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, data: Partial<Client>): Promise<void> => {
    const updatedClient = await updateClientInDb(id, data);
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedClient } : c))
    );

    // Mettre à jour le nom / email du client dans les factures chargées
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

  const deleteClient = async (id: string): Promise<void> => {
    await deleteClientFromDb(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // ---------------------------------------------------------------------------
  // PRODUITS
  // ---------------------------------------------------------------------------

  const addProduct = async (data: Omit<ProductItem, "id">): Promise<ProductItem> => {
    const newProd = await createProductInDb(data, user?.id);
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = async (id: string, data: Partial<ProductItem>): Promise<void> => {
    const updated = await updateProductInDb(id, data);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await deleteProductFromDb(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ---------------------------------------------------------------------------
  // PAIEMENTS
  // ---------------------------------------------------------------------------

  const addPayment = async (data: Omit<PaymentItem, "id">): Promise<PaymentItem> => {
    const newPayment = await createPaymentInDb(data, user?.id);
    setPayments((prev) => [newPayment, ...prev]);
    return newPayment;
  };

  const updatePayment = async (id: string, data: Partial<PaymentItem>): Promise<void> => {
    const updated = await updatePaymentInDb(id, data);
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deletePayment = async (id: string): Promise<void> => {
    await deletePaymentFromDb(id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // ---------------------------------------------------------------------------
  // PARAMÈTRES
  // ---------------------------------------------------------------------------

  const updateSettings = async (settings: CompanySettings): Promise<void> => {
    await updateCompanySettingsInDb(settings, user?.id);
    setCompanySettings(settings);
  };

  // ---------------------------------------------------------------------------
  // RECHERCHES LOCALES
  // ---------------------------------------------------------------------------

  const getInvoice = (id: string) => {
    return invoices.find((inv) => inv.id === id);
  };

  const getClient = (id: string) => {
    return clients.find((c) => c.id === id);
  };

  return (
    <InvoiceContext.Provider
      value={{
        user,
        userProfile,
        signOut,
        invoices,
        clients,
        products,
        payments,
        companySettings,
        isLoading,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateInvoiceStatus,
        addClient,
        updateClient,
        deleteClient,
        addProduct,
        updateProduct,
        deleteProduct,
        addPayment,
        updatePayment,
        deletePayment,
        updateSettings,
        getInvoice,
        getClient,
        refreshAll,
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
