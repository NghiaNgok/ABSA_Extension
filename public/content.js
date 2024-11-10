console.log("Content script loaded");

let logButton = null;

// Function to create the "Analyze" button
function createLogButton() {
  logButton = document.createElement("button");
  logButton.textContent = "Analyze";
  logButton.style.position = "absolute";
  logButton.style.zIndex = "9999";
  logButton.style.padding = "4px 8px";
  logButton.style.backgroundColor = "#f3f3f3";
  logButton.style.color = "black";
  logButton.style.border = "1px solid #ccc";
  logButton.style.borderRadius = "4px";
  logButton.style.cursor = "pointer";
  logButton.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.2)";
  logButton.style.display = "none"; // Initially hidden

  logButton.addEventListener("click", function () {
    const selectedText = window.getSelection().toString() || "No text selected";
    console.log("Analyze button clicked, sending text:", selectedText);

    // Send selected text to background script
    chrome.runtime.sendMessage(
      { action: "logText", text: selectedText },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError);
        }
      }
    );
  });

  document.body.appendChild(logButton);
}

// Function to position the button next to the selected text
function showLogButton(selection) {
  if (!logButton) {
    createLogButton();
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Position the button next to the selected text
  logButton.style.top = `${window.scrollY + rect.top - 30}px`;
  logButton.style.left = `${window.scrollX + rect.right + 10}px`;
  logButton.style.display = "inline-block";
}

// Function to display the API analysis result on the page
function displayResultOnPage(result) {
  const existingResult = document.getElementById("analysis-result");
  if (existingResult) {
    existingResult.remove();
  }

  const resultContainer = document.createElement("div");
  resultContainer.id = "analysis-result";
  resultContainer.style.position = "absolute";
  resultContainer.style.top = `${logButton.getBoundingClientRect().top + window.scrollY + logButton.offsetHeight + 5}px`;
  resultContainer.style.left = `${logButton.getBoundingClientRect().left + window.scrollX}px`;
  resultContainer.style.padding = "10px";
  resultContainer.style.backgroundColor = "#ffffff";
  resultContainer.style.border = "1px solid #ddd";
  resultContainer.style.borderRadius = "8px";
  resultContainer.style.zIndex = "10000";
  resultContainer.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";
  resultContainer.style.width = "280px";

  // Display Overall Sentiment in a separate box with distinct styling
  const overallSentiment = result[0]?.overall_sentiment || "Không xác định";
  const overallScores = result[0]?.overall_scores || { Positive: 0, Neutral: 0, Negative: 0 };
  const overallElement = document.createElement("div");
  overallElement.style.borderBottom = "1px solid #eaeaea";
  overallElement.style.padding = "12px";
  overallElement.style.marginBottom = "8px";
  overallElement.style.backgroundColor = "#f0f9ff";
  overallElement.style.border = "2px solid #007bff"; // Blue border to highlight
  overallElement.style.borderRadius = "6px";
  overallElement.innerHTML = `<strong>Overall Sentiment:</strong> ${overallSentiment}<br>`;

  // Add progress bars for Overall Sentiment
  ["Positive", "Neutral", "Negative"].forEach((key) => {
    const color = key === "Positive" ? "#4CAF50" : key === "Neutral" ? "#6c757d" : "#ff6b6b";
    const barContainer = document.createElement("div");
    barContainer.style.display = "flex";
    barContainer.style.alignItems = "center";
    barContainer.style.justifyContent = "space-between";
    barContainer.style.marginTop = "5px";
    barContainer.innerHTML = `
      <span>${key}:</span>
      <div style="flex: 1; background-color: #e0e0e0; border-radius: 4px; margin-left: 8px; height: 8px; overflow: hidden;">
        <div style="width: ${overallScores[key] * 100}%; background-color: ${color}; height: 100%;"></div>
      </div>
      <span style="margin-left: 8px; width: 50px; text-align: right;">${overallScores[key].toFixed(3)}</span>
    `;
    overallElement.appendChild(barContainer);
  });

  resultContainer.appendChild(overallElement);

  // Loop over each aspect in the result and display it
  result.forEach((item) => {
    if (!item.aspect) return; // Skip items without an aspect

    const aspectElement = document.createElement("div");
    aspectElement.style.borderBottom = "1px solid #eaeaea";
    aspectElement.style.padding = "8px 0";

    aspectElement.innerHTML = `
      <strong>Aspect:</strong> ${item.aspect || "Không xác định"}<br>
      <strong>Sentiment:</strong> ${item.sentiment || "Không xác định"}<br>
      <strong>Category:</strong> ${item.category|| "Không xác định"}<br>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px;">
        <span>Negative:</span>
        <div style="flex: 1; background-color: #e0e0e0; border-radius: 4px; margin-left: 8px; height: 8px; overflow: hidden;">
          <div style="width: ${item.scores.Negative * 100}%; background-color: #ff6b6b; height: 100%;"></div>
        </div>
        <span style="margin-left: 8px; width: 50px; text-align: right;">${item.scores.Negative.toFixed(3)}</span>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px;">
        <span>Neutral:</span>
        <div style="flex: 1; background-color: #e0e0e0; border-radius: 4px; margin-left: 8px; height: 8px; overflow: hidden;">
          <div style="width: ${item.scores.Neutral * 100}%; background-color: #6c757d; height: 100%;"></div>
        </div>
        <span style="margin-left: 8px; width: 50px; text-align: right;">${item.scores.Neutral.toFixed(3)}</span>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px;">
        <span>Positive:</span>
        <div style="flex: 1; background-color: #e0e0e0; border-radius: 4px; margin-left: 8px; height: 8px; overflow: hidden;">
          <div style="width: ${item.scores.Positive * 100}%; background-color: #4CAF50; height: 100%;"></div>
        </div>
        <span style="margin-left: 8px; width: 50px; text-align: right;">${item.scores.Positive.toFixed(3)}</span>
      </div>
    `;
    resultContainer.appendChild(aspectElement);
  });

  document.body.appendChild(resultContainer);

  // Hide result container if clicking outside
  document.addEventListener("click", (event) => {
    if (!resultContainer.contains(event.target) && event.target !== logButton) {
      resultContainer.remove();
    }
  });
}


// Listen for messages from background.js to display the result
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "displayResult") {
    console.log("Displaying result:", message.result);
    displayResultOnPage(message.result);
  }
});

// Event listener to check for text selection
document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    showLogButton(selection);
  } else if (logButton) {
    logButton.style.display = "none"; // Hide the button if there's no selection
  }
});
