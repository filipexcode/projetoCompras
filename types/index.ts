import type { Timestamp } from 'firebase/firestore';


export interface ShoppingItem {
    id: string;
    userId: string;
    name: string;
    imageUrl: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    createdAt: Timestamp;
}

// Usuario autenticado
export interface AuthUser {
    uid: string;
    email: string | null;
}
