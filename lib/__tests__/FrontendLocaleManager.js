/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import FrontendLocaleManager from "../FrontendLocaleManager";
import moment from "moment";
import {oneLine} from "common-tags";

beforeAll(() => {
  // Polyfill webpack require.ensure.
  // See http://stackoverflow.com/a/33225242/564163
  if (typeof require.ensure !== "function") {
    require.ensure = (dependencies, callback) => callback(require);
  }

  console.log("removing intl:", global.Intl);

  global.Intl = undefined;
  console.log("removing intl ctnd:", global.Intl);
});

afterAll(() => (global.Intl = undefined));

describe(
  "Frontend locale manager",
  () => {
    const localeManager = new FrontendLocaleManager();

    describe(
      "with default options",
      () => {
        it(
          "should return the language key name, without the namespace",
          () => {
            expect(localeManager.getLanguageKey("general::test")).toBe("test");
            expect(localeManager.getLanguageKey("testing::hey")).toBe("hey");
          },
        );

        it(
          "should expose a utility to get information about a time zone",
          () => expect(localeManager.getTimezoneData()).toEqual({
            abbreviation: "EST",
            offset: -5,
            offsetRaw: -300,
            offsetString: "-5",
            timezone: "-5\xA0(EST)",
          }),
        );

        it(
          "should expose the underlying Moment.js factory",
          () => expect(localeManager.getNewMoment()).toBeInstanceOf(moment),
        );

        it(
          "should format dates properly",
          () => {
            expect(
              localeManager.formatDate(),
            ).toMatch(new RegExp(oneLine`
              ^[A-Z][a-z]+
               [0-9]{1,2},
               [0-9]{4}
               [0-9]{1,2}:[0-9]{1,2}
               [AP]M
            `));
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
            )).toBe("January 30, 2017 3:25 PM\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380+03:00"),
            )).toBe("January 30, 2017 12:25 PM\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {output: "object"},
            )).toEqual({
              date: "January 30, 2017 3:25 PM",
              timezone: "EST",
            });
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {format: "LT"},
            )).toBe("3:25 PM\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {format: "LTS"},
            )).toBe("3:25:41 PM\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {format: "LLLL"},
            )).toBe("Monday, January 30, 2017 3:25 PM\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {format: "LLL"},
            )).toBe("January 30, 2017 3:25 PM\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {format: "LL"},
            )).toBe("January 30, 2017");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {format: "L"},
            )).toBe("01/30/2017");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380+03:00"),
              {timezone: true},
            )).toBe("January 30, 2017 12:25 PM\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {timezone: false},
            )).toBe("January 30, 2017 3:25 PM");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {timezone: "Europe/Vienna"},
            )).toBe("January 30, 2017 9:25 PM\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LT",
                timezone: "Europe/Vienna",
              },
            )).toBe("9:25 PM\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LTS",
                timezone: "Europe/Vienna",
              },
            )).toBe("9:25:41 PM\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LLLL",
                timezone: "Europe/Vienna",
              },
            )).toBe("Monday, January 30, 2017 9:25 PM\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LLL",
                timezone: "Europe/Vienna",
              },
            )).toBe("January 30, 2017 9:25 PM\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LL",
                timezone: "Europe/Vienna",
              },
            )).toBe("January 30, 2017");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "L",
                timezone: "Europe/Vienna",
              },
            )).toBe("01/30/2017");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380+03:00"),
            )).toBe("January 30, 2017 12:25 PM\xA0EST");
          },
        );

        it(
          "should give relevant information for time zones",
          () => {
            expect(localeManager.getTimezoneData(
              new Date("2017-01-30T20:25:41.380Z"),
            )).toEqual({
              abbreviation: "EST",
              offset: -5,
              offsetRaw: -300,
              offsetString: "-5",
              timezone: "-5\xA0(EST)",
            });
            expect(localeManager.getTimezoneData(
              new Date("2017-01-30T20:25:41.380Z"),
              {timezone: "Europe/Vienna"},
            )).toEqual({
              abbreviation: "CET",
              offset: 1,
              offsetRaw: 60,
              offsetString: "+1",
              timezone: "+1\xA0(CET)",
            });
          },
        );

        it(
          "should format file sizes properly",
          () => {
            expect(
              localeManager.formatFilesize(123456.7890),
            ).toBe("120.56\xA0KiB");
            expect(
              localeManager.formatFilesize(123123456.7890),
            ).toBe("117.42\xA0MiB");
            expect(
              localeManager.formatFilesize(123123123123123456.7890),
            ).toBe("109.36\xA0PiB");
            expect(localeManager.formatFilesize(
              123456.7890,
              {standard: "jedec"},
            )).toBe("120.56\xA0KB");
            expect(
              localeManager.formatFilesize(123456.7890, {bits: true}),
            ).toBe("964.51\xA0Kib");
            expect(
              localeManager.formatFilesize(123456.7890, {unix: true}),
            ).toBe("120.6\xA0Ki");
            expect(localeManager.formatFilesize(
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
              localeManager.formatMoney(123456.7890),
            ).toBe("$123,456.79");
            expect(
              localeManager.formatMoney(-123456.7890),
            ).toBe("-$123,456.79");
            expect(
              localeManager.formatMoney(123456.7890, {currency: "CAD"}),
            ).toBe("CA$123,456.79");
            expect(
              localeManager.formatMoney(-123456.7890, {currency: "CAD"}),
            ).toBe("-CA$123,456.79");
          },
        );

        it(
          "should format numbers properly",
          () => {
            expect(
              localeManager.formatNumber(123456.7890),
            ).toBe("123,457");
            expect(
              localeManager.formatNumber(-123456.7890),
            ).toBe("-123,457");
            expect(
              localeManager.formatNumber(
                123456.7890,
                {maximumFractionDigits: 2},
              ),
            ).toBe("123,456.79");
            expect(
              localeManager.formatNumber(
                -123456.7890,
                {maximumFractionDigits: 2},
              ),
            ).toBe("-123,456.79");

            // Percentage formatting.
            expect(localeManager.formatPercentage(0.11)).toBe("11%");
            expect(localeManager.formatPercentage(1)).toBe("100%");
            expect(localeManager.formatPercentage(1.10)).toBe("110%");
            expect(
              localeManager.formatPercentage(10000),
            ).toBe("1,000,000%");
            expect(
              localeManager.formatPercentage(-10000),
            ).toBe("-1,000,000%");
          },
        );
      },
    );

    describe(
      "with custom locales",
      () => {
        it(
          "should format dates properly",
          () => {
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {locale: "fr-CA"},
            )).toBe("30 janvier 2017 15:25\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380+03:00"),
              {locale: "fr-CA"},
            )).toBe("30 janvier 2017 12:25\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LT",
                locale: "fr-CA",
              },
            )).toBe("15:25\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LTS",
                locale: "fr-CA",
              },
            )).toBe("15:25:41\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LLLL",
                locale: "fr-CA",
              },
            )).toBe("lundi 30 janvier 2017 15:25\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LLL",
                locale: "fr-CA",
              },
            )).toBe("30 janvier 2017 15:25\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LL",
                locale: "fr-CA",
              },
            )).toBe("30 janvier 2017");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "L",
                locale: "fr-CA",
              },
            )).toBe("2017-01-30");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380+03:00"),
              {
                locale: "fr-CA",
                timezone: true,
              },
            )).toBe("30 janvier 2017 12:25\xA0EST");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                locale: "fr-CA",
                timezone: false,
              },
            )).toBe("30 janvier 2017 15:25");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                locale: "fr-CA",
                timezone: "Europe/Vienna",
              },
            )).toBe("30 janvier 2017 21:25\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LT",
                locale: "fr-CA",
                timezone: "Europe/Vienna",
              },
            )).toBe("21:25\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LTS",
                locale: "fr-CA",
                timezone: "Europe/Vienna",
              },
            )).toBe("21:25:41\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LLLL",
                locale: "fr-CA",
                timezone: "Europe/Vienna",
              },
            )).toBe("lundi 30 janvier 2017 21:25\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LLL",
                locale: "fr-CA",
                timezone: "Europe/Vienna",
              },
            )).toBe("30 janvier 2017 21:25\xA0CET");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "LL",
                locale: "fr-CA",
                timezone: "Europe/Vienna",
              },
            )).toBe("30 janvier 2017");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                format: "L",
                locale: "fr-CA",
                timezone: "Europe/Vienna",
              },
            )).toBe("2017-01-30");
            expect(localeManager.formatDate(
              new Date("2017-01-30T20:25:41.380+03:00"),
              {locale: "fr-CA"},
            )).toBe("30 janvier 2017 12:25\xA0EST");
          },
        );

        it(
          "should give relevant information for time zones",
          () => {
            expect(localeManager.getTimezoneData()).toEqual({
              abbreviation: "EST",
              offset: -5,
              offsetRaw: -300,
              offsetString: "-5",
              timezone: "-5\xA0(EST)",
            });
            expect(localeManager.getTimezoneData(
              new Date("2017-01-30T20:25:41.380Z"),
              {locale: "fr-CA"},
            )).toEqual({
              abbreviation: "EST",
              offset: -5,
              offsetRaw: -300,
              offsetString: "-5",
              timezone: "-5\xA0(EST)",
            });
            expect(localeManager.getTimezoneData(
              new Date("2017-01-30T20:25:41.380Z"),
              {
                locale: "fr-CA",
                timezone: "Europe/Vienna",
              },
            )).toEqual({
              abbreviation: "CET",
              offset: 1,
              offsetRaw: 60,
              offsetString: "+1",
              timezone: "+1\xA0(CET)",
            });
          },
        );

        it(
          "should format file sizes properly",
          () => {
            expect(localeManager.formatFilesize(
              123456.7890,
              {locale: "fr-CA"},
            )).toBe("120,56\xA0KiB");
            expect(localeManager.formatFilesize(
              123456.7890,
              {
                locale: "fr-CA",
                standard: "jedec",
              },
            )).toBe("120,56\xA0KB");
            expect(localeManager.formatFilesize(
              123456.7890,
              {
                bits: true,
                locale: "fr-CA",
              },
            ),
            ).toBe("964,51\xA0Kib");
            expect(localeManager.formatFilesize(
              123456.7890,
              {
                locale: "fr-CA",
                unix: true,
              },
            )).toBe("120,6\xA0Ki");
            expect(localeManager.formatFilesize(
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
              localeManager.formatMoney(123456.7890, {locale: "en-CA"}),
            ).toBe("US$123,456.79");
            expect(
              localeManager.formatMoney(-123456.7890, {locale: "en-CA"}),
            ).toBe("-US$123,456.79");
            expect(localeManager.formatMoney(
              123456.7890,
              {
                currency: "JPY",
                locale: "en-CA",
              },
            )).toBe("JP¥123,457");
            expect(localeManager.formatMoney(
              -123456.7890,
              {
                currency: "JPY",
                locale: "en-CA",
              },
            )).toBe("-JP¥123,457");
            expect(localeManager.formatMoney(
              123456.7890,
              {
                currency: "EUR",
                locale: "fr-CA",
              },
            )).toBe("123\xA0456,79\xA0€");
            expect(localeManager.formatMoney(
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
              localeManager.formatNumber(123456.7890, {locale: "fr-CA"}),
            ).toBe("123\xA0457");
            expect(localeManager.formatNumber(
              -123456.7890,
              {locale: "fr-CA"},
            )).toBe("-123\xA0457");
            expect(
              localeManager.formatNumber(
                -123456.7890,
                {
                  locale: "fr-CA",
                  maximumFractionDigits: 2,
                },
              ),
            ).toBe("-123\xA0456,79");

            // Percentage formatting.
            expect(
              localeManager.formatPercentage(0.11, {locale: "fr-CA"}),
            ).toBe("11\xA0%");
            expect(
              localeManager.formatPercentage(1, {locale: "fr-CA"}),
            ).toBe("100\xA0%");
            expect(
              localeManager.formatPercentage(1.10, {locale: "fr-CA"}),
            ).toBe("110\xA0%");
            expect(
              localeManager.formatPercentage(10000, {locale: "fr-CA"}),
            ).toBe("1\xA0000\xA0000\xA0%");
            expect(
              localeManager.formatPercentage(-10000, {locale: "fr-CA"}),
            ).toBe("-1\xA0000\xA0000\xA0%");
          },
        );
      },
    );
  },
);
