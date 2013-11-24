define([
    'underscore',
    'backbone'
], function(_, Backbone){
    /*A Subpage is a special model used in code pages.  In code pages, a Subpage
     *is used to highlight specific sections of code (represented in "codeHTML")
     *and use captions (represented in "caption") to describe the code.
     *Subpages can also display LaTeX in their captions if the user wants to
     *display mathematical formulas with the code (described in "hasLaTeX").
     */
    Subpage = Backbone.Model.extend({
        defaults: {
            codeHTML: "",
            caption: "",
            hasLaTeX: false
        },
    });
    
    //A collection of Subpages in a code page
    Subpages = Backbone.Collection.extend({model: Subpage});
    
    return {
        Subpage: Subpage,
        Subpages: Subpages
    };
});