// Update CartContext Types
import { createContext, useContext, useReducer, type ReactNode } from 'react';
import api from '../services/api';

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem: string;
  categoria?: string;
  notaMedia?: number;
  avaliacoes?: ProductReview[];
}


export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((acc, item) => acc + item.preco * item.quantity, 0),
      };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((acc, item) => acc + item.preco * item.quantity, 0),
      };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((acc, item) => acc + item.preco * item.quantity, 0),
      };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, originalDispatch] = useReducer(cartReducer, { items: [], total: 0 });

  const dispatch = (action: CartAction) => {
    // Log cart actions to backend
    // Format the payload to be JSON-safe and informative
    let details;
    if (action.type === 'ADD_ITEM') {
      details = { id: action.payload.id, name: action.payload.nome };
    } else if (action.type === 'UPDATE_QUANTITY') {
      details = { id: action.payload.id, quantity: action.payload.quantity };
    } else {
      details = (action as any).payload || {};
    }

    api.post('/logs/event', {
      event: `CART_${action.type}`,
      details: details
    }).catch(err => console.error('Failed to log cart action', err));

    originalDispatch(action);
  };

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
