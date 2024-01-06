chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        if (tab.url === "https://www.reddit.com/") {
            console.log("Inserted");
        }
        getAllText();
    }
})

function getAllText() {
    setTimeout(function() {
        var elements = document.querySelectorAll("b");
        console.log(elements);
        var innerTextList = [];
    
        elements.forEach(function(element) {
            innerTextList.push(element.innerText);
        });
    
        console.log(innerTextList);
        
        return innerTextList;
    },3000);
}