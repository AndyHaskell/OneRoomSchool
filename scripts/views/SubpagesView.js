define([
    "jquery",
    "underscore",
    "backbone",
    "models/Subpage",
    "views/SubpageView",
    "text!templates/subpages-template.html"
], function($, _, Backbone, Subpage, SubpageView, SubpagesTemplateText){
    //The view for a list of subpages in a code page; very similar to PagesView
    var SubpagesView = Backbone.View.extend({
        initialize: function(options){
            /*Re-render the list of subpages when the number of subpages in the
             *current Page changes.
             */
            this.collection.bind("add", this.addOrRemove, this);
            this.collection.bind("remove", this.addOrRemove, this);
            
            /*If a subpage is opened or closed, highlight the button for any
             *subpage being opened and remove the highlight for any button for
             *any subpage being closed.
             */
            this.listenTo(options.root, "open-subpage", this.highlightButton);
            this.listenTo(options.root, "close-subpage", this.deselectButton);
            
            this.subviews = {};
            this.isClosed = false;
            this.rootName = options.rootName;
            
            this.currentSubpage = -1;
            this.leftmost = this.collection.length == 0 ? -1 : 0;
        },
        template: _.template(SubpagesTemplateText),
        events: {
            "click .subpage-button" : "openSubpage",
            "click #shift-subpages-left .nav-button"  : "shiftLeft",
            "click #shift-subpages-right .nav-button" : "shiftRight"
        },
        
        render: function(){
            var subpageButtons = "";
            //Generate the HTML for the subpage buttons
            this.$el.html(this.template({subpages:this.collection.length,
                                         leftmost: this.leftmost}));
            return this;
        },
        
        /*This function is called any time a subpage is added or removed.  If a
         *subpage is being added to an empty subpage list, the leftmost index
         *for the subpages view must be changed to 0.  If after the removal of a
         *subpage the leftmost subpage index is greater than the index of the
         *last subpage, the leftmost subpage index must be updated so the
         *leftmost subpage button is in the tutorial.
         */
        addOrRemove: function(){
            if(this.collection.length <= 7){
                this.leftmost = this.collection.length > 0 ? 0 : -1;
            }
            if(this.leftmost == this.collection.length){
                this.leftmost--;
            }
            this.render();
        },
        
        //Close the subpages list; called when closing a code page.
        close: function(){
            this.remove();
            this.unbind();
            this.isClosed = true;
        },
        
        /*Opens the selected subpage.  Either removes the PageView's code screen
         *and control panel or the "new subpage" screen or closes the current
         *subpage and then renders the current subpage in the #current-subpage
         *div.
         */
        openSubpage: function(e){
            if(!$(e.target).hasClass("selected-page-button")){
                window[this.rootName].trigger("open-subpage", $(e.target)
                                                  .data("subpage-number"));
            }
        },

        //Highlights the button for the subpage that is currently open
        highlightButton: function(subpageNumber){
            $(".selected-subpage-button")
                .removeClass("selected-subpage-button");
            if(subpageNumber >= 0){
                $(".subpage-button" + ":nth-of-type(" +
                  (subpageNumber-this.leftmost+1) + ")")
                                           .addClass("selected-subpage-button");
            }
        },
        
        //Removes the highlight from whatever button is highlit
        deselectButton: function(){
            this.highlit = -1;
            $(".selected-page-button ").removeClass("selected-subpage-button");
        },
        
        //Shift the subpages list left
        shiftLeft: function(){
            this.leftmost = Math.max(this.leftmost - 7, 0);
            this.render();
        },
        
        //Shift the subpages list right
        shiftRight: function(){
            this.leftmost += 7;
            this.render();
        }
    });
    
    return SubpagesView;
});