"use client";

import DOMPurify from "isomorphic-dompurify";

/** Longest text an `<h3>` can hold and still read as a heading — past this
 *  it's a sentence the admin editor happened to format as a heading. */
const MAX_HEADING_LENGTH = 60;

/** Sanitizes admin-authored HTML (terms, privacy) and repairs what the
 *  dashboard's rich-text editor tends to produce: whole paragraphs and even
 *  lists wrapped in `<h3>`, empty `<h3>&nbsp;</h3>` spacers and `<p><br></p>`
 *  blank lines. Without this, every sentence renders as a yellow heading. */
function normalizeHtml(html: string): string {
  const fragment = DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true });
  const doc = fragment.ownerDocument;

  fragment.querySelectorAll("h3").forEach((h3) => {
    const text = (h3.textContent ?? "").replace(/ /g, " ").trim();
    if (!text) {
      h3.remove();
      return;
    }
    const hasBlocks = h3.querySelector("ol, ul, p, div") !== null;
    if (!hasBlocks && text.length <= MAX_HEADING_LENGTH) return;
    const replacement = doc.createElement(hasBlocks ? "div" : "p");
    while (h3.firstChild) replacement.appendChild(h3.firstChild);
    h3.replaceWith(replacement);
  });

  fragment.querySelectorAll("p").forEach((p) => {
    const text = (p.textContent ?? "").replace(/ /g, " ").trim();
    if (!text && !p.querySelector("img")) p.remove();
  });

  const container = doc.createElement("div");
  container.appendChild(fragment);
  return container.innerHTML;
}

export default function RichContent({ html }: { html: string }) {
  return (
    <div
      className="[&_a]:text-glace-yellow [&_a]:underline-offset-2 [&_a]:hover:underline [&_h3]:mt-7 [&_h3]:first:mt-0 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-glace-yellow [&_h3]:text-[17px] [&_p]:mt-3 [&_p]:first:mt-0 [&_div]:mt-3 [&_div]:first:mt-0 [&_ul]:mt-2 [&_ul]:space-y-2 [&_ul]:ps-5 [&_ul]:list-disc [&_ol]:mt-3 [&_ol]:space-y-2.5 [&_ol]:ps-5 [&_ol]:list-decimal [&_li::marker]:text-glace-yellow [&_strong]:font-bold [&_strong]:text-white [&_li>strong:first-child]:text-glace-yellow text-white/85 text-[15px] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: normalizeHtml(html) }}
    />
  );
}
