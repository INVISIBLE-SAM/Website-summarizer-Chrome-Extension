// Configuration
const SUMMARIZATION_API_URL = 'http://localhost:5000/summarize';
const MAX_SUMMARY_ATTEMPTS = 3;

// Message listener for summarization requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarizePage") {
        // Retrieve the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                sendResponse({ 
                    action: "summaryResponse", 
                    error: "No active tab found" 
                });
                return;
            }

            const activeTab = tabs[0];

            // Execute script to extract page content
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: extractPageContent
            }, (results) => {
                if (chrome.runtime.lastError) {
                    sendResponse({ 
                        action: "summaryResponse", 
                        error: "Content extraction failed: " + chrome.runtime.lastError.message 
                    });
                    return;
                }

                if (!results || !results[0]) {
                    sendResponse({ 
                        action: "summaryResponse", 
                        error: "No content extracted" 
                    });
                    return;
                }

                const pageContent = results[0].result;

                // Summarize the extracted content
                summarizePageContent(pageContent)
                    .then(summary => {
                        sendResponse({ 
                            action: "summaryResponse", 
                            summary: summary 
                        });
                    })
                    .catch(error => {
                        sendResponse({ 
                            action: "summaryResponse", 
                            error: error.message 
                        });
                    });
            });

            // Return true to indicate async response
            return true;
        });

        // Return true to indicate async response
        return true;
    }
});

// Function to extract page content
function extractPageContent() {
    // Advanced content extraction logic
    const contentSelectors = [
        'article', 'main', '#main-content', 
        '.article-body', '#content', '.content'
    ];

    for (let selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element.innerText.trim();
        }
    }

    return document.body.innerText.trim();
}

// Function to summarize page content
async function summarizePageContent(pageContent, attempts = 0) {
    try {
        // Validate content length
        if (!pageContent || pageContent.trim().length < 100) {
            throw new Error("Insufficient content for summarization");
        }

        // Truncate very long content
        const truncatedContent = pageContent.slice(0, 5000);

        const response = await fetch(SUMMARIZATION_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: truncatedContent })
        });

        if (!response.ok) {
            throw new Error(`API response error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data.summary;

    } catch (error) {
        // Retry mechanism
        if (attempts < MAX_SUMMARY_ATTEMPTS) {
            console.warn(`Summarization attempt ${attempts + 1} failed. Retrying...`);
            return summarizePageContent(pageContent, attempts + 1);
        }
        console.error('Summarization failed:', error);
        throw error;
    }
}