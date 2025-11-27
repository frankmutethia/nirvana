const { hash, compare } = require('bcrypt');

exports.doHash = (value, saltValue) => {
        return hash(value, saltValue);
};

exports.doCompare = (plainValue, hashedValue) => {
        return compare(plainValue, hashedValue);
};

exports.doValidation = (value, hashedValue) => {
        const result = compare(value, hashedValue);
        return result;
}