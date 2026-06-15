import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { APP_NAME } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(): Promise<void> {
    setError(null);

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0 || password.length === 0) {
      setError('Preencha e-mail e senha.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Digite um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      await signIn(trimmedEmail, password);
      // Sucesso: o redirecionamento é feito pelo _layout.tsx automaticamente.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 justify-center px-8">
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-blue-600">{APP_NAME}</Text>
          <Text className="mt-2 text-base text-gray-500">
            Entre para acessar sua lista
          </Text>
        </View>

        <View className="gap-4">
          <TextInput
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder="E-mail"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder="Senha"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {error !== null && (
          <Text className="mt-3 text-sm text-red-600">{error}</Text>
        )}

        <Pressable
          className={`mt-6 flex-row items-center justify-center rounded-xl py-4 ${
            loading ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'
          }`}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-semibold text-white">Entrar</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
