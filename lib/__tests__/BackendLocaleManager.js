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

            describe(
              "with current locale",
              () => {
                const mock = getExpressMock();

                // "Call" the Express middleware.
                middleware(
                  mock.request,
                  mock.response,
                  mock.next,
                );

                const localization = mock.request.localization;

                it(
                  "should format dates properly",
                  () => {
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                    )).toBe("January 30, 2017 3:25 PM");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380+03:00"),
                    )).toBe("January 30, 2017 12:25 PM");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {format: "LT"},
                    )).toBe("3:25 PM");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {format: "LTS"},
                    )).toBe("3:25:41 PM");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {format: "LLLL"},
                    )).toBe("Monday, January 30, 2017 3:25 PM");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {format: "LLL"},
                    )).toBe("January 30, 2017 3:25 PM");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {format: "LL"},
                    )).toBe("January 30, 2017");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {format: "L"},
                    )).toBe("01/30/2017");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380+03:00"),
                      {timezone: true},
                    )).toBe("January 30, 2017 12:25 PM");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {timezone: false},
                    )).toBe("January 30, 2017 3:25 PM");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {timezone: "Europe/Vienna"},
                    )).toBe("January 30, 2017 9:25 PM\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LT",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("9:25 PM\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LTS",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("9:25:41 PM\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LLLL",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("Monday, January 30, 2017 9:25 PM\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LLL",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("January 30, 2017 9:25 PM\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LL",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("January 30, 2017");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "L",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("01/30/2017");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380+03:00"),
                    )).toBe("January 30, 2017 12:25 PM");
                  },
                );

                it(
                  "should format file sizes properly",
                  () => {
                    expect(
                      localization.formatFilesize(123456.7890),
                    ).toBe("120.56\xA0KiB");
                    expect(
                      localization.formatFilesize(123123456.7890),
                    ).toBe("117.42\xA0MiB");
                    expect(
                      localization.formatFilesize(123123123123123456.7890),
                    ).toBe("109.36\xA0PiB");
                    expect(localization.formatFilesize(
                      123456.7890,
                      {standard: "jedec"},
                    )).toBe("120.56\xA0KB");
                    expect(
                      localization.formatFilesize(123456.7890, {bits: true}),
                    ).toBe("964.51\xA0Kib");
                    expect(
                      localization.formatFilesize(123456.7890, {unix: true}),
                    ).toBe("120.6\xA0Ki");
                    expect(localization.formatFilesize(
                      123456.7890,
                      {
                        spacer: false,
                        standard: "jedec",
                        unix: true,
                      },
                    )).toBe("120.6K");
                  },
                );

                it(
                  "should format money properly",
                  () => {
                    expect(
                      localization.formatMoney(123456.7890),
                    ).toBe("$123,456.79");
                    expect(
                      localization.formatMoney(-123456.7890),
                    ).toBe("-$123,456.79");
                    expect(
                      localization.formatMoney(123456.7890, {currency: "CAD"}),
                    ).toBe("CA$123,456.79");
                    expect(
                      localization.formatMoney(-123456.7890, {currency: "CAD"}),
                    ).toBe("-CA$123,456.79");
                  },
                );

                it(
                  "should format numbers properly",
                  () => {
                    expect(
                      localization.formatNumber(123456.7890),
                    ).toBe("123,457");
                    expect(
                      localization.formatNumber(-123456.7890),
                    ).toBe("-123,457");
                    expect(
                      localization.formatNumber(
                        123456.7890,
                        {maximumFractionDigits: 2},
                      ),
                    ).toBe("123,456.79");
                    expect(
                      localization.formatNumber(
                        -123456.7890,
                        {maximumFractionDigits: 2},
                      ),
                    ).toBe("-123,456.79");

                    // Percentage formatting.
                    expect(localization.formatPercentage(0.11)).toBe("11%");
                    expect(localization.formatPercentage(1)).toBe("100%");
                    expect(localization.formatPercentage(1.10)).toBe("110%");
                    expect(
                      localization.formatPercentage(10000),
                    ).toBe("1,000,000%");
                    expect(
                      localization.formatPercentage(-10000),
                    ).toBe("-1,000,000%");
                  },
                );
              },
            );

            describe(
              "with custom locales",
              () => {
                const mock = getExpressMock();

                // "Call" the Express middleware.
                middleware(
                  mock.request,
                  mock.response,
                  mock.next,
                );

                const localization = mock.request.localization;

                it(
                  "should format dates properly",
                  () => {
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {locale: "fr-CA"},
                    )).toBe("30 janvier 2017 15:25");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380+03:00"),
                      {locale: "fr-CA"},
                    )).toBe("30 janvier 2017 12:25");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LT",
                        locale: "fr-CA",
                      },
                    )).toBe("15:25");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LTS",
                        locale: "fr-CA",
                      },
                    )).toBe("15:25:41");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LLLL",
                        locale: "fr-CA",
                      },
                    )).toBe("lundi 30 janvier 2017 15:25");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LLL",
                        locale: "fr-CA",
                      },
                    )).toBe("30 janvier 2017 15:25");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LL",
                        locale: "fr-CA",
                      },
                    )).toBe("30 janvier 2017");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "L",
                        locale: "fr-CA",
                      },
                    )).toBe("2017-01-30");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380+03:00"),
                      {
                        locale: "fr-CA",
                        timezone: true,
                      },
                    )).toBe("30 janvier 2017 12:25");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        locale: "fr-CA",
                        timezone: false,
                      },
                    )).toBe("30 janvier 2017 15:25");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        locale: "fr-CA",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("30 janvier 2017 21:25\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LT",
                        locale: "fr-CA",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("21:25\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LTS",
                        locale: "fr-CA",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("21:25:41\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LLLL",
                        locale: "fr-CA",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("lundi 30 janvier 2017 21:25\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LLL",
                        locale: "fr-CA",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("30 janvier 2017 21:25\xA0CET");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "LL",
                        locale: "fr-CA",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("30 janvier 2017");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380Z"),
                      {
                        format: "L",
                        locale: "fr-CA",
                        timezone: "Europe/Vienna",
                      },
                    )).toBe("2017-01-30");
                    expect(localization.formatDate(
                      new Date("2017-01-30T20:25:41.380+03:00"),
                      {locale: "fr-CA"},
                    )).toBe("30 janvier 2017 12:25");
                  },
                );

                it(
                  "should format file sizes properly",
                  () => {
                    expect(localization.formatFilesize(
                      123456.7890,
                      {locale: "fr-CA"},
                    )).toBe("120,56\xA0KiB");
                    expect(localization.formatFilesize(
                      123456.7890,
                      {
                        locale: "fr-CA",
                        standard: "jedec",
                      },
                    )).toBe("120,56\xA0KB");
                    expect(localization.formatFilesize(
                      123456.7890,
                      {
                        bits: true,
                        locale: "fr-CA",
                      },
                    ),
                    ).toBe("964,51\xA0Kib");
                    expect(localization.formatFilesize(
                      123456.7890,
                      {
                        locale: "fr-CA",
                        unix: true,
                      },
                    )).toBe("120,6\xA0Ki");
                    expect(localization.formatFilesize(
                      123456.7890,
                      {
                        locale: "fr-CA",
                        spacer: false,
                        standard: "jedec",
                        unix: true,
                      },
                    )).toBe("120,6K");
                  },
                );

                it(
                  "should format money properly",
                  () => {
                    expect(
                      localization.formatMoney(123456.7890, {locale: "en-CA"}),
                    ).toBe("US$123,456.79");
                    expect(
                      localization.formatMoney(-123456.7890, {locale: "en-CA"}),
                    ).toBe("-US$123,456.79");
                    expect(localization.formatMoney(
                      123456.7890,
                      {
                        currency: "JPY",
                        locale: "en-CA",
                      },
                    )).toBe("JP¥123,457");
                    expect(localization.formatMoney(
                      -123456.7890,
                      {
                        currency: "JPY",
                        locale: "en-CA",
                      },
                    )).toBe("-JP¥123,457");
                    expect(localization.formatMoney(
                      123456.7890,
                      {
                        currency: "EUR",
                        locale: "fr-CA",
                      },
                    )).toBe("123\xA0456,79\xA0€");
                    expect(localization.formatMoney(
                      -123456.7890,
                      {
                        currency: "EUR",
                        locale: "fr-CA",
                      },
                    )).toBe("-123\xA0456,79\xA0€");
                  },
                );

                it(
                  "should format numbers properly",
                  () => {
                    expect(
                      localization.formatNumber(123456.7890, {locale: "fr-CA"}),
                    ).toBe("123\xA0457");
                    expect(localization.formatNumber(
                      -123456.7890,
                      {locale: "fr-CA"},
                    )).toBe("-123\xA0457");
                    expect(
                      localization.formatNumber(
                        -123456.7890,
                        {
                          locale: "fr-CA",
                          maximumFractionDigits: 2,
                        },
                      ),
                    ).toBe("-123\xA0456,79");

                    // Percentage formatting.
                    expect(
                      localization.formatPercentage(0.11, {locale: "fr-CA"}),
                    ).toBe("11\xA0%");
                    expect(
                      localization.formatPercentage(1, {locale: "fr-CA"}),
                    ).toBe("100\xA0%");
                    expect(
                      localization.formatPercentage(1.10, {locale: "fr-CA"}),
                    ).toBe("110\xA0%");
                    expect(
                      localization.formatPercentage(10000, {locale: "fr-CA"}),
                    ).toBe("1\xA0000\xA0000\xA0%");
                    expect(
                      localization.formatPercentage(-10000, {locale: "fr-CA"}),
                    ).toBe("-1\xA0000\xA0000\xA0%");
                  },
                );
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
