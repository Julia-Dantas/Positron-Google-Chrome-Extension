chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        const scriptToInject = `
            ${getAllText.toString()}
            ${moderateContent.toString()}
            ${getKeyWithHighestValue.toString()}
            getAllText(document.body);
        `;

        // Inject a content script into the tab
        chrome.tabs.executeScript(tabId, {
            code: scriptToInject
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            }
        });
    }
});


function getAllText(node, innerTextList = []) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) {
            getAllText(child, innerTextList);

            if (node.nodeName === "H3" && child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                const text = child.textContent.trim();
                innerTextList.push(text);
                console.log(text);
                moderateContent(text).then(data => {
                    console.log(data);
                });
            }
            else if (node.nodeName === "P" && child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                const text = child.textContent.trim();
                innerTextList.push(text);
                console.log(text);
                moderateContent(text).then(data => {
                    console.log(data);
                });
            }
            else if (node.nodeName === "A" && child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
                const text = child.textContent.trim();
                innerTextList.push(text);
                console.log(text);
                moderateContent(text).then(data => {
                    console.log(data);
                });
            }
        }
    }

    return innerTextList;
}


async function moderateContent(prompt) {
    const apiKey = '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';
    const moderationUrl = 'https://api.openai.com/v1/moderations';

    try {
        const response = await fetch(moderationUrl, {
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
        const isFlagged = data.results[0]['flagged'];
        console.log(isFlagged);

        if (isFlagged) {
            return getKeyWithHighestValue(data.results[0]['category_scores']);
        } else {
            // Do misinformation check
            return "Unflagged";
        }
    } catch (error) {
        console.error('Error while calling OpenAI Moderation API:', error);
    }
}

function getKeyWithHighestValue(obj) {
    let highestKey = null;
    let highestValue = -Infinity; // Initialize with the lowest possible number

    for (const [key, value] of Object.entries(obj)) {
        if (value > highestValue) {
            highestValue = value;
            highestKey = key;
        }
    }

    return highestKey;
}






