import { describe, it } from "node:test";
import assert from "node:assert";

// Helper reproduisant la logique d'empreinte et de détection de doublons
function computeSnapshot(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

interface SaveFlowState<T extends { id: string }> {
  savedItem: T | null;
  savedSnapshot: string | null;
  notification: string | null;
  requiresConfirmation: boolean;
}

function handleSaveAction<T extends { id: string }>(
  currentData: Record<string, unknown>,
  state: SaveFlowState<T>,
  createFn: (data: Record<string, unknown>) => T,
  updateFn: (id: string, data: Record<string, unknown>) => T
): SaveFlowState<T> {
  const currentSnapshot = computeSnapshot(currentData);

  // 1. Déjà enregistré
  if (state.savedItem) {
    // Cas sans modification
    if (currentSnapshot === state.savedSnapshot) {
      return {
        ...state,
        notification: "Aucune modification à enregistrer",
        requiresConfirmation: false,
      };
    }

    // Avec modifications : demande de confirmation
    return {
      ...state,
      notification: null,
      requiresConfirmation: true,
    };
  }

  // 2. Premier enregistrement : création
  const created = createFn(currentData);
  return {
    savedItem: created,
    savedSnapshot: currentSnapshot,
    notification: "Facture enregistrée avec succès",
    requiresConfirmation: false,
  };
}

describe("Workflow Enregistrer & Confirmation Anti-Doublon", () => {
  const invoiceData1 = {
    client: "cli-1",
    issueDate: "2026-11-01",
    total: 590000,
    notes: "Paiement attendu",
  };

  let store: Array<{ id: string; invoiceNumber: string; total: number }> = [];

  const createInvoice = (data: Record<string, unknown>) => {
    const inv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `FAC-2026-${String(store.length + 1).padStart(4, "0")}`,
      total: Number(data.total),
      ...data,
    };
    store.push(inv);
    return inv;
  };

  const updateInvoice = (id: string, data: Record<string, unknown>) => {
    const idx = store.findIndex((i) => i.id === id);
    if (idx >= 0) {
      store[idx] = { ...store[idx]!, ...data };
      return store[idx]!;
    }
    throw new Error("Invoice not found");
  };

  it("1. Premier clic : crée l'élément normalement avec notification de succès", () => {
    store = [];
    const state: SaveFlowState<{ id: string; invoiceNumber: string; total: number }> = {
      savedItem: null,
      savedSnapshot: null,
      notification: null,
      requiresConfirmation: false,
    };

    const nextState = handleSaveAction(invoiceData1, state, createInvoice, updateInvoice);

    assert.strictEqual(store.length, 1);
    assert.strictEqual(nextState.notification, "Facture enregistrée avec succès");
    assert.strictEqual(nextState.requiresConfirmation, false);
    assert.ok(nextState.savedItem !== null);
    assert.ok(nextState.savedSnapshot !== null);
  });

  it("2. Deuxième clic SANS modification : n'ouvre pas la boîte et indique 'Aucune modification à enregistrer'", () => {
    store = [];
    let state = handleSaveAction(invoiceData1, {
      savedItem: null,
      savedSnapshot: null,
      notification: null,
      requiresConfirmation: false,
    }, createInvoice, updateInvoice);

    // Reclic avec exactement les mêmes données
    state = handleSaveAction(invoiceData1, state, createInvoice, updateInvoice);

    // Aucun doublon créé
    assert.strictEqual(store.length, 1);
    assert.strictEqual(state.notification, "Aucune modification à enregistrer");
    assert.strictEqual(state.requiresConfirmation, false);
  });

  it("3. Deuxième clic AVEC modification : demande confirmation sans créer de doublon", () => {
    store = [];
    let state = handleSaveAction(invoiceData1, {
      savedItem: null,
      savedSnapshot: null,
      notification: null,
      requiresConfirmation: false,
    }, createInvoice, updateInvoice);

    const modifiedData = {
      ...invoiceData1,
      total: 750000,
      notes: "Modification du montant et prestation ajoutée",
    };

    state = handleSaveAction(modifiedData, state, createInvoice, updateInvoice);

    // Toujours 1 seul élément dans le store
    assert.strictEqual(store.length, 1);
    assert.strictEqual(state.requiresConfirmation, true);
  });

  it("4. Mettre à jour : modifie bien la même facture existante sans doublon", () => {
    store = [];
    const firstState = handleSaveAction(invoiceData1, {
      savedItem: null,
      savedSnapshot: null,
      notification: null,
      requiresConfirmation: false,
    }, createInvoice, updateInvoice);

    const savedId = firstState.savedItem!.id;
    const modifiedData = {
      ...invoiceData1,
      total: 750000,
    };

    // Mise à jour confirmée
    updateInvoice(savedId, modifiedData);

    assert.strictEqual(store.length, 1, "Le store ne doit contenir aucun doublon");
    assert.strictEqual(store[0]!.id, savedId, "L'identifiant doit rester identique");
    assert.strictEqual(store[0]!.total, 750000, "Le montant doit être mis à jour");
  });
});

