import project from "./project.json" with { type: "json" };
import componentVariants from "./componentVariants.json" with { type: "json" };
import components from "./components.json" with { type: "json" };
import screens from "./screens.json" with { type: "json" };
import version from "./version.json" with { type: "json" };

export default {
    componentVariants,
    components,
    project,
    screens,
    screenVersion: version
};