'use strict';

angular
    .module('pkfrontendApp')
    .constant('CONFIG', {
        'http': {
            'rest_host': 'http://localhost:8888'//'http://94.177.245.142:8888'
        },
        'session':{
            'key': 'satellizer_token',
            'user': 'user',
            'guest': 'guest'
        },
        'translation':{
            'path': '/translations/',
            'suffix': '.json',
            'sanitize': 'escaped',
            'default': 'dev'
        }
    });