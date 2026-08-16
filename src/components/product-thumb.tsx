import { useState } from "react";
import { cn } from "@/lib/utils";
import { productImageUrl } from "@/lib/images";

export function ProductThumb({
  id,
  alt,
  className,
  size = "md",
}: {
  id: string;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [ok, setOk] = useState(true);
  const dim = size === "sm" ? "size-11" : size === "lg" ? "aspect-square w-full" : "size-14";

  if (!ok) {
    return (
      <div
        className={cn(
          dim,
          "grid place-items-center bg-bg-elevated text-[10px] tracking-wide text-subtle uppercase",
          className,
        )}
      >
        {alt.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={productImageUrl(id)}
      alt={alt}
      className={cn(dim, "bg-bg-elevated object-cover", className)}
      onError={() => setOk(false)}
    />
  );
}
