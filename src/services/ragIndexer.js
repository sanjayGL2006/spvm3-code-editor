/**
 * SPVM3 Local Workspace RAG & Indexing Engine
 * Creates file summaries, symbol indexes (functions, classes, imports) and provides
 * fast local context retrieval for the AI Agent without network calls or neural training.
 */

export class LocalRAGIndexer {
  constructor() {
    this.index = new Map(); // path -> file metadata & symbols
    this.projectSummary = null;
    this.isIndexing = false;
  }

  async scanWorkspace(tree) {
    this.isIndexing = true;
    const fileList = [];

    function collectFiles(nodes) {
      for (const node of nodes) {
        if (node.type === 'file') {
          fileList.push(node);
        } else if (node.children) {
          collectFiles(node.children);
        }
      }
    }

    collectFiles(tree || []);

    const languagesFound = new Set();
    let totalFiles = fileList.length;

    for (const file of fileList.slice(0, 150)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext) languagesFound.add(ext);

      // Simple symbol extractor
      try {
        if (window.spvm3) {
          const content = await window.spvm3.readFile(file.path);
          const symbols = this.extractSymbols(content, ext);
          this.index.set(file.path, {
            name: file.name,
            path: file.path,
            ext,
            symbols,
            contentSnippet: content.slice(0, 500)
          });
        }
      } catch {
        // ignore unreadable files
      }
    }

    this.projectSummary = {
      totalFiles,
      indexedFiles: this.index.size,
      languages: Array.from(languagesFound),
      lastIndexed: new Date().toLocaleTimeString()
    };

    this.isIndexing = false;
    return this.projectSummary;
  }

  extractSymbols(content, ext) {
    const symbols = [];
    if (!content) return symbols;

    // JavaScript / React / TypeScript
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
      const funcMatches = content.matchAll(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|class\s+(\w+)|export\s+(?:default\s+)?function\s+(\w+))/g);
      for (const match of funcMatches) {
        const name = match[1] || match[2] || match[3] || match[4];
        if (name) symbols.push({ type: match[3] ? 'class' : 'function', name });
      }
    }
    // Python
    else if (['py', 'pyw'].includes(ext)) {
      const defMatches = content.matchAll(/def\s+(\w+)\s*\(/g);
      for (const match of defMatches) {
        symbols.push({ type: 'function', name: match[1] });
      }
      const classMatches = content.matchAll(/class\s+(\w+)\s*[\(:]/g);
      for (const match of classMatches) {
        symbols.push({ type: 'class', name: match[1] });
      }
    }
    // Java & C#
    else if (['java', 'cs'].includes(ext)) {
      const classMatches = content.matchAll(/(?:public|private|protected|internal|static)?\s*(?:class|interface|enum|record)\s+(\w+)/g);
      for (const match of classMatches) {
        symbols.push({ type: 'class', name: match[1] });
      }
      const methodMatches = content.matchAll(/(?:public|private|protected|static|async|override|virtual)\s+[\w<>,\[\]]+\s+(\w+)\s*\(/g);
      for (const match of methodMatches) {
        if (!['if', 'for', 'while', 'switch', 'catch'].includes(match[1])) {
          symbols.push({ type: 'method', name: match[1] });
        }
      }
    }
    // C / C++
    else if (['c', 'cpp', 'h', 'hpp', 'cc', 'cxx'].includes(ext)) {
      const cFuncs = content.matchAll(/\b(?:int|void|char|float|double|long|auto|bool|size_t|std::\w+)\s+(\w+)\s*\([^)]*\)\s*\{/g);
      for (const match of cFuncs) {
        symbols.push({ type: 'function', name: match[1] });
      }
      const structMatches = content.matchAll(/(?:struct|class|enum)\s+(\w+)/g);
      for (const match of structMatches) {
        symbols.push({ type: 'struct', name: match[1] });
      }
    }
    // HTML / HTM
    else if (['html', 'htm', 'svg'].includes(ext)) {
      const idMatches = content.matchAll(/id=["']([^"']+)["']/g);
      for (const match of idMatches) {
        symbols.push({ type: 'html-id', name: `#${match[1]}` });
      }
      const tagMatches = content.matchAll(/<([a-zA-Z0-9-]+)[^>]*>/g);
      const tags = new Set();
      for (const match of tagMatches) {
        if (!['div', 'span', 'br', 'p', 'a'].includes(match[1].toLowerCase())) {
          tags.add(match[1]);
        }
      }
      for (const tag of Array.from(tags).slice(0, 10)) {
        symbols.push({ type: 'tag', name: `<${tag}>` });
      }
    }
    // CSS / SCSS / LESS
    else if (['css', 'scss', 'less'].includes(ext)) {
      const classMatches = content.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{/g);
      for (const match of classMatches) {
        symbols.push({ type: 'css-class', name: `.${match[1]}` });
      }
    }
    // JSON
    else if (ext === 'json') {
      try {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object' && parsed !== null) {
          const keys = Object.keys(parsed);
          for (const k of keys.slice(0, 15)) {
            symbols.push({ type: 'json-key', name: k });
          }
        }
      } catch {
        // ignore JSON syntax errors
      }
    }
    // Markdown / README / Text / TXT
    else if (['md', 'markdown', 'txt', 'text', 'log'].includes(ext)) {
      const headingMatches = content.matchAll(/^(#{1,6})\s+(.*)$/gm);
      for (const match of headingMatches) {
        symbols.push({ type: 'heading', name: match[2].trim() });
      }
    }
    // Go / Rust / SQL / Shell
    else if (ext === 'go') {
      const funcMatches = content.matchAll(/func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/g);
      for (const match of funcMatches) symbols.push({ type: 'function', name: match[1] });
    } else if (ext === 'rs') {
      const fnMatches = content.matchAll(/fn\s+(\w+)\s*\(/g);
      for (const match of fnMatches) symbols.push({ type: 'function', name: match[1] });
      const structMatches = content.matchAll(/(?:struct|enum)\s+(\w+)/g);
      for (const match of structMatches) symbols.push({ type: 'struct', name: match[1] });
    } else if (ext === 'sql') {
      const tableMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi);
      for (const match of tableMatches) symbols.push({ type: 'sql-table', name: match[1] });
    }

    return symbols;
  }

  queryContext(userPrompt) {
    if (!userPrompt || this.index.size === 0) return '';
    const keywords = userPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const relevantSnippets = [];

    for (const [filePath, fileData] of this.index.entries()) {
      let score = 0;
      const lowerName = fileData.name.toLowerCase();

      for (const kw of keywords) {
        if (lowerName.includes(kw)) score += 5;
        if (fileData.contentSnippet.toLowerCase().includes(kw)) score += 2;
        if (fileData.symbols.some(s => s.name.toLowerCase().includes(kw))) score += 4;
      }

      if (score > 0) {
        relevantSnippets.push({
          fileName: fileData.name,
          score,
          snippet: fileData.contentSnippet,
          symbols: fileData.symbols.map(s => s.name).join(', ')
        });
      }
    }

    relevantSnippets.sort((a, b) => b.score - a.score);
    const topSnippets = relevantSnippets.slice(0, 3);

    if (topSnippets.length === 0) return '';

    return '\n\n[Project RAG Context]\n' + topSnippets.map(s => `File: ${s.fileName}\nSymbols: ${s.symbols}\nExcerpt:\n${s.snippet}`).join('\n---\n');
  }
}

export const ragIndexer = new LocalRAGIndexer();
