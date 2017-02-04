/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

// eslint-disable-next-line filenames/match-exported
import getCommonConfiguration from "./common";

export default function getFrontendI18nextConfiguration({
  detectionLocalStorageKey = "i18n_lng",
  detectionOrder = [
    "querystring",
    "cookie",
    "localStorage",
    "navigator",
  ],
  enableLocalStorage = true,
  localStorageExpirationTime = 86400000,
  localStoragePrefix = "i18n_",
  ...commonSettings
} = {}) {
  const frontendConfiguration = getCommonConfiguration({
    detectionOrder,
    ...commonSettings,
  });

  frontendConfiguration.cache = {
    enabled: enableLocalStorage,
    expirationTime: localStorageExpirationTime,
    prefix: localStoragePrefix,
  };

  frontendConfiguration.detection.lookupLocalStorage = detectionLocalStorageKey;

  return frontendConfiguration;
}
