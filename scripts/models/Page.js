define([
    'underscore',
    'backbone'
], function(_, Backbone){
    Page = Backbone.Model.extend({
        /*The initialize function in the Page model is called any time a Page
         *is being initialized.  It takes in a parameter "data", which is a hash
         *of the Page's attributes.
         *
         *It is used for processing the data hash in pages that are loaded from
         *the JSON of other tutorials.  The JSON data for any Backbone.js models
         *or collections in a page, such as a code page's "subpages" collection,
         *must be converted from JavaScript object hashes to Backbone.js models
         *and collections when they are loaded from other tutorials.
         */
        initialize: function(data){
            if(this.getType() == "code"){
                this.set({subpages: new Subpages()});
                if(typeof(data["subpages"]) != "undefined"){
                    for(var i = 0; i < data["subpages"].length; i++){
                        this.get("subpages").add(
                          new Subpage(data["subpages"][i]));
                    }
                }
            }
            /******************************************************************
             *                                                                *
             *   Add additional if statements if your user-defined page type  *
             *   is going to have any attributes that are Backbone.js models  *
             *                        and collections.                        *
             *                                                                *
             ******************************************************************/
        },
        /*The default attributes for all Pages.
         *
         *pageType is the type of Page; pre-defined pageTypes include "text",
         *which is a page that just contains text, images, and LaTeX, and
         *"code", which includes a screen containing a code sample and possibly
         *subpages that highlight and caption different parts of the code.
         *
         *content is a text representation of the main content of the page.  For
         *example, content represents the text of text pages and the code of a
         *code page.
         */
        defaults: {pageType: "text", content: ""},

        //get the type for a Page.
        getType: function(){
            return this.get("pageType");
        },
        //get the content for a Page.
        getContent: function(){
            return this.get("content");
        },
        //takes in text and sets the Page's content attribute to the text
        setContent: function(content){
            this.set({content: content});
        },
    });
    
    //The backbone.js collection for the Pages in a tutorial
    Pages = Backbone.Collection.extend({model: Page});
    
    return {
        Page: Page,
        Pages: Pages
    };
});