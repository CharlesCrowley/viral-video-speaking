import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranscribeRequest {
  attemptId: string
}

interface DeepgramResponse {
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string
        confidence: number
      }>
    }>
  }
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
    const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY')!

    if (!deepgramApiKey) {
      throw new Error('Deepgram API key not configured')
    }

    // Parse request body
    const { attemptId }: TranscribeRequest = await req.json()

    if (!attemptId) {
      throw new Error('attemptId is required')
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('recording_url, user_id')
      .eq('id', attemptId)
      .single()

    if (attemptError || !attempt) {
      throw new Error('Attempt not found')
    }

    if (!attempt.recording_url) {
      throw new Error('No recording URL found')
    }

    // Download audio file from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('recordings')
      .download(attempt.recording_url)

    if (downloadError || !audioData) {
      throw new Error('Failed to download audio file')
    }

    // Convert Blob to ArrayBuffer for Deepgram
    const audioBuffer = await audioData.arrayBuffer()

    // Call Deepgram transcription API
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
        'Content-Type': 'audio/webm',
      },
      body: audioBuffer,
    })

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text()
      console.error('Deepgram API error:', errorText)
      throw new Error(`Deepgram API failed: ${deepgramResponse.status}`)
    }

    const transcriptionResult: DeepgramResponse = await deepgramResponse.json()
    
    // Extract transcript
    const transcript = transcriptionResult.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = transcriptionResult.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0

    if (!transcript) {
      throw new Error('No transcript generated - audio may be unclear')
    }

    // Update attempt with transcript
    const { error: updateError } = await supabase
      .from('attempts')
      .update({ 
        transcript: transcript
      })
      .eq('id', attemptId)

    if (updateError) {
      throw new Error('Failed to save transcript')
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        transcript,
        confidence,
        attemptId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Transcription error:', error)
    
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