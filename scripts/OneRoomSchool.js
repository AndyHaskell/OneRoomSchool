define([
    'jquery',
    'underscore',
    'backbone',
    'views/SlideShowView',
    'models/Tutorial',
], function($, _, Backbone, SlideShowView, Tutorial){
    var initialize = function(){
        var tutorialViewExisted = window.hasOwnProperty("tutorialView");
        tutorialViewExisted || (tutorialView = new SlideShowView({model: new Tutorial()}));
        if(tutorialViewExisted){
            alert('OneRoomSchool cannot be used here because there is already '+
                  'a global variable called "tutorialView"');
        }
        else{
            $("body").append(tutorialView.render().el);
        }
    }
    
    return {
        initialize: initialize
    };
});