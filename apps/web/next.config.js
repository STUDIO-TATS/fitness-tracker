/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fitness-tracker/ui', '@fitness-tracker/types', '@fitness-tracker/supabase'],
}

module.exports = nextConfig