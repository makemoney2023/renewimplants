/** Clinic canonical paths keep the WordPress trailing slash. */
export const QUIZ_PATH = "/implant-candidate-quiz/";
export const QUIZ_THANK_YOU_PATH = "/implant-candidate-quiz/thank-you/";

export function isQuizRoute(pathname: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return path === QUIZ_PATH || path.startsWith(QUIZ_PATH);
}

/** Home and the clinic's implant page. */
export function showsQuizCta(path: string) {
  const bare = path.replace(/\/$/, "") || "/";
  return bare === "/" || bare === "/services/dental-implants" || bare === "/implants" || bare.startsWith("/service/dental-implants");
}
