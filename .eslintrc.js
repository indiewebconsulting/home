module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "mocha": true,
        "jquery": true,
    },
    "plugins": ["mocha"],
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            2
        ],

        "semi": [
            "error",
            "always"
        ]
    }
};
