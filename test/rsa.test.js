const expect = require('chai').expect;
const rsa = require('../app/lib/rsa');
const _ = require('lodash');

/** Test data. */
const privateKey =
	'-----BEGIN PRIVATE KEY-----\n' +
	'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\n' +
	'bY2PRTudHQsJMiS6h0xyX1YlQSGoYnjl\n' +
	'-----END PRIVATE KEY-----';

const publicKey =
	'-----BEGIN PUBLIC KEY-----\n' +
	'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5TXpcOEYYp5hxw9JeeGX\n' +
	'EHapm09dQBxAwIJKqsSiykDZdPeM4SL5HWohoDpXFQK0L3EpyfeKMS3bAkK8WIw8\n' +
	'TRV2JvdGajollLB9nd6HqrlBP32OHApuB3tXQDLDdHl1hTu2+PDb2Yl1tVjfvaKF\n' +
	'v2/acb4XSzlcbyTHm4GJkRa4sUPHp0PTs4c9LVFyGRD5lvRE6BUhYmaS1gwp9a1i\n' +
	'P+f+z7xBq2TUe3+IfG/pnaat0IXGsjmopSEPuI1z2dcHJMz9b+Kf2lplULvxYDYf\n' +
	'ayTopn4+kocMEMn1dYAP54K3KfpggaQ8vYrB5UQZdbr1vkB3y5/nVN1pXDB82m1d\n' +
	'30m2jDNmn91f2OThvGDLsvm3kYcvL+eTGznM54NFvF5qhfhimqt8q4DYaR1IBiDZ\n' +
	'3ojhR7Q2Vb33y3AsC9wCDxG0KXceLlUJ14EINF0MPLx0X1yMgunawJgl70AjPXKO\n' +
	'MCQ4TAt+G4YIsgx9HXsFptzrf9t3eFu5iAQaBlorF85uTJ/LqD/jMbV07DzXGagC\n' +
	'uvUh0hagiFkYQMhZPsk7AMCRVZul/d/sBdX7Ui7PA6J5V1SAH4RmlnZwkJkDrLOD\n' +
	'pox95QzICy2MXucMIlFLu5yjAbyhfVJup/2yg9gj7WkMpCRL1XVbl9h6gdpaFgCg\n' +
	'5mAdZv6QdVA6/agqkruugR0CAwEAAQ==\n' +
	'-----END PUBLIC KEY-----';

/** Unsorted test body object. */
const body = {
    b: {
        array: [],
        embedded: 2,
    },
    a: 'data',
};

describe('RSA library tests', async () => {
    it('should return true', () => {
        expect(
            rsa.verifySignature(
                body,
                rsa.generateSignature(body, privateKey),
                publicKey.toString(),
            ),
        ).to.equal(true);
    });

    it('should return false', () => {
        expect(
            rsa.verifySignature(
                {...body, add: 'me'},
                rsa.generateSignature(body, privateKey),
                publicKey.toString(),
            ),
        ).to.equal(false);
    });
});

const stringifyBodyTestHelper = (fn, oldImplementation = false) => {
    // Define the test cases
    const tests = [
        {
            name: 'should succeed with basic data',
            in: {
                b: 'test',
                c: [
                    {embedded: 2},
                ],
                a: {z: 'value', x: 'data'},
            },
            expect: '{"a": {"x": "data","z": "value"},"b": "test","c": [{"embedded": 2}]}',
        },
        {
            name: 'should succeed with ascii charracters',
            in: {test: '! \\"$#%&\'()*,+-./:;<=>?[]{}~|_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'},
            // double escape to check that the charracter actually gets escaped.
            expect: '{"test": "! \\\\\\"$#%&\'()*,+-./:;<=>?[]{}~|_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"}',
        },
        {
            name: 'should succeed with non ascii charracters',
            in: {test: 'hello & foo € bar'},
            // double escape to check that the charracter actually gets escaped.
            expect: '{"test": "hello & foo \\u20ac bar"}',
        },
        {
            name: 'should succeed with non ascii charracters 2',
            in: {test: 'äöuyåÅ'},
            // double escape to check that the charracter actually gets escaped.
            expect: '{"test": "\\u00e4\\u00f6uy\\u00e5\\u00c5"}',
        },
        {
            name: 'should succeed with no added space and fail with the old implementation',
            in: {test: '":hello'},
            expect: '{"test": "\\":hello"}',
            shouldFailOnOldImplementation: true,
        },
        {
            name: 'should succeed with non object value and fail with the old implementation',
            in: 'hello',
            expect: '"hello"',
            shouldFailOnOldImplementation: true,
        },
    ];

    tests.forEach(test => {
        it(test.name, () => {
            const out = expect(fn(test.in));
            if (test.shouldThrow) {
                out.to.throw();
                return;
            }
            /** Uncomment this to make the test suite pass with the old implementation
            if(test.shouldFailOnOldImplementation) {
                return;
            }
            */
            out.to.equal(test.expect);
        });});
};

const sortObjectOld = function (object) {
    const sortedObj = {};
    let keys = _.keys(object);

    // Sort keys.
    keys = _.sortBy(keys, key => key);

    // Iterate sub objects.
    _.each(keys, key => {
        if (typeof object[key] == 'object' && !(object[key] instanceof Array)) {
            /** Recursion. */
            sortedObj[key] = sortObjectOld(object[key]);
        } else {
            sortedObj[key] = object[key];
        }
    });

    return sortedObj;
};

const stringifyBodyOld = function (body) {
    // Stringify sorted object.
    return JSON.stringify(sortObjectOld(body))
        .replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0)
            .toString(16)).substr(-4)).replace(new RegExp('":', 'g'), '": ')
        .trim();
};

describe('stringifyBody tests', async () => {
    stringifyBodyTestHelper(rsa.stringifyBody);
});

describe('stringifyBodyOld tests', async () => {
    stringifyBodyTestHelper(stringifyBodyOld, true);
});

describe('sortObject old vs new implementation', async () => {
    it('should equal with the old implementation', () => {
        expect(rsa.sortObject(body)).to.deep.equal(sortObjectOld(body));
    });
});
