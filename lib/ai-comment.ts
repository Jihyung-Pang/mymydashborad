import type { Category } from "@/lib/posts";

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const LAW_SEARCH_URL = "http://www.law.go.kr/DRF/lawSearch.do";

type GeminiPart = { text?: string };
type GeminiResponse = {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
};

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY ?? "",
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as GeminiResponse;
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}

type LawEntry = {
  법령명한글?: string;
  법령구분명?: string;
  소관부처명?: string;
  시행일자?: string;
};

async function searchLaw(query: string): Promise<string> {
  const oc = process.env.LAW_OC_KEY;
  if (!oc) return "";

  const url =
    `${LAW_SEARCH_URL}?OC=${encodeURIComponent(oc)}&target=law&type=JSON` +
    `&query=${encodeURIComponent(query)}&display=3`;

  const res = await fetch(url);
  if (!res.ok) return "";

  const data = await res.json();
  const raw = data?.LawSearch?.law;
  const laws: LawEntry[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
  if (laws.length === 0) return "국가법령정보에서 관련 법령을 찾지 못했습니다.";

  return laws
    .map(
      (l) =>
        `- ${l.법령명한글 ?? "(제목 없음)"} (${l.법령구분명 ?? "-"} · 소관: ${l.소관부처명 ?? "-"} · 시행일자: ${l.시행일자 ?? "-"})`
    )
    .join("\n");
}

type Judgement = {
  needsLaw?: boolean;
  lawQuery?: string | null;
  comment?: string | null;
};

function parseJsonLoose(text: string): Judgement | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Judgement;
  } catch {
    return null;
  }
}

const FALLBACK_COMMENT = "오늘도 기록해주셔서 감사해요.";

export async function generateAiComment(post: {
  title: string;
  category: Category;
  content: string;
}): Promise<string> {
  const judgePrompt =
    `당신은 "하루하루"라는 개인 일기/단상/평가 게시판 글을 읽고 짧은 댓글을 남기는 AI입니다.\n` +
    `아래 글을 읽고 JSON 객체 하나만 출력하세요. 다른 설명은 쓰지 마세요.\n\n` +
    `카테고리: ${post.category}\n제목: ${post.title}\n내용:\n${post.content}\n\n` +
    `이 글이 법률/법령에 대한 구체적인 질문을 포함하면 needsLaw를 true로 하고, ` +
    `국가법령정보 검색에 쓸 법령명 키워드를 lawQuery에 담으세요 (예: "민법", "주택임대차보호법").\n` +
    `법률 질문이 아니라면 needsLaw는 false로 하고, comment에 글 내용에 대한 짧고 따뜻한 공감 댓글을 ` +
    `한국어 존댓말 2~3문장으로 바로 작성하세요.\n\n` +
    `형식: {"needsLaw": boolean, "lawQuery": "string 또는 null", "comment": "string 또는 null"}`;

  const judgeRaw = await callGemini(judgePrompt);
  const judgement = parseJsonLoose(judgeRaw);

  if (!judgement) {
    return judgeRaw || FALLBACK_COMMENT;
  }
  if (!judgement.needsLaw) {
    return judgement.comment?.trim() || FALLBACK_COMMENT;
  }

  const lawInfo = await searchLaw(judgement.lawQuery || post.title);

  const finalPrompt =
    `당신은 "하루하루" 게시판의 AI 댓글 작성자입니다. 아래 글은 법률 관련 질문을 담고 있습니다.\n` +
    `국가법령정보 공동활용(open.law.go.kr) 검색 결과를 참고하여, 정확하고 도움이 되는 댓글을 ` +
    `한국어 존댓말 3~5문장으로 작성하세요. 이것이 법률 자문이 아니라 참고 정보라는 점을 짧게 안내하세요.\n\n` +
    `글 제목: ${post.title}\n글 내용:\n${post.content}\n\n` +
    `[국가법령정보 검색 결과]\n${lawInfo}\n\n` +
    `댓글 본문만 출력하세요 (JSON이 아닌 일반 텍스트, 설명 문구 없이).`;

  const comment = await callGemini(finalPrompt);
  return comment || FALLBACK_COMMENT;
}
