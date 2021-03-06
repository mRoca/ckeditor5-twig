'use strict';

module.exports = {
    extends: 'ckeditor5',
    rules: {
        'max-len': [ 'error', {
            code: 250,
            ignoreUrls: true,
            ignoreComments: false,
            ignoreRegExpLiterals: true,
            ignoreStrings: false,
            ignoreTemplateLiterals: false
        } ],
        'indent': [ 'error', 4 ]
    },
    env: {
        amd: true,
        node: true,
        browser: true
    }
};
