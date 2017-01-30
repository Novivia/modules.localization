/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import {createInstance as createI18nextInstance} from "i18next";
import defaultsDeep from "lodash/defaultsDeep";
import filesizeFormatter from "filesize";
import i18nCustomCallbackBackend from "i18next-callback-backend";
import moment from "moment-timezone";

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
    locale = "en-US",
  } = {}) {
    this.fullLocale = locale;
    this.defaultCurrency = defaultCurrency;
    this.i18nextOptions = {
      useCustomLoader,
      ...otherI18nextOptions,
    };
    this.i18nextConfiguration = i18nextConfiguration;
  }

  static defaultFilesizeFormatSettings = {
    maximumFractionDigits: 2,
  };

  static defaultNumberFormatSettings = {
    maximumFractionDigits: 0,
  };

  // FIXME: Investigate using
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat

  /**
   * Format a date to a string based on locale.
   */
  formatDate(
    date = new Date(),
    {
      format = "LLL",
      locale,
      timezone,
      ...settings,
    },
  ) {
    const currentTimezone = this.getCurrentTimezone(timezone);
    const momentDate = this.getNewMoment(date);

    if (currentTimezone) {
      momentDate.tz(currentTimezone);
    }

    if (locale) {
      momentDate.locale(locale);
    }

    const showTimezone = (
      currentTimezone &&
      /[hH][^dDMY]+$/.test(momentDate.localeData().longDateFormat(format))
    );
    const formattedDate = momentDate.format(format);
    const formattedTimezone = showTimezone ?
      `\xA0${momentDate.zoneAbbr()}`
    : "";

    return `${formattedDate}${formattedTimezone}`;
  }

  /**
   * Format a file size to a string based on locale.
   */
  formatFilesize(
    filesize,
    {
      base,
      bits,
      locale = this.fullLocale,
      spacer = true,
      standard = "iec",
      unix,
      ...settings,
    },
  ) {
    const filesizeInfo = filesizeFormatter(
      filesize,
      {
        base,
        bits,
        output: "object",
        standard,
        unix,
      },
    );

    const formattedSize = this.formatNumber(
      filesizeInfo.value,
      {
        locale,
        ...LocaleManager.defaultFilesizeFormatSettings,
        ...settings,
      },
    );

    return `${formattedSize}${spacer ? "\xA0" : ""}${filesizeInfo.suffix}`;
  }

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

  /**
   * Format a number to a string based on locale.
   */
  formatPercentage(
    percentage,
    {
      locale = this.fullLocale,
      ...settings,
    },
  ) {
    return new Intl.NumberFormat(
      locale,
      {
        style: "percent",
        ...settings,
      },
    ).format(percentage);
  }

  getCurrentLanguage() {
    return this.i18next.language;
  }

  getCurrentTimezone(timezone) {
    if (timezone === false) {
      return;
    }

    if (timezone && timezone !== true) {
      return timezone;
    }

    // Timezone is either not set, or set to true.
    return this.guessCurrentTimezone();
  }

  getLanguageKey(...args) {
    return this.i18next.t(...args);
  }

  getNewMoment(date = new Date()) {
    return moment(date);
  }

  getTimezoneData(
    date = new Date(),
    {
      timezone,
      ...settings,
    },
  ) {
    const currentTimezone = this.getCurrentTimezone(timezone);
    const momentDate = this.getNewMoment(date);

    if (currentTimezone) {
      momentDate.tz(currentTimezone);
    }

    const abbreviation = momentDate.zoneAbbr();
    const offset = momentDate.utcOffset();

    return {
      abbreviation,
      offset,
      timezone: `${offset} (${abbreviation})`,
    };
  }

  guessCurrentTimezone() {
    return "";
  }

  async initialize() {
    await Promise.all([
      this.initializeI18next(),
      this.initializeIntlPolyfill(),
    ]);

    await this.changeLocale({locale: this.fullLocale});

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
    moment.locale(locale);
    this.fullLocale = locale;
  }

  async ensureLocaleIsLoaded() {}
}
