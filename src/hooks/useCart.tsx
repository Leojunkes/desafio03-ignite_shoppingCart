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
    const { data: stockData } = await api.get<Stock>(`stock/${productId}`);
    try {
     
    
    const productIntheCart = cart.find(
      (cartProduct) => cartProduct.id === productId
    );
    const amount = productIntheCart ? productIntheCart.amount + 1 : 1;
    if (amount > stockData.amount) {
      toast.error('quantidade solicitada fora do estoque');
      return;
    }
    if (productIntheCart) {
      const addNewProduct = cart.map((cartAdd) => {
        if (cartAdd.id === productId) {
          return {
            ...productIntheCart,
            amount: cartAdd.amount + 1,
          };
        }
        return cartAdd;
      });
      setCart(addNewProduct);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(addNewProduct));
      return;
    }
    const { data: productData } = await api.get<ProductApi>(
      `products/${productId}`
    );
    const addProductInCart = {
      ...productData,
      amount: 1,
    };
    const Arrayproducts = [...cart, { ...addProductInCart }];
    setCart(Arrayproducts);

    localStorage.setItem('@RocketShoes:cart', JSON.stringify(Arrayproducts));
  }catch{
    toast.error('Erro na adição do produto')
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
      // TODO
    } catch {
      // TODO
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
