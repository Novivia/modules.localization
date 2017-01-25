/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import {createInstance as createI18nextInstance} from "i18next";
import defaultsDeep from "lodash/defaultsDeep";

// FIXME: Migrate to
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
import {
  formatMoney,
  formatNumber,
} from "accounting-js";
import i18nCustomCallbackBackend from "i18next-callback-backend";
// import filesizeFormatter from "filesize";


const currencySettings = {
  AUD: {
    currency: {
      symbol: "AU$",
    },
  },
  CAD: {
    currency: {
      symbol: "CAD$",
    },
  },
  EUR: {
    currency: {
      symbol: "€",
    }
  },
  GBP: {
    currency: {
      symbol: "£",
    },
  },
  INR: {
    currency: {
      precision: 0,
      symbol: "₹",
    },
  },
  JPY: {
    currency: {
      precision: 0,
      symbol: "¥",
    },
  },
  USD: {
    currency: {
      symbol: "US$",
    },
  },
};

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
    locale = "en-CA",
  } = {}) {
    this.fullLocale = locale;
    this.i18nextOptions = {
      useCustomLoader,
      ...otherI18nextOptions,
    };
    this.i18nextConfiguration = i18nextConfiguration;
  }

  static defaultAccountingSettings = {
    currency: {
      decimal: ".",
      format: "%s %v",
      precision: 2,
      thousand: ","
    },
    number: {
      decimal: ".",
      precision: 0,
      thousand: ","
    },
  };

  /**
   * Returns accounting settings based on current locale.
   */
  static getAccountingSettings({locale}) {
    return defaultsDeep(
      {},
      LocaleManager.getCurrencySettings({locale}),
      LocaleManager.defaultAccountingSettings,
    );
    // return defaultsDeep({}, settings, LocaleManager.defaultAccountingSettings);
  }

  static getCurrencySettings({locale}) {
    return (
      currencySettings[locale] ||
      (locale && currencySettings[locale.toUpperCase()]) ||
      currencySettings.USD
    );
  }

  /**
   * Format a number to a string based on locale.
   */
  formatMoney(
    amount,
    {
      locale,
      ...settings,
    },
  ) {
    return formatMoney(
      amount,
      {
        ...LocaleManager.getAccountingSettings({
          locale: locale || this.fullLocale,
        }).currency,
        ...settings,
      },
    );
  }

  /**
   * Format a number to a string based on locale.
   */
  formatNumber(
    number,
    {
      locale,
      ...settings,
    },
  ) {
    return formatNumber(
      number,
      {
        ...LocaleManager.getAccountingSettings({
          locale: locale || this.fullLocale,
        }).number,
        ...settings,
      },
    );
  }

  getCurrentLanguage() {
    return this.i18next.language;
  }

  getLanguageKey(...args) {
    return this.i18next.t(...args);
  }

  async initialize() {
    await this.initializeI18next();
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
}
