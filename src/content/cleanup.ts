(() => {
	const url = new URL(window.location.href);
	if (url.searchParams.has("allowed")) {
		url.searchParams.delete("allowed");
		window.history.replaceState({}, document.title, url.toString());
	}
})();
