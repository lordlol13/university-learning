"use client";
import { useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import { Check, Copy } from "lucide-react";
import type { CodeSample } from "@/types/lesson-engine";

export function CodeExample({ examples }: { examples: CodeSample[] }) {
  const [index, setIndex] = useState(0),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  const sample = examples[index],
    language =
      sample.language === "numpy" || sample.language === "pytorch"
        ? "python"
        : sample.language;
  const tokens = Prism.highlight(
    sample.code,
    Prism.languages[language],
    language,
  ).split("\n");
  return (
    <div className="code-example">
      <div className="code-toolbar">
        <div role="tablist" aria-label="Implementation language">
          {examples.map((example, i) => (
            <button
              key={example.language}
              role="tab"
              aria-selected={i === index}
              onClick={() => {
                setIndex(i);
                setCopied(false);
                setCopyError(false);
              }}
            >
              {example.label}
            </button>
          ))}
        </div>
        <button
          aria-label="Copy code"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(sample.code);
              setCopied(true);
              setCopyError(false);
            } catch {
              setCopyError(true);
            }
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre tabIndex={0} aria-label={`${sample.label} code`}>
        <code>
          {tokens.map((line, i) => (
            <span
              key={i}
              className={`code-line ${sample.highlightLines?.includes(i + 1) ? "highlighted" : ""}`}
            >
              <span className="line-number" aria-hidden="true">
                {i + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: line || " " }} />
            </span>
          ))}
        </code>
      </pre>
      <div className="code-caption" role="status">
        {copyError
          ? "Clipboard unavailable. Select the code above to copy it."
          : "Read & copy · Run this example in your own Python environment."}
      </div>
    </div>
  );
}
