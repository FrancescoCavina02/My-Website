/**
 * Convert [[wiki links]] to standard markdown links.
 * Used when no navigation context is available.
 */
export function wikiLinksToMarkdown(content: string, basePath: string = '/notes'): string {
  return content.replace(/\[\[(.*?)\]\]/g, (match, linkText) => {
    const trimmed = linkText.trim();
    return `[${trimmed}](${basePath}/${encodeURIComponent(trimmed)})`;
  });
}
