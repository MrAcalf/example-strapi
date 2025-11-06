module.exports = ({ env }) => {
  const appKeys = env.array('APP_KEYS');
  
  if (!appKeys || appKeys.length === 0) {
    throw new Error(
      'APP_KEYS is required. Please set the APP_KEYS environment variable.\n' +
      'Generate keys with: openssl rand -base64 32\n' +
      'Format: APP_KEYS="key1,key2" (comma-separated, at least one key required)'
    );
  }

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: appKeys,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  };
};
