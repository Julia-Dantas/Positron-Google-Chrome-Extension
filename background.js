chrome.runtime.onInstalled.addListener(function () {
  console.log("My Extension installed");
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { action: "injectCSS" });
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      func: function () {
        // CSS code to change the background color
        const style = document.createElement("style");
        style.textContent = "body { background-color: #yourColor !important; }";
        document.head.appendChild(style);
      },
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "injectCSS") {
    injectCSS();
  }
});

function injectCSS() {
  // Your logic for doThis() on YouTube and Reddit
  // Get The URL
  const site = window.location.hostname;

  // alert("Injector - The JavaScript has been injected to: " + site + " 🤖")

  // Add Custom CSS - Function
  const Add_Custom_Style = (css) =>
    (document.head.appendChild(document.createElement("style")).innerHTML =
      css);

  // Create Custom Element - Function
  function Create_Custom_Element(tag, attr_tag, attr_name, value) {
    const custom_element = document.createElement(tag);
    custom_element.setAttribute(attr_tag, attr_name);
    custom_element.innerHTML = value;
    document.body.append(custom_element);
  }

  // JS Codes For youtube.com
  if (site.includes("youtube.com")) {
    /* -------------- */
    /* Add Custom CSS */
    /* -------------- */
    Add_Custom_Style(`
        @import url("https://fonts.googleapis.com/css?family=Raleway");

        body {
          background-color: red!important;
        }

        * {
            font-family: "Raleway" !important;
            color: #00ff40 !important;
        }

        ytd-channel-about-metadata-renderer {
            zoom: 1.6;
        }

        #meta.ytd-c4-tabbed-header-renderer {
            zoom: 1.3;
        }

        #js-custom-element {
            font-size: 60px;
            padding: 150px 0;
            color: #ff0037 !important;
            background-color: #fffffff2;
            position: fixed;
            top: 0;
            text-align: center;
            width: 100%;
            z-index: 999999;
        }

        .js-custom-element {
            font-size: 60px;
            padding: 150px 0;
            color: #008dff !important;
            background-color: #fffffff2;
            position: fixed;
            bottom: 0;
            text-align: center;
            width: 100%;
            z-index: 999999;
        }
    `);

    /* ---------------------- */
    /* Create Custom Elements */
    /* ---------------------- */
    // Create_Custom_Element(
    //     "div",
    //     "id",
    //     "js-custom-element",
    //     "My Custom JS Element 1"
    // )
    // Create_Custom_Element(
    //     "div",
    //     "class",
    //     "js-custom-element",
    //     "My Custom JS Element 2"
    // )
  }
}
