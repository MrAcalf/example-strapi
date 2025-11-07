'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // Detect WSL environment and show helpful message
    const isWSL = process.env.WSL_DISTRO_NAME || 
                  process.env.WSLENV || 
                  require('fs').existsSync('/proc/version') && 
                  require('fs').readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
    
    if (isWSL) {
      const serverConfig = strapi.config.get('server');
      const host = serverConfig.host;
      const port = serverConfig.port;
      
      if (host === '0.0.0.0' || host === '::') {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  WSL Detected - Use these URLs to access from Windows:    ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log(`\n  Admin Panel: http://localhost:${port}/admin`);
        console.log(`  API:         http://localhost:${port}/api\n`);
        console.log('  Note: Use "localhost" or "127.0.0.1" instead of "0.0.0.0"\n');
      }
    }
  },
};
