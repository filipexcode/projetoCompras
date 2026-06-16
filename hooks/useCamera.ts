import { useCallback, useState, type RefObject } from 'react';
import {
  useCameraPermissions,
  type CameraView,
  type PermissionResponse,
} from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import {
  CAPTURE_QUALITY,
  IMAGE_COMPRESS_QUALITY,
  IMAGE_MAX_WIDTH,
} from '@/constants';

interface UseCameraResult {
  permission: PermissionResponse | null;
  requestPermission: () => Promise<PermissionResponse>;
  capturedImageUri: string | null;
  isProcessing: boolean;
  captureAndProcess: (cameraRef: RefObject<CameraView | null>) => Promise<void>;
  resetCapture: () => void;
}

export function useCamera(): UseCameraResult {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const captureAndProcess = useCallback(
    async (cameraRef: RefObject<CameraView | null>): Promise<void> => {
      const camera = cameraRef.current;
      if (camera === null || isProcessing) {
        return;
      }

      setIsProcessing(true);
      try {
        const photo = await camera.takePictureAsync({ quality: CAPTURE_QUALITY });
        if (!photo) {
          throw new Error('Não foi possível capturar a foto.');
        }

        const context = ImageManipulator.manipulate(photo.uri);
        context.resize({ width: IMAGE_MAX_WIDTH });
        const rendered = await context.renderAsync();
        const result = await rendered.saveAsync({
          compress: IMAGE_COMPRESS_QUALITY,
          format: SaveFormat.JPEG,
        });

        setCapturedImageUri(result.uri);
      } catch (error) {
        console.warn('Erro ao capturar/processar a imagem:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  const resetCapture = useCallback((): void => {
    setCapturedImageUri(null);
  }, []);

  return {
    permission,
    requestPermission,
    capturedImageUri,
    isProcessing,
    captureAndProcess,
    resetCapture,
  };
}
