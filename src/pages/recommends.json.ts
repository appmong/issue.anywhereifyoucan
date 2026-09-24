import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { SITE, CATEGORY_MAP } from "../site.config";
import { postUrl } from "../lib/utils";

// ─────────────────────────────────────────────────────────────
// 추천 위젯 피드 (widget.js가 읽는 파일)
//   - featured: true 이고 draft: false 인 글만 노출
//   - priority 내림차순 → 동점이면 최신 발행순
//   - 이 사이트 글이니 제목·썸네일·설명을 그대로 사용 (OG 파싱 불필요)
// 결과: /recommends.json  (빌드 시 정적 파일로 생성)
// ─────────────────────────────────────────────────────────────
export async function GET(_context: APIContext) {
  const posts = (await getCollection("posts")).filter(
    (p) => !p.data.draft && p.data.featured,
  );

  posts.sort((a, b) => {
    const pr = (b.data.priority ?? 0) - (a.data.priority ?? 0);
    if (pr !== 0) return pr;
    return b.data.publishDate.getTime() - a.data.publishDate.getTime();
  });

  const items = posts.map((p) => ({
    url: SITE.url + postUrl(p.data.category, p.id),
    title: p.data.title,
    desc: p.data.description,
    tag: CATEGORY_MAP[p.data.category]?.name ?? p.data.category,
    // 썸네일: PostCard와 동일한 16:9 와이드 이미지 경로 (없으면 위젯이 자리표시)
    thumb: p.data.thumb ? `shots/${p.data.thumb}/thumb-wide.webp` : "",
    priority: p.data.priority ?? 0,
  }));

  const body = JSON.stringify(
    { generated: new Date().toISOString(), posts: items },
    null,
    0,
  );

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
