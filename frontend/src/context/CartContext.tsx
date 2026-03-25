import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type CartItem = {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (book: { bookId: number; title: string; price: number }) => void;
  removeFromCart: (bookId: number) => void;
  totalQuantity: number;
  totalPrice: number;
  // Where to return after visiting the cart
  returnPage: number;
  returnCategory: string;
  setReturnLocation: (page: number, category: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [returnPage, setReturnPage] = useState(1);
  const [returnCategory, setReturnCategory] = useState('');

  const addToCart = useCallback(
    (book: { bookId: number; title: string; price: number }) => {
      setItems(prev => {
        const existing = prev.find(i => i.bookId === book.bookId);
        if (existing) {
          // Increment quantity for existing item
          return prev.map(i =>
            i.bookId === book.bookId ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...book, quantity: 1 }];
      });
    },
    []
  );

  const removeFromCart = useCallback((bookId: number) => {
    setItems(prev => prev.filter(i => i.bookId !== bookId));
  }, []);

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const setReturnLocation = useCallback((page: number, category: string) => {
    setReturnPage(page);
    setReturnCategory(category);
  }, []);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, totalQuantity, totalPrice, returnPage, returnCategory, setReturnLocation }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
