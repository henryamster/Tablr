class Table {
  constructor(tableElement) {
    this.tableElement = tableElement;
  }

  parse() {
    return [this.parseToJson(), this.parseToMarkdown()];
  }

  parseToJson() {
    let rows = Array.from(this.tableElement.querySelectorAll("tr"));
    let headers = Array.from(rows[0].querySelectorAll("th")).map((th) =>
      th ? th.innerText : ""
    );
    let data = rows.slice(1).map((row) => {
      let cells = Array.from(row.querySelectorAll("td"));
      let obj = {};
      headers.forEach((header, i) => {
        if (cells[i]) {
          obj[header] = cells[i].innerText;
        } else {
          obj[header] = "";
        }
      });
      return obj;
    });
    return JSON.stringify(data, null, 2);
  }

 parseToMarkdown(includeHeaders = true) {
  let rows = Array.from(this.tableElement.querySelectorAll("tr"));
  let headers = Array.from(rows[0].querySelectorAll("th")).map((th) =>
    th ? th.innerText : ""
  );

  // Calculate the maximum length of each column
  let columnLengths = headers.map((header, i) =>
    Math.max(header.length, ...Array.from(rows.slice(1)).map((row) =>
      row.querySelectorAll("td")[i] ? row.querySelectorAll("td")[i].innerText.length : 0
    ))
  );

  let data = rows.slice(1).map((row) => {
    let cells = Array.from(row.querySelectorAll("td")).map((td, i) =>
      td ? td.innerText.padEnd(columnLengths[i]) : "".padEnd(columnLengths[i])
    );
    return "| " + cells.join(" | ") + " |";
  });

  let markdown = "";
  if (includeHeaders) {
    markdown += "| " + headers.map((header, i) => header.padEnd(columnLengths[i])).join(" | ") + " |\n";
    markdown += "| " + headers.map((header, i) => "---".padEnd(columnLengths[i], "-")).join(" | ") + " |\n";
  }
  markdown += data.join("\n");
  return markdown;
}
}

// Store the data of the last clicked table
window.lastClickedTable = null;

// Listen for the contextmenu event
document.addEventListener("contextmenu", (event) => {
  // Check if the context menu was opened on a table
  const table = event.target.closest("table");

  if (table) {
    // The context menu was opened on a table
    // Store the table data so it can be accessed when a context menu item is clicked
    window.lastClickedTable = new Table(table);
  } else {
    // Clear the last clicked table if the context menu was not opened on a table
    window.lastClickedTable = null;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const [jsonData, markdownData] = window.lastClickedTable.parse();
  if (message === "getClickedTableDataJson") {
    if (window.lastClickedTable) {
      sendResponse(jsonData);
    } else {
      console.warn("No table data available");
      sendResponse(null);
    }
  }

  if (message === "getClickedTableDataMarkdown") {
    if (window.lastClickedTable) {
      sendResponse(markdownData);
    } else {
      console.warn("No table data available");
      sendResponse(null);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "copyTableAsJson") {
    if (window.lastClickedTable) {
      const [jsonData, markdownData] = window.lastClickedTable.parse();
      copyToClipboard(jsonData);
    }
  } else if (message === "copyTableAsMarkdown") {
    if (window.lastClickedTable) {
      const [jsonData, markdownData] = window.lastClickedTable.parse();
      copyToClipboard(markdownData);
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "copyToClipboard") {
    navigator.clipboard.writeText(request.data).then(
      function () {
        console.log("Copying to clipboard was successful!");
        sendResponse({ status: "success" });
      },
      function (err) {
        console.error("Could not copy text: ", err);
        sendResponse({ status: "error", error: err });
      }
    );
    return true; // Will respond asynchronously.
  }
});

function copyToClipboard(data) {
  const textarea = document.createElement("textarea");
  textarea.value = data;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
