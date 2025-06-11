import { merge } from "webpack-merge";
import common from "./webpack.common.mjs";

export default merge(common, {
    mode: "production",
    output: {
        filename: "[name].[chunkhash:8].js"
    }
});