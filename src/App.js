import React, { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [results, setResults] = useState([]);
  const [overallSentiment, setOverallSentiment] = useState(''); // Thêm state cho overall sentiment
  const [overallScores, setOverallScores] = useState({ Negative: 0, Neutral: 0, Positive: 0 }); // Thêm state cho overall scores
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = () => {
    if (text) {
      setLoading(true);
      setResults([]);
      setProgress(0);

      fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sentence: text })
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data.result && data.result.length > 0) {
            setOverallSentiment(data.result[0].overall_sentiment); // Lưu overall sentiment
            setOverallScores(data.result[0].overall_scores); // Lưu overall scores
            setResults(data.result);
          } else {
            setOverallSentiment("Không xác định");
            setOverallScores({ Negative: 0, Neutral: 0, Positive: 0 });
            setResults([{ aspect: "Không xác định", sentiment: "Không xác định", category: "Không xác định", scores: { Negative: 0, Neutral: 0, Positive: 0 } }]);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Lỗi khi gọi API:", error);
          setOverallSentiment("Lỗi");
          setOverallScores({ Negative: 0, Neutral: 0, Positive: 0 });
          setResults([{ aspect: "Lỗi", sentiment: "Không xác định", category: "Không xác định", scores: { Negative: 0, Neutral: 0, Positive: 0 } }]);
          setLoading(false);
        });

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  return (
    <div className="App">
      <h1>Aspect for Technology Comments</h1>
      <textarea
        rows="5"
        placeholder="Nhập văn bản cần phân tích..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="text-area"
      />

      <button onClick={handleAnalyze} className="analyze-button">Analyze</button>

      {loading && (
        <div className="loading-container">
          <div
            className="loading-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="results-container">
          {/* Block Overall Sentiment */}
          <div className="overall-sentiment">
            <p><strong>Overall Sentiment:</strong> {overallSentiment || "Không xác định"}</p>
            <div className="score-bars">
              {Object.keys(overallScores).map((label) => (
                <div key={label} className="score-bar">
                  <span className="score-label">{label}</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${overallScores[label] * 100}%` }}
                    ></div>
                  </div>
                  <span className="score-value">{overallScores[label].toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aspect Results */}
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <p><strong>Aspect:</strong> {result.aspect}</p>
              <p><strong>Sentiment:</strong> {result.sentiment}</p>
              <p><strong>Category:</strong> {result.category}</p>
              <div className="score-bars">
                {Object.keys(result.scores).map((label) => (
                  <div key={label} className="score-bar">
                    <span className="score-label">{label}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${result.scores[label] * 100}%` }}
                      ></div>
                    </div>
                    <span className="score-value">{result.scores[label].toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
