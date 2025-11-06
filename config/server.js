module.exports = ({ env }) => {
  // Get APP_KEYS as string first to check if it exists
  const appKeysRaw = env('APP_KEYS');
  const appKeys = env.array('APP_KEYS');
  
  // Detect if we're in build phase vs runtime
  const isBuildCommand = process.argv.some(arg => arg.includes('build'));
  const isStartCommand = process.argv.some(arg => arg.includes('start'));
  
  // Check if APP_KEYS is actually set and not empty
  const hasAppKeys = appKeysRaw && appKeysRaw.trim() !== '' && appKeys && appKeys.length > 0 && appKeys[0] !== '';
  
  // Only validate APP_KEYS when starting the server (runtime), not during build
  if (isStartCommand && !isBuildCommand && !hasAppKeys) {
    throw new Error(
      'APP_KEYS is required. Please set the APP_KEYS environment variable in Koyeb.\n' +
      'Generate keys with: openssl rand -base64 32\n' +
      'Format in Koyeb: APP_KEYS=key1,key2 (comma-separated, at least one key required)\n' +
      'You can generate multiple keys by running: openssl rand -base64 32 (repeat for each key)'
    );
  }

  // During build or if not available, use placeholder keys
  const keys = hasAppKeys 
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
