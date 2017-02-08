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
    i18nextConfiguration,
    i18nextOptions: {
      fallbackLanguage = ["en-US", "en"],
      useCustomLoader = true,
      ...otherI18nextOptions,
    },
    locale = "en-US",
  }) {
    this.fullLocale = locale;
    this.defaultCurrency = defaultCurrency;
    this.i18nextOptions = {
      fallbackLanguage,
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
      output,
      timezone,
      ...settings,
    } = {},
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
    const formattedTimezone = showTimezone ? momentDate.zoneAbbr() : "";

    if (output === "object") {
      return {
        date: formattedDate,
        timezone: formattedTimezone,
      };
    }

    return (
      `${formattedDate}${formattedTimezone ? `\xA0${formattedTimezone}` : ""}`
    );
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
    } = {},
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
    } = {},
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
    } = {},
  ) {
    // return new (global.IntlPolyfill || Intl).NumberFormat(
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
    } = {},
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
    } = {},
  ) {
    const currentTimezone = this.getCurrentTimezone(timezone);
    const momentDate = this.getNewMoment(date);

    if (currentTimezone) {
      momentDate.tz(currentTimezone);
    }

    const abbreviation = momentDate.zoneAbbr();
    const offsetRaw = momentDate.utcOffset();
    const offset = offsetRaw / 60;
    const offsetString = `${offset > 0 ? "+" : ""}${offset}`;

    return {
      abbreviation,
      offset,
      offsetRaw,
      offsetString,
      timezone: `${offsetString}${abbreviation ? `\xA0(${abbreviation})` : ""}`,
    };
  }

  guessCurrentTimezone() {
    return "";
  }

  initialize() {
    // This is a bit tricky, there might we some async stuff going on during
    // initialization, but we don't want to impose an async contructor, neither
    // do we want to put the initialization burden on the user. Basically, we
    // trigger the initialization ourselves but make the result publicly
    // available in a promise.
    this.ready = this.initializeInternally();
  }

  async initializeInternally() {
    await Promise.all([
      this.initializeI18next(),
      this.initializeIntlPolyfill(),
    ]);

    await this.changeLocale({locale: this.fullLocale});

    return this;
  }

  initializeI18next(i18nextConfiguration) {
    this.i18next = createI18nextInstance();

    if (this.i18nextOptions.useCustomLoader) {
      this.i18next.use(i18nCustomCallbackBackend);
    }

    this.attachI18nextMiddleware();

    return new Promise((resolve, reject) => this.i18next.init(
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
    await this.ensureLocaleIsLoaded({locale});
    moment.locale(locale);
    this.fullLocale = locale;
  }

  async ensureLocaleIsLoaded() {}
}
