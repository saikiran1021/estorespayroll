import type { ReactNode } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const logo = PlaceHolderImages.find((img) => img.id === "estores-logo");

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50/50 p-4"
        style={{ background: 'linear-gradient(to bottom, hsl(var(--background)), #FAFAFA)' }}
    >
      <div className="mb-8">
        {logo && (
          <Image
            src={logo.imageUrl}
            alt={logo.description}
            width={200}
            height={50}
            data-ai-hint={logo.imageHint}
            className="object-contain"
          />
        )}
      </div>
      {children}
    </div>
  );
}
