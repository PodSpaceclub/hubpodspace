"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { ProductCard } from "@/components/partner/ProductCard";
import { ProductForm } from "@/components/partner/ProductForm";
import { Button } from "@/components/ui/button";
import { Plus, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock?: number;
  active: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: Omit<Product, "id">) => {
    if (editProduct?.id) {
      // Update
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === editProduct.id ? updated : p))
        );
        toast({ title: "Produto atualizado!", variant: "success" });
        setEditProduct(undefined);
        setShowForm(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast({
          title: err.error || "Erro ao atualizar produto",
          variant: "error",
        });
      }
    } else {
      // Create
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setProducts((prev) => [created, ...prev]);
        toast({ title: "Produto criado!", variant: "success" });
        setEditProduct(undefined);
        setShowForm(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast({
          title: err.error || "Erro ao criar produto",
          variant: "error",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Produto excluído", variant: "success" });
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active } : p))
      );
      toast({
        title: active ? "Produto ativado" : "Produto desativado",
        variant: "success",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar role="PARTNER" />

      <div className="flex-1 lg:ml-64">
        <Header title="Produtos" />

        <main className="p-6 pb-24 lg:pb-6 space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase">
                Meus Produtos
              </h2>
              <p className="text-sm text-[#666666]">
                {products.length} produto(s) cadastrado(s)
              </p>
            </div>
            <Button
              className="bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold rounded-lg"
              onClick={() => {
                setEditProduct(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          {/* Search */}
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          {/* Stats bar */}
          <div className="flex gap-4 text-sm">
            <span className="text-[#666666]">
              Total: <span className="text-[#1A1A1A] font-medium">{products.length}</span>
            </span>
            <span className="text-[#666666]">
              Ativos:{" "}
              <span className="text-green-600 font-medium">
                {products.filter((p) => p.active).length}
              </span>
            </span>
            <span className="text-[#666666]">
              Inativos:{" "}
              <span className="text-red-500 font-medium">
                {products.filter((p) => !p.active).length}
              </span>
            </span>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E8E8E8] rounded-xl h-64 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto mb-4 text-[#CCCCCC]" />
              <h3 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase mb-2">
                {search ? "Nenhum produto encontrado" : "Nenhum produto ainda"}
              </h3>
              <p className="text-[#666666] text-sm mb-6">
                {search
                  ? "Tente buscar por outro termo"
                  : "Comece adicionando seu primeiro produto"}
              </p>
              {!search && (
                <Button
                  className="bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold rounded-lg"
                  onClick={() => {
                    setEditProduct(undefined);
                    setShowForm(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Produto
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <MobileNav role="PARTNER" />

      <ProductForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditProduct(undefined);
        }}
        onSave={handleSave}
        initialData={editProduct}
        title={editProduct ? "Editar Produto" : "Novo Produto"}
      />
    </div>
  );
}
