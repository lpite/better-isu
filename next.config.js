/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

const prod = process.env.NODE_ENV === 'production'

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: prod ? false : true,
})

module.exports = withPWA(nextConfig)
