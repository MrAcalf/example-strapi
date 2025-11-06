module.exports = ({ env }) => {
  const appKeys = env.array('APP_KEYS');
  const isBuild = process.env.STRAPI_DISABLE_APP_KEYS_VALIDATION === 'true' || 
                  process.argv.includes('build') || 
                  process.argv.some(arg => arg.includes('strapi') && arg.includes('build'));
  
  // Only validate APP_KEYS at runtime, not during build
  if (!isBuild && (!appKeys || appKeys.length === 0)) {
    throw new Error(
      'APP_KEYS is required. Please set the APP_KEYS environment variable.\n' +
      'Generate keys with: openssl rand -base64 32\n' +
      'Format: APP_KEYS="key1,key2" (comma-separated, at least one key required)'
    );
  }

  // During build, use placeholder keys if not available
  const keys = appKeys && appKeys.length > 0 
    ? appKeys 
    : ['placeholder-key-for-build-only'];

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: keys,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  };
};
