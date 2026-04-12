"use client";

import Image from "next/image";
import { Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}

export function ProductCard({ product, onEdit, onDelete, onToggle }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden card-hover group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#F5F5F5]">
        {product.image && !imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover product-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-30">📦</div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={product.active ? "approved" : "rejected"}>
            {product.active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        {/* Overlay actions on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="icon-sm" variant="outline" onClick={() => onEdit(product)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => onToggle(product.id, !product.active)}
            className="border-amber-500/30 text-amber-400"
          >
            {product.active ? (
              <ToggleRight className="h-3.5 w-3.5" />
            ) : (
              <ToggleLeft className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1A1A1A] text-sm mb-1 truncate">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-[#666666] line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#3B3BFF]">
            {formatCurrency(product.price)}
          </span>
          {product.stock !== null && product.stock !== undefined && (
            <span className="text-xs text-[#666666]">
              Estoque: {product.stock}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
