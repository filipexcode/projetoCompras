import { useCallback, useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { ItemCard } from '@/components/ItemCard';
import { TotalBar } from '@/components/TotalBar';
import { COLORS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingList } from '@/hooks/useShoppingList';
import type { ShoppingItem } from '@/types';

function ItemSeparator() {
  return <View className="h-px bg-gray-100" />;
}

function ListEmpty() {
  return (
    <View className="items-center justify-center px-8 py-20">
      <Ionicons name="cart-outline" size={48} color={COLORS.muted} />
      <Text className="mt-4 text-center text-base text-gray-500">
        Sua lista está vazia. Use a aba Câmera para adicionar itens.
      </Text>
    </View>
  );
}

export default function ListaScreen() {
  const { user, signOut } = useAuth();
  const userId = user?.uid ?? '';

  const {
    items,
    loading,
    error,
    grandTotal,
    updateQuantity,
    deleteItem,
    clearError,
    reload,
  } = useShoppingList(userId);

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            void signOut();
          }}
          className="px-4 active:opacity-60"
          hitSlop={8}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
        </Pressable>
      ),
    });
  }, [navigation, signOut]);

  const renderItem = useCallback<ListRenderItem<ShoppingItem>>(
    ({ item }) => (
      <ItemCard
        item={item}
        onUpdateQuantity={updateQuantity}
        onDelete={deleteItem}
      />
    ),
    [updateQuantity, deleteItem],
  );

  const keyExtractor = useCallback((item: ShoppingItem) => item.id, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        className="flex-1"
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={items.length === 0 ? { flexGrow: 1 } : undefined}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />

      {error !== null && (
        <View className="mx-3 mb-2 flex-row items-center justify-between rounded-lg bg-red-100 px-4 py-3">
          <Text className="flex-1 text-sm text-red-700">{error}</Text>
          <Pressable onPress={clearError} hitSlop={8} className="ml-3">
            <Ionicons name="close" size={18} color={COLORS.danger} />
          </Pressable>
        </View>
      )}

      <TotalBar total={grandTotal} />
    </View>
  );
}
