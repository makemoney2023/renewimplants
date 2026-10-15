import handler from "vinext/server/fetch-handler";
import { withLegacyRedirects } from "../../shared/legacy-redirects";
import { getRedirects } from "../src/profile/redirects";

export default withLegacyRedirects(handler, getRedirects());
