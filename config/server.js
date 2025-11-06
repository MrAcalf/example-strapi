module.exports = ({ env }) => {
  const appKeys = env.array('APP_KEYS');
  
  // Detect if we're in build phase vs runtime
  const isBuildCommand = process.argv.some(arg => arg.includes('build'));
  const isStartCommand = process.argv.some(arg => arg.includes('start'));
  
  // Only validate APP_KEYS when starting the server (runtime), not during build
  if (isStartCommand && !isBuildCommand && (!appKeys || appKeys.length === 0)) {
    throw new Error(
      'APP_KEYS is required. Please set the APP_KEYS environment variable.\n' +
      'Generate keys with: openssl rand -base64 32\n' +
      'Format: APP_KEYS="key1,key2" (comma-separated, at least one key required)\n' +
      'You can generate multiple keys by running: openssl rand -base64 32 (repeat for each key)'
    );
  }

  // During build or if not available, use placeholder keys
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
