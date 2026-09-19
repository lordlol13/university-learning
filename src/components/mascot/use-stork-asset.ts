"use client";
import { useEffect, useState } from "react";

let assetRequest: Promise<string | null> | undefined;
export function useStorkAsset() {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    assetRequest ??= fetch("/api/mascot")
      .then(async (response) => {
        if (!response.ok) return null;
        const asset: { modelUrl?: string | null } = await response.json();
        return asset.modelUrl === "/models/stork.glb" ? asset.modelUrl : null;
      })
      .catch(() => null);
    void assetRequest.then((assetUrl) => {
      if (mounted) setUrl(assetUrl);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return url;
}
