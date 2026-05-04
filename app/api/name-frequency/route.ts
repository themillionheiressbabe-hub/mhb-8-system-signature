import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BABE_SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PYTHAGOREAN: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

function reduceNum(n: number): number {
  if (n === 11 || n === 22) return n;
  if (n < 10) return n;
  let sum = 0;
  for (const ch of String(n)) sum += parseInt(ch, 10);
  return reduceNum(sum);
}

function nameNumbers(name: string) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  let exp = 0;
  let soul = 0;
  let personality = 0;
  for (const ch of letters) {
    const v = PYTHAGOREAN[ch];
    if (!v) continue;
    exp += v;
    if (VOWELS.has(ch)) soul += v;
    else personality += v;
  }
  return {
    expression: reduceNum(exp),
    soulUrge: reduceNum(soul),
    personality: reduceNum(personality),
  };
}

export async function POST(request: Request) {
  let body: {
    birthName?: string;
    chosenName?: string;
    businessName?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const birthName = body.birthName?.trim() ?? "";
  const chosenName = body.chosenName?.trim() ?? "";
  const businessName = body.businessName?.trim() ?? "";

  if (!birthName) {
    return NextResponse.json(
      { error: "birthName is required" },
      { status: 400 },
    );
  }

  const birth = nameNumbers(birthName);
  const chosenExpression =
    chosenName && chosenName.toLowerCase() !== birthName.toLowerCase()
      ? nameNumbers(chosenName).expression
      : null;
  const businessExpression = businessName
    ? nameNumbers(businessName).expression
    : null;

  const userPrompt = `TASK: Name Frequency preview read

Birth name: ${birthName}
Birth name Expression: ${birth.expression}
Birth name Soul Urge: ${birth.soulUrge}
Birth name Personality: ${birth.personality}
${chosenName && chosenExpression !== null ? `Chosen name: ${chosenName} | Expression: ${chosenExpression}` : ""}
${businessName && businessExpression !== null ? `Business name: ${businessName} | Expression: ${businessExpression}` : ""}

Write a Name Frequency preview. This is a free taster, not a full read. Three short sections, one per number. Each section: the number in gold, then 2 sentences maximum. Make it land. Make her want more. Do not over-explain. Do not list what the number means in general, name what it means for HER specifically based on the name she was given.

End with one gold italic line: 'This is your name frequency preview. Your full Name Frequency read lives inside every BABE Signature report.'

No em dashes. No bullet points. Plain prose.`;

  let preview = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: BABE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = response.content[0];
    preview = block.type === "text" ? block.text.trim() : "";
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 },
    );
  }

  if (!preview) {
    return NextResponse.json({ error: "Empty generation" }, { status: 500 });
  }

  return NextResponse.json({
    birthExpression: birth.expression,
    birthSoulUrge: birth.soulUrge,
    birthPersonality: birth.personality,
    chosenExpression,
    businessExpression,
    preview,
  });
}
