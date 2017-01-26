/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import BackendLocaleManager from "../BackendLocaleManager";
import {oneLine} from "common-tags";

function getExpressMock({
  headers = {
    cookie: "",
  },
  next = jest.fn(),
  url = "",
} = {}) {
  return {
    next,
    request: {
      connection: {},
      headers,
      url,
    },
    response: {
      getHeader(header) {return this.headers[header] || "";},
      headers: {},
      locals: {},
      setHeader(header, data) {this.headers[header] = data;},
    },
  };
}

function assertExpressLanguage({
  cookieName = "lang",
  direction = "ltr",
  defaultLanguage = "en",
  language = "en",
  request = {},
  response = {
    headers: {},
    locals: {},
  },
} = {}) {
  expect(request).toMatchObject({
    language,
    lng: language,
    locale: language,
  });
  expect(request.languages).toContain(defaultLanguage);
  expect(request.languages).toContain(language);

  expect(response.locals).toMatchObject({
    language,
    languageDir: direction,
  });

  expect(response.headers["Set-Cookie"][0]).toMatch(
    new RegExp(`^${cookieName}=${language};`),
  );
}

function assertExpress({
  defaultLanguage,
  language,
  languageCookieName,
  languageDirection,
  middleware,
  mock,
  namespaceSeparator = "::",
}) {
  expect(middleware).toBeInstanceOf(Function);

  // "Call" the Express middleware.
  middleware(
    mock.request,
    mock.response,
    mock.next,
  );

  assertExpressLanguage({
    cookieName: languageCookieName,
    defaultLanguage,
    direction: languageDirection,
    language,
    request: mock.request,
    response: mock.response,
  });

  // Request.
  expect(mock.request.t).toBeInstanceOf(Function);
  expect(mock.request.t(`ns${namespaceSeparator}key`)).toBe("key");
  expect(mock.request.i18n).toBeInstanceOf(Object);

  // Response.
  expect(mock.response.locals.t).toBeInstanceOf(Function);
  expect(mock.response.locals.t(`ns${namespaceSeparator}key`)).toBe("key");
  expect(mock.response.locals.exists).toBeInstanceOf(Function);
  expect(mock.response.locals.i18n).toBeInstanceOf(Object);

  // Next.
  expect(mock.next).toHaveBeenCalled();
}

describe(
  "Backend locale manager",
  () => {
    describe(
      "with default options",
      () => {
        const localeManager = new BackendLocaleManager();

        it(
          "should return the language key name, without the namespace",
          () => {
            expect(localeManager.getLanguageKey("general::test")).toBe("test");
            expect(localeManager.getLanguageKey("testing::hey")).toBe("hey");
          },
        );

        describe(
          "i18next Express middleware",
          () => {
            const middleware = localeManager.getI18nextExpressMiddleware();

            it(
              "with default options",
              () => assertExpress({
                middleware,
                mock: getExpressMock(),
              }),
            );

            it(
              "should accept French by default",
              () => assertExpress({
                language: "fr",
                middleware,
                mock: getExpressMock({
                  url: "?lang=fr",
                }),
              }),
            );

            it(
              oneLine`
                should not accept something that is not English or French by
                default, but if provided it should default to English
              `,
              () => assertExpress({
                language: "en",
                middleware,
                mock: getExpressMock({
                  url: "?lang=de",
                }),
              }),
            );
          },
        );

        describe(
          "locales middleware",
          () => {
            const middleware = localeManager.getLocalesExpressMiddleware();

            it(
              "with default options",
              () => {
                const mock = getExpressMock();

                // "Call" the Express middleware.
                middleware(
                  mock.request,
                  mock.response,
                  mock.next,
                );

                const localization = mock.request.localization;

                expect(
                  localization.formatMoney(123456.7890),
                ).toBe("US$123,456.79");
                expect(localization.formatNumber(123456.7890)).toBe("123,457");
                expect(
                  localization.formatNumber(
                    123456.7890,
                    {maximumFractionDigits: 2},
                  ),
                ).toBe("123,456.79");
              },
            );
          },
        );
      },
    );

    describe(
      "with different options",
      () => {
        const defaultLanguage = "de";
        const languageCookieName = "bob";
        const namespaceSeparator = "~";
        const resources = {
          cn: {
            hello: {
              planet: "hi there planet",
            },
            inter: {
              po: "la<fillTheBlank>on",
            },
          },
          de: {
            caporal: {
              mustard: "no its colonel",
            },
            hello: {
              world: "HeLlO, wOrLd.",
            },
            sargeant: {
              world: "we all live in amerika",
            },
          },
        };

        const localeManager = new BackendLocaleManager({
          i18nextConfiguration: {
            defaultNamespace: "caporal",
            detectionCookieName: languageCookieName,
            detectionQueryStringVariable: "bobino",
            fallbackLanguage: defaultLanguage,
            fallbackNamespace: "sargeant",
            interpolationPrefix: "<",
            interpolationSuffix: ">",
            languageWhitelist: [
              "cn",
              "de",
            ],
            namespaceList: [
              "army",
            ],
            namespaceSeparator,
            resources,
            returnObjects: false,
          },
        });

        it(
          oneLine`
            should return the language key name, without the namespace, when it
            can't find the key
          `,
          () => {
            expect(localeManager.getLanguageKey("caporal~test")).toBe("test");
            expect(localeManager.getLanguageKey("testing~hey")).toBe("hey");
          },
        );

        it(
          "should return the appropriate resource when it exists in the store",
          () => {
            expect(localeManager.getLanguageKey("hello~world")).toBe(
              resources.de.hello.world,
            );
            expect(
              localeManager.getLanguageKey("hello~world", {lng: "cn"}),
            ).toBe(resources.de.hello.world);
            expect(
              localeManager.getLanguageKey("hello~planet", {lng: "cn"}),
            ).toBe(resources.cn.hello.planet);
            expect(localeManager.getLanguageKey("mustard")).toBe(
              resources.de.caporal.mustard,
            );
            expect(
              localeManager.getLanguageKey("mustard", {lng: "cn"}),
            ).toBe(resources.de.caporal.mustard);
            expect(
              localeManager.getLanguageKey("bob~world", {lng: "cn"}),
            ).toBe(resources.de.sargeant.world);
          },
        );

        it(
          "should properly apply the interpolation when relevant",
          () => expect(localeManager.getLanguageKey(
            "inter~po",
            {fillTheBlank: "ti", lng: "cn"},
          )).toBe("lation"),
        );

        describe(
          "i18next Express middleware",
          () => {
            const middleware = localeManager.getI18nextExpressMiddleware();

            it(
              "with default options",
              () => assertExpress({
                defaultLanguage,
                language: "de",
                languageCookieName,
                middleware,
                mock: getExpressMock(),
                namespaceSeparator,
              }),
            );

            it(
              "should accept Chinese by default",
              () => assertExpress({
                defaultLanguage,
                language: "cn",
                languageCookieName,
                middleware,
                mock: getExpressMock({
                  url: "?bobino=cn",
                }),
                namespaceSeparator,
              }),
            );

            it(
              oneLine`
                should not accept something that is not German or Chinese by
                default, but if provided it should default to German
              `,
              () => assertExpress({
                defaultLanguage,
                language: "de",
                languageCookieName,
                middleware,
                mock: getExpressMock({
                  url: "?bobino=fr",
                }),
                namespaceSeparator,
              }),
            );
          },
        );
      },
    );
  },
);
