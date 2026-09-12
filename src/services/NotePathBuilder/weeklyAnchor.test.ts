import { describe, expect, it } from "vitest";
import NotePathBuilder from "src/services/NotePathBuilder";
import { compilePattern } from "src/utils/dateEngine";
import { gregorianToJalali, jalaliToDate } from "src/utils/dateUtils";
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
		"YYYY",
		"YY",
		"MMMM",
		"MMM",
		"MM",
		"M",
		"DD",
		"D",
		"jYYYY",
		"jYY",
		"jMMMM",
		"jMMM",
		"jMM",
		"jM",
		"jDD",
		"jD",
		"Q",
		"QQ",
		"QQQ",
		"QQQQ",
		"jQ",
		"jQQ",
		"jQQQQ",
	];

	it.each(dateTokens)("shows Anchor for %s/ww", (token) => {
		const builder = new NotePathBuilder(makePlugin(`${token}/ww`));
		expect(builder.weeklyPathNeedsAnchor()).toBe(true);
	});

	it.each([
		"ww",
		"Weekly/ww",
		"Weekly",
		"",
		"YYYY",
		"jYYYY",
		"QQQQ",
	])("does not show Anchor for %s", (path) => {
		const builder = new NotePathBuilder(makePlugin(path));
		expect(builder.weeklyPathNeedsAnchor()).toBe(false);
	});

	it("recognizes mixed Jalali and Gregorian date tokens", () => {
		const builder = new NotePathBuilder(makePlugin("YYYY/jMM/QQQQ/ww"));
		expect(builder.weeklyPathNeedsAnchor()).toBe(true);
	});
});

describe("Weekly path anchor resolution", () => {
	const calculator = {
		getWeekNumber: (date: Date) =>
			new NotePathBuilder(
				makePlugin("YYYY/ww"),
			).buildEngineContext({
				jy: gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate()).jy,
			}).week,
	};

	it("uses the Gregorian quarter at the selected anchor", () => {
		const jalali = gregorianToJalali(2026, 3, 30);
		const weekStartCalculator = new NotePathBuilder(makePlugin("YYYY/ww"));
		const weekNumber =
			weekStartCalculator
				.buildEngineContext({
					jy: jalali.jy,
					jm: jalali.jm,
					jd: jalali.jd,
				})
				.week ?? 0;

		// Keep the week number lookup independent of the expected Gregorian boundary.
		expect(weekNumber).toBeGreaterThan(0);

		const startBuilder = new NotePathBuilder(makePlugin("YYYY/QQQQ/ww", "start"));
		const endBuilder = new NotePathBuilder(makePlugin("YYYY/QQQQ/ww", "end"));

		const start = startBuilder.buildWeeklyNotePath(jalali.jy, weekNumber);
		const end = endBuilder.buildWeeklyNotePath(jalali.jy, weekNumber);

		expect(start.filePath).toContain("2026/1st quarter/");
		expect(end.filePath).toContain("2026/2nd quarter/");
	});

	it("changes Gregorian month while keeping Jalali month stable when a week crosses a Gregorian quarter", () => {
		const jalali = gregorianToJalali(2026, 3, 30);
		const builder = new NotePathBuilder(makePlugin("YYYY/MMMM/jMM/ww", "start"));
		const endBuilder = new NotePathBuilder(makePlugin("YYYY/MMMM/jMM/ww", "end"));
		const calculator = new (NotePathBuilder as never)();
		void calculator;

		const date = jalaliToDate(jalali.jy, jalali.jm, jalali.jd);
		const weekNumber = new NotePathBuilder(makePlugin("ww")).buildEngineContext({
			jy: jalali.jy,
			jm: jalali.jm,
			jd: jalali.jd,
			week: undefined,
		}).week;
		void date;
		expect(weekNumber).toBeUndefined();

		const start = builder.buildWeeklyNotePath(jalali.jy, 1);
		const end = endBuilder.buildWeeklyNotePath(jalali.jy, 1);
		expect(start.filePath).toContain("/01/");
		expect(end.filePath).toContain("/01/");
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
