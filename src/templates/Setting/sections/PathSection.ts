import { Notice, Setting } from "obsidian";
import NotePathBuilder from "src/services/NotePathBuilder";
import type { SectionRenderer } from "src/types";
import { addHeading, addPath } from "../controls";
import { NOTE_TYPES } from "../noteTypes";

export const renderPathSection: SectionRenderer = (ctx, containerEl) => {
	const { app, controller } = ctx;

	addHeading(controller, containerEl, "setting.sections.paths");

	for (const noteType of NOTE_TYPES) {
		if (noteType.id !== "weekly") {
			addPath(
				app,
				controller,
				containerEl,
				noteType.pathNameKey,
				noteType.pathDescKey,
				noteType.pathKey,
				"folder",
			);
			continue;
		}

		const pathBuilder = new NotePathBuilder(controller.plugin);
		let anchorVisible = pathBuilder.weeklyPathNeedsAnchor();
		let anchorSetting: Setting;

		const refreshAnchorText = () => {
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
		};

		const refreshAnchorVisibility = () => {
			const nextVisible = pathBuilder.weeklyPathNeedsAnchor();
			if (nextVisible === anchorVisible) return;

			anchorVisible = nextVisible;
			anchorSetting.settingEl.style.display = nextVisible ? "flex" : "none";

			if (nextVisible) {
				new Notice(controller.plugin.setting.language === "fa" ? "واقعاً این همه پوشه لازمه؟" : "Do we really need this many folders?");
			}
		};

		addPath(
			app,
			controller,
			containerEl,
			noteType.pathNameKey,
			noteType.pathDescKey,
			noteType.pathKey,
			"folder",
			{ onBlur: refreshAnchorVisibility },
		);

		anchorSetting = new Setting(containerEl).addDropdown((dropdown) => {
			dropdown.addOption("start", "");
			dropdown.addOption("end", "");
			dropdown.setValue(controller.get("weeklyPathAnchor") ?? "start").onChange(async (value) => {
				await controller.set("weeklyPathAnchor", value as "start" | "end");
			});
		});

		controller.trackLocale(refreshAnchorText);
		refreshAnchorText();
		anchorSetting.settingEl.style.display = anchorVisible ? "flex" : "none";
	}
};
