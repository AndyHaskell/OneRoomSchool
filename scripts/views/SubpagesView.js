define([
    "jquery",
    "underscore",
    "backbone",
    "models/Subpage",
    "views/SubpageView",
    "text!templates/subpages-template.html"
], function($, _, Backbone, Subpage, SubpageView, subpagesTemplateText){
    //The view for a list of subpages in a code page; very similar to PagesView
    SubpagesView = Backbone.View.extend({
        initialize: function(){
            /*Re-render the list of subpages when the number of subpages in the
             *current Page changes.
             */
            this.collection.bind("add", this.render, this);
            this.collection.bind("remove", this.render, this);
            
            this.listenTo(Backbone, "close-subpage", this.highlightButton);
            
            this.subviews = {};
            this.isClosed = false;
        },
        template: _.template(subpagesTemplateText),
        events: {
            "click .subpage-button" : "openSubpage"
        },
        render: function(){
            var subpageButtons = "";
            //Generate the HTML for the subpage buttons
            for(var i = 0; i < this.collection.length; i++){
                subpageButtons = subpageButtons + '<p class = "subpage-button' +
                                 ' nav-button" data-subpage-number = "' + i +
                                 '">Subpage ' + (i+1).toString() + '</p>';
            }
            this.$el.html(this.template({noSubpages:this.collection.length == 0,
                                         subpageButtons: subpageButtons}));
            return this;
        },
        //Close the subpages list; called when closing a code page.
        close: function(){
            this.remove();
            this.unbind();
            this.isClosed = true;
        },
        /*Opens the selected subpage.  Either removes the PageView's code screen
         *and control panel or the "new subpage" screen or closes the
         *current subpage and then renders the current subpage in the
         *#current-subpage div.
         */
        openSubpage: function(e){
            if(!$(e.target).hasClass("selected-page-button")){
                Backbone.trigger("open-subpage",$(e.target)
                                                  .data("subpage-number"));
            }
        },
        //Highlights the button for the subpage that is currently open
        highlightButton: function(pageNumber){
            $(".selected-subpage-button").removeClass(
                                                     "selected-subpage-button");
            if(pageNumber >= 0){
                $(".subpage-button"+":nth-of-type("+(pageNumber+1)+")")
                                           .addClass("selected-subpage-button");
            }
        }
    });
    
    return SubpagesView;
});