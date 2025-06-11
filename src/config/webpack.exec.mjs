import { merge } from "webpack-merge";
import dev from "./webpack.dev.mjs";

export default merge(dev, {
    target: "node"
});