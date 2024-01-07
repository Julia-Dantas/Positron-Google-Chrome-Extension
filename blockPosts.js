chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        const scriptToInject = `
            ${moderateContent.toString()}
            ${getKeyWithHighestValue.toString()}
            ${blurElement.toString()}
            ${createWarning.toString()}
            ${getAllText.toString()}
			${applyRateLimiting.toString()}
			${query.toString()}

            let lastRequestTime = 0;
            const requestInterval = 200;

            const warningDiv = createWarning();
            getAllText(document.body, warningDiv);
            observeDOM();

            function observeDOM() {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((newNode) => {
                            getAllText(newNode, warningDiv);
                        });
                    });
                });

                observer.observe(document.body, { childList: true, subtree: true });
            }
        `;

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
        'sexual': 'This post likely contains sexual content.',
        'hate': 'This post likely contains hate speech.',
        'harassment': 'This post likely contains harassment-related content.',
        'self-harm': 'This post likely contains self-harm content.',
        'sexual/minors': 'This post likely contains inappropriate content related to minors.',
        'hate/threatening': 'This post likely contains threatening hate speech.',
        'violence/graphic': 'This post likely contains graphic violence.',
        'self-harm/intent': 'This post likely shows intent of self-harm.',
        'self-harm/instructions': 'This post likely contains instructions for self-harm.',
        'harassment/threatening': 'This post likely contains threatening harassment.',
        'violence': 'This post likely contains violent content.',
		'misinformation': 'This post contains topics that are prone to misinformation.'
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
                child.nodeType === Node.TEXT_NODE &&
                child.textContent.trim().length > 0
            ) {
                const text = child.textContent.trim();
                if (text.split(/\s+/).length >= 3) {
					moderateContent(text).then(data => {
						console.log(data);
						if (data !== "Unflagged") {
							blurElement(node, 5, data, warningDiv);
						}
					});
				}
            }

        }
    }
}


let lastRequestTime = 0;
const requestInterval = 200; // 500 milliseconds interval between requests

async function moderateContent(prompt) {
    const apiKey = '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';
    const moderationUrl = 'https://api.openai.com/v1/moderations';
    const engineUrl = "https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions";

    try {
        // Apply rate limiting
        await applyRateLimiting();

        // Moderation API request
        const moderationResponse = await fetch(moderationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ input: prompt })
        });

        if (!moderationResponse.ok) {
            throw new Error(`Error: ${moderationResponse.status}`);
        }

        const moderationData = await moderationResponse.json();
        const isFlagged = moderationData.results[0]['flagged'];

        if (!isFlagged) {
			return "Unflagged";
			//const misinformationResult = await query({ inputs: prompt });
			
			//console.log(misinformationResult[0][0]['score']);
			
			//return (misinformationResult[0][0]['label'] == 'Fake' && misinformationResult[0][0]['score'] > 0.999) ? "misinformation" :"Unflagged";
        }

        return getKeyWithHighestValue(moderationData.results[0]['category_scores']);

    } catch (error) {
        console.error('Error while calling OpenAI API:', error);
    }
}

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/therealcyberlord/fake-news-classification-distilbert",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	console.log(result);

	return result;
}

// Function to handle rate limiting
async function applyRateLimiting() {
    const currentTime = Date.now();
    if (currentTime - lastRequestTime < requestInterval) {
        await new Promise(resolve => setTimeout(resolve, requestInterval - (currentTime - lastRequestTime)));
    }
    lastRequestTime = Date.now();
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






