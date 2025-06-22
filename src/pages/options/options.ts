import { decisionCounterKey, PromptDecision } from "../../prompt/decision.js";

function getStoredClickCounts(
	domainName: string,
): Promise<{ yesCount: number; noCount: number }> {
	const yesKey = decisionCounterKey(domainName, PromptDecision.Yes);
	const noKey = decisionCounterKey(domainName, PromptDecision.No);

	return new Promise((resolve) => {
		chrome.storage.local.get([yesKey, noKey], (result) => {
			const yesRaw = result[yesKey];
			const noRaw = result[noKey];

			const yesCount =
				typeof yesRaw === "number" && Number.isFinite(yesRaw) ? yesRaw : 0;
			const noCount =
				typeof noRaw === "number" && Number.isFinite(noRaw) ? noRaw : 0;

			resolve({ yesCount, noCount });
		});
	});
}

function renderDomainList(domainList: string[]): void {
	const listElement = document.getElementById(
		"domain-list",
	) as HTMLUListElement | null;

	if (!listElement) {
		return;
	}

	listElement.innerHTML = "";

	domainList.forEach(async (domainName) => {
		const { yesCount, noCount } = await getStoredClickCounts(domainName);

		const listItem = document.createElement("li");
		listItem.className = "card domain-item stack stack-16 align-start";

		const domainLabel = document.createElement("span");
		domainLabel.textContent = domainName;
		domainLabel.className = "domain-label";

		const decisionCountGroup = document.createElement("div");
		decisionCountGroup.className = "stack stack-8 align-start";

		const visitedCountLabel = document.createElement("span");
		visitedCountLabel.textContent = `Visited with intention: ${yesCount}`;
		visitedCountLabel.className = "subtitle";

		const exitedCountLabel = document.createElement("span");
		exitedCountLabel.textContent = `Visits canceled: ${noCount}`;
		exitedCountLabel.className = "subtitle";

		decisionCountGroup.appendChild(visitedCountLabel);
		decisionCountGroup.appendChild(exitedCountLabel);

		const removeButton = document.createElement("button");
		removeButton.textContent = "Remove";
		removeButton.className = "button button-small button-danger";

		removeButton.addEventListener("click", () => {
			const updatedList = domainList.filter((d) => d !== domainName);
			chrome.storage.local.set({ domains: updatedList });
			renderDomainList(updatedList);
		});

		listItem.appendChild(domainLabel);
		listItem.appendChild(decisionCountGroup);
		listItem.appendChild(removeButton);
		listElement.appendChild(listItem);
	});
}

chrome.storage.local.get("domains", (result) => {
	const stored: unknown = result.domains;
	const domainList =
		Array.isArray(stored) && stored.every((d) => typeof d === "string")
			? stored
			: [];
	renderDomainList(domainList);
});

const addForm = document.getElementById("add-form") as HTMLFormElement;
const domainInput = document.getElementById("domain-input") as HTMLInputElement;

addForm?.addEventListener("submit", (event) => {
	event.preventDefault();
	const newDomain = domainInput.value.trim();

	chrome.storage.local.get("domains", (result) => {
		const domainsBlockedByUser =
			Array.isArray(result.domains) &&
			result.domains.every((d) => typeof d === "string")
				? result.domains
				: [];

		if (domainsBlockedByUser.includes(newDomain)) {
			alert("Domain already exists in the list.");
			return;
		}

		const updated = [...domainsBlockedByUser, newDomain];
		chrome.storage.local.set({ domains: updated }, () => {
			renderDomainList(updated);
			domainInput.value = "";
		});
	});
});
