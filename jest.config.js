module.exports = {
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,vue}'],
    coverageProvider: 'babel',
    coverageDirectory: 'tests/coverage/',
    coverageReporters: ['html', 'text-summary'],
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'json', 'vue'],
    transform: {
        '^.+\\.vue$': require.resolve('@vue/vue2-jest'),
        '^.+\\.jsx?$': require.resolve('babel-jest'),
    },
    transformIgnorePatterns: ['/node_modules/(?!(ip-regex)/)'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/tests/mocks/fileMock.js',
        '\\.(css|less)$': '<rootDir>/tests/mocks/fileMock.js',
    },
    testMatch: ['**/tests/unit/**/*.spec.[jt]s?(x)', '**/__tests__/*.[jt]s?(x)'],
};
