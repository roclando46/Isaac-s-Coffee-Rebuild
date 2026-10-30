"use client";
import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/content/products";

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [i, setI] = useState(0);
  return (
    <div className="gallery">
      <div className="main"><Image src={photos[i].src} alt={photos[i].alt} width={900} height={1154} priority sizes="(max-width:860px) 100vw, 600px" /></div>
      {photos.length > 1 && (
        <div className="thumbs">
          {photos.map((ph, n) => (
            <button key={ph.src} aria-pressed={n === i} aria-label={`Show photo ${n + 1}`} onClick={() => setI(n)}>
              <Image src={ph.src} alt="" width={150} height={150} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
