import type { LocaleResourcesType } from "@/locales/list";
import I18nCommon from "./common";
import I18nCollections from "./pages/collections";
import I18nLayout from "./layout";
import I18nNavigation from "./navigation";
import I18nPages from "./pages/sys_page";
import I18nRecords from "./pages/records";
import I18nSettings from "./pages/settings";

const Locale: LocaleResourcesType = {
    common: I18nCommon,
    collections: I18nCollections,
    layout: I18nLayout,
    navigation: I18nNavigation,
    pages: I18nPages,
    records: I18nRecords,
    settings: I18nSettings,
};

export default Locale;
