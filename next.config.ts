import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: ['https://*.cloudworkstations.dev'],
  },
   webpack: (config, { isServer }) => {
    // This is to fix a bug with handlebars and webpack
    // See: https://github.com/webpack/webpack/issues/17263
    config.module.rules.push({
      test: /node_modules\/handlebars\/lib\/index\.js$/,
      loader: 'string-replace-loader',
      options: {
        search: "require.extensions['.hbs'] = function (module, filename) {",
        replace:
          "require.extensions['.hbs'] = function (module, filename) { return; ",
      },
    });
    return config;
  },
};

export default nextConfig;
