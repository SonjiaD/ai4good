# a tts script for app.py to call on (using gemini's TTS API)

from google import genai
from google.genai import types
import wave, io, base64, os

# creating client to read GOOGLE_API_KEY from env
client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))

# fcn defining TTS synthesis
def synthesize_tts(
        text: str,
        voice_name: str = 'Erinome',
        sample_rate: int = 24000,
        channels: int = 1,
        sample_width: int = 2, 
) -> bytes:
    """
    Returns a complete WAV file as bytes synthesized from the input text using Gemini TTS API.
    """
    # sends rq to gemini model
    resp = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=text,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name,
                    )
                )
            ),
        ),
    )

    # extracting PCM (raw audio data) from gemini's response
    part = resp.candidates[0].content.parts[0].inline_data # access audio parts
    data = part.data # base64-encoded PCM audio

    # if base64 encoded, decode PCM -> bytes
    if isinstance(data, str):
        pcm_data = base64.b64decode(data)
    pcm_data = data
    

    # wrapping PCM into WAV container (so it is recognized by audio players)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm_data)

    buffer.seek(0) # reset buffer pos
    return buffer.read() # write to .wav file 