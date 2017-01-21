/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import BackendLocaleManager from "../BackendLocaleManager";

describe(
  "Backend locale manager",
  () => {
    // const defaultConfiguration = getBackendConfiguration();

    describe(
      "with default options",
      () => {
        const localeManager = new BackendLocaleManager();

        it(
          "should return the key name, without the namespace",
          () => {
            const key = localeManager.getLanguageKey("general::test");

            expect(key).toBe("test");
          },
        );
      },
    );
  },
);
