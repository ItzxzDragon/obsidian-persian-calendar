import { GREGORIAN_MONTHS_NAME } from "src/constants";

import type { TTokenDefinition, TLocale } from "src/types";
import { createNameToken, createNumericToken } from "./tokenFactories";

const GREGORIAN_QUARTERS_NAME: Record<TLocale, Record<number, string>> = {
	fa: {
		1: "سه‌ماهه اول",
		2: "سه‌ماهه دوم",
		3: "سه‌ماهه سوم",
		4: "سه‌ماهه چهارم",
	},
	en: {
		1: "1st quarter",
		2: "2nd quarter",
		3: "3rd quarter",
		4: "4th quarter",
	},
};

export const gregorianTokens: TTokenDefinition[] = [
	createNumericToken({ token: "YYYY", family: "gregorian", field: "gy", digits: 4, pad: true }),
	createNumericToken({
		token: "YY",
		family: "gregorian",
		field: "gy",
		digits: 2,
		pad: true,
		encode: (y) => ((y % 100) + 100) % 100,
	}),

	createNameToken({
		token: "MMMM",
		family: "gregorian",
		field: "gm",
		namesByLocale: GREGORIAN_MONTHS_NAME,
	}),
	createNameToken({
		token: "MMM",
		family: "gregorian",
		field: "gm",
		namesByLocale: GREGORIAN_MONTHS_NAME,
		abbreviate: true,
	}),
	createNumericToken({ token: "MM", family: "gregorian", field: "gm", digits: 2, pad: true }),
	createNumericToken({ token: "M", family: "gregorian", field: "gm", digits: 2, pad: false }),

	createNumericToken({ token: "DD", family: "gregorian", field: "gd", digits: 2, pad: true }),
	createNumericToken({ token: "D", family: "gregorian", field: "gd", digits: 2, pad: false }),

	createNumericToken({
		token: "Q",
		family: "gregorian",
		field: "quarter",
		digits: 1,
		pad: false,
	}),
	createNumericToken({
		token: "QQ",
		family: "gregorian",
		field: "quarter",
		digits: 2,
		pad: true,
	}),
	createNameToken({
		token: "QQQ",
		family: "gregorian",
		field: "quarter",
		namesByLocale: {
			fa: { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4" },
			en: { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4" },
		},
	}),
	createNameToken({
		token: "QQQQ",
		family: "gregorian",
		field: "quarter",
		namesByLocale: GREGORIAN_QUARTERS_NAME,
	}),
];