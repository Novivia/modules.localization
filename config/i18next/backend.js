/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

// eslint-disable-next-line filenames/match-exported
import getCommonConfiguration from "./common";

export default function getBackendI18nextConfiguration({
  detectionCaches = [
    "cookie",
    "session",
  ],
  detectionOrder = [
    "querystring",
    "session",
    "cookie",
    "header"
  ],
  detectionSessionVariable = "lang",
  ...commonSettings,
} = {}) {
  const backendConfiguration = getCommonConfiguration({
    detectionOrder,
    ...commonSettings,
  });

  backendConfiguration.detection.caches = detectionCaches;
  backendConfiguration.detection.lookupSession = detectionSessionVariable;

  return backendConfiguration;
}
