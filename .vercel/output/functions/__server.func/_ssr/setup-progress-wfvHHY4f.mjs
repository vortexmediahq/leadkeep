//#region node_modules/.nitro/vite/services/ssr/assets/setup-progress-wfvHHY4f.js
/** Set when the owner opens Settings, so the setup chart can tick off notifications. */
var NOTIFY_SETUP_KEY = "leadkeep.setup.notifications";
function isBusinessReady(business) {
	return business.name.trim().length > 0 && (business.phone.trim().length > 0 || business.email.trim().length > 0);
}
function setupProgress(input) {
	const steps = [
		{
			id: "business",
			label: "Add your business details",
			done: isBusinessReady(input.business),
			to: "/links",
			hash: "business",
			counted: true
		},
		{
			id: "link",
			label: "Create your first lead link",
			done: input.linksCount > 0,
			to: "/links",
			hash: "new-link",
			counted: true
		},
		{
			id: "questions",
			label: "Create a questionnaire",
			done: input.questionnairesCount > 0,
			to: "/questions",
			hash: "templates",
			counted: true,
			note: !input.questionnairesReady && input.questionnairesCount === 0 ? "A database update is needed before you can save your own." : void 0
		},
		{
			id: "services",
			label: "Add a service you sell",
			done: input.namedServices > 0,
			to: "/services",
			counted: true
		},
		{
			id: "notifications",
			label: "Choose how you're notified",
			done: input.notificationsChosen,
			to: "/settings",
			hash: "alerts",
			counted: true
		},
		{
			id: "branding",
			label: "Add your logo and colours",
			done: Boolean(input.brandingReady),
			to: "/settings",
			hash: "branding",
			counted: false,
			note: input.brandingReady ? void 0 : "Optional. Makes your forms and quotes look like you."
		}
	];
	const countable = steps.filter((step) => step.counted);
	const done = countable.filter((step) => step.done).length;
	const total = countable.length;
	return {
		steps,
		done,
		total,
		percent: total === 0 ? 0 : Math.round(done / total * 100)
	};
}
//#endregion
export { setupProgress as n, NOTIFY_SETUP_KEY as t };
