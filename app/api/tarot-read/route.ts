import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BABE_SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";
import { TAROT_DECK } from "@/lib/tarot/deck";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  let body: {
    cardName?: string;
    reversed?: boolean;
    destinyCardName?: string;
    destinyCardEnergyBody?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const cardName = body.cardName?.trim() ?? "";
  const reversed = Boolean(body.reversed);
  const destinyCardName = body.destinyCardName?.trim() ?? "";
  const destinyCardEnergyBody = body.destinyCardEnergyBody?.trim() ?? "";

  if (!cardName) {
    return NextResponse.json(
      { error: "cardName is required" },
      { status: 400 },
    );
  }

  const card = TAROT_DECK.find((c) => c.name === cardName);
  if (!card) {
    return NextResponse.json({ error: "Card not in deck" }, { status: 404 });
  }

  const orientationLabel = reversed ? "Reversed" : "Upright";
  const keywords = (reversed ? card.reversedKeywords : card.uprightKeywords)
    .slice(0, 4)
    .join(", ");

  const userPrompt = `TASK: Tarot card pull read

The client pulled: ${card.name} (${orientationLabel})
${orientationLabel} meaning keywords: ${keywords}
Card meaning: ${card.meaning}

Today's Destiny Card is: ${destinyCardName}
Today's Destiny Card energy: ${destinyCardEnergyBody}

Write a tarot pull read. 3-4 sentences. How does this card land today specifically given the collective Destiny Card energy? Second person. Plain prose. No em dashes. No bullet points. Breathable. BABE voice.`;

  let read = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 250,
      system: BABE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = response.content[0];
    read = block.type === "text" ? block.text.trim() : "";
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 },
    );
  }

  if (!read) {
    return NextResponse.json({ error: "Empty generation" }, { status: 500 });
  }

  return NextResponse.json({ read });
}
