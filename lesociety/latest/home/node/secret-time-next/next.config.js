const path = require("path");
require("dotenv").config();

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

module.exports = {
  images: {
    domains: [
      'uopffshulmumslhgdcce.supabase.co',
      ...(supabaseHost ? [supabaseHost] : [])
    ],
  },

  devIndicators: {
    autoPrerender: false,
    buildActivity: false,
  },

  env: {
    modules: ["auth", "event"],
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  },
  
  // Production optimizations
  compiler: {
    // Remove console.logs in production (except error and warn)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Use SWC minifier for faster builds and smaller bundles
  swcMinify: true,
  
  async redirects() {
    return [
      // {
      //   source: "/home",
      //   destination: "/",
      //   permanent: true,
      // },
    ];
  },
};
