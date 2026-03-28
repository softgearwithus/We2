const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
  'div',
  'a',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
]);

const URI_ATTRS = new Set(['href', 'src']);
const ALLOWED_ATTRS = new Set([
  'href',
  'src',
  'alt',
  'title',
  'target',
  'rel',
  'colspan',
  'rowspan',
]);

const ALLOWED_URI_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const hasDomParser =
  typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined';

const isSafeUri = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('/')) return true;

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return ALLOWED_URI_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const sanitizeRichHtml = (unsafeHtml: string) => {
  if (!unsafeHtml) return '';
  if (!hasDomParser) return escapeHtml(unsafeHtml);

  const parser = new window.DOMParser();
  const parsed = parser.parseFromString(unsafeHtml, 'text/html');
  const body = parsed.body;

  const sanitizeNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent || '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      return Array.from(element.childNodes).map(sanitizeNode).join('');
    }

    const attrs: string[] = [];
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (!ALLOWED_ATTRS.has(name)) continue;
      if (name.startsWith('on')) continue;

      if (URI_ATTRS.has(name) && !isSafeUri(value)) {
        continue;
      }

      if (name === 'target' && value !== '_blank') {
        continue;
      }

      attrs.push(`${name}="${escapeHtml(value)}"`);
    }

    if (tag === 'a') {
      const hasTargetBlank = attrs.some((attr) => attr === 'target="_blank"');
      const hasRel = attrs.some((attr) => attr.startsWith('rel='));
      if (hasTargetBlank && !hasRel) {
        attrs.push('rel="noopener noreferrer"');
      }
    }

    const sanitizedChildren = Array.from(element.childNodes)
      .map(sanitizeNode)
      .join('');
    const attrSegment = attrs.length ? ` ${attrs.join(' ')}` : '';

    return `<${tag}${attrSegment}>${sanitizedChildren}</${tag}>`;
  };

  return Array.from(body.childNodes).map(sanitizeNode).join('');
};
