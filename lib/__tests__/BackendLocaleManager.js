/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import BackendLocaleManager from "../BackendLocaleManager";

describe(
  "Backend locale manager",
  () => {
    describe(
      "with default options",
      () => {
        // const localeManager = new BackendLocaleManager();
        const localeManager = new BackendLocaleManager({
          i18nextConfiguration: {
            // customLoad: () => ({}),
            resources: {},
          },
        });

        it(
          "should return the language key name, without the namespace",
          () => {
            expect(localeManager.getLanguageKey("general::test")).toBe("test");
            expect(localeManager.getLanguageKey("testing::hey")).toBe("hey");
          },
        );

        it(
          "should return the i18next Express middleware",
          () => {
            const expressMiddleware = localeManager.getI18nextExpressMiddleware();
            const req = {
              connection: {},
              headers: {
                cookie: "",
              },
              url: "abc",
            };
            const res = {
              getHeader: () => "",
              setHeader: () => undefined,
            };
            const next = jest.fn();

            expect(expressMiddleware).toBeInstanceOf(Function);
            console.log("test:", expressMiddleware(req, res, next));
            // expect(() => expressMiddleware(express))
          },
        );
      },
    );
  },
);
