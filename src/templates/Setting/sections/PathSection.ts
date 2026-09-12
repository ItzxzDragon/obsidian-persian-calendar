import type { SectionRenderer } from "src/types";
import NotePathBuilder from "src/services/NotePathBuilder";
import { addDropdown, addHeading, addPath } from "../controls";
import { NOTE_TYPES } from "../noteTypes";
import { Notice } from "obsidian";

export const renderPathSection: SectionRenderer = (ctx, containerEl) => {
	const { app, controller } = ctx;

	addHeading(controller, containerEl, "setting.sections.paths");

	for (const noteType of NOTE_TYPES) {
		if (noteType.id === "weekly") {
			const pathBuilder = new NotePathBuilder(controller.plugin);
			const anchorSetting = addDropdown(
				controller,
				containerEl,
				"",
				"",
				"weeklyPathAnchor",
				{
					start: "",
					end: "",
				},
			);

			let anchorVisible = pathBuilder.weeklyPathNeedsAnchor();

			const refreshAnchorVisibility = (showNotice = false) => {
				const nextVisible = pathBuilder.weeklyPathNeedsAnchor();
				if (nextVisible === anchorVisible) return;

				anchorVisible = nextVisible;
				anchorSetting.settingEl.style.display = nextVisible ? "flex" : "none";

				if (!nextVisible && showNotice) {
					new Notice(controller.plugin.setting.language === "fa" ? "تنظیمات مخفی!" : "Settings hidden!");
				}
			};

			controller.trackLocale(() => {
				const isFa = controller.plugin.setting.language === "fa";
				anchorSetting.setName(isFa ? "مبنای تاریخ مسیر هفته‌نوشت" : "Weekly path date anchor");
				anchorSetting.setDesc(
					isFa
						? "برای مسیرهای هفتگی دارای متغیر تاریخ، مشخص می‌کند تاریخ‌های مسیر از ابتدای هفته یا انتهای هفته گرفته شوند."
						: "When the weekly path contains date variables, choose whether they are resolved from the start or end of the week.",
				);

				const select = anchorSetting.controlEl.querySelector<HTMLSelectElement>("select");
				if (select) {
					select.options[0].textContent = isFa ? "ابتدای هفته" : "Start of week";
					select.options[1].textContent = isFa ? "انتهای هفته" : "End of week";
				}
			});

			anchorSetting.settingEl.style.display = anchorVisible ? "flex" : "none";

			addPath(
				app,
				controller,
				containerEl,
				noteType.pathNameKey,
				noteType.pathDescKey,
				noteType.pathKey,
				"folder",
				{ onBlur: () => refreshAnchorVisibility(true) },
			);
			continue;
		}

		addPath(
			app,
			controller,
			containerEl,
			noteType.pathNameKey,
			noteType.pathDescKey,
			noteType.pathKey,
			"folder",
		);
	}
};
