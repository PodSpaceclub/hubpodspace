"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "./Cart";
import { toast } from "@/components/ui/toaster";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock?: number;
  active: boolean;
}

interface ProductGridProps {
  products: Product[];
  partnerId: string;
}

function ProductItem({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden flex card-hover">
      {/* Info */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-[#1A1A1A] text-sm mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-[#666666] line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3B3BFF]">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={() => onAdd(product)}
            className="w-8 h-8 rounded-full bg-[#E85A00] hover:bg-[#CC4D00] flex items-center justify-center transition-all hover:scale-110"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="w-28 h-28 flex-shrink-0 relative overflow-hidden">
        {product.image && !imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#F5F5F5] flex items-center justify-center text-2xl">
            📦
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductGrid({ products, partnerId }: ProductGridProps) {
  const { addItem, setPartnerId } = useCart();
  const activeProducts = products.filter((p) => p.active);

  const handleAddToCart = (product: Product) => {
    setPartnerId(partnerId);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast({
      title: "Adicionado ao carrinho!",
      description: product.name,
      variant: "success",
    });
  };

  if (activeProducts.length === 0) {
    return (
      <div className="text-center py-12 text-[#666666]">
        <p>Nenhum produto disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {activeProducts.map((product) => (
        <ProductItem key={product.id} product={product} onAdd={handleAddToCart} />
      ))}
    </div>
  );
}
