/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import getFrontendI18nextConfiguration from "../config/i18next/frontend";
import i18nCache from "i18next-localstorage-cache";
import i18nLanguageDetector from "i18next-browser-languagedetector";
import LocaleManager from "./LocaleManager";
import moment from "moment-timezone";

// FIXME: Figure out a way to include this in the test suite.
/* istanbul ignore next */
if (global.__TESTING__) {
  // Polyfill webpack require.ensure.
  // See http://stackoverflow.com/a/33225242/564163
  if (typeof require.ensure !== "function") {
    require.ensure = (dependencies, callback) => callback(require);
  }
}

/**
 * A module providing tools to manage localization utilities in the frontend.
 */

export default class FrontendLocaleManager extends LocaleManager {
  constructor({
    i18nextOptions: {
      useCache = true,
      useLanguageDetector = true,
      ...otherI18nextOptions,
    } = {},
    ...options,
  } = {}) {
    super({
      i18nextOptions: {
        useCache,
        useLanguageDetector,
        ...otherI18nextOptions,
      },
      ...options,
    });

    this.initialize();
  }

  loadedLocales = new Set();

  attachI18nextMiddleware() {
    const {
      useCache,
      useLanguageDetector,
    } = this.i18nextOptions;

    if (useCache) {
      this.i18next.use(i18nCache);
    }

    if (useLanguageDetector) {
      this.i18next.use(i18nLanguageDetector);
    }
  }

  getI18nextConfiguration() {
    return getFrontendI18nextConfiguration(this.i18nextConfiguration);
  }

  guessCurrentTimezone() {
    return moment.tz.guess();
  }

  async initializeIntlPolyfill() {
    if (!global.Intl && !global.IntlPolyfill) {
      return new Promise(resolve => require.ensure(
        [],
        require => {
          require("intl");
          resolve();
        },
      ));
    }
  }

  async ensureLocaleIsLoaded({locale}) {
    const commonLocaleName = locale.toLowerCase();

    if (this.loadedLocales.has(commonLocaleName)) {
      return;
    }

    return new Promise(resolve => {
      if (!global.IntlPolyfill) {
        return resolve();
      }

      require.ensure(
        [],
        require => {
          require(`intl/locale-data/jsonp/${locale}.js`);
          this.loadedLocales.add(commonLocaleName);
          resolve();
        },
      );
    });
  }
}
