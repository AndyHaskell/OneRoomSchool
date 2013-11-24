define([
    "jquery",
    "underscore",
    "backbone",
    "other/highlight",
    "text!templates/subpage-template.html",
], function($, _, Backbone, highlightCode, subpageTemplateText){
    /*The view for editing a code page's subpage.  Its HTML is very similar to
     *that of the code page.
     */
    SubpageView = Backbone.View.extend({
        initialize: function(){
            this.subviews = {};
            this.isClosed = false;
        },
        template: _.template(subpageTemplateText),
        events: {
            "click #leave-subpage"      : "close",
            "click #save-subpage"       : "saveSubpage",
            "click #delete-subpage"     : "deleteSubpage",
            "click #select-code-screen" : "highlightCode",
            "click span"                : "removeSpan"
        },
        render: function(){
            this.$el.html(this.template({code: tutorialView.subviews.
                                              currentPageView.model.get("code"),
                                         subpage: this.model}));
            return this;
        },
        /*When closing a subpage, the user returns to the main screen for
         *editing the current page, so restore the PageView's code screen and
         *control panel.
         */
        close: function(){
            this.isClosed = true;
            this.unbind();
            this.remove();
            $("#page-code-screen, #page-control-panel-div").show();
        },
        /*Same as highlightCode and removeSpan in the functions in a page view
         *that are used when creating a new subpage.
         */
        highlightCode: function(){
            Highlight.highlightCode();
        },
        //Remove the highlighting on a section of code in a subpage
        removeSpan: function(e){
            $(e.target).replaceWith($(e.target).html());
        },
        /*Save changes to a subpage, including which code is selected, the
         *subpages's caption, and whether or not the subpage should render LaTeX
         *in its caption and close the subpage.
         */
        saveSubpage: function(){
            this.model.set({codeHTML: $("#select-code-screen").html(),
                            caption: $("#subpage-content").val(),
                            hasLaTeX: $("#has-LaTeX:checked").length == 1});
            this.close();
        },
        //Close the subpage view and delete the current subpage.
        deleteSubpage: function(){
            this.model.destroy();
            this.close();
        },
    });
    
    return SubpageView;
});