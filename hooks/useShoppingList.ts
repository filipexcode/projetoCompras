import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import {
  addItem as addItemService,
  deleteItem as deleteItemService,
  getItems,
  updateItemQuantity,
} from '@/services/firestore';
import { deleteItemImage } from '@/services/storage';
import type { ShoppingItem } from '@/types';

type NewItemData = Omit<ShoppingItem, 'id' | 'userId' | 'createdAt'>;

interface UseShoppingListResult {
  items: ShoppingItem[];
  loading: boolean;
  error: string | null;
  grandTotal: number;
  addItem: (data: NewItemData) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  deleteItem: (itemId: string, imageUrl: string) => Promise<void>;
  clearError: () => void;
  reload: () => Promise<void>;
}

export function useShoppingList(userId: string): UseShoppingListResult {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const itemsRef = useRef<ShoppingItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const fetched = await getItems(userId);
      setItems(fetched);
      setError(null);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addItem = useCallback(
    async (data: NewItemData): Promise<void> => {
      try {
        const id = await addItemService(userId, data);
        const newItem: ShoppingItem = {
          id,
          userId,
          ...data,
          createdAt: Timestamp.now(),
        };
        setItems((prev) => [newItem, ...prev]);
      } catch (err) {
        const message = getFirebaseErrorMessage(err);
        setError(message);
        throw new Error(message);
      }
    },
    [userId],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<void> => {
      const current = itemsRef.current.find((item) => item.id === itemId);
      if (!current) {
        return;
      }
      const { unitPrice } = current;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity, totalPrice: unitPrice * quantity }
            : item,
        ),
      );

      try {
        await updateItemQuantity(userId, itemId, quantity, unitPrice);
      } catch (err) {
        setError(getFirebaseErrorMessage(err));
      }
    },
    [userId],
  );

  const deleteItem = useCallback(
    async (itemId: string, imageUrl: string): Promise<void> => {
      setItems((prev) => prev.filter((item) => item.id !== itemId));

      try {
        await deleteItemImage(imageUrl);
        await deleteItemService(userId, itemId);
      } catch (err) {
        setError(getFirebaseErrorMessage(err));
      }
    },
    [userId],
  );

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items],
  );

  return {
    items,
    loading,
    error,
    grandTotal,
    addItem,
    updateQuantity,
    deleteItem,
    clearError,
    reload,
  };
}
