import { Text, View } from 'react-native';

// Tela inicial em branco (apenas valida que Expo Router + NativeWind funcionam).
// Comece a desenvolver a partir daqui.
export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-900">projetoComprasTrue</Text>
      <Text className="mt-2 text-center text-base text-gray-500">
        Base pronta: Expo Router + NativeWind + Firebase + expo-camera.
        Comece a desenvolver aqui.
      </Text>
    </View>
  );
}
