import Image from "next/image";
import Link from "next/link";
import { Star, Package } from "lucide-react";

interface StoreCardProps {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  category?: string;
  productsCount?: number;
  rating?: number;
}

export function StoreCard({
  slug,
  name,
  description,
  logo,
  category,
  productsCount = 0,
  rating = 4.8,
}: StoreCardProps) {
  return (
    <Link href={`/store/${slug}`}>
      <div className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden card-hover cursor-pointer group">
        {/* Banner */}
        <div className="relative h-28 bg-[#3B3BFF] overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="sound-wave opacity-40">
              <span style={{ background: "rgba(255,255,255,0.7)" }} />
              <span style={{ background: "rgba(255,255,255,0.8)" }} />
              <span style={{ background: "#ffffff" }} />
              <span style={{ background: "rgba(255,255,255,0.8)" }} />
              <span style={{ background: "rgba(255,255,255,0.7)" }} />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="relative px-4">
          <div className="absolute -top-8 left-4 w-16 h-16 rounded-2xl border-4 border-white overflow-hidden shadow-card bg-[#F5F5F5]">
            {logo ? (
              <Image src={logo} alt={name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-[#3B3BFF] flex items-center justify-center text-xl font-bold text-white">
                {name[0]}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 px-4 pb-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-[#1A1A1A] text-sm group-hover:text-[#3B3BFF] transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
          </div>

          {description && (
            <p className="text-xs text-[#666666] line-clamp-2 mb-3">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-[#666666]">
              <Package className="h-3 w-3" />
              <span>{productsCount} produtos</span>
            </div>
            {category && (
              <span className="text-xs bg-[#E85A00]/10 text-[#E85A00] border border-[#E85A00]/20 px-2 py-0.5 rounded-full font-medium">
                {category}
              </span>
            )}
          </div>

          <div className="mt-3">
            <span className="w-full block text-center text-xs font-bold text-[#E85A00] bg-[#E85A00]/10 hover:bg-[#E85A00] hover:text-white border border-[#E85A00]/20 py-1.5 rounded-lg transition-colors">
              Ver Loja →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
