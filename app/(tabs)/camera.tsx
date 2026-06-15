import { useMemo, useRef, useState } from 'react';
import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { formatCurrency } from '@/lib/formatters';
import { useAuth } from '@/hooks/useAuth';
import { useCamera } from '@/hooks/useCamera';
import { useShoppingList } from '@/hooks/useShoppingList';
import { uploadItemImage } from '@/services/storage';

function parsePrice(text: string): number {
  return Number.parseFloat(text.replace(',', '.'));
}

export default function CameraScreen() {
  const { user } = useAuth();
  const userId = user?.uid ?? '';
  const { addItem } = useShoppingList(userId);

  const {
    permission,
    requestPermission,
    capturedImageUri,
    isProcessing,
    captureAndProcess,
    resetCapture,
  } = useCamera();

  const cameraRef = useRef<CameraView>(null);

  const [name, setName] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [saving, setSaving] = useState<boolean>(false);

  const totalPreview = useMemo<number>(() => {
    const price = parsePrice(unitPrice);
    const qty = Number.parseInt(quantity, 10);
    if (!Number.isFinite(price) || !Number.isInteger(qty)) {
      return 0;
    }
    return price * qty;
  }, [unitPrice, quantity]);

  function clearForm(): void {
    setName('');
    setUnitPrice('');
    setQuantity('1');
  }

  async function handleCapture(): Promise<void> {
    await captureAndProcess(cameraRef);
  }

  async function handleSave(): Promise<void> {
    const trimmedName = name.trim();
    const price = parsePrice(unitPrice);
    const qty = Number.parseInt(quantity, 10);

    if (trimmedName.length === 0) {
      Alert.alert('Erro ao salvar item', 'Informe o nome do produto.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert('Erro ao salvar item', 'Informe um preço unitário válido.');
      return;
    }
    if (!Number.isInteger(qty) || qty < 1) {
      Alert.alert('Erro ao salvar item', 'Informe uma quantidade válida (mínimo 1).');
      return;
    }
    if (capturedImageUri === null) {
      Alert.alert('Erro ao salvar item', 'Nenhuma foto capturada.');
      return;
    }

    setSaving(true);
    try {
      const imageUrl = await uploadItemImage(userId, capturedImageUri);
      await addItem({
        name: trimmedName,
        imageUrl,
        unitPrice: price,
        quantity: qty,
        totalPrice: price * qty,
      });
      clearForm();
      resetCapture();
      router.replace('/(tabs)/lista');
    } catch (error) {
      Alert.alert(
        'Erro ao salvar item',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-base text-gray-700">
          Precisamos da sua permissão para usar a câmera.
        </Text>
        <Pressable
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 active:bg-blue-700"
          onPress={() => {
            if (permission.canAskAgain) {
              void requestPermission();
            } else {
              void Linking.openSettings();
            }
          }}
        >
          <Text className="text-base font-semibold text-white">
            {permission.canAskAgain ? 'Permitir câmera' : 'Abrir configurações'}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (capturedImageUri !== null) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={{ uri: capturedImageUri }}
            className="h-56 w-full rounded-2xl bg-gray-200"
            resizeMode="cover"
          />

          <Pressable
            className="mt-3 flex-row items-center justify-center rounded-xl border border-gray-300 py-3 active:bg-gray-100"
            onPress={resetCapture}
            disabled={saving}
          >
            <Text className="text-base font-medium text-gray-700">
              Tirar outra foto
            </Text>
          </Pressable>

          <View className="mt-6 gap-4">
            <View>
              <Text className="mb-1 text-sm font-medium text-gray-600">
                Nome do produto
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder="Ex.: Arroz 5kg"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                editable={!saving}
              />
            </View>

            <View>
              <Text className="mb-1 text-sm font-medium text-gray-600">
                Preço unitário (R$)
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder="0,00"
                placeholderTextColor="#9ca3af"
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="decimal-pad"
                editable={!saving}
              />
            </View>

            <View>
              <Text className="mb-1 text-sm font-medium text-gray-600">
                Quantidade
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder="1"
                placeholderTextColor="#9ca3af"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                editable={!saving}
              />
            </View>
          </View>

          <View className="mt-6 flex-row items-center justify-between rounded-xl bg-gray-100 px-4 py-3">
            <Text className="text-base font-medium text-gray-600">Total</Text>
            <Text className="text-xl font-bold text-blue-600">
              {formatCurrency(totalPreview)}
            </Text>
          </View>

          <Pressable
            className={`mt-6 flex-row items-center justify-center rounded-xl py-4 ${
              saving ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'
            }`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Salvar item
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      <View className="absolute inset-x-0 bottom-10 items-center">
        <Pressable
          onPress={handleCapture}
          disabled={isProcessing}
          className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/70 bg-white/30 active:bg-white/50"
        >
          <View className="h-16 w-16 rounded-full bg-white" />
        </Pressable>
      </View>

      {isProcessing && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="mt-3 text-base text-white">Processando...</Text>
        </View>
      )}
    </View>
  );
}
