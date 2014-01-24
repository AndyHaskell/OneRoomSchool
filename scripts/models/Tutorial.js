define([
    "underscore",
    "backbone",
    "models/Page"
], function(_, Backbone, Page){
    //The model for storing a tutorial's data
    var Tutorial = Backbone.Model.extend({
        defaults: {
            title  : "Insert your title here",
            desc   : "Insert your description here"
        },
        /*If the tutorial is being loaded from JSON, then the tutorial's JSON
         *object is passed in as "data".  Otherwise, no parameters are taken in
         *and a blank tutorial is created.
         */
        initialize: function(data){
            //Add a Pages collection to the TutorialView model
            this.set({pages: new Page.Pages()});
            
            /*If the JSON of a tutorial was passed into the initialize function,
             *the pages of the tutorial are converted from JSON objects to
             *Backbone.js models.
             */
            if(typeof(data) != "undefined"){
                var pages = data["pages"];
                if(typeof(pages) != "undefined"){
                    for(var i = 0; i < pages.length; i++){
                        this.get("pages").add(new Page.Page(pages[i]));
                    }
                }
            }
        },
        //Updates the title and description of the tutorial
        updateTitleInfo: function(title, desc){
            this.set({title: title, desc: desc});
        }
    });
    return Tutorial;
});