module.exports = ({ env }) => {
  // Get and validate DeepL auth key - must be a non-empty string
  const deeplAuthKeyRaw = env('DEEPL_AUTH_KEY');
  let deeplAuthKey = null;
  if (deeplAuthKeyRaw && typeof deeplAuthKeyRaw === 'string') {
    // Trim and remove surrounding quotes if present
    const trimmed = deeplAuthKeyRaw.trim();
    const unquoted = trimmed.startsWith('"') && trimmed.endsWith('"') 
      ? trimmed.slice(1, -1) 
      : trimmed.startsWith("'") && trimmed.endsWith("'")
      ? trimmed.slice(1, -1)
      : trimmed;
    deeplAuthKey = unquoted !== '' ? unquoted : null;
  }
  
  const plugins = {
    upload: {
        config: {
          provider: "strapi-provider-cloudflare-r2",
          providerOptions: {
            accessKeyId: env("CF_ACCESS_KEY_ID"),
            secretAccessKey: env("CF_ACCESS_SECRET"),
            /**
             * `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
             */
            endpoint: env("CF_ENDPOINT"),
            params: {
              Bucket: env("CF_BUCKET"),
            },
            /**
             * Set this Option to store the CDN URL of your files and not the R2 endpoint URL in your DB.
             * Can be used in Cloudflare R2 with Domain-Access or Public URL: https://pub-<YOUR_PULIC_BUCKET_ID>.r2.dev
             * This option is required to upload files larger than 5MB, and is highly recommended to be set.
             * Check the cloudflare docs for the setup: https://developers.cloudflare.com/r2/data-access/public-buckets/#enable-public-access-for-your-bucket
             */
            cloudflarePublicAccessUrl: env("CF_PUBLIC_ACCESS_URL"),
            /**
             * Sets if all assets should be uploaded in the root dir regardless the strapi folder.
             * It is useful because strapi sets folder names with numbers, not by user's input folder name
             * By default it is false
             */
            pool: false,
          },
          actionOptions: {
            upload: {},
            uploadStream: {},
            delete: {},
          },
        },
      },
  };

  // Configure translate plugin - use dummy provider if DeepL auth key is not provided
  plugins.translate = {
    enabled: !!deeplAuthKey,
    config: {
      // Use dummy provider when auth key is missing to prevent initialization errors
      provider: deeplAuthKey ? 'deepl' : 'dummy',
      providerOptions: deeplAuthKey ? {
        // DeepL API authentication key
        authKey: deeplAuthKey,
      } : {},
      // Which field types are translated (default string, text, richtext, components and dynamiczones)
      // Either string or object with type and format
      // Possible formats: plain, markdown, html, jsonb (default plain)
      translatedFieldTypes: [
        'string',
        { type: 'blocks', format: 'jsonb' },
        { type: 'text', format: 'plain' },
        { type: 'richtext', format: 'markdown' },
        'component',
        'dynamiczone',
      ],
      // If relations should be translated (default true)
      translateRelations: true,
      // ignore updates for certain content types (default [], i.e. no content types are ignored)
      ignoreUpdatedContentTypes: ['api::category.category'],
      // wether to regenerate uids when batch updating (default false)
      regenerateUids: true
    },
  };

  return plugins;
};
