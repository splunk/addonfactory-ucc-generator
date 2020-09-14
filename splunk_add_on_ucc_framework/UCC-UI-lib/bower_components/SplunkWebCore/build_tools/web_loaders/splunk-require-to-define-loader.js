module.exports = function requireToDefine(content) {
    return content.replace(/require/, 'define');
};
