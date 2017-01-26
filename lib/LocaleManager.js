/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import {createInstance as createI18nextInstance} from "i18next";
import defaultsDeep from "lodash/defaultsDeep";
import i18nCustomCallbackBackend from "i18next-callback-backend";
// import filesizeFormatter from "filesize";

/**
 * A module providing tools to manage localization utilities.
 */

export default class LocaleManager {
  constructor({
    defaultCurrency = "USD",
    i18nextOptions: {
      useCustomLoader = true,
      ...otherI18nextOptions,
    },
    i18nextConfiguration,
    locale = "en-CA",
  } = {}) {
    this.fullLocale = locale;
    this.defaultCurrency = defaultCurrency;
    this.i18nextOptions = {
      useCustomLoader,
      ...otherI18nextOptions,
    };
    this.i18nextConfiguration = i18nextConfiguration;
  }

  static defaultNumberFormatSettings = {
    maximumFractionDigits: 0,
  };

  /**
   * Format a currency to a string based on locale.
   */
  formatMoney(
    amount,
    {
      currency = this.defaultCurrency,
      locale = this.fullLocale,
      ...settings,
    },
  ) {
    return new Intl.NumberFormat(
      locale,
      {
        currency,
        style: "currency",
        ...settings,
      },
    ).format(amount);
  }

  /**
   * Format a number to a string based on locale.
   */
  formatNumber(
    number,
    {
      locale = this.fullLocale,
      ...settings,
    },
  ) {
    return new Intl.NumberFormat(
      locale,
      {
        ...LocaleManager.defaultNumberFormatSettings,
        ...settings,
      },
    ).format(number);
  }

  getCurrentLanguage() {
    return this.i18next.language;
  }

  getLanguageKey(...args) {
    return this.i18next.t(...args);
  }

  async initialize() {
    await Promise.all([
      this.initializeI18next(),
      this.initializeIntlPolyfill(),
    ]);

    await this.ensureLocaleIsLoaded({locale: this.fullLocale});

    // console.log("locale?", this.i18next.language);
  }

  initializeI18next(i18nextConfiguration) {
    this.i18next = createI18nextInstance();

    if (this.i18nextOptions.useCustomLoader) {
      this.i18next.use(i18nCustomCallbackBackend);
    }

    this.attachI18nextMiddleware();

    return new Promise((resolve, reject) => this.i18next.init(
      this.getI18nextConfiguration(),
      err => {
        if (err) {
          return reject(err);
        }

        resolve();
      },
    ));
  }

  async changeLocale({locale}) {
    await ensureLocaleIsLoaded({locale});
    this.fullLocale = locale;
  }

  async ensureLocaleIsLoaded() {}
}
