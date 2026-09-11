import type { SectionRenderer } from "src/types";
import NotePathBuilder from "src/services/NotePathBuilder";
import { addDropdown, addHeading, addPath } from "../controls";
import { NOTE_TYPES } from "../noteTypes";

export const renderPathSection: SectionRenderer = (ctx, containerEl) => {
	const { app, controller } = ctx;

	addHeading(controller, containerEl, "setting.sections.paths");

	for (const noteType of NOTE_TYPES) {
		addPath(
			app,
			controller,
			containerEl,
			noteType.pathNameKey,
			noteType.pathDescKey,
			noteType.pathKey,
			"folder",
		);

		if (noteType.id === "weekly") {
			const pathBuilder = new NotePathBuilder(controller.plugin);
			if (pathBuilder.weeklyPathNeedsAnchor()) {
				const isFa = controller.plugin.setting.language === "fa";
				addDropdown(
					controller,
					containerEl,
					isFa ? "مبنای تاریخ مسیر هفته‌نوشت" : "Weekly path date anchor",
					isFa
						? "برای مسیرهای هفتگی دارای متغیر تاریخ، مشخص می‌کند تاریخ‌های مسیر از ابتدای هفته یا انتهای هفته گرفته شوند."
						: "When the weekly path contains date variables, choose whether they are resolved from the start or end of the week.",
					"weeklyPathAnchor",
					{
						start: isFa ? "ابتدای هفته" : "Start of week",
						end: isFa ? "انتهای هفته" : "End of week",
					},
				);
			}
		}
	}
};
