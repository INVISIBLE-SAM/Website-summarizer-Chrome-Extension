from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Load summarization model
summarizer = pipeline("summarization", model="t5-small")

@app.route('/summarize', methods=['POST'])
def summarize_text():
    try:
        # Get text from request
        data = request.json
        text = data.get('text', '')

        # Validate input
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Perform summarization
        summary = summarizer(
            text, 
            max_length=150,  # Adjust summary length
            min_length=50,
            do_sample=False
        )[0]['summary_text']

        return jsonify({
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)