import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BABE_SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const YEAR_LABELS: Record<number, string> = {
  1: "The Year of Initiation",
  2: "The Year of Partnership",
  3: "The Year of Expression",
  4: "The Year of Foundation",
  5: "The Year of Change",
  6: "The Year of Responsibility",
  7: "The Year of Reflection",
  8: "The Year of Power",
  9: "The Year of Release",
  11: "The Year of Illumination",
  22: "The Year of Legacy",
};

const YEAR_FALLBACKS: Record<number, string> = {
  1: "A year of new beginnings. What you start now sets the pattern for the next 9 years. Plant seeds with intention.",
  2: "A year of patience and partnership. What you are building needs time. Collaboration matters more than solo effort right now.",
  3: "A year of expression and expansion. Your voice is the tool. Create, communicate, and let yourself be seen.",
  4: "A year of foundations and discipline. Build the structure. What gets laid down now will hold weight for years.",
  5: "A year of change and freedom. Expect the unexpected. Stay flexible and move with the shifts rather than against them.",
  6: "A year of responsibility and love. Home, family, and relationships take centre stage. Service is the theme.",
  7: "A year of reflection and inner work. Go deep, not wide. What you learn about yourself this year changes everything.",
  8: "A year of power and harvest. What you have built is ready to produce results. Step into the authority.",
  9: "A year of completion and release. Let go of what is finished. Clear the ground for the new cycle ahead.",
  11: "A Master Year of spiritual awakening and illumination. Heightened sensitivity. Trust the inner knowing.",
  22: "A Master Year of building at scale. What you create this year has the potential to last beyond you.",
};

function sumDigits(n: number): number {
  let s = 0;
  let t = Math.abs(n);
  while (t > 0) {
    s += t % 10;
    t = Math.floor(t / 10);
  }
  return s;
}

function reduce(n: number): number {
  if (n === 11 || n === 22) return n;
  if (n < 10) return n;
  return reduce(sumDigits(n));
}

function personalYearFor(birthMonth: number, birthDay: number, year: number): number {
  return reduce(reduce(birthMonth) + reduce(birthDay) + reduce(sumDigits(year)));
}

function nextBirthdayDate(birthMonth: number, birthDay: number): Date {
  const today = new Date();
  const year = today.getFullYear();
  const thisYearBirthday = new Date(year, birthMonth - 1, birthDay);
  const todayMidnight = new Date(year, today.getMonth(), today.getDate());
  if (todayMidnight < thisYearBirthday) return thisYearBirthday;
  return new Date(year + 1, birthMonth - 1, birthDay);
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function POST(request: Request) {
  let body: { dob?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const dob = body.dob?.trim() ?? "";
  const dobMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!dobMatch) {
    return NextResponse.json({ error: "Invalid dob format" }, { status: 400 });
  }
  const birthMonth = Number(dobMatch[2]);
  const birthDay = Number(dobMatch[3]);

  const currentYear = new Date().getFullYear();
  const personalYear = personalYearFor(birthMonth, birthDay, currentYear);
  const yearLabel = YEAR_LABELS[personalYear] ?? "";
  const nextShiftDate = formatLongDate(nextBirthdayDate(birthMonth, birthDay));
  const isMaster = personalYear === 11 || personalYear === 22;
  const cyclePosition = isMaster ? null : personalYear;

  const userPrompt = `TASK: Personal Year read

Personal Year number: ${personalYear}
Current year: ${currentYear}
Birth month: ${birthMonth}
Birth day: ${birthDay}

Year meanings:
1: New starts. What you initiate now sets the pattern for the next 9 years.
2: Patience and partnership. What you are building needs time. Collaboration over solo effort.
3: Expression and expansion. Your voice is the tool. Create, communicate, be seen.
4: Foundations and discipline. Build the structure. What gets laid down now holds weight for years.
5: Change and freedom. Expect the unexpected. Stay flexible and move with the shifts.
6: Responsibility and love. Home, family, relationships take centre stage. Service is the theme.
7: Reflection and inner work. Go deep, not wide. What you learn about yourself this year changes everything.
8: Power and harvest. What you have built is ready to produce results. Step into the authority.
9: Completion and release. Let go of what is finished. Clear the ground for the new cycle ahead.
11: Spiritual awakening and illumination. Heightened sensitivity. Trust the inner knowing above all.
22: Building at scale. What you create this year has the potential to last beyond you.

Write a Personal Year ${personalYear} read. 4-5 short breathable paragraphs. 1-2 sentences each.

Structure:
- Open by naming what this year is fundamentally asking for in plain language
- Name what this year rewards (what to lean into)
- Name what this year does not reward (what to ease back on)
- Name the shadow pattern this year tends to surface
- Close with one line she can carry into the year

Second person. Plain prose. No em dashes. No bullet points. No headers. Breathable paragraphs.`;

  let yearRead = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: BABE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = response.content[0];
    yearRead = block.type === "text" ? block.text.trim() : "";
  } catch {
    yearRead = "";
  }

  if (!yearRead) yearRead = YEAR_FALLBACKS[personalYear] ?? "";

  return NextResponse.json({
    personalYear,
    yearLabel,
    yearRead,
    cyclePosition,
    isMaster,
    currentYear,
    nextShiftDate,
  });
}
