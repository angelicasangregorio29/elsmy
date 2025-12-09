import os
from flask import Flask, request, jsonify
from transformers import pipeline
import tempfile

app = Flask(__name__)

# Model name can be configured via environment variable INFER_MODEL
MODEL_NAME = os.environ.get('INFER_MODEL', 'superb/wav2vec2-base-superb-er')

print(f"Loading model for audio-classification: {MODEL_NAME}")
classifier = pipeline('audio-classification', model=MODEL_NAME, device=-1)


@app.route('/infer', methods=['POST'])
def infer():
    """Receive a multipart file upload (form field 'file') and return emotion labels."""
    if 'file' not in request.files:
        return jsonify({'error': 'no file provided'}), 400
    f = request.files['file']
    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(f.filename)[1]) as tmp:
        f.save(tmp.name)
        tmp_path = tmp.name

    try:
        results = classifier(tmp_path)
        # results is typically a list of {label,score}
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
