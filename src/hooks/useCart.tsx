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

interface ProductApi {
  id: number;
  title: string;
  price: number;
  image: string;
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
      const productIntheCart = cart.find((product) => product.id === productId);

      if (!productIntheCart) {
        const { data: product } = await api.get<Product>(
          `products/${productId}`
        );
        const { data: stock } = await api.get<Product>(`stock/${productId}`);
        if (stock.amount > 0) {
          setCart([...cart, { ...product, amount: 1 }]);
          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify([...cart, { ...product, amount: 1 }])
          );

          toast('Adicionado');
          return;
        }
      }
      if (productIntheCart) {
        const { data: stock } = await api.get<Stock>(`stock/${productId}`);

        if (stock.amount > productIntheCart.amount) {
          const updatedCart = cart.map((cartItem) =>
            cartItem.id === productId
              ? {
                  ...cartItem,
                  amount: Number(cartItem.amount + 1),
                }
              : cartItem
          );
          setCart(updatedCart);
          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify(updatedCart)
          );
          toast('adicionado');
          return;
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productRemove = cart.find((product) => product.id === productId);
      if (!productRemove) {
        toast.error('Erro na remoção do produto');
        return;
      }
      const updateCart = cart.filter((product) => product.id != productId);
      setCart(updateCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }
      const { data } = await api.get(`stock/${productId}`);

      const productAmount = data.amount;
      const dontStock = amount > productAmount;

      if (dontStock) {
        toast.error('quantidade solicitada fora de estoque');
        return;
      }
      const productExists = cart.some((product) => product.id === productId);
      if (!productExists) {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }
      const updateCart = cart.map((cartItem) =>
        cartItem.id === productId
          ? {
              ...cartItem,
              amount,
            }
          : cartItem
      );
      setCart(updateCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
