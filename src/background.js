chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create(
    {
      id: "copyTableAsJson",
      title: "Copy Table as JSON",
      contexts: ["all"],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }
    }
  );

  chrome.contextMenus.create(
    {
      id: "copyTableAsMarkdown",
      title: "Copy Table as Markdown",
      contexts: ["all"],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }
    }
  );
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("%c Tablr Installed", "color: green;");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
});

function sendMessageToContentScript(tabId, message) {
  chrome.tabs.sendMessage(tabId, message, (response) => {
    console.log("Response from content script:", response);
  });
}

chrome.contextMenus.create(
  {
    id: "copyTableAsJson",
    title: "Copy Table as JSON",
    contexts: ["all"],
  },
  () => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }
  }
);

chrome.contextMenus.create(
  {
    id: "copyTableAsMarkdown",
    title: "Copy Table as Markdown",
    contexts: ["all"],
  },
  () => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }
  }
);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "copyTableAsJson" ||
    info.menuItemId === "copyTableAsMarkdown"
  ) {
    if (tab.status === "complete") {
      chrome.tabs.sendMessage(
        tab.id,
        info.menuItemId === "copyTableAsJson"
          ? "getClickedTableDataJson"
          : "getClickedTableDataMarkdown",
        (response) => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
          } else {
            console.log("Table data received:", response);
            // Send the data to the content script
            chrome.tabs.sendMessage(tab.id, {
              command: "copyToClipboard",
              data: response,
            });
          }
        }
      );
    } else {
      console.log("Tab is not fully loaded");
    }
  }
});
