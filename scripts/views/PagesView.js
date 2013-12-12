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
            
            this.listenTo(Backbone, "close-page", this.highlightButton);
            
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
        /*Open the selected page, setting its page view to the tutorial view's
         *"current page view"
         */
        openPage: function(e){
            if(!$(e.target).hasClass("selected-page-button")){
                Backbone.trigger("open-page", $(e.target).data("page-number"));
            }
        },
        //Highlights the button for the page that is currently open
        highlightButton: function(pageNumber){
            $(".selected-page-button ").removeClass("selected-page-button");
            if(pageNumber >= 0){
                $(".page-button"+":nth-of-type("+(pageNumber+1)+")")
                                              .addClass("selected-page-button");
            }
        }
    });
    
    return PagesView;
});