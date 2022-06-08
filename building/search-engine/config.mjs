import headings from "../utils/headings.mjs";
export const searchingIndexConfig = {
  idField: "file",
  fields: ["title", "description", "tags", ...headings, "body"],
  storeFields: ["title", "file", "description", ...headings],
};
export default searchingIndexConfig;
