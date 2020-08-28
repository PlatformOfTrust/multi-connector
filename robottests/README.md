# Multi-Connector tests

## System requirements

- [Python 3.6.x](https://www.python.org/downloads/)
- [Poetry](https://python-poetry.org/docs/)

## Installation

Install RobotFramework and dependencies:

    poetry install

## Usage

Set environment variables depending on `Data Product` you are going to be testing. E.g:

    # Linux
	export POT_APP_ACCESS_TOKEN=<app-access-token>
    export POT_CLIENT_SECRET=<client-secret>
    export POT_PRODUCT_CODE=<product-code>
    
    echo "$POT_APP_ACCESS_TOKEN"

    # Windows
    set POT_APP_ACCESS_TOKEN=<app-access-token>
    set POT_CLIENT_SECRET=<client-secret>
    set POT_PRODUCT_CODE=<product-code>
    
    echo %POT_APP_ACCESS_TOKEN%
    
Start test suite:

    poetry run python -m robot -A connectors/<connector>/robotargs.txt

Results can be found in `connectors/<connector>/result` folder.
