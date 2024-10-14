import axios from 'axios';

const API_KEY = 'c9b77ed632654ea78daa92877387c712';
const UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';
const LEMUR_URL = 'https://api.assemblyai.com/lemur/v3/generate/task';

const MAX_RETRIES = 10;
const RETRY_DELAY = 3000; // 3 seconds

export const transcribeAudio = async (audioBlob: Blob): Promise<any> => {
  try {
    // Step 1: Upload the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    const uploadResponse = await axios.post(UPLOAD_URL, audioBlob, {
      headers: {
        'Authorization': API_KEY,
        'Content-Type': audioBlob.type
      }
    });

    console.log('Upload response:', uploadResponse.data);
    const audioUrl = uploadResponse.data.upload_url;

    // Step 2: Start the transcription
    const transcriptResponse = await axios.post(TRANSCRIPT_URL, {
      audio_url: audioUrl,
      speaker_labels: true
    }, {
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('Transcript response:', transcriptResponse.data);
    const transcriptId = transcriptResponse.data.id;

    // Step 3: Poll for the transcription result
    let result;
    for (let i = 0; i < MAX_RETRIES; i++) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

      const pollingResponse = await axios.get(`${TRANSCRIPT_URL}/${transcriptId}`, {
        headers: { 'Authorization': API_KEY }
      });

      console.log(`Polling attempt ${i + 1}:`, pollingResponse.data);

      if (pollingResponse.data.status === 'completed') {
        result = pollingResponse.data;
        break;
      } else if (pollingResponse.data.status === 'error') {
        throw new Error(`Transcription failed: ${pollingResponse.data.error}`);
      }

      if (i === MAX_RETRIES - 1) {
        throw new Error('Max retries reached. Transcription timed out.');
      }
    }

    if (!result) {
      throw new Error('Transcription failed to complete');
    }

    // Debug: Log the raw transcript
    console.log('Raw transcript:', JSON.stringify(result, null, 2));

    // Format the transcript for LeMUR
    const formattedTranscript = result.utterances.map((utterance: any) => {
      return `Speaker ${utterance.speaker}: ${utterance.text}`;
    }).join('\n');

    // Debug: Log the formatted transcript
    console.log('Formatted transcript for LeMUR:', formattedTranscript);

    // Step 4: Generate LeMUR recommendations
    const lemurResponse = await axios.post(LEMUR_URL, {
      transcript_ids: [transcriptId],
      prompt: `As an experienced psychodynamically-oriented therapist, create a rich, insightful, and valuable psychotherapy note based on the following therapy session transcript. Your note should demonstrate deep clinical expertise and provide a comprehensive psychodynamic perspective on the session. Please include the following elements in your note:

1. Session Overview: Briefly summarize the main themes and content of the session.

2. Client Presentation: Describe the client's affect, behavior, and any significant non-verbal cues observed during the session.

3. Psychodynamic Formulation: Provide a detailed analysis of the client's unconscious processes, defense mechanisms, and transference/countertransference dynamics observed in the session. Include relevant theoretical concepts from psychodynamic theory.

4. Key Moments: Highlight 2-3 significant moments or exchanges from the session, using direct quotes where appropriate. Explain their psychodynamic significance.

5. Interpretation and Insight: Offer your professional interpretation of the client's underlying conflicts, patterns, and unconscious motivations based on the session content.

6. Treatment Progress: Discuss how this session relates to the overall treatment goals and any progress or setbacks observed.

7. Future Directions: Suggest potential areas for exploration in future sessions and any specific interventions or techniques you plan to employ.

Please ensure that your note is detailed, nuanced, and reflects a deep understanding of psychodynamic principles. Use clinical language appropriate for a professional psychotherapy note while maintaining clarity.

Transcript:
${formattedTranscript}`,
      final_model: "anthropic/claude-3-5-sonnet"
    }, {
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('LeMUR response:', lemurResponse.data);

    return {
      transcript: result,
      recommendations: lemurResponse.data.response
    };
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    let errorMessage = 'An unknown error occurred during transcription.';
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      errorMessage = `API Error: ${error.response?.data?.error || error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};