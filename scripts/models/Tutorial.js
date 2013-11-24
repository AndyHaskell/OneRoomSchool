define([
    "underscore",
    "backbone"
], function(_, Backbone){
    //The model for storing a tutorial's data
    Tutorial = Backbone.Model.extend({
        defaults: {
            title  : "Insert your title here",
            desc   : "Insert your description here",
            format : "slide-show"
        },
        initialize: function(data){
            //Add a Pages collection to the TutorialView model
            this.set({pages: new Pages()});
            
            /*When loading a Tutorial from another Tutorial's JSON data, the
             *JSON object representing each model's sub-models (such as Pages
             *of a Tutorial or Subpages of a Page) must be converted to
             *Backbone.js models.  Therefore, in this part of the initialize
             *function, each object in data["pages"] must be converted to a Page
             *model in the new Tutorial's Page collection.
             */
            if(typeof(data) != "undefined"){
                var pages = data["pages"];
                if(typeof(pages) != "undefined"){
                    for(var i = 0; i < pages.length; i++){
                        this.get("pages").add(new Page(pages[i]));
                    }
                }
            }
        },
    });
    return Tutorial;
});