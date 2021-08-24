import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];

      const productAdded = updatedCart.find(item => item.id === productId);

      if (productAdded) {
        const { data: stock } = await api.get(`stock/${productId}`);

        if (productAdded.amount >= stock.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        productAdded.amount += 1;
      } else {
        const { data: product } = await api.get(`products/${productId}`);
        const newProduct = { ...product, amount: 1 };
        updatedCart.push(newProduct);
      }

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productAddedIndex = cart.findIndex(item => item.id === productId);

      const { data: stock } = await api.get(`stock/${productId}`);

      if (cart[productAddedIndex].amount + amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      cart[productAddedIndex].amount += amount;

      const updatedCartData = [...cart];
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCartData));
      setCart(updatedCartData);
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
      return;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
