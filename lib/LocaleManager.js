/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import {createInstance as createI18nextInstance} from "i18next";
import i18nCustomCallbackBackend from "i18next-callback-backend";
// import filesizeFormatter from "filesize";

/**
 * A module providing tools to manage localization utilities.
 */

export default class LocaleManager {
  constructor({
    i18nextOptions: {
      useCustomLoader = true,
      ...otherI18nextOptions,
    },
    i18nextConfiguration,
  } = {}) {
    this.i18nextOptions = {
      useCustomLoader,
      ...otherI18nextOptions,
    };
    this.i18nextConfiguration = i18nextConfiguration;
  }

  getCurrentLanguage() {
    return this.i18next.language;
  }

  getLanguageKey(...args) {
    return this.i18next.t(...args);
  }

  initialize() {
    this.initializeI18next();
  }

  initializeI18next(i18nextConfiguration) {
    this.i18next = createI18nextInstance();

    if (this.i18nextOptions.useCustomLoader) {
      this.i18next.use(i18nCustomCallbackBackend);
    }

    this.attachI18nextMiddleware();
    this.i18next.init(this.getI18nextConfiguration());
  }
}
