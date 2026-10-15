import pagesJson from "../../content/pages.json";
import siteJson from "../../content/site.json";
import { createCatalog } from "@shell/lib/catalog";
import type { ClinicPage, ClinicSite } from "@shell/types";

export const site = siteJson as ClinicSite;
export const pages = pagesJson as ClinicPage[];
export const catalog = createCatalog(site, pages);
