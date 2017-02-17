/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import getCommonI18nextConfiguration from "../common";

describe(
  "Common i18next configuration",
  () => it(
    "should return a sensible default",
    () => expect(getCommonI18nextConfiguration()).toMatchObject({}),
  ),
);
