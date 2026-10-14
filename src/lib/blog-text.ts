/** Heading ids shared by the server loader and the client MDX components.
 *  This file must stay free of Node built-ins. Importing it from a client
 *  component is safe; importing `blog.ts` is not (`process` is missing in the browser).
 */
export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
