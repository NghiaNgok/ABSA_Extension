console.log("Analyze button clicked, sending text:");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzeText") {
    const text = message.text;
    console.log("Received text to analyze:", text);

    // Gửi yêu cầu tới API
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

        // Gửi lại kết quả tới content.js
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "displayResult",
          result: data.result, // Đảm bảo `data.result` là phần cần hiển thị
        });
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
        sendResponse({ success: false });
      });

    return true; // Giữ kênh tin nhắn mở để gửi phản hồi bất đồng bộ
  }
});
