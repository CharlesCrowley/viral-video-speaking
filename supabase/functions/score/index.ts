import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScoreRequest {
  attemptId: string
  lessonVocab: string[]
}

interface Mistake {
  type: string
  excerpt: string
  suggestion: string
}

interface ScoreData {
  ielts: number
  cefr: string
  fluency: number
  vocab: number
  grammar: number
}

interface FeedbackData {
  mistakes: Mistake[]
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const groqApiKey = Deno.env.get('GROQ_API_KEY')!

    if (!groqApiKey) {
      throw new Error('Groq API key not configured')
    }

    // Parse request body
    const { attemptId, lessonVocab }: ScoreRequest = await req.json()

    if (!attemptId) {
      throw new Error('attemptId is required')
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get attempt record with transcript
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('transcript, user_id')
      .eq('id', attemptId)
      .single()

    if (attemptError || !attempt) {
      throw new Error('Attempt not found')
    }

    if (!attempt.transcript) {
      throw new Error('No transcript found for this attempt')
    }

    // Prepare prompt for Groq
    const prompt = `You are an expert IELTS speaking examiner. Analyze the following English description and provide detailed feedback.

TRANSCRIPT: "${attempt.transcript}"

LESSON VOCABULARY: ${lessonVocab.join(', ')}

Please analyze the speaking sample and return ONLY a valid JSON object with this exact structure:

{
  "ielts": 6.5,
  "cefr": "B2",
  "fluency": 4,
  "vocab": 3,
  "grammar": 4,
  "mistakes": [
    {
      "type": "Grammar",
      "excerpt": "I was went to the store",
      "suggestion": "I went to the store"
    },
    {
      "type": "Vocabulary",
      "excerpt": "very good",
      "suggestion": "excellent, outstanding, or remarkable"
    }
  ]
}

SCORING CRITERIA:
- IELTS: 1.0-9.0 (overall band score)
- CEFR: A1, A2, B1, B2, C1, or C2
- Fluency: 1-5 (smoothness, pace, hesitation)
- Vocab: 1-5 (range, accuracy, lesson vocab usage)
- Grammar: 1-5 (accuracy, complexity, range)

Focus on constructive feedback. Identify specific mistakes with clear suggestions. Consider use of lesson vocabulary as a positive factor.`

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API error:', errorText)
      throw new Error(`Groq API failed: ${groqResponse.status}`)
    }

    const groqResult: GroqResponse = await groqResponse.json()
    const aiResponse = groqResult.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI model')
    }

    // Parse AI response as JSON
    let scoreData: ScoreData
    let feedbackData: FeedbackData
    
    try {
      const parsedResponse = JSON.parse(aiResponse)
      
      // Validate required fields
      if (!parsedResponse.ielts || !parsedResponse.cefr) {
        throw new Error('Invalid AI response format')
      }

      scoreData = {
        ielts: Math.max(1.0, Math.min(9.0, parsedResponse.ielts)),
        cefr: parsedResponse.cefr,
        fluency: Math.max(1, Math.min(5, parsedResponse.fluency || 3)),
        vocab: Math.max(1, Math.min(5, parsedResponse.vocab || 3)),
        grammar: Math.max(1, Math.min(5, parsedResponse.grammar || 3)),
      }

      feedbackData = {
        mistakes: Array.isArray(parsedResponse.mistakes) ? parsedResponse.mistakes : []
      }

    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      
      // Fallback scoring if JSON parsing fails
      scoreData = {
        ielts: 5.0,
        cefr: 'B1',
        fluency: 3,
        vocab: 3,
        grammar: 3,
      }
      
      feedbackData = {
        mistakes: [{
          type: 'System',
          excerpt: 'Analysis temporarily unavailable',
          suggestion: 'Please try again later for detailed feedback'
        }]
      }
    }

    // Update attempt with scores and feedback
    const { error: updateError } = await supabase
      .from('attempts')
      .update({ 
        score_json: scoreData,
        feedback_json: feedbackData
      })
      .eq('id', attemptId)

    if (updateError) {
      throw new Error('Failed to save scoring results')
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        scoreData,
        feedbackData,
        attemptId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Scoring error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})