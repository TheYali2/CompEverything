
export const minifyCode = async (file: File): Promise<Blob> => {
  const text = await file.text();
  let minified = text;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  try {
    if (ext === 'js' || ext === 'javascript' || ext === 'mjs') {
      minified = text
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\s*([=+\-*/{}();,:])\s*/g, '$1');
    } else if (ext === 'css') {
      minified = text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\s*([:;{}])\s*/g, '$1')
        .replace(/;}/g, '}');
    } else if (ext === 'html' || ext === 'htm') {
      minified = text
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '');
    } else if (ext === 'json') {
      minified = JSON.stringify(JSON.parse(text));
    } else if (ext === 'xml' || ext === 'svg') {
      minified = text
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .replace(/[\r\n]/g, '');
    }
  } catch (e) {
    console.error("Minification failed", e);
    return file;
  }

  let mimeType = file.type;
  if (ext === 'json') mimeType = 'application/json';
  if (ext === 'svg') mimeType = 'image/svg+xml';
  if (ext === 'xml') mimeType = 'application/xml';

  return new Blob([minified], { type: mimeType });
};
