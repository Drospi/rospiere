import JSZip from 'jszip';

export interface EpubChapter {
  id: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
}

export interface ParsedEpub {
  id: string;
  title: string;
  author: string;
  language: string;
  description: string;
  coverBase64?: string;
  fileSizeText: string;
  chapters: EpubChapter[];
  totalWords: number;
}

export async function parseEpubFromBuffer(buffer: ArrayBuffer | Uint8Array, fileName: string): Promise<ParsedEpub> {
  const zip = await JSZip.loadAsync(buffer);
  
  // 1. Locate OPF file
  let opfPath = 'content.opf';
  const containerXml = zip.file('META-INF/container.xml');
  if (containerXml) {
    const containerStr = await containerXml.async('string');
    const match = containerStr.match(/full-path="([^"]+)"/);
    if (match && match[1]) {
      opfPath = match[1];
    }
  }

  let opfFile = zip.file(opfPath);
  if (!opfFile) {
    // Search any .opf
    const opfKey = Object.keys(zip.files).find((k) => k.endsWith('.opf'));
    if (opfKey) {
      opfFile = zip.file(opfKey);
      opfPath = opfKey;
    }
  }

  let title = fileName.replace(/\.epub$/i, '');
  let author = 'Autor Desconocido';
  let language = 'es';
  let description = 'Tomo importado en formato EPUB estándar.';
  let coverBase64: string | undefined = undefined;

  const basePath = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  if (opfFile) {
    const opfContent = await opfFile.async('string');

    // Title
    const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // Author
    const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].trim();
    }

    // Language
    const langMatch = opfContent.match(/<dc:language[^>]*>([^<]+)<\/dc:language>/i);
    if (langMatch && langMatch[1]) {
      language = langMatch[1].trim();
    }

    // Description
    const descMatch = opfContent.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].trim();
    }

    // Cover image search
    const coverMatch = opfContent.match(/href="([^"]+\.(?:jpg|jpeg|png|webp))"/i);
    if (coverMatch && coverMatch[1]) {
      const coverFileName = basePath + coverMatch[1];
      const coverEntry = zip.file(coverFileName) || zip.file(coverMatch[1]);
      if (coverEntry) {
        const base64Data = await coverEntry.async('base64');
        const mime = coverFileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
        coverBase64 = `data:${mime};base64,${base64Data}`;
      }
    }
  }

  // Fallback cover search in zip
  if (!coverBase64) {
    const imageKey = Object.keys(zip.files).find((k) => /\.(jpg|jpeg|png)$/i.test(k));
    if (imageKey) {
      const entry = zip.file(imageKey);
      if (entry) {
        const base64Data = await entry.async('base64');
        const mime = imageKey.endsWith('.png') ? 'image/png' : 'image/jpeg';
        coverBase64 = `data:${mime};base64,${base64Data}`;
      }
    }
  }

  // Extract chapters from html/xhtml files
  const htmlKeys = Object.keys(zip.files)
    .filter((k) => /\.(html|xhtml|htm)$/i.test(k) && !k.includes('toc') && !k.includes('cover'))
    .sort();

  const chapters: EpubChapter[] = [];
  let totalWords = 0;

  for (let i = 0; i < htmlKeys.length; i++) {
    const key = htmlKeys[i];
    const file = zip.file(key);
    if (!file) continue;

    const rawHtml = await file.async('string');
    
    // Extract title if present in h1/h2/title
    let chapterTitle = `Capítulo ${i + 1}`;
    const hMatch = rawHtml.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i) || rawHtml.match(/<p class="[^"]*title[^"]*">(.*?)<\/p>/i);
    if (hMatch && hMatch[1]) {
      const cleanH = hMatch[1].replace(/<[^>]+>/g, '').trim();
      if (cleanH.length > 2 && cleanH.length < 120) {
        chapterTitle = cleanH;
      }
    }

    // Split paragraphs
    const pMatches = rawHtml.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
    const paragraphs: string[] = [];

    for (const p of pMatches) {
      const cleanText = p
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();

      if (cleanText.length > 15) {
        paragraphs.push(cleanText);
        totalWords += cleanText.split(/\s+/).length;
      }
    }

    if (paragraphs.length > 0) {
      chapters.push({
        id: `ch-${i + 1}`,
        title: chapterTitle,
        subtitle: `Sección ${i + 1}`,
        paragraphs,
      });
    }
  }

  const sizeKb = Math.round(buffer.byteLength / 1024);
  const fileSizeText = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    author,
    language,
    description,
    coverBase64,
    fileSizeText,
    chapters,
    totalWords,
  };
}
