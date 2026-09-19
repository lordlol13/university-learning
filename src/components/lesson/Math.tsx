import { memo } from "react";
import katex from "katex";

export const MathFormula = memo(function MathFormula({
  latex,
  display = false,
}: {
  latex: string;
  display?: boolean;
}) {
  const html = katex.renderToString(latex, {
    displayMode: display,
    throwOnError: false,
    trust: false,
    output: "htmlAndMathml",
    maxExpand: 1000,
  });
  return (
    <span
      className={display ? "lesson-math display-math" : "lesson-math"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\$[^$]+\$)/g)
        .map((part, index) =>
          part.startsWith("$") && part.endsWith("$") ? (
            <MathFormula key={index} latex={part.slice(1, -1)} />
          ) : (
            part
          ),
        )}
    </>
  );
}
