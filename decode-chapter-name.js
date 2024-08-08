// decodeChapter.js

const DECODE_VALUE = "@#%&;№%#&**#!@";

const decodeChapter = (name) => {
  if (!name) return { part: "", chapter: "", name: "" };
  const decodedValues = name.split(DECODE_VALUE);

  if (decodedValues.length === 3) {
    const [part, chapter, nameChapter] = decodedValues;

    return {
      part,
      chapter,
      name: nameChapter,
    };
  }

  if (decodedValues.length === 2) {
    const [part, chapter] = decodedValues;

    return {
      part,
      chapter,
      name: "",
    };
  }

  if (decodedValues.length === 1) {
    const [nameChapter] = decodedValues;

    return {
      part: "",
      chapter: "",
      name: nameChapter,
    };
  }

  return {
    part: "",
    chapter: "",
    name: "",
  };
};

const formatChapterName = (name) => {
  const { part, chapter, name: chapterName } = decodeChapter(name);
  const partValue = part ? `Том ${part}` : "";
  const chapterValue =
    typeof chapter === "string" && chapter.length > 0
      ? `Розділ ${chapter}${chapterName ? ":" : ""}`
      : "";
  const nameValue = chapterName ? `${chapterName}` : "";

  return [partValue, chapterValue, nameValue].filter((item) => item).join(" ");
};

module.exports = formatChapterName;
