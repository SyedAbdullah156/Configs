// ==UserScript==
// @name         ChatGPT Auto Prompt
// @namespace    https://chatgpt.com
// @version      2.1
// @description  Auto-fill and send prompts from URL
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(async function () {
    // Chatgpt url foramt: https://chatgpt.com/?q={searchTerms}&hints=search&temporary-chat=true
    // where {searchTerms} should be replaced with %s if adding as search engine to firefox. 
    // While, hints can take values: "search", "reasoning" etc
    
    'use strict';

    // Prevent the script from running twice
    if (window.__CHATGPT_AUTO_PROMPT_RUNNING__) return;
    window.__CHATGPT_AUTO_PROMPT_RUNNING__ = true;

    const params = new URLSearchParams(window.location.search);
    const prompt =
        params.get("prompt") ||
        params.get("q") ||
        params.get("text");

    if (!prompt) return;

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Wait up to 10 seconds for the prompt textarea
    let textarea;
    const textareaTimeout = Date.now() + 10000;

    while (!(textarea = document.querySelector("#prompt-textarea"))) {
        if (Date.now() > textareaTimeout) {
            throw new Error("Prompt textarea not found.");
        }
        await sleep(300);
    }

    textarea.focus();

    // Clear any existing text
    document.execCommand("selectAll", false, null);
    document.execCommand("delete", false, null);

    // Insert the prompt
    document.execCommand("insertText", false, prompt);

    // Wait up to 10 seconds for the Send button
    let sendButton;
    const buttonTimeout = Date.now() + 10000;

    while (true) {
        sendButton = document.querySelector('button[data-testid="send-button"]');

        if (sendButton && !sendButton.disabled) {
            break;
        }

        if (Date.now() > buttonTimeout) {
            throw new Error("Send button not found or never became enabled.");
        }

        await sleep(300);
    }

    // Give React a moment to update
    await sleep(300);

    sendButton.click();

    // Remove query parameters from the URL
    history.replaceState({}, "", location.pathname);

})();