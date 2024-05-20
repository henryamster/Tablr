document.getElementById("copyAsJsonButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      "getClickedTableDataJson",
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        } else {
          copyToClipboard(response);
          console.log("copyTableAsJson");
        }
      }
    );
  });
});

document
  .getElementById("copyAsMarkdownButton")
  .addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        "getClickedTableDataMarkdown",
        (response) => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
          } else {
            copyToClipboard(response);
            console.log("copyTableAsMarkdown");
          }
        }
      );
    });
  });

function copyToClipboard(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { command: "copyToClipboard", data: data },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        } else {
          console.log(response);
        }
      }
    );
  });
}
