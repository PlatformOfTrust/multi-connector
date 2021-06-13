*** Settings ***
Documentation     SFTP Server
Library           Collections
Library           DateTime
Library           PoTLib
Library           REST         ${API_URL}

*** Variables ***
${LOCAL_TZ}                  +02:00
${TEST_ENV}                  sandbox
${API_URL}                   https://api-${TEST_ENV}.oftrust.net
${API_PATH}                  /broker/v1/fetch-data-product
${CONNECTOR_URL}             http://localhost:8080
${CONNECTOR_PATH}            /translator/v1/fetch
${APP_TOKEN}                 %{POT_APP_ACCESS_TOKEN}
${CLIENT_SECRET}             %{POT_CLIENT_SECRET}
${PRODUCT_CODE}              %{POT_PRODUCT_CODE}
${ID1}                       image.jpg
${ID2}                       textfile.txt
${ID3}                       image.png
@{IDS}                       ${ID1}
@{IDS2}                      ${ID2}
@{IDS3}                      ${ID3}
${CONTENT}                   Testing.
${URL}                       https://finematics.com/wp-content/uploads/2021/01/aave-ghost-2-270x250.png
&{TARGET_OBJECT}             name=@{IDS}
&{TARGET_OBJECT_2}           name=@{IDS2}  content=${CONTENT}
&{TARGET_OBJECT_3}           name=@{IDS3}  url=${URL}
&{BROKER_BODY_PARAMETERS}    targetObject=${TARGET_OBJECT}
&{BROKER_BODY}               productCode=${PRODUCT_CODE}
...                          parameters=${BROKER_BODY_PARAMETERS}

*** Keywords ***
Fetch Data Product
    [Arguments]     ${body}
    ${signature}    Calculate PoT Signature          ${body}    ${CLIENT_SECRET}
    Set Headers     {"x-pot-signature": "${signature}", "x-app-token": "${APP_TOKEN}"}
    POST            ${API_PATH}                      ${body}
    Output schema   response body

Get Body
    [Arguments]          &{kwargs}
    ${body}              Copy Dictionary      ${BROKER_BODY}    deepcopy=True
    ${now}               Get Current Date     time_zone=UTC     result_format=%Y-%m-%dT%H:%M:%S+00:00
    Set To Dictionary    ${body}              timestamp         ${now}
    Set To Dictionary    ${body}              &{kwargs}
    ${json_string}=      evaluate             json.dumps(${body})   json
    [Return]             ${body}

*** Test Cases ***
fetch, 200
    [Tags]                bug-0001
    ${body}               Get Body
    Fetch Data Product    ${body}
    Integer               response status                                         200
    String                response body @context                                  https://standards.oftrust.net/v2/Context/DataProductOutput/Document/
    Object                response body data
    Array                 response body data document
    String                response body data document 0 @type                     Document
    String                response body data document 0 url
    String                response body data document 0 name
    String                response body data document 0 nameExtension
    String                response body data document 0 categorizationInternetMediaType

fetch, 200, Plain text file
    [Tags]                bug-0002
    ${body}               Get Body
    Set To Dictionary     ${body["parameters"]}                                  targetObject=${TARGET_OBJECT_2}
    Fetch Data Product    ${body}
    Integer               response status                                         200
    String                response body @context                                  https://standards.oftrust.net/v2/Context/DataProductOutput/Document/
    Object                response body data
    Array                 response body data document
    String                response body data document 0 @type                     Document
    String                response body data document 0 url
    String                response body data document 0 name
    String                response body data document 0 nameExtension
    String                response body data document 0 categorizationInternetMediaType

fetch, 200, Binary image file
    [Tags]                bug-0003
    ${body}               Get Body
    Set To Dictionary     ${body["parameters"]}                                  targetObject=${TARGET_OBJECT_3}
    Fetch Data Product    ${body}
    Integer               response status                                         200
    String                response body @context                                  https://standards.oftrust.net/v2/Context/DataProductOutput/Document/
    Object                response body data
    Array                 response body data document
    String                response body data document 0 @type                     Document
    String                response body data document 0 url
    String                response body data document 0 name
    String                response body data document 0 nameExtension
    String                response body data document 0 categorizationInternetMediaType

fetch, 422, Missing data for parameters required field
    [Tags]                 bug-0003
    ${body}                Get Body
    Pop From Dictionary    ${body}                                      parameters
    Fetch Data Product     ${body}
    Integer    response status                                          422
    Integer    response body error status                               422
    String     response body error message parameters 0                 Missing data for required field.

fetch, 422, Missing data for targetObject required field
    [Tags]                 bug-0004
    ${body}                Get Body
    Pop From Dictionary    ${body["parameters"]}                        targetObject
    Fetch Data Product     ${body}
    Integer    response status                                          422
    Integer    response body error status                               422
    String     response body error message parameters.targetObject.name 0    Missing data for required field.

fetch, 200, Empty name
    [Tags]                 bug-0005
    ${body}                Get Body
    Set To Dictionary      ${body["parameters"]["targetObject"]}        name=[]
    Fetch Data Product     ${body}
    Integer    response status                                          200
    String     response body @context                                   https://standards.oftrust.net/v2/Context/DataProductOutput/Document/
    Array      response body data document                              maxItems=0
