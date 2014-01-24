define([
    "jquery",
    "underscore",
    "backbone",
    "models/Page",
    "views/PageView",
    "text!templates/pages-template.html",
], function($, _, Backbone, Page, PagesView, PagesTemplate){
    var PagesView = Backbone.View.extend({
        initialize: function(options){
            this.subviews = {};
            this.isClosed = false;
            this.rootName = options.rootName;
            
            /*re-render the list of Pages with the correct number of buttons
             *if the number of Pages in the collection is changed.
             */
            this.collection.bind("add", this.addOrRemove, this);
            this.collection.bind("remove", this.addOrRemove, this);
            
            /*If a page is opened or closed, highlight the button for any page
             *being opened and remove the highlight for any button for any page
             *being closed.
             */
            this.listenTo(options.root, "open-page", this.highlightButton);
            this.listenTo(options.root, "close-page", this.deselectButton);
            
            this.highlit = -1;
            this.leftmost = this.collection.length == 0 ? -1 : 0;
        },
        template: _.template(PagesTemplate),
        events: {
            "click .page-button" : "openPage",
            "click #shift-pages-left .nav-button"  : "shiftLeft",
            "click #shift-pages-right .nav-button" : "shiftRight"
        },
        render: function(){
            this.$el.html(this.template({pages    : this.collection.length,
                                         leftmost : this.leftmost}));
            this.highlightButton(this.highlit);
            return this;
        },
        /*This function is called any time a page is added or removed.  If a
         *page is being added to an empty page list, the leftmost index for the
         *pages view must be changed to 0.  If after the removal of a page the
         *leftmost page index is greater than the index of the last page, the
         *leftmost page index must be updated so the leftmost page button is in
         *the tutorial.
         */
        addOrRemove: function(){
            if(this.collection.length <= 7){
                this.leftmost = this.collection.length > 0 ? 0 : -1;
            }
            if(this.leftmost == this.collection.length){
                this.leftmost = Math.max(this.leftmost - 7, -1);
            }
            this.render();
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
            var pageNumber = $(e.target).data("page-number");
            if(!$(e.target).hasClass("selected-page-button")){
                window[this.rootName].trigger("open-page", pageNumber);
            }
            this.highlit = pageNumber;
        },
        //Highlights the button for the page that is currently open
        highlightButton: function(pageNumber){
            $(".selected-page-button").removeClass("selected-page-button");
            if(pageNumber >= 0){
                $(".page-button" + ":nth-of-type(" +
                  (pageNumber - this.leftmost + 1) +
                  ")").addClass("selected-page-button");
            }
        },
        //Removes the highlight from whatever button is highlit
        deselectButton: function(){
            this.highlit = -1;
            $(".selected-page-button ").removeClass("selected-page-button");
        },
        //Shift the pages list left by 7 pages
        shiftLeft: function(){
            this.leftmost = Math.max(this.leftmost - 7, 0);
            this.render();
        },
        //Shift the pages list right by 7 pages
        shiftRight: function(){
            this.leftmost += 7;
            this.render();
        }
    });
    
    return PagesView;
});