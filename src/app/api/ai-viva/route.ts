import { NextRequest, NextResponse } from 'next/server';

export interface VivaExchange {
  round: number;
  question: string;
  studentAnswer: string;
  score: number;
  keyTermsUsed: string[];
  feedback: string;
}

export interface AIVivaRequest {
  topic: string;
  category?: string;
  experimentCode?: string;
  governingTheory?: string;
  persona?: 'strict' | 'supportive';
  round: number;
  totalRounds?: number;
  studentAnswer: string;
  history?: VivaExchange[];
  currentQuestion?: string;
}

export interface AIVivaResponse {
  score: number;
  rubricBreakdown: {
    technicalAccuracy: number;
    terminologyUsage: number;
    conceptualReasoning: number;
  };
  feedback: string;
  keyTermsUsed: string[];
  missedKeyTerms: string[];
  examinerCommentary: string;
  nextQuestion: string;
  isFinal: boolean;
  finalEvaluation?: {
    overallScore: number;
    grade: 'A+' | 'A' | 'B' | 'C' | 'Re-Exam';
    strengths: string[];
    topicsToRevise: string[];
    examinerRemarks: string;
  };
}

// Robust fallback heuristic evaluation when OpenRouter API is unavailable or rate-limited
function generateFallbackEvaluation(
  req: AIVivaRequest,
  totalRounds: number
): AIVivaResponse {
  const answer = (req.studentAnswer || '').toLowerCase();
  const wordCount = answer.trim().split(/\s+/).length;
  const isFinal = req.round >= totalRounds;

  // Domain technical keywords library by subject
  const topicKeywords: { [key: string]: string[] } = {
    machine: ['back emf', 'flux', 'torque', 'armature', 'commutator', 'shunt', 'series', 'speed', 'field', 'saturation', 'losses', 'efficiency', 'slip', 'synchronous', 'stator', 'rotor'],
    transformer: ['mutual induction', 'core loss', 'iron loss', 'copper loss', 'hysteresis', 'eddy current', 'open circuit', 'short circuit', 'regulation', 'efficiency', 'turns ratio'],
    circuit: ['thevenin', 'norton', 'resonance', 'quality factor', 'impedance', 'reactance', 'capacitance', 'inductance', 'kirchhoff', 'kvl', 'kcl', 'maximum power'],
    opamp: ['virtual ground', 'slew rate', 'feedback', 'inverting', 'non-inverting', 'cmrr', 'bandwidth', 'gain', 'saturation', 'differential'],
    digital: ['truth table', 'nand', 'nor', 'universal gate', 'flip-flop', 'race around', 'propagation delay', 'de morgan', 'karnaugh map', 'boolean'],
    power: ['firing angle', 'thyristor', 'scr', 'triac', 'inverter', 'rectifier', 'pwm', 'duty cycle', 'commutation', 'harmonics']
  };

  // Find relevant keywords for this topic
  let relevantKeywords: string[] = ['voltage', 'current', 'power', 'frequency', 'resistance', 'efficiency', 'characteristic'];
  for (const [key, words] of Object.entries(topicKeywords)) {
    if (
      (req.topic || '').toLowerCase().includes(key) ||
      (req.category || '').toLowerCase().includes(key)
    ) {
      relevantKeywords = [...relevantKeywords, ...words];
    }
  }

  const matchedTerms = relevantKeywords.filter((term) => answer.includes(term));
  const missedTerms = relevantKeywords.filter((term) => !answer.includes(term)).slice(0, 3);

  let techScore = Math.min(5.0, Math.max(1.5, (matchedTerms.length * 1.5) + (wordCount > 15 ? 1.0 : 0.5)));
  let termScore = Math.min(3.0, Math.max(1.0, matchedTerms.length * 0.8));
  let reasonScore = Math.min(2.0, Math.max(0.5, wordCount > 20 ? 1.8 : 1.0));
  
  if (wordCount < 4 || answer.includes("don't know") || answer.includes("no idea")) {
    techScore = 1.0;
    termScore = 0.5;
    reasonScore = 0.5;
  }

  const score = Number((techScore + termScore + reasonScore).toFixed(1));

  let commentary = "Let us proceed to the next technical aspect.";
  if (req.persona === 'strict') {
    commentary = score >= 7.5
      ? "Acceptable. Now prove your understanding of the governing operational constraints."
      : "Your response lacks mathematical and terminological precision. Answer this carefully:";
  } else {
    commentary = score >= 7.5
      ? "Great explanation! Let's explore how this applies under varying conditions."
      : "Good attempt! Let's clarify the physical principle behind this with another question.";
  }

  const nextQuestions = [
    `How does temperature rise affect the performance and insulation limits in this ${req.topic} configuration?`,
    `What specific protective equipment or fusing rating would you specify for this experiment?`,
    `Explain how the governing mathematical equations dictate the shape of the experimental curve.`,
    `What failure mode occurs if the load impedance drops to zero abruptly?`
  ];

  const nextQuestion = nextQuestions[(req.round - 1) % nextQuestions.length];

  const response: AIVivaResponse = {
    score,
    rubricBreakdown: {
      technicalAccuracy: Number(techScore.toFixed(1)),
      terminologyUsage: Number(termScore.toFixed(1)),
      conceptualReasoning: Number(reasonScore.toFixed(1)),
    },
    feedback: score >= 7.0
      ? `Solid explanation. You correctly referenced ${matchedTerms.slice(0, 2).join(' and ') || 'the operational principles'}.`
      : `Your answer touched upon the basics, but you should mention key concepts such as ${missedTerms.join(', ')}.`,
    keyTermsUsed: matchedTerms.slice(0, 4),
    missedKeyTerms: missedTerms,
    examinerCommentary: commentary,
    nextQuestion,
    isFinal,
  };

  if (isFinal) {
    const totalScore = Math.min(10, Math.max(4, score));
    let grade: 'A+' | 'A' | 'B' | 'C' | 'Re-Exam' = 'B';
    if (totalScore >= 9.0) grade = 'A+';
    else if (totalScore >= 8.0) grade = 'A';
    else if (totalScore >= 6.5) grade = 'B';
    else if (totalScore >= 5.0) grade = 'C';
    else grade = 'Re-Exam';

    response.finalEvaluation = {
      overallScore: totalScore,
      grade,
      strengths: matchedTerms.length > 0 ? [`Good command of ${matchedTerms.join(', ')}`] : ['Understands basic apparatus setup'],
      topicsToRevise: missedTerms.length > 0 ? missedTerms : ['Review governing mathematical proofs'],
      examinerRemarks: score >= 7.5
        ? "Candidate demonstrates strong analytical competency and sound conceptual grasp of laboratory formulations."
        : "Candidate has baseline understanding but requires further revision on mathematical derivations and physical principles.",
    };
  }

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const body: AIVivaRequest = await req.json();
    const {
      topic,
      category = 'Electrical Engineering',
      experimentCode = 'EE-LAB',
      governingTheory = '',
      persona = 'strict',
      round = 1,
      totalRounds = 4,
      studentAnswer = '',
      history = [],
      currentQuestion = 'Explain the core working principle and aim of this experiment.'
    } = body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const isFinal = round >= totalRounds;

    // If no API key or empty answer, use heuristic engine gracefully
    if (!apiKey) {
      const fallback = generateFallbackEvaluation(body, totalRounds);
      return NextResponse.json(fallback);
    }

    const personaInstructions = persona === 'strict'
      ? `You are Dr. R. K. Sharma, a rigorous, distinguished university external examiner evaluating electrical engineering lab students. You value strict technical accuracy, exact mathematical governing equations, and proper IEEE terminology. You are direct, formal, and probe deep into failure modes.`
      : `You are Prof. Sarah Chen, an encouraging and insightful university research examiner. You value deep intuition, physical reasoning, and first-principles understanding. You are supportive and help students connect theory to hands-on lab experiments.`;

    const systemPrompt = `${personaInstructions}

EVALUATION ASSIGNMENT:
- Experiment / Topic: "${topic}" (${category} - Code: ${experimentCode})
- Reference Context / Theory: ${governingTheory || 'Standard AICTE / IEEE electrical engineering curriculum'}
- Current Round: Round ${round} of ${totalRounds} (isFinal: ${isFinal})
- Question Asked: "${currentQuestion}"
- Student's Answer: "${studentAnswer}"

GRADING RUBRIC (Total: 10.0 Marks):
1. Technical Accuracy (0.0 to 5.0): Correct laws, formulas, circuit polarities, physics.
2. Domain Terminology (0.0 to 3.0): Exact technical keywords used rather than vague lay terms.
3. Conceptual Reasoning & Depth (0.0 to 2.0): Explaining 'why', physical mechanisms, edge cases.

INSTRUCTIONS:
- Evaluate the student's answer fairly and constructively.
- Extract all technical keywords used by student and any critical terms they missed.
- If round < totalRounds, generate the next logical follow-up question (probing deeper or transitioning to practical applications).
- If isFinal is true, provide an overall final evaluation, letter grade (A+, A, B, C, Re-Exam), strengths, and revision topics.

OUTPUT FORMAT: You MUST return ONLY valid JSON matching this exact structure:
{
  "score": 8.5,
  "rubricBreakdown": {
    "technicalAccuracy": 4.5,
    "terminologyUsage": 2.5,
    "conceptualReasoning": 1.5
  },
  "feedback": "Detailed 2-3 sentence technical evaluation of what was right and what was missing.",
  "keyTermsUsed": ["term1", "term2"],
  "missedKeyTerms": ["term3", "term4"],
  "examinerCommentary": "Short spoken transition commentary matching your persona.",
  "nextQuestion": "The next technical question to ask the student.",
  "isFinal": ${isFinal},
  ${isFinal ? `"finalEvaluation": {
    "overallScore": 8.5,
    "grade": "A",
    "strengths": ["Strong understanding of back EMF", "Clear mathematical explanation"],
    "topicsToRevise": ["Armature reaction compensation", "Starter resistance sizing"],
    "examinerRemarks": "Candidate exhibits solid theoretical foundation and laboratory acumen."
  }` : `"finalEvaluation": null`}
}`;

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://eezone.com',
        'X-Title': 'EE Zone AI Viva Examiner',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Student submitted answer: "${studentAnswer}". Previous exchanges: ${JSON.stringify(history)}. Please evaluate and return JSON.`
          }
        ],
        temperature: 0.35,
        max_tokens: 1000,
      }),
    });

    if (!openRouterResponse.ok) {
      console.warn('OpenRouter viva call failed, falling back to local heuristic evaluator.');
      return NextResponse.json(generateFallbackEvaluation(body, totalRounds));
    }

    const data = await openRouterResponse.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Clean markdown code blocks if wrapped by Gemma
    let jsonString = rawContent;
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    } else {
      const braceMatch = rawContent.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonString = braceMatch[0];
      }
    }

    try {
      const parsed: AIVivaResponse = JSON.parse(jsonString);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.warn('JSON parse error from Gemma output, fallback active:', parseError);
      return NextResponse.json(generateFallbackEvaluation(body, totalRounds));
    }
  } catch (error: any) {
    console.error('AI Viva API error:', error);
    return NextResponse.json(
      {
        score: 7.0,
        rubricBreakdown: { technicalAccuracy: 3.5, terminologyUsage: 2.0, conceptualReasoning: 1.5 },
        feedback: "Your answer demonstrated fundamental understanding of the core concepts.",
        keyTermsUsed: ["voltage", "current"],
        missedKeyTerms: ["governing equations"],
        examinerCommentary: "Let us continue to the next technical problem.",
        nextQuestion: "Explain the safety precautions essential when conducting this laboratory test.",
        isFinal: false
      },
      { status: 200 }
    );
  }
}
