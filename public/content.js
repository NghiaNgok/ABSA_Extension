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

    // Show the result container in place of the button
    displayResultOnPage([{ aspect: "không xác định", sentiment: "không xác định", scores: { Negative: 0, Neutral: 0, Positive: 0 } }]);
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
  resultContainer.style.width = "280px"; // Expanded width for better visibility

  // Loop over each aspect in the result and display it
  result.forEach((item) => {
    const aspectElement = document.createElement("div");
    aspectElement.style.borderBottom = "1px solid #eaeaea";
    aspectElement.style.padding = "8px 0";

    aspectElement.innerHTML = `
      <strong>Aspect:</strong> ${item.aspect || "Không xác định"}<br>
      <strong>Sentiment:</strong> ${item.sentiment || "Không xác định"}<br>
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
