"use client";

import { useState, useRef } from "react";
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
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    image: initialData?.image || "",
    stock: initialData?.stock,
    active: initialData?.active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Apenas imagens são permitidas" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Imagem deve ter no máximo 5MB" }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const err = await res.json();
        setErrors((prev) => ({ ...prev, image: err.error || "Erro ao enviar imagem" }));
        return;
      }

      const { url } = await res.json();
      setFormData((f) => ({ ...f, image: url }));
    } catch {
      setErrors((prev) => ({ ...prev, image: "Erro ao enviar imagem" }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((f) => ({ ...f, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Imagem do Produto
            </label>

            {/* Preview */}
            <div className="relative h-40 rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E8E8E8] mb-2">
              {uploading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#3B3BFF]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-xs text-[#666666]">Enviando imagem...</span>
                </div>
              ) : formData.image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#999999]">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Nenhuma imagem selecionada</span>
                </div>
              )}
            </div>

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#E8E8E8] hover:border-[#3B3BFF] rounded-xl py-3 px-4 text-sm text-[#666666] hover:text-[#3B3BFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : formData.image ? "Trocar imagem" : "Selecionar imagem do dispositivo"}
            </button>
            {errors.image && (
              <p className="text-xs text-red-500 mt-1">{errors.image}</p>
            )}
            <p className="text-xs text-[#999999] mt-1">PNG, JPG, WEBP — máximo 5MB</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <Button type="submit" loading={loading} disabled={uploading}>
              {initialData?.id ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
