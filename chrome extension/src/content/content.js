// content.js - Content Script for Web Page Text Extraction

// Function to extract main content from the page
function extractMainContent() {
    // Priority selectors for content extraction
    const contentSelectors = [
        'article',
        'main',
        '#main-content',
        '.main-content',
        '.article-body',
        '#content',
        '.content',
        'body'
    ];

    // Try finding content using priority selectors
    for (const selector of contentSelectors) {
        const contentElement = document.querySelector(selector);
        
        if (contentElement) {
            // Extract text, removing extra whitespaces
            const text = contentElement.innerText
                .replace(/\s+/g, ' ')
                .trim();
            
            // Minimum content length check
            if (text.length > 100) {
                return text;
            }
        }
    }

    // Fallback to entire body text if no specific content found
    return document.body.innerText
        .replace(/\s+/g, ' ')
        .trim();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // If a content extraction is requested
    if (request.action === 'extractContent') {
        try {
            // Extract and return page content
            const pageContent = extractMainContent();
            
            sendResponse({
                success: true,
                content: pageContent
            });
        } catch (error) {
            sendResponse({
                success: false,
                error: error.message
            });
        }
        
        // Important: return true for async response
        return true;
    }
});

// Optional: Logging for debugging
console.log('Content script loaded for Web Summary extension');