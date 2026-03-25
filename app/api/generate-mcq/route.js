import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { topic, numberOfQuestions = 5, difficulty = "medium" } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
        }

        const prompt = `Generate exactly ${numberOfQuestions} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY valid JSON in this exact format, no markdown, no code fences:
{
  "questions": [
    {
      "id": 1,
      "question": "What is ...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer is the 0-based index of the correct option
- Questions should be educational and well-crafted
- Provide a clear, concise explanation for each answer
- Difficulty "${difficulty}": ${difficulty === "easy" ? "basic recall and definitions" : difficulty === "medium" ? "application and understanding" : "analysis, edge cases, and deep understanding"}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional educator and quiz creator. You ONLY respond with valid JSON, no markdown formatting, no code fences, no extra text."
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096,
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Groq API error:", errData);
            return NextResponse.json(
                { error: errData.error?.message || "Failed to generate quiz from Groq API" },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return NextResponse.json({ error: "No response from AI" }, { status: 500 });
        }

        // Parse the JSON response, handling potential markdown code fences
        let parsed;
        try {
            // Try direct parse first
            parsed = JSON.parse(content);
        } catch {
            // Try extracting JSON from markdown code fences
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1].trim());
            } else {
                // Try finding JSON object in the response
                const objMatch = content.match(/\{[\s\S]*\}/);
                if (objMatch) {
                    parsed = JSON.parse(objMatch[0]);
                } else {
                    throw new Error("Could not parse AI response as JSON");
                }
            }
        }

        // Validate structure
        if (!parsed.questions || !Array.isArray(parsed.questions)) {
            return NextResponse.json({ error: "Invalid quiz format from AI" }, { status: 500 });
        }

        // Ensure each question has required fields
        const validQuestions = parsed.questions.map((q, i) => ({
            id: q.id || i + 1,
            question: q.question || "",
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
            correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
            explanation: q.explanation || "",
        })).filter(q => q.question && q.options.length === 4);

        return NextResponse.json({
            topic,
            difficulty,
            totalQuestions: validQuestions.length,
            questions: validQuestions,
        });
    } catch (err) {
        console.error("MCQ Generation error:", err);
        return NextResponse.json({ error: err.message || "Failed to generate quiz" }, { status: 500 });
    }
}
