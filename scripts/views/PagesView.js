define([
    "jquery",
    "underscore",
    "backbone",
    "models/Page",
    "views/PageView",
    "text!templates/pages-template.html",
], function($, _, Backbone, Page, PagesView, pagesTemplate){
    PagesView = Backbone.View.extend({
        initialize: function(){
            /*re-render the list of Pages with the correct number of buttons
             *if the number of Pages in the collection is changed.
             */
            this.collection.bind("add", this.render, this);
            this.collection.bind("remove", this.render, this);
            
            this.subviews = {};
            this.isClosed = false;
        },
        template: _.template(pagesTemplate),
        events: {
            "click .page-button" : "openPage"
        },
        render: function(){
            var pageButtons = "";
            //Generate the HTML for the page buttons
            for(var i = 0; i < this.collection.length; i++){
                pageButtons = pageButtons +
                              '<p class = "page-button nav-button"' +
                              ' data-page-number = "' + i + '">Page ' +
                              (i+1).toString() + '</p>';
            }
            this.$el.html(this.template({noPages: this.collection.length == 0,
                                         pageButtons: pageButtons}));
            return this;
        },
        close: function(){
            this.remove();
            this.unbind();
            this.isClosed = true;
        },
        /*openPage opens the selected page by first closing either the new page
         *toolbar or any new page window or page that was already open and then
         *opening the selected page in a callback function.  After this, the
         *"current page view" in the tutorial view's subviews is set to the
         *PageView for the page being opened.
         */
        openPage: function(e){
            var pageNumber = $(e.target).data("page-number");
            var currentPageView = this.subviews.currentPageView;
            var pageToOpen = new PageView({
                        model: this.collection.at(pageNumber)});
            //A page was already open
            if(currentPageView != null && !currentPageView.isClosed){
                currentPageView.close(function(){
                    $("#current-page").html(pageToOpen.render().el);
                    pageToOpen.processPageHTML();
                    $("#current-page").slideDown(400);
                });
            }
            /*No pages are open; the user was in the main menu or new page mode
             *when the page button was clicked.
             */
            else{
                var toHide = $("#current-page").html() != "" ?
                             "#current-page" : "#new-page-toolbar";
                $(toHide).slideUp(400, function(){
                    $("#current-page").html(pageToOpen.render().el);
                    pageToOpen.processPageHTML();
                    $("#current-page").slideDown(400);
                });
            }
            tutorialView.subviews.currentPageView = pageToOpen;
        }
    });
    
    return PagesView;
});