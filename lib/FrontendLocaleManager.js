/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import getFrontendI18nextConfiguration from "../config/frontend";
import i18nCache from "i18next-localstorage-cache";
import i18nLanguageDetector from "i18next-browser-languagedetector";
import LocaleManager from "./LocaleManager";

/**
 * A module providing tools to manage localization utilities.
 */

export default class FrontendLocaleManager extends LanguageManager {
  constructor({
    i18nextOptions: {
      useCache = true,
      useLanguageDetector = true,
      ...otherI18nextOptions,
    },
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
}
