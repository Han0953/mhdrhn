"use client";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";

import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";
import type {MediaAsset} from "@/lib/media";
import {getMediaDimensions} from "@/lib/media-dimensions";

/** The reserved frame stays in place even if a request fails. No broken-image icon. */
export function MediaImage({ media, sizes, fallback }: { media: MediaAsset; sizes: string; fallback?: ReactNode }) {
  const {locale,t}=useTranslation();
  const [failedSrc, setFailedSrc] = useState<string>();
  if (failedSrc === media.src) return fallback ?? <span className="media-unavailable">{t("Gambar belum dapat dimuat.")}</span>;
  const image = <Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes={sizes} loading="lazy" decoding="async" onError={() => setFailedSrc(media.src)}/>;
  if (!media.rotation) return image;
  const dimensions = getMediaDimensions(media);
  return translateTree(<span className="media-rotated" data-media-rotation={media.rotation} style={{ "--media-ratio": dimensions.width / dimensions.height } as CSSProperties}>{image}</span>,t,locale);
}
