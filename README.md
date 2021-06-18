# Multi-Connector

> HTTP server to handle Platform of Trust Broker API requests.

## Supported Data Sources

Following data sources are supported out of the box. Example configs can be found at the repo.

- A-3 Integration API
- Carinafour CALS
- Congrid Public API
- Digital Supply Chain
- Digitraffic Live Trains API
- Digitraffic Marine API
- EnerKey Data API
- ENTSO-E Transparency Platform
- Fidelix Pilvivalvomo
- Finavia Flights API
- Finavia Queues API
- SFTP Server
- GeoServer Web Feature Service
- Haltian Thingsee API
- HubSpot API
- Trend Controls IQ Vision MQTT
- Microsoft 365
- Nuuka Solutions Platform
- Nysse GTFS RT public API
- LVI-Info.fi API
- Orfer Production Line
- Rakennustieto API
- Sähkönumerot.fi API
- Schneider EcoStruxure Cloud
- Siemens Mindsphere
- Siemens Navigator
- Smartwatcher API
- Talotohtori API
- Trackinno Service API
- Vastuu Group Company API
- VTT Transport Data Platform
- Wapice IoT-Ticket

## Getting Started

These instructions will get you a copy of the connector up and running.

### Prerequisites

Using environment variables is optional.

Connector generates RSA keys automatically, but keys can be also applied from the environment.
```
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII..."
PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMII..."
```

Issuing and renewing free Let's Encrypt SSL certificate by Greenlock Express v4 is supported by including the following variables.
```
GREENLOCK_DOMAIN=www.example.com
GREENLOCK_MAINTANER=info@example.com
```

## Installing

> A step by step series of examples that tell you how to get the connector configured.

Configuration is accomplished by entering parameters and credentials to make a connection to the data source. Enabling handling of broker requests requires the following configurations.

- Template at /config/templates/{data-source}.json
- Config at /config/{product-code}.json
-- example configs for supported data sources can be found at /config/examples/

Optionally

- Plugins at /config/plugins/{plugin}.js
- Resources at /config/resources/{resource}.{ext} -- referenced from a config file

### Step 1: Create a template (optional)

Template defines data source specific configurations such as protocol and authentication. Each json file in folder /config/templates defines a single data source. Template includes only common parameters and client specific information is entered by placeholders, which enable template to be utilized by multiple configs that represent data products.

Example template:
 ```
{
  "plugins": [ // Invoked plugins
    "oauth2", // Authentication handled by OAuth2 plugin, which uses details provided in authConfig.
    "siemens-mindsphere" // Manipulates resource request parameters to match resource timestamp format.
  ],
  "protocol": "rest",
  "authConfig": { // Parameters required to initiate a resource request.
    "url": "https://${customer}.piam.eu1.mindsphere.io",
    "authPath": "/oauth/token",
    "clientId": "${clientId}",
    "clientSecret": "${clientSecret}",
    "path": "https://gateway.eu1.mindsphere.io/api/iottimeseries/v3/timeseries/${assetId}/${aspectId}"
  },
  "dataObjects": [ // Defines path to data object/-s in resource response.
    "" // Empty string defines root.
  ],
  "dataPropertyMappings": { // Defines path to a type spesific data.
    "${type}": "value" // Type is defined dynamicly and controlled by config or broker request. Data would be taken with key name "value" from data object.
  },
  "generalConfig": {
    "query": {
      "properties": [], // Properties included to the resource request query.
      "limit": { "limit": 1 }, // Used with data sources, which have same endpoint for latest and history data to include only latest value.
      "end": "to", // Defines end time query parameter name.
      "start": "from" // Defines start time query parameter name.
    },
    "sourceName": {
      "pathIndex": 8 // Indicates location of the process name (e.g. 8th element in resource path, 'aspectId').
    },
    "hardwareId": {
      "pathIndex": 7 // Indicates location of the process id.
    },
    "timestamp": {
      "dataObjectProperty": "_time" // Indicates location of the process timestamp.
    }
  }
}
 ```

### Step 2: Write a plugin (optional)

If the data source requires custom code, a plugin can be utilized to handle and manipulate phases of the data retrieval. Data source is considered as a resource. Plugin is triggered in the following phases.

- parameters - Broker request parameters
- request - Resource request options
- response - Resource response
- data - Resource data object
- id - Data object id property value
- onerror - Resource request error object

### Step 3: Compose a config

Pick an example and fill in fields which are encapsulated by symbols < and >. Data product specific values are included in an object named "static". Broker request includes parameters which define query contents. Allocation of these parameters is defined in "dynamic" property. Place the config file to the root of config folder and rename it to match the product code of the data product at Platform of Trust e.g my-product-code.json. Every broker request with a matching product code will be handled by this config.

Example config:
```
{
  "template": "siemens-mindsphere",
  "static": {
    "customer": "customerName", // Replaces e.g ${customer}-placeholder in template.
    "clientId": "abc",
    "clientSecret": "xyz",
    "type": "MeasureAirTemperatureCelsiusDegree"
  },
  "dynamic": {
    "authConfig.path": "ids" // Broker request parameter "ids" is included to the template path per entry.
  }
}
```

### Step 4: Provide resources (optional)

In some cases, data source might require files e.g certificate to initiate a connection to the external system. Resources are included to the /config/resources folder and referenced directly by filenames.

## Running the connector

Connector starts with the following command.

```
npm start
```

## Providing configs from environment variables

Configs, templates and resources can be also provided though environment variables. JSON-data is converted to base64 to support this procedure. Conversion is accomplished by the following command.

```
npm run generate
```

Output can be found at /temp folder. Content of each file is set to the variable name defined by the file name.

## Docker

Docker image can be build with the following command.

```
npm run docker:build
```

Deploying from the official repo [polkuio/connector](https://hub.docker.com/r/polkuio/connector) is accomplished the following way.
```
docker pull polkuio/connector
docker run -p 8080:8080 -d polkuio/connector
```
