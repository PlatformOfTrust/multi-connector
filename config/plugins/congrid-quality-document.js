'use strict';
/**
 * Module dependencies.
 */
const rp = require('request-promise');
const req = require('request');
const https = require('https');
const fs = require('fs');

/**
 * Congrid quality document creator plugin.
 */

const DOWNLOAD_DIR = './temp/';

/**
 * Sends http request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} [headers]
 * @param {String/Object/Array} [body]
 * @return {Promise}
 */
function request (method, url, headers, body) {
    const options = {
        method: method,
        uri: url,
        json: true,
        body: body,
        resolveWithFullResponse: true,
        headers: headers,
    };

    return rp(options).then(result => Promise.resolve(result))
        .catch((error) => {
            return Promise.reject(error);
        });
}

/**
 * Downloads file from given URL.
 *
 * @param {String} url
 * @param {String} folder
 * @return {Promise}
 */
const downloadFile = async (url, folder = 'unspecified') => {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const dir = DOWNLOAD_DIR + folder;
        // Create directory, if it does not exist.
        if (!fs.existsSync(dir)) await fs.mkdirSync(dir);
        const downloadPath = dir  + '/' + filename;
        return new Promise(resolve => {
            const file = fs.createWriteStream(downloadPath);
            https.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    file.close();
                    resolve(downloadPath);
                });
            });
        });
    } catch (e) {
        console.log(e.message);
        return null;
    }
};

/**
 * Uploads file to given URL.
 *
 * @param {Object} url
 * @param {String} filePath
 * @return {Promise}
 */
const uploadfile = async (url, filePath) => {
    try {
        return await new Promise((resolve, reject) => {
            const stats = fs.statSync(filePath);
            fs.createReadStream(filePath).pipe(req({
                method: 'PUT',
                url: url,
                headers: {
                    'Content-Length': stats['size'],
                },
            }, function (err, res) {
                // Remove uploaded file from local file system.
                fs.unlink(filePath, () => false);
                err ? reject(err) : resolve(res.statusCode);
            }));
        });
    } catch (e) {
        console.log(e.message);
        return null;
    }
};

/**
 * Switch querying protocol to REST.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {

        // Validate type.
        if (template.parameters.targetObject['@type'] !== 'Document') {
            return template;
        }

        // TODO: Testing.
        const qualityDocumentName = 'Sertifikaatti';
        const projectCode = '123124';
        const workSectionCode = '2.1';
        const workActivityName = 'CE-dokumentit';

        // TODO: Get order from CALS by WP, which is in the end of the filename.
        // https://c4-prod-apim.azure-api.net/pot/instances/{instanceId}/purchaseorders/{purchaseOrderId}
        // Query CALS connector through broker API.

        const domain = 'https://api.congrid.com';
        const apiToken = 'cfe48adb6ae45905c2ffa823ece655f29a46a07d';
        const headers = {'Congrid-API-Token': apiToken};

        template.authConfig.url = domain;
        template.authConfig.headers['Congrid-API-Token'] = apiToken;

        const originalFilename = template.parameters.targetObject.name;
        const contentType = template.parameters.targetObject['categorizationInternetMediaType'];
        if (!contentType) {
            return Promise.reject(new Error('Missing field categorizationInternetMediaType.'));
        }

        /** Create document and fetch it */
        const projectsUrl = domain + '/v2/projects?projectCode=' + projectCode;
        const projects = await request('GET', projectsUrl, headers);
        const project = projects.body.results.find(p => p.projectCode === projectCode);

        const matricesUrl = domain + '/v2/projects/' + project.id + '/matrices';
        const matrices = await request('GET', matricesUrl, headers);
        const matrix = matrices.body.results.find(p => p.projectId === project.id);

        const workSectionsUrl = domain + '/v2/projects/' + project.id + '/workSections?matrixId=' + matrix.id + '&code=' + workSectionCode;
        const workSections = await request('GET', workSectionsUrl, headers);
        const workSection = workSections.body.results.find(p => p.code === workSectionCode);

        const workActivitiesUrl = domain + '/v2/projects/' + project.id + '/workActivities?matrixId=' + matrix.id + '&name=' + workActivityName;
        const workActivities = await request('GET', workActivitiesUrl, headers);
        const workActivity = workActivities.body.results.find(p => p.name === workActivityName);

        const body = {
            contentType,
            'createdAt': new Date().toISOString(),
            'name': qualityDocumentName,
            'statusId': 'PENDING',
            originalFilename,
            'projectId': project.id,
            'workActivityId': workActivity.id,
            'workSectionId': workSection.id,
        };

        const downloadUrl = template.parameters.targetObject['url'];
        if (!downloadUrl) {
            return Promise.reject(new Error('Missing field url.'));
        }

        // Download file from given url.
        const file = await downloadFile(downloadUrl, template.productCode);
        if (!file) {
            return Promise.reject(new Error('Failed to download file from given url.'));
        }

        // Create quality document.
        const qualityDocumentsUrl = domain + '/v2/qualityDocuments';
        const create = await request('POST', qualityDocumentsUrl, headers, body);
        const qualityDocument = create.body;

        // Upload quality document.
        const uploadUrl = qualityDocument.signedUploadUrl;
        const upload = await uploadfile(uploadUrl, file);
        if (!upload) {
            return Promise.reject(new Error('Failed to upload file to given url.'));
        }

        // Update quality document availability.
        body.available = true;
        await request('PUT', qualityDocumentsUrl + '/' + qualityDocument.id, headers, body);

        // Fetch the uploaded document.
        template.authConfig.path = '/v2/qualityDocuments/' + qualityDocument.id;
        template.dataObjects = [''];

    } catch (err) {
        console.log(err.message);
        return template;
    }
    return template;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'congrid-quality-document',
    template,
};
