import { describe, expect, it } from "vitest";
import NotePathBuilder from "src/services/NotePathBuilder";
import { compilePattern, formatPattern } from "src/utils/dateEngine";

const makePlugin = (weeklyNotesPath: string) =>
	({
		setting: {
			weeklyNotesPath,
			weeklyPathAnchor: "start",
			weekCalculation: "jalali-first-day-of-year",
		},
	} as never);

describe("Gregorian season tokens", () => {
	it("formats Q and QQ as numeric season values", () => {
		expect(formatPattern("Q", { gm: 1 })).toBe("1");
		expect(formatPattern("Q", { gm: 12 })).toBe("4");
		expect(formatPattern("QQ", { gm: 1 })).toBe("01");
		expect(formatPattern("QQ", { gm: 12 })).toBe("04");
	});

	it("formats QQQ as short season names", () => {
		expect(formatPattern("QQQ", { gm: 4 })).toBe("Sum");
		expect(formatPattern("QQQ", { gm: 10 })).toBe("Win");
	});

	it("formats QQQQ as full season names", () => {
		expect(formatPattern("QQQQ", { gm: 4 })).toBe("Summer");
		expect(formatPattern("QQQQ", { gm: 10 })).toBe("Winter");
	});

	it("treats Gregorian season tokens as date fields", () => {
		expect(compilePattern("YYYY/QQ/ww").fields).toEqual(["gy", "quarter", "week"]);
	});
});

describe("Weekly path anchor visibility", () => {
	it.each([
		["jYYYY/ww", true],
		["jYYYY/jMM/ww", true],
		["jYYYY/jQQQQ/ww", true],
		["YYYY/QQQQ/ww", true],
		["ww", false],
		["Weekly/ww", false],
	])("for %s returns %s", (path, expected) => {
		const builder = new NotePathBuilder(makePlugin(path));
		expect(builder.weeklyPathNeedsAnchor()).toBe(expected);
	});
});