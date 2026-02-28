/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-leaflet', 'leaflet'],
  serverExternalPackages: ['mongoose'],
  turbopack: {},
};

export default nextConfig;
