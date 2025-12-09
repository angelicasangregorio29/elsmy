Hugging Face audio-classification inference microservice

This small Flask app exposes `/infer` which accepts multipart form-data with field `file` and returns the model's predictions.

Setup (recommended in a virtualenv):

```bash
cd server/inference
python -m venv .venv
. .venv/bin/activate    # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
export INFER_MODEL=superb/wav2vec2-base-superb-er  # change model if you prefer
python app.py
```

By default it listens on port `5001`.

Notes:
- Choose an appropriate emotion recognition model from Hugging Face (search for `audio-classification` or `emotion` models).
- For production, prefer GPU for lower latency and pin a specific model checkpoint.
- The model name is configurable via `INFER_MODEL` env var.

Example response:
```
{
  "results": [
    {"label": "joy", "score": 0.78},
    {"label": "neutral", "score": 0.15}
  ]
}
```
