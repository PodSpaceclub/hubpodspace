"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock?: number;
  active: boolean;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "id">) => Promise<void>;
  initialData?: Product;
  title?: string;
}

export function ProductForm({
  open,
  onClose,
  onSave,
  initialData,
  title = "Novo Produto",
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    image: initialData?.image || "",
    stock: initialData?.stock,
    active: initialData?.active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (formData.price <= 0) newErrors.price = "Preço deve ser maior que zero";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const sampleImages = [
    "https://picsum.photos/seed/food1/400/300",
    "https://picsum.photos/seed/food2/400/300",
    "https://picsum.photos/seed/food3/400/300",
    "https://picsum.photos/seed/prod1/400/300",
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image preview */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Imagem do Produto
            </label>
            <div className="relative h-40 rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E8E8E8] mb-2">
              {formData.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#999999]">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Selecione uma imagem abaixo</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {sampleImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData((f) => ({ ...f, image: img }))}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    formData.image === img
                      ? "border-[#3B3BFF]"
                      : "border-[#E8E8E8] hover:border-[#3B3BFF]/50"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              <div className="flex-1">
                <Input
                  placeholder="URL da imagem"
                  value={formData.image || ""}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, image: e.target.value }))
                  }
                  className="h-12 text-xs"
                />
              </div>
            </div>
          </div>

          <Input
            label="Nome do Produto *"
            placeholder="Ex: Plano Bronze - Sessão Individual"
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />

          <Textarea
            label="Descrição"
            placeholder="Descreva seu produto ou serviço..."
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preço (R$) *"
              type="number"
              placeholder="0,00"
              min="0"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
              }
              error={errors.price}
            />
            <Input
              label="Estoque (opcional)"
              type="number"
              placeholder="Ilimitado"
              min="0"
              value={formData.stock ?? ""}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  stock: e.target.value ? parseInt(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData((f) => ({ ...f, active: e.target.checked }))
              }
              className="w-4 h-4 rounded border-[#E8E8E8] bg-white text-[#3B3BFF]"
            />
            <label htmlFor="active" className="text-sm text-[#1A1A1A]">
              Produto ativo (visível na loja)
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {initialData?.id ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
