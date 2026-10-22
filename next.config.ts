import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// Exact private addresses owned by this machine; follows Wi-Fi DHCP changes on restart.
const localPreviewHosts = Object.values(networkInterfaces()).flatMap(addresses =>
  (addresses ?? []).filter(address => address.family === "IPv4" && !address.internal &&
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address.address)).map(address => address.address)
);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", ...new Set(localPreviewHosts)],
};

export default nextConfig;
