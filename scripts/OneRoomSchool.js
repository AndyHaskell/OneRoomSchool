define([
    'jquery',
    'underscore',
    'backbone',
    'views/SlideShowView',
    'models/Tutorial',
], function($, _, Backbone, slideShowView, Tutorial){
    var initialize = function(){
        tutorialView = new slideShowView({model: new Tutorial()});
        $("body").append(tutorialView.render().el);
    }
    
    return {
        initialize: initialize
    };
});