import { describe, expect, it } from "vitest";
import NotePathBuilder from "src/services/NotePathBuilder";
import { compilePattern } from "src/utils/dateEngine";
import { getWeekStartCalculator, gregorianToJalali, jalaliToDate } from "src/utils/dateUtils";
import type { TSetting } from "src/types";

const makePlugin = (weeklyNotesPath: string, weeklyPathAnchor: "start" | "end" = "start") =>
	({
		setting: {
			weeklyNotesPath,
			weeklyPathAnchor,
			weekCalculation: "jalali-first-day-of-year",
		} as Pick<TSetting, "weeklyNotesPath" | "weeklyPathAnchor" | "weekCalculation">,
	} as never);

describe("Weekly path anchor visibility", () => {
	const dateTokens = [
		"YYYY", "YY", "MMMM", "MMM", "MM", "M", "DD", "D",
		"jYYYY", "jYY", "jMMMM", "jMMM", "jMM", "jM", "jDD", "jD",
		"Q", "QQ", "QQQ", "QQQQ", "jQ", "jQQ", "jQQQQ",
	];

	it.each(dateTokens)("shows Anchor for %s/ww", (token) => {
		const builder = new NotePathBuilder(makePlugin(`${token}/ww`));
		expect(builder.weeklyPathNeedsAnchor()).toBe(true);
	});

	it.each(["ww", "Weekly/ww", "Weekly", "", "YYYY", "jYYYY", "QQQQ"])(
		"does not show Anchor for %s",
		(path) => {
			const builder = new NotePathBuilder(makePlugin(path));
			expect(builder.weeklyPathNeedsAnchor()).toBe(false);
		},
	);

	it("recognizes mixed Jalali and Gregorian date tokens", () => {
		const builder = new NotePathBuilder(makePlugin("YYYY/jMM/QQQQ/ww"));
		expect(builder.weeklyPathNeedsAnchor()).toBe(true);
	});
});

describe("Weekly path anchor resolution", () => {
	const calculator = getWeekStartCalculator("jalali-first-day-of-year");

	it("uses the Gregorian quarter at the selected anchor", () => {
		// 2026-03-30 is in Q1, while the same Saturday-based week ends in April/Q2.
		const jalali = gregorianToJalali(2026, 3, 30);
		const { jy: weekYear, weekNumber } = calculator.getWeekNumber(
			jalaliToDate(jalali.jy, jalali.jm, jalali.jd),
		);

		const start = new NotePathBuilder(makePlugin("YYYY/QQQQ/ww", "start")).buildWeeklyNotePath(
			weekYear,
			weekNumber,
		);
		const end = new NotePathBuilder(makePlugin("YYYY/QQQQ/ww", "end")).buildWeeklyNotePath(
			weekYear,
			weekNumber,
		);

		expect(start.filePath).toContain("2026/1st quarter/");
		expect(end.filePath).toContain("2026/2nd quarter/");
	});

	it("resolves Gregorian month and Jalali month from the selected anchor", () => {
		const jalali = gregorianToJalali(2026, 3, 30);
		const { jy: weekYear, weekNumber } = calculator.getWeekNumber(
			jalaliToDate(jalali.jy, jalali.jm, jalali.jd),
		);

		const start = new NotePathBuilder(makePlugin("YYYY/MMMM/jMM/ww", "start")).buildWeeklyNotePath(
			weekYear,
			weekNumber,
		);
		const end = new NotePathBuilder(makePlugin("YYYY/MMMM/jMM/ww", "end")).buildWeeklyNotePath(
			weekYear,
			weekNumber,
		);

		expect(start.filePath).toContain("2026/March/01/");
		expect(end.filePath).toContain("2026/April/01/");
	});

	it("resolves mixed Jalali and Gregorian tokens for both anchors", () => {
		const jalali = gregorianToJalali(2026, 3, 30);
		const { jy: weekYear, weekNumber } = calculator.getWeekNumber(
			jalaliToDate(jalali.jy, jalali.jm, jalali.jd),
		);

		const start = new NotePathBuilder(makePlugin("YYYY/jMM/QQ/ww", "start")).buildWeeklyNotePath(
			weekYear,
			weekNumber,
		);
		const end = new NotePathBuilder(makePlugin("YYYY/jMM/QQ/ww", "end")).buildWeeklyNotePath(
			weekYear,
			weekNumber,
		);

		expect(start.filePath).toContain("2026/01/01/");
		expect(end.filePath).toContain("2026/01/01/");
	});
});

describe("Weekly path anchor pattern fields", () => {
	it.each([
		["YYYY/ww", ["gy", "week"]],
		["MMMM/ww", ["gm", "week"]],
		["QQQQ/ww", ["quarter", "week"]],
		["jYYYY/ww", ["jy", "week"]],
		["jMMMM/ww", ["jm", "week"]],
		["jQQQQ/ww", ["season", "week"]],
		["YYYY/jMM/QQ/ww", ["gy", "jm", "quarter", "week"]],
	])("compiles %s into the expected fields", (pattern, fields) => {
		expect(compilePattern(pattern).fields).toEqual(fields);
	});
});
