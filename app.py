from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptAvailable

app = Flask(__name__)
CORS(app)  
model_name = "sshleifer/distilbart-cnn-12-6"
model_revision = "a4f8f3e"
summarizer = pipeline('summarization', model=model_name, revision=model_revision)

@app.route('/summarize', methods=['POST', 'OPTIONS'])
def summarize():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    data = request.get_json()
    youtube_video = data['url']
    video_id = youtube_video.split("v=")[-1].split("&")[0]  # Handle additional URL parameters
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
    except NoTranscriptAvailable:
        return jsonify({'error': 'Subtitles are not available for this video.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    result = " ".join([t['text'] for t in transcript])
    summarized_text = []
    num_iters = len(result) // 1000
    for i in range(num_iters + 1):
        start = i * 1000
        end = min((i + 1) * 1000, len(result))  
        out = summarizer(result[start:end])
        summarized_text.append(out[0]['summary_text'])

    summary = " ".join(summarized_text)
    return jsonify({'summary': summary})

if __name__ == "__main__":
    app.run(debug=True)
