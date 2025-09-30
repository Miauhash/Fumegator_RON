// lib/i18n.js
import { en } from '../locales/en';
import { pt } from '../locales/pt';
import { es } from '../locales/es';
import { zh } from '../locales/zh';

const languages = {
  en,
  pt,
  es,
  zh,
};

/**
 * Função de tradução robusta.
 * @param {string} key A chave da tradução.
 * @param {string} lang O idioma atual (ex: 'en', 'pt').
 * @param {Object} vars Variáveis para substituir no texto (ex: {count: 5}).
 * @returns {string} O texto traduzido.
 */
export function t(key, lang = 'en', vars = {}) {
  // Garante que temos um fallback para o inglês se o idioma não existir
  const selectedLang = languages[lang] || languages.en;
  // Pega o texto da língua selecionada, ou do inglês se a chave não existir na língua selecionada.
  // Se não encontrar em nenhum, retorna a própria chave para sabermos o que falta.
  let text = selectedLang[key] || languages.en[key] || key;

  // Garante que o texto seja uma string antes de tentar substituir variáveis
  if (typeof text !== 'string') {
    console.warn(`Translation key "${key}" is not a string for language "${lang}".`);
    return key;
  }

  for (const [varKey, varValue] of Object.entries(vars)) {
    const regex = new RegExp(`{${varKey}}`, 'g');
    text = text.replace(regex, varValue);
  }
  return text;
}