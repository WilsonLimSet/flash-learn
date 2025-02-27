import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Add the modules that should be excluded from transpilation
    config.module = {
      ...config.module,
      exprContextCritical: false,
      rules: [
        ...config.module.rules,
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: ['html-loader']
        }
      ]
    };
    
    // Exclude problematic modules from webpack processing
    config.externals = [...(config.externals || []), 'nodejieba', '@mapbox/node-pre-gyp'];
    
    return config;
  }
};

export default nextConfig;
