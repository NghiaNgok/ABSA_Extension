let analyzeButton;

// Hàm để hiển thị nút "Analyze" gần văn bản đã chọn
function showAnalyzeButton(selection) {
  if (analyzeButton) {
    analyzeButton.remove();
  }

  analyzeButton = document.createElement("button");
  analyzeButton.textContent = "Analyze";
  analyzeButton.style.position = "absolute";
  analyzeButton.style.cursor = "pointer";
  analyzeButton.style.padding = "5px 10px";
  analyzeButton.style.fontSize = "14px";
  analyzeButton.style.border = "none";
  analyzeButton.style.borderRadius = "4px";
  analyzeButton.style.backgroundColor = "#4CAF50";
  analyzeButton.style.color = "#fff";
  analyzeButton.style.zIndex = "1000";

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  analyzeButton.style.top = `${window.scrollY + rect.top - 30}px`;
  analyzeButton.style.left = `${window.scrollX + rect.right + 10}px`;

  document.body.appendChild(analyzeButton);

  // Lắng nghe sự kiện click của nút Analyze
  analyzeButton.addEventListener("click", () => {
    const selectedText = selection.toString();
    console.log("Analyze button clicked, sending text:", selectedText);

    try {
      chrome.runtime.sendMessage(
        { action: "analyzeText", text: selectedText },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Context invalidated:", chrome.runtime.lastError);
          } else {
            // Xóa nút Analyze sau khi bấm
            analyzeButton.remove();
          }
        }
      );
    } catch (error) {
      console.error("Error sending message to background:", error);
    }
  });
}

// Lắng nghe sự kiện chọn văn bản
document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    showAnalyzeButton(selection);
  } else if (analyzeButton) {
    analyzeButton.remove();
  }
});

// Lắng nghe thông điệp từ background để hiển thị kết quả phân tích
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "displayResult") {
    console.log("Displaying result:", message.result);
    displayResultOnPage(message.result); // Hiển thị kết quả
  }
});

// Hàm để hiển thị kết quả phân tích trên trang
function displayResultOnPage(result) {
  const existingResult = document.getElementById("analysis-result");
  if (existingResult) {
    existingResult.remove();
  }

  const resultContainer = document.createElement("div");
  resultContainer.id = "analysis-result";
  resultContainer.style.position = "fixed";
  resultContainer.style.bottom = "20px";
  resultContainer.style.right = "20px";
  resultContainer.style.padding = "10px";
  resultContainer.style.backgroundColor = "#f9f9f9";
  resultContainer.style.border = "1px solid #ccc";
  resultContainer.style.borderRadius = "8px";
  resultContainer.style.zIndex = "1000";
  resultContainer.style.maxWidth = "300px";
  resultContainer.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";

  result.forEach((item) => {
    const aspectElement = document.createElement("p");
    aspectElement.innerHTML = `<strong>Aspect:</strong> ${item.aspect}<br>
                               <strong>Sentiment:</strong> ${item.sentiment}<br>
                               <strong>Scores:</strong><br>
                               <div style="margin-left: 10px;">
                                 Negative: ${item.scores.Negative.toFixed(3)}<br>
                                 Neutral: ${item.scores.Neutral.toFixed(3)}<br>
                                 Positive: ${item.scores.Positive.toFixed(3)}
                               </div>`;
    resultContainer.appendChild(aspectElement);
  });

  document.body.appendChild(resultContainer);
}
