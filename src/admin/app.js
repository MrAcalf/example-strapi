import ptBRTranslations from './translations/pt-BR.json';

// Função para converter objeto aninhado em chaves planas (ex: "Auth.form.welcome.title")
const flattenTranslations = (obj, prefix = '') => {
  const flattened = {};
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenTranslations(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
};

// Converte as traduções do JSON para o formato esperado pelo Strapi
const translations = flattenTranslations(ptBRTranslations);

const config = {
  locales: [
    'pt-BR',
  ],
  translations: {
    'pt-BR': translations,
  },
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};
  