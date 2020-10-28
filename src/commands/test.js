const jest = require("jest");

module.exports = function (args) {
    args.push(
        "--config",
        JSON.stringify({
            transform: {
                "^.+\\.(js|ts)$": [
                    "babel-jest",
                    {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: {
                                        node: "current"
                                    }
                                }
                            ]
                        ]
                    }
                ]
            }
        })
    );
    jest.run(args);
};
