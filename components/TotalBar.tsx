import { memo } from 'react';
import { Text, View } from 'react-native';
import { formatCurrency } from '@/lib/formatters';

interface TotalBarProps {
  total: number;
}

function TotalBarComponent({ total }: TotalBarProps) {
  return (
    <View className="flex-row items-center justify-between border-t border-gray-200 bg-white px-5 py-4">
      <Text className="text-base font-medium text-gray-600">Total da compra:</Text>
      <Text className="text-2xl font-bold text-blue-600">
        {formatCurrency(total)}
      </Text>
    </View>
  );
}

export const TotalBar = memo(TotalBarComponent);
