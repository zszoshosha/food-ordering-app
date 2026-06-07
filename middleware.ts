import proxy from "./src/proxy";

export default proxy;

export const config = {
	// Match all page routes (with or without locale) while excluding API/static assets.
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};
