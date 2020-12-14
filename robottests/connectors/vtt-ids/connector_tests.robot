*** Settings ***
Documentation     VTT Transport Data Platform Tests
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
&{TARGET_OBJECT}             lowLeftCornerCoordinateAxis1=60.170059  lowLeftCornerCoordinateAxis2=24.907368  upperRightCornerCoordinateAxis1=60.17726  upperRightCornerCoordinateAxis2=24.935804
${START_TIME}                2020-11-08T18:14:35
${END_TIME}                  2020-11-08T23:14:35
${PERIOD}                    ${START_TIME}/${END_TIME}
&{BROKER_BODY_PARAMETERS}    targetObject=${TARGET_OBJECT}
...                          period=${PERIOD}
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
fetch, 200, history
    [Tags]                bug-0001
    ${body}               Get Body
    Fetch Data Product    ${body}
    Integer               response status                                         200
    String                response body @context                                  https://standards.oftrust.net/v2/Context/DataProductOutput/Process/Measure/Traffic/
    Object                response body data
    Array                 response body data traffic
    Array                 response body data traffic 0 vehicle
    String                response body data traffic 0 targetObject @type        BoundingBox

fetch, 422, Missing data for parameters required field
    [Tags]                 bug-0002
    ${body}                Get Body
    Pop From Dictionary    ${body}                              parameters
    Fetch Data Product     ${body}
    Integer    response status                                  422
    Integer    response body error status                       422
    String     response body error message parameters 0         Missing data for required field.

fetch, 422, Missing data for period required field
    [Tags]                 bug-0003
    ${body}                Get Body
    Pop From Dictionary    ${body["parameters"]}                period
    Fetch Data Product     ${body}
    Integer    response status                                  422
    Integer    response body error status                       422
    String     response body error message parameters.period 0  Missing data for required field.

fetch, 422, Missing data for targetObject required field
    [Tags]                 bug-0004
    ${body}                Get Body
    Pop From Dictionary    ${body["parameters"]}                targetObject
    Fetch Data Product     ${body}
    Integer    response status                                  422
    Integer    response body error status                       422
    String     response body error message parameters.targetObject.lowLeftCornerCoordinateAxis1 0     Missing data for required field.
    String     response body error message parameters.targetObject.lowLeftCornerCoordinateAxis2 0     Missing data for required field.
    String     response body error message parameters.targetObject.upperRightCornerCoordinateAxis1 0     Missing data for required field.
    String     response body error message parameters.targetObject.upperRightCornerCoordinateAxis2 0     Missing data for required field.

fetch, 422, Empty targetObject
    [Tags]                 bug-0005
    ${body}                Get Body
    Set To Dictionary      ${body["parameters"]}                targetObject=@{EMPTY}
    Fetch Data Product     ${body}
    Integer    response status                                  422
    Integer    response body error status                       422
    String     response body error message parameters.targetObject.lowLeftCornerCoordinateAxis1 0     Missing data for required field.
    String     response body error message parameters.targetObject.lowLeftCornerCoordinateAxis2 0     Missing data for required field.
    String     response body error message parameters.targetObject.upperRightCornerCoordinateAxis1 0     Missing data for required field.
    String     response body error message parameters.targetObject.upperRightCornerCoordinateAxis2 0     Missing data for required field.
