const path = require("path");
const data = {
    test01: {
        //without tests into path
        mockResultDisorderly : [
            {
                id: 1,
                name: path.join("usil", "enterprise", "01.test.js"),
            },
            {
                id: 2,
                name: path.join("usil", "enterprise", "02.test.js"),
            },
            {
                id: 3,
                name: path.join("acme", "enterprise", "01.test.js"),
            },
            {
                id: 4,
                name: path.join("usil", "center", "01.test.js"),
            },
        
        ],
        mockResultOrderly: [
            {
                id: 3,
                name: path.join("acme", "enterprise", "01.test.js"),
            },
            {
                id: 4,
                name: path.join("usil", "center", "01.test.js"),
            },
            {
                id: 1,
                name: path.join("usil", "enterprise", "01.test.js"),
            },
            {
                id: 2,
                name: path.join("usil", "enterprise", "02.test.js"),
            },
        ]
    },
    //with any test into path
    test02: {
        mockResultDisorderly : [
            {
                id: 1,
                name: path.join("tests", "usil", "enterprise", "01.test.js"),
            },
            {
                id: 2,
                name: path.join("usil", "enterprise", "02.test.js"),
            },
            {
                id: 3,
                name: path.join("acme", "enterprise", "01.test.js"),
            },
            {
                id: 4,
                name: path.join("usil", "center", "01.test.js"),
            },
        
        ],
        mockResultOrderly: [
            {
                id: 3,
                name: path.join("acme", "enterprise", "01.test.js"),
            },
            {
                id: 1,
                name: path.join("tests", "usil", "enterprise", "01.test.js"),
            },
            {
                id: 4,
                name: path.join("usil", "center", "01.test.js"),
            },
            {
                id: 2,
                name: path.join("usil", "enterprise", "02.test.js"),
            },
        ]
    },
    // with tests
    test03: {
        mockResultDisorderly : [
            {
                id: 1,
                name: path.join("random", "acme", "tests", "usil", "enterprise", "01.test.js"),
            },
            {
                id: 2,
                name: path.join("acme", "tests", "acme", "usil", "enterprise", "02.test.js"),
            },
            {
                id: 3,
                name: path.join("bcme", "usil-cepel", "tests", "acme", "enterprise", "01.test.js"),
            },
            {
                id: 4,
                name: path.join("23232", "tests", "usil", "center", "01.test.js"),
            },
        
        ],
        mockResultOrderly: [
            {
                id: 3,
                name: path.join("bcme", "usil-cepel", "tests", "acme", "enterprise", "01.test.js"),
            },
            {
                id: 2,
                name: path.join("acme", "tests", "acme", "usil", "enterprise", "02.test.js"),
            },
            {
                id: 1,
                name: path.join("random", "acme", "tests", "usil", "enterprise", "01.test.js"),
            },
            {
                id: 4,
                name: path.join("23232", "tests", "usil", "center", "01.test.js"),
            },
        ]
    }
}

module.exports = data;