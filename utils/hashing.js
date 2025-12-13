const { hash, compare } = require('bcrypt');
const { createHmac} = require('crypto');

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

exports.hmacProcess = (value, secret) => {
const result = createHmac('sha256', secret).update(value).digest('hex');
return result
}