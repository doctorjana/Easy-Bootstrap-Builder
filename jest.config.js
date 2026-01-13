module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '**/tests/unit/**/*.test.js'
    ],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/components.js' // Large data file
    ],
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 50,
            functions: 60,
            lines: 60
        }
    },
    verbose: true
};
