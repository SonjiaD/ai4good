from huggingface_hub import hf_hub_download
import os
import shutil

# Download the model weights from Hugging Face
local_path = hf_hub_download(
    repo_id="openai/whisper-base",
    filename="base.pt",
    cache_dir=os.path.expanduser("~/.cache/huggingface"),  # default HF cache
)

# Copy (or move) to Whisper's expected cache location
whisper_cache = os.path.expanduser("~/.cache/whisper/models")
os.makedirs(whisper_cache, exist_ok=True)
shutil.copy(local_path, os.path.join(whisper_cache, "base.pt"))

print(f"✅ base.pt downloaded to Whisper cache at:\n{whisper_cache}/base.pt")
