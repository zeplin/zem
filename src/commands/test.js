const jest = require("jest");

module.exports = function (args) {
    args.push(
        "--config",
        JSON.stringify({
            transform: {
                "^.+\\.(js|jsx|ts|tsx)$": [
                    "babel-jest",
                    {
                        presets: [
                            [
                                require.resolve("@babel/preset-env"),
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