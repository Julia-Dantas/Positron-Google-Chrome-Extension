var reasonList = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        //console.log("Page loaded");

        // Inject a content script into the tab
        chrome.tabs.executeScript(tabId, {
            code: `(${getAllText.toString()})(document.body);`
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            } else {
                //console.log(results[0]); // results from getAllText
            }
        });
    }
});

function getAllText(node, innerTextList = []) {
    if (node.nodeType === Node.ELEMENT_NODE) {

        node.childNodes.forEach(function (child) {
            getAllText(child, innerTextList);
            if (node.nodeName === "H3" && child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                innerTextList.push(child.textContent.trim());
                moderateContent('Fuck dogs in their ass and penises?')
                    .then(data => console.log(data))
                    .catch(error => console.error(error)); // Display a warning
            }
            else if (node.nodeName === "P" && child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                innerTextList.push(child.textContent.trim());
            }
        });
    }

    return innerTextList;
}

async function moderateContent(prompt) {
    const apiKey = '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';
    const url = 'https://api.openai.com/v1/moderations';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ input: prompt })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.) {
            throw new Error(`Error: ${data.error.message}`);
        }
        return data;
    } catch (error) {
        console.error('Error while calling OpenAI Moderation API:', error);
    }
}

// Usage example
moderateContent('Fuck dogs in their ass and penises?')
    .then(data => console.log(data))
    .catch(error => console.error(error));
