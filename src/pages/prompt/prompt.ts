import { decisionCounterKey, PromptDecision } from "../../prompt/decision.js";

const lastAttemptKey = (domain: string): string => `lastAttempt_${domain}`;

function incrementDomainDecisionCounter(
	domainName: string,
	decision: PromptDecision,
): void {
	const storageKey = decisionCounterKey(domainName, decision);

	chrome.storage.local.get(storageKey, (result) => {
		const currentCount: number = result[storageKey] ?? 0;
		chrome.storage.local.set({ [storageKey]: currentCount + 1 });
	});
}

function normalizeDomainName(urlString: string): string {
	try {
		const hostname = new URL(urlString).hostname.toLowerCase();
		return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
	} catch {
		return urlString;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const queryParams = new URLSearchParams(window.location.search);
	const targetParam = queryParams.get("target");

	if (!targetParam) {
		return;
	}

	const rawTargetUrl = targetParam;
	const targetUrl = new URL(rawTargetUrl);
	const domainName = normalizeDomainName(rawTargetUrl);

	const targetUrlElement = document.getElementById("target-url") as HTMLElement;
	const lastAttemptElement = document.getElementById(
		"last-attempt",
	) as HTMLElement;

	targetUrlElement.textContent = rawTargetUrl;

	chrome.storage.local.get(lastAttemptKey(domainName), (result) => {
		const previousAttemptIso: string | undefined =
			result[lastAttemptKey(domainName)];

		if (previousAttemptIso && lastAttemptElement) {
			const previousAttemptDate = new Date(previousAttemptIso);

			lastAttemptElement.textContent =
				"You tried to visit this site previously at: " +
				previousAttemptDate.toLocaleString();

			return;
		}

		lastAttemptElement.textContent =
			"This is your first attempt to visit this site. ";
	});

	chrome.storage.local.set({
		[lastAttemptKey(domainName)]: new Date().toISOString(),
	});

	const handleDecision = (decision: PromptDecision): void => {
		incrementDomainDecisionCounter(domainName, decision);

		if (decision === PromptDecision.Yes) {
			targetUrl.searchParams.set("allowed", "true");
			window.location.href = targetUrl.toString();
		}

		if (decision === PromptDecision.No) {
			closeCurrentTab();
		}
	};

	const yesButton = document.getElementById(
		PromptDecision.Yes,
	) as HTMLButtonElement | null;

	const noButton = document.getElementById(
		PromptDecision.No,
	) as HTMLButtonElement | null;

	// Attach prompt listeners to buttons
	yesButton?.addEventListener("click", () =>
		handleDecision(PromptDecision.Yes),
	);
	noButton?.addEventListener("click", () => handleDecision(PromptDecision.No));
});

function closeCurrentTab(): void {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const currentTab = tabs[0];

		if (currentTab?.id !== undefined) {
			chrome.tabs.remove(currentTab.id);
		}
	});
}

const openOptionsButton = document.getElementById(
	"open-options",
) as HTMLButtonElement | null;

openOptionsButton?.addEventListener("click", (event) => {
	event.preventDefault();
	chrome.runtime.openOptionsPage();
});
