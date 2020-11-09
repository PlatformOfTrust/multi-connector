'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * Rakennustieto.
 */

/** Property to path parameter mapping. */
const map = {
    ItemGTINCode: 'gtin',
    ItemRTNumber: 'itemNumber',
    SupplierVATNumber: 'supplierVAT',
    ItemTalo2000Classes: 'talo2000',
};

// Source mapping.
const schema = {
    '$schema': 'http://json-schema.org/draft-07/schema',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/ProductCatalog',
    'source': null,
    'type': 'object',
    'title': 'Data product output core schema',
    'description': 'Core schema for general data product output.',
    'required': [
        '@context',
        'data',
        'signature',
    ],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'title': 'JSON-LD context url',
            'description': 'JSON-LD context url with terms required to understand data product content.',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/ProductCatalog/',
        },
        'data': {
            '$id': '#/properties/data',
            'source': null,
            'type': 'object',
            'title': 'Data product output',
            'description': 'Output of data product delivered to customers.',
            'properties': {
                'product': {
                    '$id': '#/properties/data/properties/product',
                    'source': null,
                    'type': 'object',
                    'title': 'Product',
                    'description': 'Product returned from catalog.',
                    'properties': {
                        'codeProductCatalog': {
                            '$id': '#/properties/data/properties/product/properties/codeProductCatalog',
                            'source': 'ItemRTNumber',
                            'type': 'string',
                            'title': 'Product code as specified in catalog',
                            'description': 'Catalog specific product code should be used as parameter. Please refer specific catalog utilized by connector for details.',
                        },
                        'codeProduct': {
                            '$id': '#/properties/data/properties/product/properties/codeProduct',
                            'source': 'ItemSupplierProductCode',
                            'type': 'string',
                            'title': 'Product code',
                            'description': 'Unique product code given by manufacturer.',
                        },
                        'codeProduct2': {
                            '$id': '#/properties/data/properties/product/properties/codeProduct2',
                            'source': null,
                            'type': 'string',
                            'title': 'Product code 2',
                            'description': 'Additional unique product code given by manufacturer.',
                        },
                        'gTIN': {
                            '$id': '#/properties/data/properties/product/properties/gTIN',
                            'source': 'ItemGTINCode',
                            'type': 'string',
                            'title': 'GTIN code',
                            'description': 'GTIN standard based identifier.',
                        },
                        'categorizationUnspsc': {
                            '$id': '#/properties/data/properties/product/properties/categorizationUnspsc',
                            'source': null,
                            'type': 'string',
                            'title': 'UNSPSC Code',
                            'description': 'The United Nations Standard Products and Services Code (UNSPSC) is a taxonomy of products and services for use in eCommerce. It is a four-level hierarchy coded as an eight-digit number, with an optional fifth level adding two more digits.',
                        },
                        'name': {
                            '$id': '#/properties/data/properties/product/properties/name',
                            'source': 'ItemLongProductName_fi',
                            'type': 'string',
                            'title': 'Name',
                            'description': 'Unique product name given by manufacturer.',
                        },
                        'taxVATCode': {
                            '$id': '#/properties/data/properties/product/properties/taxVATCode',
                            'source': 'ItemSupplierVATNumber',
                            'type': 'string',
                            'title': 'VAT code',
                            'description': 'Value-added taxation identifier.',
                        },
                        'nameBrand': {
                            '$id': '#/properties/data/properties/product/properties/nameBrand',
                            'source': 'ItemSupplierBrand',
                            'type': 'string',
                            'title': 'Brand name',
                            'description': 'Brand name.',
                        },
                        'groupName': {
                            '$id': '#/properties/data/properties/product/properties/groupName',
                            'source': 'ItemProductSeries',
                            'type': 'string',
                            'title': 'Product group name',
                            'description': 'Unique product group name given by manufacturer.',
                        },
                        'categorizationSahkonumerot': {
                            '$id': '#/properties/data/properties/product/properties/categorizationSahkonumerot',
                            'source': null,
                            'type': 'string',
                            'title': 'Sahkonumerot product category',
                            'description': 'Categorization name given by Sähkönumerot.fi (Finland).',
                        },
                        'nameTechnical': {
                            '$id': '#/properties/data/properties/product/properties/nameTechnical',
                            'source': 'ItemTechnicalName',
                            'type': 'string',
                            'title': 'Technical name',
                            'description': 'Technical name.',
                        },
                        'categorizationSahkonumerotEnglish': {
                            '$id': '#/properties/data/properties/product/properties/categorizationSahkonumerotEnglish',
                            'source': null,
                            'type': 'string',
                            'title': 'Sahkonumerot product category (EN)',
                            'description': 'Categorization name given by Sähkönumerot.fi (Finland) in english language.',
                        },
                        'categorizationSahkonumerotSwedish': {
                            '$id': '#/properties/data/properties/product/properties/categorizationSahkonumerotSwedish',
                            'source': null,
                            'type': 'string',
                            'title': 'Sahkonumerot product category (SWE)',
                            'description': 'Categorization name given by Sähkönumerot.fi (Finland) in swedish language.',
                        },
                        'length': {
                            '$id': '#/properties/data/properties/product/properties/length',
                            'source': null,
                            'type': 'string',
                            'title': 'Length',
                            'description': 'Length.',
                        },
                        'width': {
                            '$id': '#/properties/data/properties/product/properties/width',
                            'source': null,
                            'type': 'string',
                            'title': 'Width',
                            'description': 'Object width.',
                        },
                        'height': {
                            '$id': '#/properties/data/properties/product/properties/height',
                            'source': null,
                            'type': 'string',
                            'title': 'Height',
                            'description': 'Height.',
                        },
                        'weight': {
                            '$id': '#/properties/data/properties/product/properties/weight',
                            'source': null,
                            'type': 'string',
                            'title': 'Weight',
                            'description': 'Object weight.',
                        },
                        'volume': {
                            '$id': '#/properties/data/properties/product/properties/volume',
                            'source': null,
                            'type': 'string',
                            'title': 'Volume',
                            'description': 'Volume of the object.',
                        },
                        'unitUsage': {
                            '$id': '#/properties/data/properties/product/properties/unitUsage',
                            'source': 'ItemUsageUnit',
                            'type': 'string',
                            'title': 'Usage unit',
                            'description': 'Unit which is applied in usage.',
                        },
                        'unitConversion': {
                            '$id': '#/properties/data/properties/product/properties/unitConversion',
                            'source': null,
                            'type': 'string',
                            'title': 'Conversion unit',
                            'description': 'Conversion unit.',
                        },
                        'unitSales': {
                            '$id': '#/properties/data/properties/product/properties/unitSales',
                            'source': 'ItemSalesUnit',
                            'type': 'string',
                            'title': 'Sales unit',
                            'description': 'Unit which is used in selling.',
                        },
                        'periodWarranty': {
                            '$id': '#/properties/data/properties/product/properties/periodWarranty',
                            'source': null,
                            'type': 'string',
                            'title': 'Warranty period',
                            'description': 'Warranty period.',
                        },
                        'archived': {
                            '$id': '#/properties/data/properties/product/properties/archived',
                            'source': null,
                            'type': 'string',
                            'format': 'date-time',
                            'title': 'Archived date',
                            'description': 'Archived date.',
                        },
                        'published': {
                            '$id': '#/properties/data/properties/product/properties/published',
                            'source': null,
                            'type': 'string',
                            'format': 'date-time',
                            'title': 'Published date',
                            'description': 'Published date.',
                        },
                        'updated': {
                            '$id': '#/properties/data/properties/product/properties/updated',
                            'source': 'ItemModifiedAt',
                            'type': 'string',
                            'format': 'date-time',
                            'title': 'Update time',
                            'description': 'Last update time.',
                        },
                        'replacingProduct': {
                            '$id': '#/properties/data/properties/product/properties/replacingProduct',
                            'source': null,
                            'type': 'string',
                            'title': 'Replacing product',
                            'description': 'Product which can be used for replacing.',
                        },
                        'replacedProduct': {
                            '$id': '#/properties/data/properties/product/properties/replacedProduct',
                            'source': null,
                            'type': 'string',
                            'title': 'Replaced product',
                            'description': 'Replaced product.',
                        },
                        'image': {
                            '$id': '#/properties/data/properties/product/properties/image',
                            'source': null,
                            'type': 'string',
                            'title': 'Image',
                            'description': 'Image or picture.',
                        },
                        'categorizationRakennustieto': {
                            '$id': '#/properties/data/properties/product/properties/categorizationRakennustieto',
                            'source': 'ItemGeneralName',
                            'type': 'string',
                            'title': 'RT product category',
                            'description': 'RT product category (general name).',
                        },
                        'categorizationTalo2000': {
                            '$id': '#/properties/data/properties/product/properties/categorizationTalo2000',
                            'source': 'ItemTalo2000Classes',
                            'type': 'string',
                            'title': 'Talo 2000 product category',
                            'description': 'Product category name based on Talo 2000 standard (Finland).',
                        },
                        'idSystemLocal': {
                            '$id': '#/properties/data/properties/product/properties/idSystemLocal',
                            'source': 'ItemNumber',
                            'type': 'string',
                            'title': 'Source system id',
                            'description': 'Id given by source system.',
                        },
                        'categorizationM1': {
                            '$id': '#/properties/data/properties/product/properties/categorizationM1',
                            'source': null,
                            'type': 'string',
                            'title': 'M1 product category',
                            'description': 'M1 product category (Finland).',
                        },
                        'status': {
                            '$id': '#/properties/data/properties/product/properties/status',
                            'source': 'ItemStatus',
                            'type': 'string',
                            'title': 'Life-cycle status',
                            'description': 'Life-cycle status.',
                        },
                        'supplier': {
                            '$id': '#/properties/data/properties/product/properties/supplier',
                            'source': null,
                            'type': 'object',
                            'title': 'The supplier schema',
                            'description': 'An explanation about the purpose of this instance.',
                            'properties': {
                                'name': {
                                    '$id': '#/properties/data/properties/product/properties/supplier/properties/name',
                                    'source': 'ItemSupplierName',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Unique product name given by manufacturer.',
                                },
                                'taxVATCode': {
                                    '$id': '#/properties/data/properties/product/properties/supplier/properties/taxVATCode',
                                    'source': 'ItemSupplierVATNumber',
                                    'type': 'string',
                                    'title': 'VAT code',
                                    'description': 'Value-added taxation identifier.',
                                },
                            },
                        },
                        'package': {
                            '$id': '#/properties/data/properties/product/properties/package',
                            'source': null,
                            'type': 'object',
                            'title': 'The package schema',
                            'description': 'An explanation about the purpose of this instance.',
                            'properties': {
                                'amountPerPackage': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/amountPerPackage',
                                    'source': 'ItemPackage1Size',
                                    'type': 'string',
                                    'title': 'Package size',
                                    'description': 'Amount of products (goods) in the package.',
                                },
                                'gTIN': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/gTIN',
                                    'source': 'ItemGTINCode',
                                    'type': 'string',
                                    'title': 'GTIN code',
                                    'description': 'GTIN standard based identifier.',
                                },
                                'length': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/length',
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Length',
                                    'description': 'Length.',
                                },
                                'width': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/width',
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Width',
                                    'description': 'Object width.',
                                },
                                'height': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/height',
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Height',
                                    'description': 'Height.',
                                },
                                'weight': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/weight',
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Weight',
                                    'description': 'Object weight.',
                                },
                                'volume': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/volume',
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Volume',
                                    'description': 'Volume of the object.',
                                },
                            },
                        },
                        'safety': {
                            '$id': '#/properties/data/properties/product/properties/safety',
                            'source': 'SafetyDataSheet',
                            'type': 'array',
                            'title': 'Safety information',
                            'description': 'Safety related information.',
                            'additionalItems': true,
                            'items': {
                                '$id': '#/properties/data/properties/product/properties/safety/items',
                                'anyOf': [
                                    {
                                        '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0',
                                        'type': 'object',
                                        'title': 'The first anyOf schema',
                                        'description': 'An explanation about the purpose of this instance.',
                                        'properties': {
                                            'idSystemLocal': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/idSystemLocal',
                                                'source': 'sys_id',
                                                'type': 'string',
                                                'title': 'Source system id',
                                                'description': 'Id given by source system.',
                                            },
                                            'safetyNameDocument': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyNameDocument',
                                                'source': 'SafetyDataName_fi',
                                                'type': 'string',
                                                'title': 'Safety document name',
                                                'description': 'Safety document name.',
                                            },
                                            'safetyNameCommercial': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyNameCommercial',
                                                'source': 'SafetyDataCommercialName_fi',
                                                'type': 'string',
                                                'title': 'Safety commercial name',
                                                'description': 'Safety document commercial name.',
                                            },
                                            'updated': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/updated',
                                                'source': 'SafetyDataDate',
                                                'type': 'string',
                                                'format': 'date-time',
                                                'title': 'Update time',
                                                'description': 'Last update time.',
                                            },
                                            'safetyUsageIntended': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyUsageIntended',
                                                'source': 'SafetyDataIntendedUse_fi',
                                                'type': 'string',
                                                'title': 'Intended usage purpose',
                                                'description': 'Intended usage of the product.',
                                            },
                                            'safetyFirstAidInstructions': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyFirstAidInstructions',
                                                'source': 'SafetyDataFirstAidMeasures_fi',
                                                'type': 'string',
                                                'title': 'First aid instructions',
                                                'description': 'First aid instructions.',
                                            },
                                            'safetyPreventionAndProtection': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyPreventionAndProtection',
                                                'source': 'SafetyDataPreventionAndProtection_fi',
                                                'type': 'string',
                                                'title': 'The safetyPreventionAndProtection schema',
                                                'description': 'An explanation about the purpose of this instance.',
                                            },
                                            'safetyDisposalInstructions': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyDisposalInstructions',
                                                'source': 'SafetyDataDisposalConsiderations_fi',
                                                'type': 'string',
                                                'title': 'The safetyDisposalInstructions schema',
                                                'description': 'An explanation about the purpose of this instance.',
                                            },
                                            'safetyCasNumber': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyCasNumber',
                                                'source': 'SafetyDataCASnr_fi',
                                                'type': 'string',
                                                'title': 'CAS number',
                                                'description': 'CAS number.',
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        'documents': {
                            '$id': '#/properties/data/properties/product/properties/documents',
                            'source': 'Files',
                            'type': 'array',
                            'title': 'The documents schema',
                            'description': 'An explanation about the purpose of this instance.',
                            'additionalItems': true,
                            'items': {
                                '$id': '#/properties/data/properties/product/properties/documents/items',
                                'anyOf': [
                                    {
                                        '$id': '#/properties/data/properties/product/properties/documents/items/anyOf/0',
                                        'type': 'object',
                                        'title': 'The first anyOf schema',
                                        'description': 'An explanation about the purpose of this instance.',
                                        'properties': {
                                            'name': {
                                                '$id': '#/properties/data/properties/product/properties/documents/items/anyOf/0/properties/name',
                                                'source': 'Name',
                                                'type': 'string',
                                                'title': 'Name',
                                                'description': 'Name.',
                                            },
                                            'updated': {
                                                '$id': '#/properties/data/properties/product/properties/documents/items/anyOf/0/properties/updated',
                                                'source': 'ModifiedAt',
                                                'type': 'string',
                                                'format': 'date-time',
                                                'title': 'Update time',
                                                'description': 'Last update time.',
                                            },
                                            'url': {
                                                '$id': '#/properties/data/properties/product/properties/documents/items/anyOf/0/properties/url',
                                                'source': 'Url',
                                                'type': 'string',
                                                'title': 'URL address',
                                                'description': 'URL address.',
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    },
};

/**
 * Translates response id to request id.
 *
 * @param {Object} config
 * @param {String/Object} id
 * @return {String/Object}
 */
const id = async (config, id) => {
    let translation;
    try {
        translation = config.parameters.ids[config.index];
        // Reverse translation.
        translation.property = Object.keys(map)[Object.values(map).indexOf(translation.property)];
    } catch (err) {
        return id;
    }
    return translation || id;
};

/**
 * Translates request parameters.
 *
 * @param {Object} config
 * @param {String/Object} parameters
 * @return {String/Object}
 */
const parameters = async (config, parameters) => {
    try {
        // Translate id properties.
        for (let i = 0; i < parameters.ids.length; i++) {
            parameters.ids[i].property = map[parameters.ids[i].property];
        }
        return parameters;
    } catch (err) {
        return parameters;
    }
};

/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object/String} id
 * @param {Object} data
 * @return {Object}
 */
const handleData = function (config, id, data) {
    let result = {};
    try {
        for (let j = 0; j < data.length; j++) {
            const value = data[j][config.output.value];
            result = transformer.transform(value, schema.properties.data);
        }
        return result;
    } catch (err) {
        return result;
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
                handleData(
                    config,
                    array[i][config.output.id],
                    array[i][config.output.data],
                ));
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
 * Expose plugin methods.
 */
module.exports = {
    name: 'rakennustieto',
    parameters,
    output,
    id,
};
