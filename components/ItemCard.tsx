import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { COLORS } from '@/constants';
import { formatCurrency } from '@/lib/formatters';
import type { ShoppingItem } from '@/types';

interface ItemCardProps {
  item: ShoppingItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onDelete: (itemId: string, imageUrl: string) => void;
}

function ItemCardComponent({ item, onUpdateQuantity, onDelete }: ItemCardProps) {
  const decrementDisabled = item.quantity <= 1;

  function handleDecrement(): void {
    if (!decrementDisabled) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  }

  function handleIncrement(): void {
    onUpdateQuantity(item.id, item.quantity + 1);
  }

  function confirmDelete(): void {
    Alert.alert(
      'Excluir item',
      `Deseja remover "${item.name}" da lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onDelete(item.id, item.imageUrl),
        },
      ],
      { cancelable: true },
    );
  }

  return (
    <View className="flex-row items-center bg-white px-4 py-3">
      {item.imageUrl.length > 0 ? (
        <Image
          source={{ uri: item.imageUrl }}
          className="h-16 w-16 rounded-lg bg-gray-200"
          resizeMode="cover"
        />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
          <Ionicons name="image-outline" size={24} color={COLORS.muted} />
        </View>
      )}

      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
          {item.name}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500">
          {formatCurrency(item.unitPrice)} / un.
        </Text>

        <View className="mt-2 flex-row items-center">
          <Pressable
            onPress={handleDecrement}
            disabled={decrementDisabled}
            className={`h-8 w-8 items-center justify-center rounded-full ${
              decrementDisabled ? 'bg-gray-100' : 'bg-gray-200 active:bg-gray-300'
            }`}
          >
            <Ionicons
              name="remove"
              size={18}
              color={decrementDisabled ? COLORS.muted : '#111827'}
            />
          </Pressable>

          <Text className="mx-3 min-w-[24px] text-center text-base font-semibold text-gray-900">
            {item.quantity}
          </Text>

          <Pressable
            onPress={handleIncrement}
            className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 active:bg-gray-300"
          >
            <Ionicons name="add" size={18} color="#111827" />
          </Pressable>
        </View>
      </View>

      <View className="ml-2 items-end">
        <Text className="text-base font-bold text-blue-600">
          {formatCurrency(item.totalPrice)}
        </Text>
        <Pressable
          onPress={confirmDelete}
          className="mt-2 h-9 w-9 items-center justify-center rounded-full active:bg-red-50"
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </Pressable>
      </View>
    </View>
  );
}

export const ItemCard = memo(ItemCardComponent);
