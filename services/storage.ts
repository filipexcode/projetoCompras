import { Directory, File, Paths } from 'expo-file-system';


// Armazenamento em diretorio local. Copia fotos para documentDirectory/items/`. FireStore guarda só o caminho
const IMAGES_DIR_NAME = 'items';

function getImagesDirectory(): Directory {
    const directory = new Directory(Paths.document, IMAGES_DIR_NAME);
    if (!directory.exists) {
        directory.create({ idempotent: true });
    }
    return directory;
}


// Pega a imagem para diretorio local persiste, retorna o caminho certo e salva
export async function uploadItemImage(
    userId: string,
    localUri: string,
): Promise<string> {
    try {
        const directory = getImagesDirectory();
        const source = new File(localUri);
        const destination = new File(directory, `${userId}_${Date.now()}.jpg`);

        source.copy(destination);

        return destination.uri;
    } catch (error) {
        console.warn('Erro ao salvar imagem localmente:', error);
        throw new Error('Não foi possível salvar a imagem no dispositivo.');
    }
}

export async function deleteItemImage(imageUrl: string): Promise<void> {
    if (imageUrl.length === 0) {
        return;
    }

    try {
        const file = new File(imageUrl);
        if (file.exists) {
            file.delete();
        }
    } catch (error) {
        console.warn('Falha ao excluir imagem local (ignorado):', error);
    }
}
