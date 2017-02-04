/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import getFrontendI18nextConfiguration from "../config/i18next/frontend";
import i18nCache from "i18next-localstorage-cache";
import i18nLanguageDetector from "i18next-browser-languagedetector";
import LocaleManager from "./LocaleManager";
import moment from "moment-timezone";

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
    console.log("intl:", global.Intl)
    global.Intl = undefined;

    require("intl");

    console.log("intl2:", global.Intl)

    // if (!global.Intl) {
    //   return new Promise(resolve => require.ensure(
    //     [],
    //     require => {
    //       require("intl");
    //       resolve();
    //     },
    //   ));
    // }
  }

  async ensureLocaleIsLoaded({locale}) {
    console.log("never called :(");

    if (this.loadedLocales.has(locale)) {
      return;
    }

    return new Promise(resolve => require.ensure(
      [],
      require => {
        require(`intl/locale-data/jsonp/${locale.toLowerCase()}.js`);
        this.loadedLocales.add(locale);
        resolve();
      },
    ));
  }
}
