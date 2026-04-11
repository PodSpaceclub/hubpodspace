"use client";

import { useState, createContext, useContext } from "react";
import { X, Plus, Minus, ShoppingCart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: CartItem["product"]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  partnerId?: string;
  setPartnerId: (id: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [partnerId, setPartnerIdState] = useState<string>();

  const addItem = (product: CartItem["product"]) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const setPartnerId = (id: string) => setPartnerIdState(id);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        partnerId,
        setPartnerId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, total, clearCart, partnerId } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    // Save cart to sessionStorage for checkout page
    sessionStorage.setItem("cart", JSON.stringify(items));
    sessionStorage.setItem("cartTotal", total.toString());
    sessionStorage.setItem("partnerId", partnerId || "");
    onClose();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-sm bg-white border-l border-[#E8E8E8] flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8E8E8]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#3B3BFF]" />
            <h2 className="font-display text-lg font-700 text-[#1A1A1A] uppercase">Seu Carrinho</h2>
            <span className="bg-[#3B3BFF] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            <X className="h-4 w-4 text-[#666666]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingCart className="h-12 w-12 text-[#CCCCCC]" />
              <p className="text-[#666666] text-sm">
                Seu carrinho está vazio
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 bg-[#F5F5F5] rounded-xl p-3"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E8E8E8] flex-shrink-0">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-[#3B3BFF] font-semibold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="w-6 h-6 rounded-full bg-[#E8E8E8] hover:bg-[#3B3BFF]/20 flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="w-6 h-6 rounded-full bg-[#E8E8E8] hover:bg-[#3B3BFF]/20 flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#E8E8E8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666666]">Total</span>
              <span className="font-display text-2xl font-700 text-[#1A1A1A]">
                {formatCurrency(total)}
              </span>
            </div>
            <Button
              className="w-full bg-[#E85A00] hover:bg-[#CC4D00] text-white font-bold h-11 rounded-lg"
              onClick={handleCheckout}
            >
              Finalizar Pedido
              <ChevronRight className="h-4 w-4" />
            </Button>
            <button
              onClick={clearCart}
              className="w-full text-xs text-[#666666] hover:text-red-500 transition-colors"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CartFab() {
  const [open, setOpen] = useState(false);
  const { itemCount, total } = useCart();

  if (itemCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-[#3B3BFF] hover:bg-[#2525DD] text-white px-5 py-3 rounded-full shadow-blue transition-all hover:scale-105"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-semibold">{formatCurrency(total)}</span>
        <span className="bg-white text-[#3B3BFF] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      </button>

      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
