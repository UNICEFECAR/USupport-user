import en from "./en.js";
import ru from "./ru.js";
import kk from "./kk.js";

const translations = {
  en, ru, kk,
};

/**
 *
 * @param {string} key the key of the translation
 * @param {string} language the alpha2 code of the language
 * @returns {string} the translated string
 */
export function t(key, language = "en") {
  // Make sure the language exists and if not return the default language
  if (!Object.keys(translations).includes(language)) {
    return translations["en"][key];
  }
  return translations[language][key];
}
