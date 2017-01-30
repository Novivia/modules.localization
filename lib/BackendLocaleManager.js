/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import getBackendI18nextConfiguration from "../config/i18next/backend";
import {
  LanguageDetector as i18nLanguageDetector,
  handle as i18nHandle,
} from "i18next-express-middleware";
import LocaleManager from "./LocaleManager";

/**
 * A module providing tools to manage localization utilities.
 */

export default class BackendLocaleManager extends LocaleManager {
  constructor({
    i18nextOptions: {
      useLanguageDetector = true,
      ...otherI18nextOptions,
    } = {},
    ...options,
  } = {}) {
    super({
      i18nextOptions: {
        useLanguageDetector,
        ...otherI18nextOptions,
      },
      ...options,
    });

    this.initialize();
  }

  attachI18nextMiddleware() {
    const {
      useLanguageDetector,
    } = this.i18nextOptions;

    if (useLanguageDetector) {
      this.i18next.use(i18nLanguageDetector);
    }
  }

  getI18nextConfiguration() {
    return getBackendI18nextConfiguration(this.i18nextConfiguration);
  }

  getI18nextExpressMiddleware() {
    return i18nHandle(this.i18next);
  }

  getLocalesExpressMiddleware() {
    return (req, res, next) => {
      if (req) {
        if (req.localization) {
          console.warn(`Overwriting "req.localization".`);
        }

        req.localization = req.l10n = {};

        req.localization.formatDate = (
          date,
          {
            locale = req.language,
            timezone = req.timezone,
            ...settings,
          } = {},
        ) => this.formatDate(
          date,
          {
            locale,
            timezone,
            ...settings,
          },
        );

        req.localization.formatFilesize = (
          filesize,
          {
            locale = req.language,
            ...settings,
          } = {},
        ) => this.formatFilesize(
          filesize,
          {
            locale,
            ...settings,
          },
        );

        req.localization.formatMoney = (
          amount,
          {
            locale = req.language,
            ...settings,
          } = {},
        ) => this.formatMoney(
          amount,
          {
            locale,
            ...settings,
          },
        );

        req.localization.formatNumber = (
          number,
          {
            locale = req.language,
            ...settings,
          } = {},
        ) => this.formatNumber(
          number,
          {
            locale,
            ...settings,
          },
        );

        req.localization.formatPercentage = (
          percentage,
          settings = {},
        ) => this.formatPercentage(
          percentage,
          {
            locale: req.language,
            ...settings,
          },
        );
      }

      next();
    };
  }

  initializeIntlPolyfill() {
    // FIXME: One day Node will support this out of the box.
    global.Intl = require("intl");
  }
}
