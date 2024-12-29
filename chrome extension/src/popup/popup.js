document.addEventListener("DOMContentLoaded", function () {
    const summarizeButton = document.getElementById("summarizeButton");
    const summaryDiv = document.getElementById("summary");
    const loadingIndicator = document.getElementById("loading");
    const errorDiv = document.getElementById("error");

    summarizeButton.addEventListener("click", () => {
        // Reset UI
        summaryDiv.textContent = '';
        errorDiv.textContent = '';
        loadingIndicator.style.display = 'block';
        summarizeButton.disabled = true;

        // Query active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                // Send message to background script to extract and summarize content
                chrome.runtime.sendMessage(
                    { 
                        action: "summarizePage", 
                        tabId: tabs[0].id 
                    },
                    handleSummaryResponse
                );
            }
        });
    });

    function handleSummaryResponse(response) {
        // Hide loading, re-enable button
        loadingIndicator.style.display = 'none';
        summarizeButton.disabled = false;

        if (response.action === "summaryResponse" && response.summary) {
            summaryDiv.textContent = response.summary;
        } else {
            errorDiv.textContent = response.error || 'Summarization failed';
        }
    }
});