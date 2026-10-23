"use client";
import { useTranslation } from "@/i18n/LocaleProvider";
import { translateTree } from "@/i18n/translate";


import { useEffect, useRef, useState } from "react";

export function CopyProjectLink() {
  const {locale,t}=useTranslation();
  const [result, setResult] = useState<{ status: "copied" | "manual"; url: string } | null>(null);
  const request = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => { request.current++; }, []);
  useEffect(() => { if (result?.status === "manual") { input.current?.focus(); input.current?.select(); } }, [result]);
  async function copy() {
    const token = ++request.current;
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      if (request.current === token) setResult({ status: "copied", url });
    } catch {
      if (request.current === token) setResult({ status: "manual", url });
    }
  }
  return translateTree(<div className="copy-project"><button type="button" className="text-link" onClick={copy}>Salin tautan proyek</button><p role="status" className="meta">{result?.status === "copied" ? "Tautan tersalin." : result?.status === "manual" ? "Tautan belum berhasil disalin otomatis. Pilih tautan di bawah, lalu gunakan Ctrl+C atau menu salin perangkat." : ""}</p>{result?.status === "manual" && <label>Tautan proyek<input ref={input} readOnly value={result.url} onFocus={event => event.currentTarget.select()}/></label>}</div>,t,locale);
}
