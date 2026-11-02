import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

/** Author ki info yahan badlein. Poori site par yahi dikhegi. */
export const AUTHOR = {
  name: "SEO Toolkit Team",
  bio: "We build free, simple SEO tools and write practical guides for webmasters, bloggers and marketers.",
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  image?: string;
  readMinutes: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface Post extends PostMeta {
  html: string;
  toc: TocItem[];
}

function asDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim()) return value.trim().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function decode(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseFile(slug: string) {
  const file = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  if (data.draft === true) return null;

  const words = content.split(/\s+/).filter(Boolean).length;
  const meta: PostMeta = {
    slug,
    title: String(data.title || slug),
    description: String(data.description || ""),
    date: asDateString(data.date),
    updated: data.updated ? asDateString(data.updated) : undefined,
    category: String(data.category || "General"),
    image: data.image ? String(data.image) : undefined,
    readMinutes: Math.max(1, Math.ceil(words / 200)),
  };
  return { meta, content };
}

/** Saare articles, naya sabse upar */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const posts: PostMeta[] = [];
  for (const name of fs.readdirSync(BLOG_DIR)) {
    if (!name.endsWith(".md")) continue;
    const slug = name.replace(/\.md$/, "");
    if (!/^[a-z0-9-]+$/i.test(slug)) continue;
    const parsed = parseFile(slug);
    if (parsed) posts.push(parsed.meta);
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Ek article, HTML aur Table of Contents ke saath */
export function getPostBySlug(slug: string): Post | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const parsed = parseFile(slug);
  if (!parsed) return null;

  let html = marked.parse(parsed.content, { async: false }) as string;

  // Har H2 / H3 ko id do aur Table of Contents banao
  const toc: TocItem[] = [];
  const used = new Set<string>();
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level, inner) => {
    const text = decode(stripTags(inner)).trim();
    const base = slugify(text) || "section";
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    toc.push({ id, text, level: Number(level) });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  // Images late load hon, taake page tez rahe
  html = html.replace(/<img /g, '<img loading="lazy" ');

  return { ...parsed.meta, html, toc };
}