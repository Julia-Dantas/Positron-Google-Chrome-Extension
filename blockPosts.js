chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        const scriptToInject = `
            ${getAllText.toString()}
            ${moderateContent.toString()}
            ${getKeyWithHighestValue.toString()}
            ${blurElement.toString()}
            ${createWarning.toString()}

            const warningDiv = createWarning();

            function observeDOM() {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((newNode) => {
                            getAllText(newNode,warningDiv);
                        });
                    });
                });

                observer.observe(document.body, { childList: true, subtree: true });
            }

            getAllText(document.body,warningDiv);
            observeDOM();
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

function createWarning() {
    // Create floating warning div
    const warningDiv = document.createElement('div');
    warningDiv.textContent = "TEST"
    warningDiv.style.cssText = `
        display: none;
        position: fixed;
        background-color: rgba(255, 255, 255, 0.9);
        color: black;
        text-align: center;
        padding: 10px;
        border: 1px solid black;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        pointer-events: none; // To allow click events to pass through
    `;

    // Append warning div to the body
    document.body.appendChild(warningDiv);

    document.onmousemove = function(event) {
        warningDiv.style.left = `${event.clientX}px`;
        warningDiv.style.top = `${event.clientY}px`;
    };

    return warningDiv;
}

function blurElement(element, blurRadius, text, warningDiv) {
    const Reasons = {
        'sexual': 'This post contains sexual content.',
        'hate': 'This post contains hate speech.',
        'harassment': 'This post contains harassment-related content.',
        'self-harm': 'This post contains self-harm content.',
        'sexual/minors': 'This post contains inappropriate content related to minors.',
        'hate/threatening': 'This post contains threatening hate speech.',
        'violence/graphic': 'This post contains graphic violence.',
        'self-harm/intent': 'This post shows intent of self-harm.',
        'self-harm/instructions': 'This post contains instructions for self-harm.',
        'harassment/threatening': 'This post contains threatening harassment.',
        'violence': 'This post contains violent content.'
    };

    if (element && text in Reasons) {
        element.style.filter = `blur(${blurRadius}px)`; // Blur the element

        // Update warning div position with mouse movement over the element
        element.onmouseenter = function(event) {
            warningDiv.textContent = Reasons[text]; // Set the text
            warningDiv.style.display = 'block';
        };

        element.onmouseleave = function() {
            warningDiv.style.display = 'none';
        };

        // Click event listener
        element.addEventListener('click', function(event) {
            // User chose to proceed, remove blur
            element.style.filter = "none";
            warningDiv.style.display = 'none';

            element.onmouseenter = null;

            event.preventDefault();
            event.stopPropagation();
        }, { once: true });
    }
}

function getAllText(node,warningDiv) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) {
            getAllText(child,warningDiv);
            if (
                (node.nodeName === 'H3' || node.nodeName === 'H1' || node.nodeName === 'H2' ||
                    node.nodeName === 'P' ||
                    node.nodeName === 'A') &&
                child.nodeType === Node.TEXT_NODE &&
                child.textContent.trim().length > 0
            ) {
                const text = child.textContent.trim();
                moderateContent(text).then(data => {
                    console.log(data);
                    if (data !== "Unflagged") {
                        blurElement(node, 5, data,warningDiv);
                    }
                });
            }

        }
    }
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






