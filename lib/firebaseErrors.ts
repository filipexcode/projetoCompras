const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
    // --- Authentication ---
    'auth/invalid-email': 'E-mail inválido. Verifique e tente novamente.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/user-not-found': 'Não encontramos uma conta com este e-mail.',
    'auth/wrong-password': 'Senha incorreta. Tente novamente.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
    'auth/email-already-in-use': 'Este e-mail já está em uso.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/missing-password': 'Informe a senha.',
    'auth/missing-email': 'Informe o e-mail.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
    'auth/operation-not-allowed':
        'Login por e-mail/senha não está habilitado no Firebase.',
    'auth/requires-recent-login': 'Faça login novamente para continuar.',
    'auth/api-key-not-valid': 'Chave de API do Firebase inválida. Verifique o .env.',
    'auth/invalid-api-key': 'Chave de API do Firebase inválida. Verifique o .env.',
    'auth/configuration-not-found':
        'Configuração do Firebase não encontrada. Habilite o Authentication no console.',

    // --- Storage ---
    'storage/unauthorized': 'Você não tem permissão para acessar este arquivo.',
    'storage/canceled': 'Envio cancelado.',
    'storage/object-not-found': 'Arquivo não encontrado.',
    'storage/quota-exceeded': 'Cota de armazenamento excedida.',
    'storage/unauthenticated': 'Sessão expirada. Faça login novamente.',
    'storage/retry-limit-exceeded': 'Tempo de envio esgotado. Tente novamente.',
    'storage/invalid-checksum': 'Falha na integridade do arquivo. Tente novamente.',
    'storage/server-file-wrong-size': 'Falha no envio do arquivo. Tente novamente.',
};

const DEFAULT_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.';

function extractErrorCode(error: unknown): string | null {
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as { code: unknown }).code;
        if (typeof code === 'string') {
            return code;
        }
    }
    return null;
}

export function getFirebaseErrorMessage(error: unknown): string {
    const code = extractErrorCode(error);
    if (code && code in FIREBASE_ERROR_MESSAGES) {
        return FIREBASE_ERROR_MESSAGES[code];
    }
    if (error instanceof Error && error.message.length > 0 && !code) {
        return error.message;
    }
    return DEFAULT_MESSAGE;
}