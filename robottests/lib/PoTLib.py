#!/usr/bin/python
# -*- coding: utf-8 -*-
import base64
import hashlib
import hmac
import json


def calculate_pot_signature(body, client_secret):
    return base64.b64encode(hmac.new(
            client_secret.encode('utf-8'),
            json.dumps(
                body,
                sort_keys=True,
                indent=None,
                separators=(',', ': ')).strip().encode('utf-8'),
            hashlib.sha256).digest()).decode()
