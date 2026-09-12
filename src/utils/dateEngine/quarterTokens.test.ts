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

describe("Gregorian quarter tokens", () => {
	it("formats Q and QQ as numeric quarter values", () => {
		expect(formatPattern("Q", { gm: 1 })).toBe("1");
		expect(formatPattern("Q", { gm: 12 })).toBe("4");
		expect(formatPattern("QQ", { gm: 1 })).toBe("01");
		expect(formatPattern("QQ", { gm: 12 })).toBe("04");
	});

	it("formats QQQ and QQQQ as quarter labels", () => {
		expect(formatPattern("QQQ", { gm: 4 })).toBe("Q2");
		expect(formatPattern("QQQQ", { gm: 10 })).toBe("2nd quarter");
	});

	it("treats Gregorian quarter tokens as date fields", () => {
		expect(compilePattern("YYYY/QQ/ww").fields).toEqual(["gy", "quarter", "week"]);
	});
});

describe("Weekly path anchor visibility", () => {
	it.each([
		["jYYYY/ww", true],
		["jYYYY/jMM/ww", true],
		["jYYYY/jQQQQ/ww", true],
		["ww", false],
		["Weekly/ww", false],
	])("for %s returns %s", (path, expected) => {
		const builder = new NotePathBuilder(makePlugin(path));
		expect(builder.weeklyPathNeedsAnchor()).toBe(expected);
	});
});