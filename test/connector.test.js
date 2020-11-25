const expect = require('chai').expect;
const connector = require('../app/lib/connector');

/** Empty request. */
const reqTemplate = {
    body: {},
    protocol: 'http',
    get: function () {
        return 'localhost:8080';
    },
};

/** Wrapper for getData. */
const getData = async (request) => {
    let result;
    try {
        const res = await connector.getData(request);
        result = res.body ? res.body : res;
    } catch (e) {
        result = e.message;
    }
    return result;
};

let loading = true;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Set listener for completion of loading.
connector.emitter.on('collections',
    async (collections) => {
        loading = false;
    });

describe('Connector library tests', async () => {

    // Wait for connector to load all required files (configurations).
    before(async function () {
        while (loading) {
            await wait(500);
        }
        return Promise.resolve();
    });

    // Close active connector plugins after tests.
    after(async function () {
        setTimeout(process.exit, 3000);
    });

    it('should return data missing for all required fields', async () => {
        expect(JSON.stringify(await getData(reqTemplate))).to.equal(JSON.stringify({
            productCode: ['Missing data for required field.'],
            timestamp: ['Missing data for required field.'],
            parameters: ['Missing data for required field.'],
        }));
    });

    it('should return data missing for some required fields', async () => {
        expect(JSON.stringify(await getData({
            ...reqTemplate,
            body: {
                ...reqTemplate.body,
                productCode: 'default',
            },
        }))).to.equal(JSON.stringify({
            timestamp: ['Missing data for required field.'],
            parameters: ['Missing data for required field.'],
        }));
    });

    it('should return data missing for required field parameters.ids', async () => {
        expect(JSON.stringify(await getData({
            ...reqTemplate,
            body: {
                ...reqTemplate.body,
                productCode: 'default',
                timestamp: new Date(Date.now()).toISOString(),
                parameters: {},
            },
        }))).to.equal(JSON.stringify({
            'parameters.ids': ['Missing data for required field.'],
        }));
    });

    it('should return empty data', async () => {
        expect(JSON.stringify(await getData({
            ...reqTemplate,
            body: {
                ...reqTemplate.body,
                productCode: 'default',
                timestamp: new Date(Date.now()).toISOString(),
                parameters: {
                    ids: [],
                },
            },
        }))).to.equal(JSON.stringify({
            output: {
                '@context': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Sensor/',
                data: {sensors: []},
            },
            payloadKey: 'data',
        },
        ));
    });

    it('should return data', async () => {
        expect(JSON.stringify(await getData({
            ...reqTemplate,
            body: {
                ...reqTemplate.body,
                productCode: 'default',
                timestamp: new Date(Date.now()).toISOString(),
                parameters: {
                    ids: ['TEST'],
                },
            },
        }))).to.not.be.empty;
    });
});
