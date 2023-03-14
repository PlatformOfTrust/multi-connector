'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const rp = require('request-promise');
const RRule = require('rrule').RRule;
const cache = require('../../app/cache');
const {queue} = require('../../app/lib/queue');
const winston = require('../../logger.js');
const transformer = require('../../app/lib/transformer');
const noteSchema = require('../schemas/note_granlund-manager-v4.0.json');
const serviceRequestSchema = require('../schemas/service-request_granlund-manager-v2.1.json');
const maintenanceInformationSchema = require('../schemas/maintenance-information_granlund-manager-v3.2.json');

/**
 * Granlund Manager transformer.
 */

const name = 'granlund-manager';
const UPDATE_TIME = 10 * 60 * 1000;
const STORAGE_TIME = 20 * 24 * 60 * 60 * 1000;

/**
 * Resolve tasks by object id.
 *
 * @param {Object} config
 * @param {String} url
 * @param {Boolean} [skip]
 * @return {Object}
 */
const getTasks = async (config, url, skip = false) => {
    try {
        const cached = cache.getDoc(config.productCode, url);
        if (!cached || skip) {
            const oauth2 = config.plugins.find(p => p.name === 'oauth2');
            const options = await oauth2.request(config, {});
            const {body} = await request('GET', url, {...options.headers, 'Content-Type': 'application/json'});
            cache.setDoc(config.productCode, url, body, STORAGE_TIME / 1000);
            return body;
        } else {
            const ttl = cache.getTtl(config.productCode, url) || 0;
            const expiration = ttl - STORAGE_TIME + UPDATE_TIME;
            if (new Date().getTime() > expiration && !skip) {
                getTasks(config, url, true);
            }
            return cached;
        }
    } catch (e) {
        return null;
    }
};

/**
 * Resolve notes by object id.
 *
 * @param {Object} config
 * @param {String} url
 * @param {Boolean} [skip]
 * @return {Object}
 */
const getNotes = async (config, url, skip = false) => {
    try {
        const cached = cache.getDoc(config.productCode, url);
        if (!cached || skip) {
            const oauth2 = config.plugins.find(p => p.name === 'oauth2');
            const options = await oauth2.request(config, {});
            const {body} = await request('GET', url, {...options.headers, 'Content-Type': 'application/json'});
            cache.setDoc(config.productCode, url, body, STORAGE_TIME / 1000);
            return body;
        } else {
            const ttl = cache.getTtl(config.productCode, url) || 0;
            const expiration = ttl - STORAGE_TIME + UPDATE_TIME;
            if (new Date().getTime() > expiration && !skip) {
                getNotes(config, url, true);
            }
            return cached;
        }
    } catch (e) {
        return null;
    }
};

/**
 * Resolve single task.
 *
 * @param {Object} config
 * @param {Object} value
 * @param {Boolean} [skip]
 * @param {Number} [priority]
 * @return {Object}
 */
const getTask = async (config, value, skip = false, priority = 0) => {
    try {
        const cached = cache.getDoc(config.productCode, value.Task.Id);
        if ((!cached || skip) && priority === 0) {
            const oauth2 = config.plugins.find(p => p.name === 'oauth2');
            const options = await oauth2.request(config, {});
            const url = `${(Array.isArray(config.authConfig.path) ? config.authConfig.path[0] : config.authConfig.path).split('/').slice(0, 5).join('/')}/maintenance-tasks/${value.Task.Id}`;
            const {body} = await request('GET', url, {...options.headers, 'Content-Type': 'application/json'});
            // Store completed tasks permanently.
            const ttl = value.Task.StateId === 90 ? 0 : STORAGE_TIME / 1000;
            cache.setDoc(config.productCode, value.Task.Id, body, ttl);
            return body;
        } else {
            const ttl = cache.getTtl(config.productCode, value.Task.Id) || 0;
            const expiration = ttl - STORAGE_TIME + UPDATE_TIME;
            // Update only tasks which have not been completed.
            if (new Date().getTime() > expiration && !skip && value.Task.StateId !== 90) {
                getTask(config, value, true);
            }
            return cached;
        }
    } catch (e) {
        return null;
    }
};

/**
 * Resolve single note.
 *
 * @param {Object} config
 * @param {Object} value
 * @param {Boolean} [skip]
 * @param {Number} [priority]
 * @return {Object}
 */
const getNote = async (config, value, skip = false, priority = 0) => {
    try {
        const cached = cache.getDoc(config.productCode, value.MaintenanceNoteId);
        if ((!cached || skip) && priority === 0) {
            const oauth2 = config.plugins.find(p => p.name === 'oauth2');
            const options = await oauth2.request(config, {});
            const url = `${(Array.isArray(config.authConfig.path) ? config.authConfig.path[0] : config.authConfig.path).split('/').slice(0, 5).join('/')}/maintenance-notes/${value.MaintenanceNoteId}`;
            const {body} = await request('GET', url, {...options.headers, 'Content-Type': 'application/json'});
            cache.setDoc(config.productCode, value.MaintenanceNoteId, body, STORAGE_TIME / 1000);
            return body;
        } else {
            const ttl = cache.getTtl(config.productCode, value.MaintenanceNoteId) || 0;
            const expiration = ttl - STORAGE_TIME + UPDATE_TIME;
            if (new Date().getTime() > expiration && !skip) {
                getTask(config, value, true);
            }
            return cached;
        }
    } catch (e) {
        return null;
    }
};

/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object/String} id
 * @param {Object} data
 * @param {Number} index
 * @return {Object}
 */
const handleData = async (config, id, data, index) => {
    const startTime = new Date().getTime();
    let object = {};
    try {
        let key;
        for (let j = 0; j < data.length; j++) {
            let result = {};
            if (data[j]['@type'] === 'Note') {
                key = Object.keys(noteSchema.properties.data.properties)[0];
                let value = data[j][config.output.value];

                if (new Date().getTime() < (startTime + 1000)) {
                    // Resolve note.
                    try {
                        const doc = await getNote(config, value, false, index);
                        value = doc ? {...doc, ...value} : value;
                    } catch (err) {
                        winston.log('error', err.message);
                    }
                } else {
                    getNote(config, value);
                }

                result = transformer.transform(value, noteSchema.properties.data);
            } else if (data[j]['@type'] === 'Case' || data[j]['@type'] === '${type}') {
                key = Object.keys(serviceRequestSchema.properties.data.properties)[0];
                const value = data[j][config.output.value];

                // Transform raw input.
                value.type = 'Case';
                value.statusType = 'Status';
                value.statusCodeType = 'StatusCode';
                value.creatorType = 'Organization';
                value.requestorType = 'Person';
                value.parentObjectType = 'Object';
                value.locationType = 'Location';
                value.locationOrganizationType = 'Organization';

                switch (value.Phase) {
                    case 'Undefined':
                        value.Phase = 'New';
                        break;
                    case 'Defined':
                        value.Phase = 'Completed';
                        break;
                    case 'UnderProgress':
                        value.Phase = 'Ongoing';
                        break;
                }

                try {
                    // Create idLocal from description.
                    const description = value.Request;
                    let regExp = /\[(.*?)]/g;
                    let removeOuterBrackets = true;
                    if (Object.hasOwnProperty.call(config.parameters, 'pattern')) {
                        regExp = config.parameters.pattern;
                        removeOuterBrackets = false;
                    }
                    const matches = _.uniq(((description || '').match(regExp) || []).filter(tag => tag.length > 2).map(s => removeOuterBrackets ? s.slice(1, -1) : s));
                    if (matches[0]) {
                        value.CodedObject.Id2 = matches[0].split(' ')[0] || matches[0];
                        const name = matches[0].split(' ').filter(i => i !== '');
                        if (name.length > 1) {
                            name.shift();
                        }
                        value.CodedObject.Name2 = name.join(' ');
                        value.CodedObject.DisplayName2 = `${value.CodedObject.Id2}${value.CodedObject.Name2 !== value.CodedObject.Id2 ? ' ' + value.CodedObject.Name2 : ''}`;
                    }
                } catch (err) {
                    console.log(err.message);
                }

                result = transformer.transform(value, serviceRequestSchema.properties.data);
            } else {
                key = Object.keys(maintenanceInformationSchema.properties.data.properties)[0];
                let value = data[j][config.output.value];

                if (new Date().getTime() < (startTime + 1000)) {
                    // Resolve jobs.
                    try {
                        const doc = await getTask(config, value, false, index);
                        value = doc ? doc : value;
                    } catch (err) {
                        winston.log('error', err.message);
                    }
                } else {
                    getTask(config, value);
                }
                value.updated = new Date().toISOString();
                value.Jobs = (value.Jobs || []).map(j => {
                    switch (j.StateId) {
                        case 60:
                            j.State = 'New'; // Job doesnt have StartDate
                            break;
                        case 90:
                            j.State = 'Completed'; // Job has DoneDate
                            break;
                        case 30:
                            j.State = 'Ongoing'; // Job has StartDate
                            break;
                    }
                    j.TaskDate = value.Task.TaskDate;
                    j.TaskStarDate = value.Task.StartDate;
                    j.TaskDoneDate = value.Task.DoneDate;
                    j.TaskMustDoneDate = value.Task.MustDoneDate;
                    return {...j, Mission: value.Mission};
                });
                switch (value.Task.StateId) {
                    case 60:
                        value.Task.State = 'New'; // Job doesnt have StartDate
                        break;
                    case 90:
                        value.Task.State = 'Completed'; // Job has DoneDate
                        break;
                    case 30:
                        value.Task.State = 'Ongoing'; // Job has StartDate
                        break;
                }
                value.CodedObject = (value.Jobs || []).map(j => j.CodedObject);

                try {
                    let freq = 'YEARLY';
                    let options = {};
                    let years = [];
                    let months = [];
                    switch (value.Mission.MaintenanceCycle) {
                        case 6:
                            freq = 'YEARLY';
                            years = value.Mission.SelectedYears.split(',').map(y => Number.parseInt(y));
                            options = {
                                interval: years.reduce((prev, curr) => Math.min(Math.abs(prev - curr), prev)),
                            };
                            break;
                        case 5:
                            freq = 'YEARLY';
                            break;
                        case 3:
                            freq = 'YEARLY';
                            months = value.Mission.MaintenanceMonths.split(',').map(y => Number.parseInt(y));
                            options = {
                                count: months.length,
                            };
                            break;
                        case 2:
                            freq = 'MONTHLY';
                            break;
                    }
                    if (value.Mission.Name.includes('kuukausittain')
                        || value.Mission.Name.includes('Kuukausittain')
                        || value.Mission.Name.includes('Kuukausityöt')
                        || value.Mission.Name.includes('Kuukausitesti')) {
                        freq = 'MONTHLY';
                    }
                    if (value.Mission.Name.includes('viikoittain') || value.Mission.Name.includes('Viikoittain')) {
                        freq = 'WEEKLY';
                    }
                    // console.log(value.Mission.MaintenanceCycle + ' --> ' + value.Mission.Name + ' --> ' + freq);

                    // Parse schedule
                    value.schedule = new RRule({
                        freq: RRule[freq],
                        dtstart: new Date(value.Task.TaskDate),
                        ...options,
                    }).toString();
                } catch (e) {
                    console.log(e.message);
                }

                result = transformer.transform(value, maintenanceInformationSchema.properties.data);
                // result[Object.keys(result)[0]][0].raw = value;
                try {
                    const targets = result[Object.keys(result)[0]][0].processTarget.map(p => p.idLocal);
                    result[Object.keys(result)[0]] = targets.map(idLocal => ({...result[Object.keys(result)[0]][0], processTarget: [result[Object.keys(result)[0]][0].processTarget.find(p => p.idLocal === idLocal)]}));
                } catch (err) {
                    console.log('Split fail');
                    console.log(err.message);
                }
                // result[Object.keys(result)[0]][0].processTarget = [{idLocal: id}];
            }

            // Merge all to same result.
            if (Object.hasOwnProperty.call(object, key)) {
                if (!Array.isArray(object[key])) {
                    object[key] = [object[key]];
                }
                if (!Array.isArray(result[key])) {
                    result[key] = [result[key]];
                }
                object[key].push(...result[key]);
            } else {
                object = result;
            }
        }
        if (JSON.stringify(object) === '{}') {
            object = {[key]: []};
        }
        return object;
    } catch (err) {
        return object;
    }
};

/**
 * Filters response object by id.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        const ids = (_.get(config, 'parameters.ids') || []).map(object => object.id || object.idLocal).flat();
        // Skip filtering in case ids array is empty.
        if (ids.length === 0) { return response; }
        if (typeof response === 'string') {
            response = await getTasks(config, response);
        }
        return response;
    } catch (e) {
        return response;
    }
};

/**
 * Transforms output to Platform of Trust context schema.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    // Initialize harmonized output.
    const result = {
        [config.output.context]: config.output.contextValue,
        [config.output.object]: {
            [config.output.array]: [],
        },
    };

    // Hand over data objects to transformer.
    try {
        const array = output.data[config.output.array];
        for (let i = 0; i < array.length; i++) {
            result[config.output.object][config.output.array].push(
                await handleData(
                    config,
                    array[i][config.output.id],
                    array[i][config.output.data],
                    i,
                ));
        }

        /*
        // Calculate service request counts.
        try {
            const count = {};
            const completed = {};
            result[config.output.object][config.output.array] = result[config.output.object][config.output.array].map((t) => {
                if (Object.hasOwnProperty.call(t, 'maintenanceInformation') || Object.hasOwnProperty.call(t, 'note')) {
                    const keyName = Object.hasOwnProperty.call(t, 'maintenanceInformation') ? 'maintenanceInformation' : 'note';
                    t[keyName].forEach(m => {
                        if (m.processTarget[0]) {
                            const done = m.status[0].status === 'Completed';
                            count[m.processTarget[0].idLocal] = !Object.hasOwnProperty.call(count, m.processTarget[0].idLocal) ? 1 : count[m.processTarget[0].idLocal] + 1;
                            completed[m.processTarget[0].idLocal] = !Object.hasOwnProperty.call(completed, m.processTarget[0].idLocal) ? (done ? 1 : 0) : completed[m.processTarget[0].idLocal] + (done ? 1 : 0);
                        }
                    });
                    t[keyName] = t[keyName].map(m => {
                        if (m.processTarget[0]) {
                            if (Object.hasOwnProperty.call(count, m.processTarget[0].idLocal)) {
                                m.count = count[m.processTarget[0].idLocal];
                                m.completed = completed[m.processTarget[0].idLocal];
                                m.value =  m.completed === 0 || m.count === 0 ? 0 : Math.round(m.completed / m.count * 100);
                                // delete count[m.processTarget[0].idLocal];
                            }
                        }
                        return m;
                    });
                }
                return t;
            });
        } catch (err) {
            console.log('Count fail');
            console.log(err.message);
        }
        */

        // Calculate task counts.
        try {
            const count = {};
            const completed = {};
            result[config.output.object][config.output.array] = result[config.output.object][config.output.array].map((t) => {
                if (Object.hasOwnProperty.call(t, 'maintenanceInformation') || Object.hasOwnProperty.call(t, 'note') || Object.hasOwnProperty.call(t, 'serviceRequest')) {
                    const keyName = Object.hasOwnProperty.call(t, 'maintenanceInformation') ? 'maintenanceInformation' : Object.hasOwnProperty.call(t, 'note') ? 'note' : 'serviceRequest';
                    t[keyName].forEach(m => {
                        const target = (m.processTarget || [])[0] || m.targetObject;
                        if (target) {
                            const done = (m.status[0].status || m.status[0].name) === 'Completed';
                            const targetId = target.idLocal2 || target.idLocal;
                            count[targetId] = !Object.hasOwnProperty.call(count, targetId) ? 1 : count[targetId] + 1;
                            completed[targetId] = !Object.hasOwnProperty.call(completed, targetId) ? (done ? 1 : 0) : completed[targetId] + (done ? 1 : 0);
                        }
                    });
                    t[keyName] = t[keyName].map(m => {
                        const target = (m.processTarget || [])[0] || m.targetObject;
                        if (target) {
                            const targetId = target.idLocal2 || target.idLocal;
                            if (Object.hasOwnProperty.call(count, targetId)) {
                                m.count = count[targetId];
                                m.completed = completed[targetId];
                                m.value =  m.completed === 0 || m.count === 0 ? 0 : Math.round(m.completed / m.count * 100);
                                // delete count[m.processTarget[0].idLocal];
                            }
                        }
                        return m;
                    });
                }
                return t;
            });
        } catch (err) {
            console.log('Count fail');
            console.log(err.message);
        }

        // Filter out duplicate tasks.
        try {
            const known = [];
            result[config.output.object][config.output.array] = result[config.output.object][config.output.array].map((t) => {
                if (Object.hasOwnProperty.call(t, 'maintenanceInformation')) {
                    t.maintenanceInformation = t.maintenanceInformation.filter((t) => {
                        const isDuplicate = known.includes(`${t.idLocal}-${(t.processTarget[0] || {}).idLocal}`);
                        if (!isDuplicate) {
                            known.push(`${t.idLocal}-${(t.processTarget[0] || {}).idLocal}`);
                        }
                        return !isDuplicate;
                    });
                }
                return t;
            });
        } catch (err) {
            console.log('Duplicate filter fail');
            console.log(err.message);
        }

        // Filter out duplicate notes.
        try {
            const known = [];
            result[config.output.object][config.output.array] = result[config.output.object][config.output.array].map((t) => {
                if (Object.hasOwnProperty.call(t, 'note')) {
                    t.note = t.note.filter((t) => {
                        const isDuplicate = known.includes(t.idLocal);
                        if (!isDuplicate) {
                            known.push(t.idLocal);
                        }
                        return !isDuplicate;
                    });
                }
                return t;
            });
        } catch (err) {
            console.log('Duplicate filter fail');
            console.log(err.message);
        }

        // Filter out duplicate service request.
        try {
            const known = [];
            result[config.output.object][config.output.array] = result[config.output.object][config.output.array].map((t) => {
                if (Object.hasOwnProperty.call(t, 'serviceRequest')) {
                    t.serviceRequest = t.serviceRequest.filter((t) => {
                        const isDuplicate = known.includes(t.idLocal);
                        if (!isDuplicate) {
                            known.push(t.idLocal);
                        }
                        return !isDuplicate;
                    });
                }
                return t;
            });
        } catch (err) {
            console.log('Duplicate filter fail');
            console.log(err.message);
        }

        if (result[config.output.object][config.output.array].length === 1) {
            result[config.output.object] =
                result[config.output.object][config.output.array][0];
        } else {
            result[config.output.object][config.output.array] =
                result[config.output.object][config.output.array].map((o => {
                    return Object.values(o);
                })).flat(2);
        }
        return result;
    } catch (err) {
        return output;
    }
};

/**
 * Sends http request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} [headers]
 * @param {String/Object/Array} [body]
 * @return {Promise}
 */
const request = async (method, url, headers, body) => {
    const options = {
        method: method,
        uri: url,
        json: true,
        body: body,
        resolveWithFullResponse: true,
        headers: headers,
    };

    try {
        const result = await queue(`${name}-${Math.round(Math.random())}`, rp, [options]);
        return Promise.resolve(result);
    } catch (err) {
        return Promise.reject(err);
    }
};

const exportEquipmentObjects = (data, dataKey, criteria) => {
    const output = data[dataKey].map(b => exportEquipmentObjects(b, dataKey, criteria)).flat();
    if (Object.entries(criteria).map(([key, value]) => data[key] === value).every(a => !!a)) {
        output.push({...data, [dataKey]: undefined});
    }
    return output;
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
        if (_.get(template.parameters, 'targetObject.@type')) {
            if (_.get(template.parameters, 'targetObject.idLocal')) {
                const oauth2 = template.plugins.find(p => p.name === 'oauth2');
                if (!oauth2) {
                    return Promise.reject();
                }
                const options = await oauth2.request(template, {});
                // Update document.
                // /service-requests/{{serviceRequestId}}/Phase
                const update = {};
                if (_.get(template.parameters, 'targetObject.status.0.name')) {
                    update.Phase = template.parameters.targetObject.status[0].name;
                    switch (update.Phase) {
                        case 'New':
                            update.Phase = 'New';
                            break;
                        case 'Completed':
                            update.Phase = 'Defined';
                            break;
                        case 'Ongoing':
                            update.Phase = 'UnderProgress';
                            break;
                    }
                }
                // Comment is required.
                const defaultComment = 'Päivitys';
                if (_.get(template.parameters, 'targetObject.process.additionalInformation')) {
                    update.Comment = template.parameters.targetObject.process.additionalInformation || defaultComment;
                } else {
                    update.Comment = defaultComment;
                }
                if (!_.isEmpty(update)) {
                    const url = template.authConfig.path.split('/').slice(0, 5).join('/') + '/service-requests/' + template.parameters.targetObject.idLocal + '/Phase';
                    const {body} = await request('PUT', url, {...options.headers, 'Content-Type': 'application/json'}, update);
                    winston.log('info', 'Updated ' + template.parameters.targetObject.idLocal);
                    template.authConfig.path = body;
                } else {
                    template.authConfig.path = [];
                }
                template.protocol = 'custom';
            }
        } else if (Object.keys(template.dataPropertyMappings).includes('Process') || Object.keys(template.dataPropertyMappings).includes('Note')) {
            /*
            // Maintenance Information
            const oauth2 = template.plugins.find(p => p.name === 'oauth2');
            if (!oauth2) {
                return Promise.reject();
            }
            const options = await oauth2.request(template, {});
            const url = (Array.isArray(template.authConfig.path)
                ? template.authConfig.path[0]
                : template.authConfig.path
            ).split('/').slice(0, 5).join('/') + '/favorite-portfolios?onlyFacilitiesAndBuildings=false';
            const {body} = await request('GET', url, {...options.headers, 'Content-Type': 'application/json'});
            const equipment = exportEquipmentObjects(body[0].Data[0].Data[0], 'ChildObjects', {ObjectSort: 0});
            // const equipment = exportEquipmentObjects(body[0].Data[0].Data[0], 'ChildObjects', {TypeUsage: 'Equipment'});
            // console.log(_.uniq(equipment.map(v => v.TypeUsage)));
            // console.log(equipment.map(x => x.Id).length);
            equipment.map(x => console.log(x.Id + ';' + x.DisplayName));
            // console.log(JSON.stringify(equipment.map(x => x.Id + ';' + x.Name + '\n')));
            */

            const notes = Object.keys(template.dataPropertyMappings).includes('Note');
            let apiPath = '/maintenance-plans';
            template.output.contextValue = 'https://standards.oftrust.net/v2/Context/DataProductOutput/MaintenanceInformation/?v=3.2';
            template.output.array = 'maintenanceInformation';
            template.protocol = 'custom';
            if (notes) {
                apiPath = '/maintenance-notes';
                template.output.contextValue = 'https://standards.oftrust.net/v2/Context/DataProductOutput/Note/?v=4.0';
                template.output.array = 'note';
                template.protocol = 'custom';
            }

            // apiPath = '/maintenance-notes'
            template.parameters.targetObject.idLocal = Array.isArray(template.parameters.targetObject.idLocal) ? template.parameters.targetObject.idLocal : [template.parameters.targetObject.idLocal];
            template.authConfig.path = template.parameters.targetObject.idLocal.map(p => (Array.isArray(template.authConfig.path) ? template.authConfig.path[0] : template.authConfig.path).split('/').slice(0, 5).join('/') + `/objects/${_.isObject(p) ? (p.id || p.idLocal) : p}${apiPath}`);
            const cached = template.authConfig.path.filter(p => !!cache.getDoc(template.productCode, p));
            const preload = template.authConfig.path.filter(p => !cached.includes(p));

            if (template.authConfig.path.length > 1) {
                template.authConfig.path = [...cached, ...preload.slice(-2)];
            }

            const loader = async (urls) => {
                for (let i = 0; i < urls.length; i++) {
                    if (notes) {
                        await getNotes(template, urls[i]);
                    } else {
                        await getTasks(template, urls[i]);
                    }

                }
            };

            loader(preload);
        }
    } catch (err) {
        winston.log('error', err.message);
        return template;
    }
    return template;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name,
    template,
    response,
    output,
};
