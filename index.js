let myLinks = []
const inputEl = document.getElementById("input-el")
const inputBtn = document.getElementById("input-btn")
const ulEl = document.getElementById("ul-el")
const deleteBtn = document.getElementById("delete-btn")
const linksFromLocalStorage = JSON.parse( localStorage.getItem("myLinks") )
const tabBtn = document.getElementById("tab-btn")

if (linksFromLocalStorage) {
    myLinks = linksFromLocalStorage
    render(myLinks)
}

tabBtn.addEventListener("click", function(){    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        let activeTab = tabs[0];
        myLinks.push({
            url: activeTab.url,
            title: activeTab.title || getCleanName(activeTab.url)
        })
        localStorage.setItem("myLinks", JSON.stringify(myLinks) )
        render(myLinks)
    })
})

function render(links) {
    let listItems = ""
    for (let i = 0; i < links.length; i++) {
        let item = links[i];
        
        // Backward compatibility for old string links vs new object format
        let url = typeof item === "string" ? item : item.url;
        let title = typeof item === "string" ? getCleanName(item) : item.title;
        let domain = getDomain(url);
        let favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

        listItems += `
            <li class="link-card">
                <a class="link-info" target='_blank' href='${url}'>
                    <img class="link-favicon" src="${favicon}" alt="" />
                    <div class="link-text">
                        <span class="link-title">${title}</span>
                        <span class="link-domain">${domain}</span>
                    </div>
                </a>
                <button class="delete-single-btn" data-index="${i}" title="Delete link">✕</button>
            </li>
        `
    }
    ulEl.innerHTML = listItems

    // Attach event listeners to individual delete buttons
    const deleteSingleBtns = document.querySelectorAll(".delete-single-btn");
    deleteSingleBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const index = this.getAttribute("data-index");
            myLinks.splice(index, 1);
            localStorage.setItem("myLinks", JSON.stringify(myLinks));
            render(myLinks);
        });
    });
}

function getDomain(url) {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

function getCleanName(url) {
    try {
        const parsed = new URL(url);
        const pathParts = parsed.pathname.split("/").filter(p => p.length > 0);
        if (pathParts.length > 0) {
            return pathParts[pathParts.length - 1].replace(/[-_]/g, " ");
        }
        return parsed.hostname;
    } catch {
        return url;
    }
}

deleteBtn.addEventListener("dblclick", function() {
    localStorage.clear()
    myLinks = []
    render(myLinks)
})

inputBtn.addEventListener("click", function() {
    if (inputEl.value.trim() !== "") {
        let rawUrl = inputEl.value.trim();
        if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
            rawUrl = "https://" + rawUrl;
        }
        myLinks.push({
            url: rawUrl,
            title: getCleanName(rawUrl)
        })
        inputEl.value = ""
        localStorage.setItem("myLinks", JSON.stringify(myLinks) )
        render(myLinks)
    }
})