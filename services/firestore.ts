import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    type CollectionReference,
} from 'firebase/firestore';
import { FIRESTORE_COLLECTION, FIRESTORE_ITEMS_SUBCOLLECTION } from '@/constants';
import { db } from '@/lib/firebase';
import type { ShoppingItem } from '@/types';

// Refereencia para a subcoleção de itens de um usuario
function itemsCollection(userId: string): CollectionReference {
    return collection(db, FIRESTORE_COLLECTION, userId, FIRESTORE_ITEMS_SUBCOLLECTION);
}

function readNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function readString(value: unknown): string {
    return typeof value === 'string' ? value : '';
}


// Busca os itens pela da de criacao mais recente
export async function getItems(userId: string): Promise<ShoppingItem[]> {
    const itemsQuery = query(itemsCollection(userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(itemsQuery);

    return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const createdAt =
            data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now();

        const item: ShoppingItem = {
            id: docSnap.id,
            userId,
            name: readString(data.name),
            imageUrl: readString(data.imageUrl),
            unitPrice: readNumber(data.unitPrice),
            quantity: readNumber(data.quantity),
            totalPrice: readNumber(data.totalPrice),
            createdAt,
        };
        return item;
    });
}


// Adiciona novo item e retorna o id do documneto
export async function addItem(
    userId: string,
    data: Omit<ShoppingItem, 'id' | 'userId' | 'createdAt'>,
): Promise<string> {
    const docRef = await addDoc(itemsCollection(userId), {
        name: data.name,
        imageUrl: data.imageUrl,
        unitPrice: data.unitPrice,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}


// Atualiza e recalcula a quantidade de itens
export async function updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number,
    unitPrice: number,
): Promise<void> {
    const itemRef = doc(
        db,
        FIRESTORE_COLLECTION,
        userId,
        FIRESTORE_ITEMS_SUBCOLLECTION,
        itemId,
    );
    await updateDoc(itemRef, {
        quantity,
        totalPrice: unitPrice * quantity,
    });
}

// Remove o iten da lista do usuario
export async function deleteItem(userId: string, itemId: string): Promise<void> {
    const itemRef = doc(
        db,
        FIRESTORE_COLLECTION,
        userId,
        FIRESTORE_ITEMS_SUBCOLLECTION,
        itemId,
    );
    await deleteDoc(itemRef);
}
