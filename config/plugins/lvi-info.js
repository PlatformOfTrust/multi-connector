'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * LVI-Info.
 */

/** Property to path parameter mapping. */
const map = {
    TT024: 'productLinkNumber',
    TT052: 'gtinCode',
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
                            'source': 'TT024',
                            'type': 'string',
                            'title': 'Product code as specified in catalog',
                            'description': 'Catalog specific product code should be used as parameter. Please refer specific catalog utilized by connector for details.',
                        },
                        'codeProduct': {
                            '$id': '#/properties/data/properties/product/properties/codeProduct',
                            'source': 'TT050',
                            'type': 'string',
                            'title': 'Product code',
                            'description': 'Unique product code given by manufacturer.',
                        },
                        'codeProduct2': {
                            '$id': '#/properties/data/properties/product/properties/codeProduct2',
                            'source': 'TT051',
                            'type': 'string',
                            'title': 'Product code 2',
                            'description': 'Additional unique product code given by manufacturer.',
                        },
                        'gTIN': {
                            '$id': '#/properties/data/properties/product/properties/gTIN',
                            'source': 'TT052',
                            'type': 'string',
                            'title': 'GTIN code',
                            'description': 'GTIN standard based identifier.',
                        },
                        'categorizationUnspsc': {
                            '$id': '#/properties/data/properties/product/properties/categorizationUnspsc',
                            'source': 'TT080',
                            'type': 'string',
                            'title': 'UNSPSC Code',
                            'description': 'The United Nations Standard Products and Services Code (UNSPSC) is a taxonomy of products and services for use in eCommerce. It is a four-level hierarchy coded as an eight-digit number, with an optional fifth level adding two more digits.',
                        },
                        'name': {
                            '$id': '#/properties/data/properties/product/properties/name',
                            'source': 'TT100',
                            'type': 'string',
                            'title': 'Name',
                            'description': 'Unique product name given by manufacturer.',
                        },
                        'taxVATCode': {
                            '$id': '#/properties/data/properties/product/properties/taxVATCode',
                            'source': 'TT101',
                            'type': 'string',
                            'title': 'VAT code',
                            'description': 'Value-added taxation identifier.',
                        },
                        'nameBrand': {
                            '$id': '#/properties/data/properties/product/properties/nameBrand',
                            'source': 'TT110',
                            'type': 'string',
                            'title': 'Brand name',
                            'description': 'Brand name.',
                        },
                        'groupName': {
                            '$id': '#/properties/data/properties/product/properties/groupName',
                            'source': 'TT120',
                            'type': 'string',
                            'title': 'Product group name',
                            'description': 'Unique product group name given by manufacturer.',
                        },
                        'categorizationLVIInfo': {
                            '$id': '#/properties/data/properties/product/properties/categorizationLVIInfo',
                            'source': 'TT200',
                            'type': 'string',
                            'title': 'LVI-Info product category',
                            'description': 'Categorization name given by LVI-Info.fi (Finland).',
                        },
                        'nameTechnical': {
                            '$id': '#/properties/data/properties/product/properties/nameTechnical',
                            'source': 'TT201',
                            'type': 'string',
                            'title': 'Technical name',
                            'description': 'Technical name.',
                        },
                        'categorizationLVIInfoEnglish': {
                            '$id': '#/properties/data/properties/product/properties/categorizationLVIInfoEnglish',
                            'source': 'TT205',
                            'type': 'string',
                            'title': 'LVI-Info product category (EN)',
                            'description': 'Categorization name given by LVI-Info.fi (Finland) in english language.',
                        },
                        'categorizationLVIInfoSwedish': {
                            '$id': '#/properties/data/properties/product/properties/categorizationLVIInfoSwedish',
                            'source': 'TT207',
                            'type': 'string',
                            'title': 'LVI-Info product category (SWE)',
                            'description': 'Categorization name given by LVI-Info.fi (Finland) in swedish language.',
                        },
                        'length': {
                            '$id': '#/properties/data/properties/product/properties/length',
                            'source': 'TT300',
                            'type': 'string',
                            'title': 'Length',
                            'description': 'Length.',
                        },
                        'width': {
                            '$id': '#/properties/data/properties/product/properties/width',
                            'source': 'TT301',
                            'type': 'string',
                            'title': 'Width',
                            'description': 'Object width.',
                        },
                        'height': {
                            '$id': '#/properties/data/properties/product/properties/height',
                            'source': 'TT302',
                            'type': 'string',
                            'title': 'Height',
                            'description': 'Height.',
                        },
                        'weight': {
                            '$id': '#/properties/data/properties/product/properties/weight',
                            'source': 'TT303',
                            'type': 'string',
                            'title': 'Weight',
                            'description': 'Object weight.',
                        },
                        'volume': {
                            '$id': '#/properties/data/properties/product/properties/volume',
                            'source': 'TT304',
                            'type': 'string',
                            'title': 'Volume',
                            'description': 'Volume of the object.',
                        },
                        'unitUsage': {
                            '$id': '#/properties/data/properties/product/properties/unitUsage',
                            'source': 'TT400',
                            'type': 'string',
                            'title': 'Usage unit',
                            'description': 'Unit which is applied in usage.',
                        },
                        'unitConversion': {
                            '$id': '#/properties/data/properties/product/properties/unitConversion',
                            'source': 'TT401',
                            'type': 'string',
                            'title': 'Conversion unit',
                            'description': 'Conversion unit.',
                        },
                        'unitSales': {
                            '$id': '#/properties/data/properties/product/properties/unitSales',
                            'source': 'TT402',
                            'type': 'string',
                            'title': 'Sales unit',
                            'description': 'Unit which is used in selling.',
                        },
                        'periodWarranty': {
                            '$id': '#/properties/data/properties/product/properties/periodWarranty',
                            'source': 'TT500',
                            'type': 'string',
                            'title': 'Warranty period',
                            'description': 'Warranty period.',
                        },
                        'archived': {
                            '$id': '#/properties/data/properties/product/properties/archived',
                            'source': 'TT510',
                            'type': 'string',
                            'format': 'date-time',
                            'title': 'Archived date',
                            'description': 'Archived date.',
                        },
                        'published': {
                            '$id': '#/properties/data/properties/product/properties/published',
                            'source': 'TT511',
                            'type': 'string',
                            'format': 'date-time',
                            'title': 'Published date',
                            'description': 'Published date.',
                        },
                        'updated': {
                            '$id': '#/properties/data/properties/product/properties/updated',
                            'source': 'TT512',
                            'type': 'string',
                            'format': 'date-time',
                            'title': 'Update time',
                            'description': 'Last update time.',
                        },
                        'replacingProduct': {
                            '$id': '#/properties/data/properties/product/properties/replacingProduct',
                            'source': 'TT520',
                            'type': 'string',
                            'title': 'Replacing product',
                            'description': 'Product which can be used for replacing.',
                        },
                        'replacedProduct': {
                            '$id': '#/properties/data/properties/product/properties/replacedProduct',
                            'source': 'TT521',
                            'type': 'string',
                            'title': 'Replaced product',
                            'description': 'Replaced product.',
                        },
                        'image': {
                            '$id': '#/properties/data/properties/product/properties/image',
                            'source': 'TT701',
                            'type': 'string',
                            'title': 'Image',
                            'description': 'Image or picture.',
                        },
                        'categorizationRakennustieto': {
                            '$id': '#/properties/data/properties/product/properties/categorizationRakennustieto',
                            'source': null,
                            'type': 'string',
                            'title': 'RT product category',
                            'description': 'RT product category (general name).',
                        },
                        'categorizationTalo2000': {
                            '$id': '#/properties/data/properties/product/properties/categorizationTalo2000',
                            'source': null,
                            'type': 'string',
                            'title': 'Talo 2000 product category',
                            'description': 'Product category name based on Talo 2000 standard (Finland).',
                        },
                        'idSystemLocal': {
                            '$id': '#/properties/data/properties/product/properties/idSystemLocal',
                            'source': null,
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
                            'source': null,
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
                                    'source': 'TT100',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Unique product name given by manufacturer.',
                                },
                                'taxVATCode': {
                                    '$id': '#/properties/data/properties/product/properties/supplier/properties/taxVATCode',
                                    'source': 'TT101',
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
                                    'source': 'TT410',
                                    'type': 'string',
                                    'title': 'Package size',
                                    'description': 'Amount of products (goods) in the package.',
                                },
                                'gTIN': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/gTIN',
                                    'source': 'TT411',
                                    'type': 'string',
                                    'title': 'GTIN code',
                                    'description': 'GTIN standard based identifier.',
                                },
                                'length': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/length',
                                    'source': 'TT412',
                                    'type': 'string',
                                    'title': 'Length',
                                    'description': 'Length.',
                                },
                                'width': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/width',
                                    'source': 'TT413',
                                    'type': 'string',
                                    'title': 'Width',
                                    'description': 'Object width.',
                                },
                                'height': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/height',
                                    'source': 'TT414',
                                    'type': 'string',
                                    'title': 'Height',
                                    'description': 'Height.',
                                },
                                'weight': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/weight',
                                    'source': 'TT415',
                                    'type': 'string',
                                    'title': 'Weight',
                                    'description': 'Object weight.',
                                },
                                'volume': {
                                    '$id': '#/properties/data/properties/product/properties/package/properties/volume',
                                    'source': 'TT416',
                                    'type': 'string',
                                    'title': 'Volume',
                                    'description': 'Volume of the object.',
                                },
                            },
                        },
                        'safety': {
                            '$id': '#/properties/data/properties/product/properties/safety',
                            'source': null,
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
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Source system id',
                                                'description': 'Id given by source system.',
                                            },
                                            'safetyNameDocument': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyNameDocument',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Safety document name',
                                                'description': 'Safety document name.',
                                            },
                                            'safetyNameCommercial': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyNameCommercial',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Safety commercial name',
                                                'description': 'Safety document commercial name.',
                                            },
                                            'updated': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/updated',
                                                'source': null,
                                                'type': 'string',
                                                'format': 'date-time',
                                                'title': 'Update time',
                                                'description': 'Last update time.',
                                            },
                                            'safetyUsageIntended': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyUsageIntended',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Intended usage purpose',
                                                'description': 'Intended usage of the product.',
                                            },
                                            'safetyFirstAidInstructions': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyFirstAidInstructions',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'First aid instructions',
                                                'description': 'First aid instructions.',
                                            },
                                            'safetyPreventionAndProtection': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyPreventionAndProtection',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'The safetyPreventionAndProtection schema',
                                                'description': 'An explanation about the purpose of this instance.',
                                            },
                                            'safetyDisposalInstructions': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyDisposalInstructions',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'The safetyDisposalInstructions schema',
                                                'description': 'An explanation about the purpose of this instance.',
                                            },
                                            'safetyCasNumber': {
                                                '$id': '#/properties/data/properties/product/properties/safety/items/anyOf/0/properties/safetyCasNumber',
                                                'source': null,
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
                            'source': 'documents',
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
                                                'source': 'name',
                                                'type': 'string',
                                                'title': 'Name',
                                                'description': 'Name.',
                                            },
                                            'updated': {
                                                '$id': '#/properties/data/properties/product/properties/documents/items/anyOf/0/properties/updated',
                                                'source': null,
                                                'type': 'string',
                                                'format': 'date-time',
                                                'title': 'Update time',
                                                'description': 'Last update time.',
                                            },
                                            'url': {
                                                '$id': '#/properties/data/properties/product/properties/documents/items/anyOf/0/properties/url',
                                                'source': 'url',
                                                'type': 'string',
                                                'title': 'URL address',
                                                'description': 'URL address.',
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        'etimFeature': {
                            '$id': '#/properties/data/properties/product/properties/etimFeature',
                            'source': 'etimFeatureValues',
                            'type': 'array',
                            'title': '',
                            'description': '',
                            'items': {
                                '$id': '#/properties/data/properties/product/properties/etimFeature/items',
                                'source': null,
                                'type': 'object',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/product/properties/etimFeature/items/properties/@type',
                                        'source': 'type',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'etimFeatureValueId': {
                                        '$id': '#/properties/data/properties/product/properties/etimFeature/items/properties/etimFeatureValueId',
                                        'source': 'etimFeatureValueId',
                                        'type': 'string',
                                        'title': 'ETIM feature type',
                                        'description': 'ETIM feature type.',
                                    },
                                    'etimFeatureId': {
                                        '$id': '#/properties/data/properties/product/properties/etimFeature/items/properties/etimFeatureId',
                                        'source': 'etimFeatureId',
                                        'type': 'string',
                                        'title': 'ETIM feature id',
                                        'description': 'ETIM feature id.',
                                    },
                                    'etimClassId': {
                                        '$id': '#/properties/data/properties/product/properties/etimFeature/items/properties/etimClassId',
                                        'source': 'etimClassId',
                                        'type': 'string',
                                        'title': 'ETIM class id',
                                        'description': 'ETIM class id.',
                                    },
                                    'etimFeatureType': {
                                        '$id': '#/properties/data/properties/product/properties/etimFeature/items/properties/etimFeatureType',
                                        'source': 'etimFeatureType',
                                        'type': 'string',
                                        'title': 'ETIM feature type',
                                        'description': 'ETIM feature type.',
                                    },
                                    'etimValue': {
                                        '$id': '#/properties/data/properties/product/properties/etimFeature/items/properties/etimValue',
                                        'source': 'value1',
                                        'type': [
                                            'boolean',
                                            'string',
                                        ],
                                        'title': 'ETIM value',
                                        'description': 'ETIM value.',
                                    },
                                },
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

// Template for document array.
const documentsTemplate = [
    {
        name: 'Kuvapaikka 1 - Pääkuva',
        url: 'TT701',
    },
    {
        name: 'Kuvapaikka 2 - Kuvapaikka 2',
        url: 'TT702',
    },
    {
        name: 'Kuvapaikka 3 - Kuvapaikka 3',
        url: 'TT703',
    },
    {
        name: 'Kuvapaikka 4 - Viivapiirroskuva',
        url: 'TT704',
    },
    {
        name: 'Kuvapaikka 5 - Mittakuva',
        url: 'TT705',
    },
    {
        name: 'Kuvapaikka 6 - Kytkentäkaavio',
        url: 'TT706',
    },
    {
        name: 'Kuvapaikka 7 - Tekninen kuva esim. räjäytyskuva',
        url: 'TT707',
    },
    {
        name: 'Kuvapaikka 8 - Valonjakokäyrä',
        url: 'TT708',
    },
    {
        name: 'Kuvapaikka 9 - Mainoskuva',
        url: 'TT709',
    },
    {
        name: 'Kuvapaikka 10 - Käyttöpaikkakuva / Sekalainen',
        url: 'TT710',
    },
    {
        name: 'Kuvapaikka 11 - Energiamerkki',
        url: 'TT711',
    },
    {
        name: 'Linkki 1 - Toimittajan tuotesivu',
        url: 'TT731',
    },
    {
        name: 'Linkki 2 - Käyttöohjeet',
        url: 'TT732',
    },
    {
        name: 'Linkki 3 - 3D-malli',
        url: 'TT733',
    },
    {
        name: 'Linkki 4 - doP-tunnisteen linkki toimittajan sivulle',
        url: 'TT734',
    },
    {
        name: 'Linkki 5 - Valonjakokäyrä',
        url: 'TT735',
    },
    {
        name: 'Linkki 6 - Asennusvideo',
        url: 'TT736',
    },
    {
        name: 'Linkki 7 - Esittelyvideo',
        url: 'TT737',
    },
    {
        name: 'Dokumentti 1 - Mainos',
        url: 'TT751',
    },
    {
        name: 'Dokumentti 2 - Tuoteluettelo',
        url: 'TT752',
    },
    {
        name: 'Dokumentti 3 - Esite',
        url: 'TT753',
    },
    {
        name: 'Dokumentti 4 - 3D-tiedosto',
        url: 'TT754',
    },
    {
        name: 'Dokumentti 5 - Asennusohje',
        url: 'TT755',
    },
    {
        name: 'Dokumentti 6 - Käyttöohje',
        url: 'TT756',
    },
    {
        name: 'Dokumentti 7 - Mittapiirros',
        url: 'TT757',
    },
    {
        name: 'Dokumentti 8 - Tekniset tiedot',
        url: 'TT758',
    },
    {
        name: 'Dokumentti 9 - Tuoteseloste',
        url: 'TT759',
    },
    {
        name: 'Dokumentti 10 - Tuotesertifikaatti',
        url: 'TT760',
    },
    {
        name: 'Dokumentti 11 - Suoritustasoilmoitus (DoP)',
        url: 'TT761',
    },
    {
        name: 'Dokumentti 12 - Valonjakokäyrä',
        url: 'TT762',
    },
    {
        name: 'Dokumentti 13 - CE-dokumentti',
        url: 'TT763',
    },
    {
        name: 'Dokumentti 14 - Toimitusehdot/Takuuehdot',
        url: 'TT764',
    },
];

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
            value.documents = documentsTemplate.map(doc => {
                doc.url = value[doc.url];
                return doc;
            }).filter(doc => !!doc.url && doc.url !== '');

            value.etimFeatureValues = (Array.isArray(value.etimFeatureValues) ? value.etimFeatureValues : [])
                .map(doc => {
                    doc.type = 'EtimFeature';
                    return doc;
                });

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
    name: 'lvi-info',
    parameters,
    id,
    output,
};
