module.exports = {
    //swcMinify: true,
    async redirects() {
      return [
        {
          source: '/actions/commands',
          destination: '/actions/invoices',
          permanent: true,
        },
      ]
    },
    webpack: function (config, { webpack, dev, isServer }) {
        // Fixes npm packages that depend on `fs` module
        if (!isServer) {
          config.resolve.fallback.fs = false;
        }
        if (isServer) {
          config.plugins.push(
            new webpack.IgnorePlugin({
              checkResource(resource) {
                // If I am including something from my backend directory, I am sure that this shouldn't be included in my frontend bundle
                if (resource.includes('.next/server/chunks')) {
                  return true;
                }
                return false;
              },
            }),
          );

          config.module.rules.push({
            test: /\.(css|html)$/i,
            loader: "html-loader",
          });
        }

        return config;
    },
    env: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGE_SENDER_ID: process.env.FIREBASE_MESSAGE_SENDER_ID,
      NEXT_ABSOLUTE_URL: process.env.NEXT_ABSOLUTE_URL,
      STORAGE_PREFIX: process.env.STORAGE_PREFIX,
      PRODUCTION: process.env.PRODUCTION,
    },
};
