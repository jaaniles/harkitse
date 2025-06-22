const INITIAL_DOMAIN_LIST: string[] = [];
let domainsBlockedByUser: string[] = INITIAL_DOMAIN_LIST;

const PROMPT_PAGE_PATH = "pages/prompt/prompt.html";

// ---- MAIN LISTENER ---- //
// Listen for navigation requests
// Check if intended navigation is to a user specified domain
// If so, INTERCEPT and redirect to a prompt page
chrome.webRequest.onBeforeRequest.addListener(
	(details) => {
		const url = details.url;

		//  Check for "allowed" parameter in URL
		// If present, skip the interception
		if (skipIntercept(url)) {
			return {};
		}

		const invalidInitiator = details.type !== "main_frame" || details.initiator;

		if (invalidInitiator) {
			// If the request is not a main frame request or has an outside initiator, do not redirect
			// This prevents intercepting requests that are not user-initiated
			return {};
		}

		if (isTargetDomain(url)) {
			const redirectUrl =
				chrome.runtime.getURL(PROMPT_PAGE_PATH) +
				"?target=" +
				encodeURIComponent(url);
			return { redirectUrl };
		}

		return {};
	},
	{ urls: ["<all_urls>"], types: ["main_frame"] },
	["blocking"],
);

// Load user-specified domains to be intercepted
chrome.storage.local.get("domains", ({ domains }) => {
	const loadedDomainsArrayIsValid =
		Array.isArray(domains) && domains.every((d) => typeof d === "string");

	if (loadedDomainsArrayIsValid) {
		domainsBlockedByUser = domains;
	} else {
		domainsBlockedByUser = INITIAL_DOMAIN_LIST;
	}
});

// Listen to changes in user-specified domains
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName === "local" && changes.domains) {
		const updated = changes.domains.newValue;

		if (Array.isArray(updated)) {
			domainsBlockedByUser = updated;
			return;
		}

		// Updated domain list was empty
		// Reset to initial domain list
		domainsBlockedByUser = INITIAL_DOMAIN_LIST;
	}
});

function isTargetDomain(url: string): boolean {
	const thisOrigin = chrome.runtime.getURL("").replace(/\/$/, "");

	if (url.startsWith(thisOrigin)) {
		return false;
	}

	return domainsBlockedByUser.some((domain) => url.includes(domain));
}

function skipIntercept(url: string): boolean {
	return url.includes("allowed=true");
}
