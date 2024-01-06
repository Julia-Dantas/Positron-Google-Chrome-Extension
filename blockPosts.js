// new MutationObserver(() => {
//     const url = location.href;
//     if (url !== lastUrl) {
//         lastUrl = url;
//         console.log(url);
//     }
// }
// ).observe(document, {subtree: true, childList: true});

// chrome.runtime.onInstalled.addListener(({reason}) => {
//     if (reason === 'install') {
//       chrome.tabs.create({
//         url: "onboarding.html"
//       });
//     }
//   });

//   async function getCurrentTab() {
//     let queryOptions = { active: true, lastFocusedWindow: true };
//     // `tab` will either be a `tabs.Tab` instance or `undefined`.
//     let [tab] = await chrome.tabs.query(queryOptions);
//     return tab;
//   }

//   function sendMessageToActiveTab(message) {
//     const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
//     const response = await chrome.tabs.sendMessage(tab.id, message);
//     // TODO: Do something with the response.
//   }