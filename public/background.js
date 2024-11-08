console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed and background script loaded");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logText" && request.text) {
    console.log("Received text in background:", request.text);

    const text = request.text;
    console.log("Received text to analyze:", text);

    // Gửi request đến API
    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sentence: text }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("API response:", data);

        // Truyền kết quả về content script
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "displayResult",
          result: data.result, // Đúng cấu trúc từ api.py mới
        });
        console.log("Result sent back to content script");
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
        sendResponse({ success: false });
      });

    return true; // Giữ kênh message mở cho async response
  }
});
