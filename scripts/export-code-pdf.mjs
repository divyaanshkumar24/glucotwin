// Builds GlucoTwin_Code.pdf: every source file in the repository, with a title page, a table of
// contents with page numbers, and each file's code in a monospace font with line numbers.
// Run with: npm run export:pdf

import { execFileSync } from "node:child_process";
import { createWriteStream, existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { Writable } from "node:stream";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = join(ROOT, "GlucoTwin_Code.pdf");

const FONTS = {
  sans: join(ROOT, "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf"),
  sansBold: join(ROOT, "node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf"),
  mono: join(ROOT, "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"),
  monoBold: join(ROOT, "node_modules/geist/dist/fonts/geist-mono/GeistMono-SemiBold.ttf"),
};

const COLORS = { text: "#1C1917", muted: "#78716C", rule: "#E7E5E4", accent: "#0F766E" };

// Source we wrote. Lock files, generated files and binaries are left out.
const INCLUDED_EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".css", ".json", ".md", ".svg"]);
const EXCLUDED_FILES = new Set(["package-lock.json", "AGENTS.md"]);

// A4 page geometry in points.
const PAGE = { width: 595.28, height: 841.89, left: 40, right: 40, top: 54, bottom: 54 };
const CODE = { size: 7.5, lineHeight: 9.6, gutter: 26, gap: 8 };
const TOC = { size: 9, lineHeight: 14 };
const CONTENT_WIDTH = PAGE.width - PAGE.left - PAGE.right;
const CODE_WIDTH = CONTENT_WIDTH - CODE.gutter - CODE.gap;
const CONTENT_BOTTOM = PAGE.height - PAGE.bottom;
const TOC_ROWS_PER_PAGE = Math.floor((CONTENT_BOTTOM - PAGE.top - 30) / TOC.lineHeight);

/**
 * Files in the repository (committed, or new and not ignored) that count as source. Root files
 * come first, then folders alphabetically. Git's ignore rules keep node_modules and builds out.
 */
function listSourceFiles() {
  const listed = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  return [...new Set(listed)]
    .filter((file) => existsSync(join(ROOT, file)))
    .filter((file) => INCLUDED_EXTENSIONS.has(extname(file)) && !EXCLUDED_FILES.has(file.split("/").pop()))
    .sort((a, b) => {
      const aRoot = !a.includes("/");
      const bRoot = !b.includes("/");
      if (aRoot !== bRoot) return aRoot ? -1 : 1;
      return a.localeCompare(b);
    });
}

function readSource(file) {
  return readFileSync(join(ROOT, file), "utf8").replace(/\r\n/g, "\n").replace(/\n$/, "").replaceAll("\t", "  ");
}

/**
 * Draw the whole document. Run twice: the first run learns which page each file starts on,
 * the second run prints those page numbers in the table of contents.
 */
function draw(output, files, sources, startPages) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.left, right: PAGE.right },
    bufferPages: true,
    info: { Title: "GlucoTwin source code", Author: "GlucoTwin" },
  });
  doc.pipe(output);
  doc.registerFont("sans", FONTS.sans);
  doc.registerFont("sans-bold", FONTS.sansBold);
  doc.registerFont("mono", FONTS.mono);
  doc.registerFont("mono-bold", FONTS.monoBold);

  const pageCount = () => doc.bufferedPageRange().count;
  const found = new Map();
  const totalLines = files.reduce((sum, file) => sum + sources.get(file).split("\n").length, 0);
  const tocPages = Math.max(1, Math.ceil(files.length / TOC_ROWS_PER_PAGE));

  // Title page.
  doc.font("sans-bold").fontSize(34).fillColor(COLORS.text).text("GlucoTwin", PAGE.left, 250);
  doc.font("sans").fontSize(16).fillColor(COLORS.muted).text("Source code", PAGE.left, 296);
  doc.moveTo(PAGE.left, 330).lineTo(PAGE.left + 60, 330).lineWidth(1.5).strokeColor(COLORS.accent).stroke();
  const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  doc.font("sans").fontSize(10).fillColor(COLORS.text);
  doc.text(`${files.length} files, ${totalLines.toLocaleString("en")} lines`, PAGE.left, 350);
  doc.fillColor(COLORS.muted).text(`Commit ${commit}, ${new Date().toISOString().slice(0, 10)}`, PAGE.left, 366);
  doc.text("A browser-only glucose digital twin for the UnivaBio student hackathon.", PAGE.left, 382);
  doc.text("Educational tool. Not a medical device. Always follow your doctor's advice.", PAGE.left, 398);

  // Table of contents.
  for (let page = 0; page < tocPages; page++) {
    doc.addPage();
    if (page === 0) {
      doc.font("sans-bold").fontSize(16).fillColor(COLORS.text).text("Contents", PAGE.left, PAGE.top);
    }
    let y = PAGE.top + 30;
    for (const file of files.slice(page * TOC_ROWS_PER_PAGE, (page + 1) * TOC_ROWS_PER_PAGE)) {
      doc.font("mono").fontSize(TOC.size).fillColor(COLORS.text).text(file, PAGE.left, y, { lineBreak: false });
      const number = String(startPages.get(file) ?? "");
      doc.fillColor(COLORS.muted).text(number, PAGE.width - PAGE.right - 40, y, { width: 40, align: "right", lineBreak: false });
      y += TOC.lineHeight;
    }
  }

  // Code, one file after another. A file starts on a fresh page only if little room is left.
  const charWidth = doc.font("mono").fontSize(CODE.size).widthOfString("M");
  const charsPerRow = Math.floor(CODE_WIDTH / charWidth);
  let y = CONTENT_BOTTOM;
  const MIN_ROOM_FOR_FILE = 70;

  for (const file of files) {
    if (y + MIN_ROOM_FOR_FILE > CONTENT_BOTTOM) {
      doc.addPage();
      y = PAGE.top;
    }
    found.set(file, pageCount());
    const lines = sources.get(file).split("\n");

    y += 8;
    doc.font("mono-bold").fontSize(9.5).fillColor(COLORS.text).text(file, PAGE.left, y, { lineBreak: false });
    doc.font("sans").fontSize(8).fillColor(COLORS.muted).text(`${lines.length} lines`, PAGE.width - PAGE.right - 80, y + 1, {
      width: 80,
      align: "right",
      lineBreak: false,
    });
    y += 15;
    doc.moveTo(PAGE.left, y).lineTo(PAGE.width - PAGE.right, y).lineWidth(0.5).strokeColor(COLORS.rule).stroke();
    y += 6;

    lines.forEach((line, index) => {
      // Long lines continue on the next row, without a line number.
      const rows = [];
      for (let i = 0; i < Math.max(line.length, 1); i += charsPerRow) rows.push(line.slice(i, i + charsPerRow));
      rows.forEach((row, rowIndex) => {
        if (y + CODE.lineHeight > CONTENT_BOTTOM) {
          doc.addPage();
          y = PAGE.top;
          doc.font("mono").fontSize(7).fillColor(COLORS.muted).text(`${file} (continued)`, PAGE.left, y, { lineBreak: false });
          y += 14;
        }
        doc.font("mono").fontSize(CODE.size);
        if (rowIndex === 0) {
          doc.fillColor(COLORS.muted).text(String(index + 1), PAGE.left, y, { width: CODE.gutter, align: "right", lineBreak: false });
        }
        doc.fillColor(COLORS.text).text(row, PAGE.left + CODE.gutter + CODE.gap, y, { lineBreak: false });
        y += CODE.lineHeight;
      });
    });
    y += 6;
  }

  // Footer on every page except the title page. Margins are zeroed so writing here adds no page.
  const total = pageCount();
  for (let i = 1; i < total; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0;
    doc.font("sans").fontSize(8).fillColor(COLORS.muted);
    doc.text("GlucoTwin source code", PAGE.left, PAGE.height - 34, { lineBreak: false });
    doc.text(`${i + 1} of ${total}`, PAGE.width - PAGE.right - 60, PAGE.height - 34, { width: 60, align: "right", lineBreak: false });
  }

  doc.end();
  return { found, total };
}

const files = listSourceFiles();
const sources = new Map(files.map((file) => [file, readSource(file)]));

// Pass 1 finds the page numbers; pass 2 writes the real file.
const discard = new Writable({ write: (_chunk, _encoding, done) => done() });
const { found } = draw(discard, files, sources, new Map());
const stream = createWriteStream(OUTPUT);
const { total } = draw(stream, files, sources, found);

stream.on("finish", () => {
  const kb = Math.round(statSync(OUTPUT).size / 1024);
  process.stdout.write(`Wrote ${OUTPUT}\n${files.length} files, ${total} pages, ${kb} KB\n`);
});
