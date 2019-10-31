import messagesEn from '~/languages/translations/en.json5';
import messagesJa from '~/languages/translations/ja.json5';
import {createIntl} from 'react-intl';

export const messages: { [locale: string]: { [key: string]: string } } = {
  ja: messagesJa,
  en: messagesEn,
};

const locales: { [locale: string]: string[] } = {
  ja: ['ja', 'ja-JP'],
  en: ['en', 'en-US'],
};

export const chooseLocale = () => {
  for (const browserLanguage of navigator.languages) {
    for (const locale of Object.keys(locales)) {
      if (locales[locale].includes(browserLanguage)) {
        return locale;
      }
    }
  }
  return 'en';
};

const locale = chooseLocale()

export const Intl = createIntl({
  locale: locale,
  messages: messages[locale]
})
