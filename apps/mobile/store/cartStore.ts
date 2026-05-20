import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { Product } from "@/types";
import * as productService from "@/services/product.service";
import { useAuthStore } from "@/store/authStore";

const CART_STORAGE_KEY = "just_sell_cart";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  ownerUserId: string | null;
  isHydrated: boolean;
  hydrate: (userId?: string | null) => Promise<void>;
  addItem: (product: Product) => Promise<{ added: boolean }>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  verifyItems: () => Promise<void>;
  setOwnerUserId: (userId: string | null) => Promise<void>;
};

type PersistedCart = {
  ownerUserId: string | null;
  items: CartItem[];
};

async function persistItems(items: CartItem[], ownerUserId: string | null) {
  const payload: PersistedCart = { ownerUserId, items };
  await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  ownerUserId: null,
  isHydrated: false,

  hydrate: async (userId = null) => {
    try {
      const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        set({ items: [], ownerUserId: userId, isHydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as PersistedCart | CartItem[];
      const persisted = Array.isArray(parsed)
        ? { ownerUserId: null, items: parsed }
        : parsed;

      if (persisted.ownerUserId !== userId) {
        set({ items: [], ownerUserId: userId, isHydrated: true });
        await persistItems([], userId);
        return;
      }

      set({
        items: persisted.items ?? [],
        ownerUserId: userId,
        isHydrated: true,
      });
    } catch {
      set({ items: [], ownerUserId: userId, isHydrated: true });
    }
  },

  addItem: async (product) => {
    const ownerUserId = useAuthStore.getState().user?.id ?? null;
    if (get().ownerUserId !== ownerUserId) {
      set({ items: [], ownerUserId });
      await persistItems([], ownerUserId);
    }

    const existing = get().items.find((item) => item.productId === product.id);
    if (existing) {
      return { added: false };
    }

    const nextItems = [
      ...get().items,
      {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] ?? "",
        sellerId: product.userId,
        sellerName: product.seller.name,
        quantity: 1,
      },
    ];

    set({ items: nextItems, ownerUserId });
    await persistItems(nextItems, ownerUserId);
    return { added: true };
  },

  removeItem: async (productId) => {
    const nextItems = get().items.filter((item) => item.productId !== productId);
    set({ items: nextItems });
    await persistItems(nextItems, get().ownerUserId);
  },

  clearCart: async () => {
    set({ items: [], ownerUserId: get().ownerUserId });
    await persistItems([], get().ownerUserId);
  },

  verifyItems: async () => {
    const currentItems = get().items;
    if (currentItems.length === 0) return;

    const checkedItems = await Promise.all(
      currentItems.map(async (item) => {
        try {
          const product = await productService.getProductById(item.productId);
          if (product.isSold || product.status !== "ACTIVE") {
            return null;
          }

          return {
            ...item,
            title: product.title,
            price: product.price,
            image: product.images?.[0] ?? item.image,
            sellerId: product.userId,
            sellerName: product.seller.name,
          };
        } catch {
          return null;
        }
      })
    );

    const validItems = checkedItems.filter((item): item is CartItem => Boolean(item));
    if (validItems.length !== currentItems.length) {
      set({ items: validItems });
      await persistItems(validItems, get().ownerUserId);
    }
  },

  setOwnerUserId: async (userId) => {
    if (get().ownerUserId === userId) return;
    set({ items: [], ownerUserId: userId });
    await persistItems([], userId);
  },
}));
