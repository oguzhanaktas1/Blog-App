import os
import sys
import json
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def clean_intro(text):
    import re
    lines = text.split('\n')
    # Remove the first 4 lines as before
    lines = lines[4:]
    # Remove lines that match common AI intro patterns
    filtered = []
    intro_patterns = [
        r"^Elbette[,.!\s]*(aşağıda)?[\s\S]*bulunmaktadır[.!]?$",
        r"^Elbette[,.!\s]*[\s\S]*verilmiştir[.!]?$",
        r"^Elbette[,.!\s]*[\s\S]*aşağıda[\s\S]*$",
        r"^Aşağıda[\s\S]*bulunmaktadır[.!]?$",
        r"^İşte[\s\S]*bulunmaktadır[.!]?$",
        r"^İşte[\s\S]*$",
        r"^Tabii ki[\s\S]*$",
        r"^Yapay zekanın[\s\S]*etkilerini[\s\S]*anlatan[\s\S]*yazı[\s\S]*$",
        r"^Aşağıda[\s\S]*$",
        r"^Bilgilendirici bir blog yazısı[\s\S]*$",
        r"^Harika bir fikir[.!\s]*İşte[\s\S]*$",
        r"^Harika bir fikir[.!\s]*[\s\S]*$",
        r"^İşte kahve tutkunlarının yüzünü güldürecek[\s\S]*$",
        r"^İşte[\s\S]*yazısı[\s\S]*$",
        r"^İşte[\s\S]*blog yazısı[\s\S]*$",
        r"^İşte[\s\S]*$",
        r"^Hazırsanız[\s\S]*başlayalım[.!]?$",
        r"^Buyurun[.!\s]*[\s\S]*$",
        r"^Şimdi[\s\S]*başlayalım[.!]?$",
        r"^Gelin[\s\S]*keşfedelim[.!]?$",
        r"^Gelin[\s\S]*bakalım[.!]?$",
        r"^Haydi[\s\S]*başlayalım[.!]?$",
        r"^Hazırsanız[\s\S]*$",
        r"^Haydi[\s\S]*$",
        r"^Buyurun[.!\s]*$",
    ]
    for line in lines:
        if any(re.match(pat, line.strip(), re.IGNORECASE) for pat in intro_patterns):
            continue
        filtered.append(line)
    return '\n'.join(filtered).lstrip()

def generate(user_prompt: str):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    client = genai.Client(api_key=api_key)
    model = "gemini-2.5-pro"

    contents = [
        types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)])
    ]

    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=-1),
        tools=[types.Tool(googleSearch=types.GoogleSearch())],
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(text="""Sen profesyonel bir blog yazarı asistanısın. Kullanıcının verdiği konu veya açıklamaya göre sadece blog yazısı üret. Motivasyon cümleleri, açıklamalar, başlıklar, 'işte yazınız' gibi ifadeler ekleme. Sadece blog içeriğini oluştur. Blog yazısında giriş, gelişme ve sonuç olsun. Formatlama, paragraf düzeni ve akıcılık profesyonel düzeyde olmalı. Sadece içerik üret, başka hiçbir şey yazma
""")
        ],
    )

    final_text = ""
    for chunk in client.models.generate_content_stream(model=model, contents=contents, config=config):
        final_text += chunk.text or ""

    cleaned = clean_intro(final_text.strip())
    print(json.dumps({ "content": cleaned }))

if __name__ == "__main__":
    prompt = sys.stdin.read()
    generate(prompt)
