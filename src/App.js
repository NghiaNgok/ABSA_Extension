import React, { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [results, setResults] = useState([]);
  const [overallSentiment, setOverallSentiment] = useState(''); // Thêm state cho overall sentiment
  const [overallScores, setOverallScores] = useState({ Negative: 0, Neutral: 0, Positive: 0 }); // Thêm state cho overall scores
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState('en'); // State quản lý ngôn ngữ

  const locales = {
    en: {
      title: 'Aspect Analysis for Reviews',
      placeholder: 'Enter the text to analyze...',
      analyzeButton: 'Analyze',
      overallSentiment: 'Overall Sentiment',
      aspect: 'Aspect',
      sentiment: 'Sentiment',
      category: 'Category',
      notDetermined: 'Not determined',
      error: 'Error',
    },
    vi: {
      title: 'Phân tích khía cạnh bình luận',
      placeholder: 'Nhập văn bản cần phân tích...',
      analyzeButton: 'Phân tích',
      overallSentiment: 'Tổng quan cảm xúc',
      aspect: 'Khía cạnh',
      sentiment: 'Cảm xúc',
      category: 'Danh mục',
      notDetermined: 'Không xác định',
      error: 'Lỗi',
      scoreLabels: {
        Positive: 'Tích cực',
        Negative: 'Tiêu cực',
        Neutral: 'Trung tính'
      }
    },
  };

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
            setOverallSentiment(locales[language].notDetermined);
            setOverallScores({ Negative: 0, Neutral: 0, Positive: 0 });
            setResults([{ aspect: locales[language].notDetermined, sentiment: locales[language].notDetermined, category: locales[language].notDetermined, scores: { Negative: 0, Neutral: 0, Positive: 0 } }]);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Lỗi khi gọi API:", error);
          setOverallSentiment(locales[language].error);
          setOverallScores({ Negative: 0, Neutral: 0, Positive: 0 });
          setResults([{ aspect: locales[language].error, sentiment: locales[language].notDetermined, category: locales[language].notDetermined, scores: { Negative: 0, Neutral: 0, Positive: 0 } }]);
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

  const handleLanguageToggle = () => {
    setLanguage(prevLanguage => (prevLanguage === 'en' ? 'vi' : 'en'));
  };

  const lang = locales[language];
  const scoreLabels = language === 'vi' ? lang.scoreLabels : { Positive: 'Positive', Negative: 'Negative', Neutral: 'Neutral' };

  return (
    <div className="App">
      <button onClick={handleLanguageToggle} className="language-toggle">
        {language === 'en' ? '🇻🇳' : '🇺🇸'}
      </button>

      <h1>{lang.title}</h1>

      <textarea
        rows="5"
        placeholder={lang.placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="text-area"
      />

      <button onClick={handleAnalyze} className="analyze-button">
        {lang.analyzeButton}
      </button>

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
        <div className="overall-sentiment">
  <p>
    <strong>{lang.overallSentiment}:</strong>{" "}
    {language === "vi" && overallSentiment in scoreLabels
      ? scoreLabels[overallSentiment]
      : overallSentiment || lang.notDetermined}
  </p>
  <div className="score-bars">
    {Object.keys(overallScores).map((label) => (
      <div key={label} className="score-bar">
        <span className="score-label">{scoreLabels[label]}</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${overallScores[label] * 100}%` }}
          ></div>
        </div>
        <span className="score-value">
          {overallScores[label].toFixed(3)}
        </span>
      </div>
    ))}
  </div>
</div>

{results.map((result, index) => (
  <div key={index} className="result-item">
    <p>
      <strong>{lang.aspect}:</strong> {result.aspect}
    </p>
    <p>
      <strong>{lang.sentiment}:</strong>{" "}
      {language === "vi" && result.sentiment in scoreLabels
        ? scoreLabels[result.sentiment]
        : result.sentiment}
    </p>
    <p>
      <strong>{lang.category}:</strong> {result.category}
    </p>
    <div className="score-bars">
      {Object.keys(result.scores).map((label) => (
        <div key={label} className="score-bar">
          <span className="score-label">{scoreLabels[label]}</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${result.scores[label] * 100}%` }}
            ></div>
          </div>
          <span className="score-value">
            {result.scores[label].toFixed(3)}
          </span>
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
