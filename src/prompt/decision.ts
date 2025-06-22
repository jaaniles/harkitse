export enum PromptDecision {
	Yes = "yes",
	No = "no",
}

export const decisionCounterKey = (
	domain: string,
	decision: PromptDecision,
): string => `count_${decision}_${domain}`;
