require.config({
    baseUrl: 'scripts',

    paths: {
        jquery: 'libs/jquery-1.10.1.min',
        underscore: 'libs/underscore',
        backbone: 'libs/backbone',
        json: 'libs/json2',
        rangy: 'libs/rangy/rangy-core',
        cssclassapplier: 'libs/rangy/rangy-cssclassapplier',
    },
    
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'json': {
            exports: 'json2'
        },
        'rangy': {
            exports: 'rangy'
        },
        'cssclassapplier': {
            deps: ['rangy'],
            exports: 'cssclassapplier'
        }
    }
});

require(['OneRoomSchool'], function(OneRoomSchool){
    OneRoomSchool.initialize();
});