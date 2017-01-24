/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

/* eslint-disable filenames/match-exported */

export default function getCommonI18nextConfiguration({
  customLoader,
  defaultNamespace = "general",
  detectionCookieName = "lang",
  detectionOrder,
  detectionQueryStringVariable = "lang",
  fallbackLanguage = "en",
  fallbackNamespace,
  instantInitialization = true,
  interpolationPrefix,
  interpolationSuffix,
  interpolationWrapper = "__",
  languageWhitelist = [
    "en",
    "fr",
  ],
  namespaceList = [],
  namespaceSeparator = "::",
  returnObjects = true,
  ...i18nextOptions
} = {}) {
  const configuration = {
    customLoad: customLoader,
    defaultNS: defaultNamespace,
    detection: {
      lookupCookie: detectionCookieName,
      lookupQuerystring: detectionQueryStringVariable,
      order: detectionOrder,
    },
    fallbackLng: fallbackLanguage,
    fallbackNS: fallbackNamespace,
    initImmediate: instantInitialization,
    interpolation: {
      prefix: interpolationPrefix || interpolationWrapper,
      suffix: interpolationSuffix || interpolationWrapper,
    },
    ns: namespaceList,
    nsSeparator: namespaceSeparator,
    returnObjects,
    whitelist: languageWhitelist,
    ...i18nextOptions,
  };

  return configuration;
}
