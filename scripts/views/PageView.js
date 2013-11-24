define([
    "jquery",
    "underscore",
    "backbone",
    "templates/render-page",
    "other/preview-page",
    "views/SubpageView",
    "views/SubpagesView",
    "models/Subpage",
    "text!templates/new-subpage-template.html",
    "rangy",
    "cssclassapplier"
], function($, _, Backbone, renderPage, previewPage, SubpageView, SubpagesView,
            Subpage, newSubpageTemplateText, rangy, cssclassapplier){
    //The view representing a page of the tutorial
    PageView = Backbone.View.extend({
        initialize: function(){
            this.subviews = {};
            this.isClosed = false;
            this.customizeView();
        },
        /*The default events for a PageView are for closing the PageView and
         *deleting the Page, upon clicking their respective buttons.  Additional
         *events for PageViews specific to page types can be added in
         *customizeView, which is called from initialize.
         */
        events: {
            "click #leave-page"  : "close",
            "click #delete-page" : "deletePage",
        },
        render: function(){
            this.$el.html(renderPage(this.model));
            //If the page being opened has any subviews, render them.
            this.renderSubviews();
            return this;
        },
        /*The close function for a PageView.  Closes the view by sliding the
         *page up, closing any subviews the PageView has, and removing and
         *unbinding the PageView.  If a callback function is passed as well,
         *the callback function is called, which can be used to give the close
         *function additional effects, like deleting the page or opening the
         *PageView for another Page.  If no callback function is passed, the
         *new page toolbar is restored.
         */
        close: function(callback){
            var self = this;
            $("#current-page").slideUp(400, function(){
                self.closeSubviews();
                if(typeof(callback) == "function"){
                    callback(self);
                }
                else{
                    $("#new-page-toolbar").slideDown(400);
                }
                self.remove();
                self.unbind();
                self.isClosed = true;
            });
        },
        closeSubviews: function(){
            var self = this;
            var keys = Object.keys(self.subviews);
            for(var i = 0; i < keys.length; i++){
                if(self.subviews[keys[i]] != null){
                    self.subviews[keys[i]].close();
                }
            }
        },
        //Close and delete the current page
        deletePage: function(){
            this.close(function(self){
                self.model.destroy();
                $("#new-page-toolbar").slideDown(400);
            });
        },
        /**********************************************************************
         *                                                                    *
         *  customizeView is called from initialize to add additional events, *
         *  member functions, and subviews to the PageView that are specific  *
         *                to the type of the PageView's Page.                 *
         *                                                                    *
         **********************************************************************/
        customizeView: function(){
            var self = this;
            
            /******************************************************************
             *                                                                *
             *      Add if statements below for user-defined page types       *
             *                                                                *
             ******************************************************************/
            if(self.model.getType() == "text"){
                self.events["click #save-page"] = "saveEdit",
                /*Save edits made when editing this page by setting the current
                 *Page's "content" attribute to the data in the "#page-content"
                 *textarea.
                 */
                self.saveEdit = function(){
                    this.close(function(self){
                        self.model.setContent($("#page-content").val());
                        self.model.set({hasLaTeX:
                                        $("#has-LaTeX:checked").length == 1});
                        $("#new-page-toolbar").slideDown(400);
                    });
                }
            }
            if(self.model.getType() == "code"){
                self.subviews.subpagesView = new SubpagesView({
                    collection: self.model.get("subpages")});
                self.subviews.currentSubpageView = null;
                
                self.events["click #add-subpage"] = "openNewSubpage";
                self.events["click #select-code-screen"] = "highlightCode";
                self.events["click .selected"] = "removeSpan";
                self.events["click #cancel-new-subpage"] = "closeNewSubpage";
                self.events["click #save-new-subpage"] = "addSubpage";
                
                /*Remove spans in the code screen that are highlit when they are
                 *clicked on in "new subpage mode"
                 */
                self.removeSpan = function(e){
                    $(e.target).replaceWith($(e.target).html());
                };
                //Highlight code that is dragged over when in "new subpage mode"
                self.highlightCode = function(){ highlightCode(); };
                //Add a new subpage and exit "new subpage mode"
                self.addSubpage = function(){
                    var insertAt = parseInt($("#at-subpage").val());
                    var subpageList = this.model.get("subpages");
                    insertAt = max((insertAt >= 0 &&
                                    insertAt <= subpageList.length+1 ?
                                    insertAt-1 : subpageList.length), 0);
                    subpageList.add(new Subpage.Subpage({
                        codeHTML: $("#select-code-screen").html(),
                        caption:  $("#new-subpage-content").val(),
                        hasLaTeX: $("#has-LaTeX:checked").length == 1
                    }), {at: insertAt});
                    this.closeNewSubpage();
                };
                /*Enter "new subpage mode"; new and existing subpages both
                 *include a code screen that looks identical to the code
                 *screen in the main code page, as well as their own control
                 *panel, so hide the main page's code screen and control panel
                 *to replace it with the control panel for the new subpage.
                 */
                self.openNewSubpage = function(){
                    var subpageTemplate = _.template(newSubpageTemplateText);
                    $("#page-code-screen, #page-control-panel-div").hide();
                    $("#current-subpage").html(subpageTemplate({
                                   code: codeToHTML(this.model.getContent())}));
                };
                /*Exit "new subpage mode" and restore the main page's code
                 *screen and control panel.
                 */
                self.closeNewSubpage = function(){
                    $("#current-subpage").html("");
                    $("#page-code-screen, #page-control-panel-div").show();
                };
            }
        },
        /*renderSubviews is called from a PageView's render function to render
         *any subviews that are specific to the type of page being rendered.
         */
        renderSubviews: function(){
            if(this.model.getType() == "code"){
                this.subviews.subpagesView.setElement(this.$("#subpages"))
                    .render();
            }
            /******************************************************************
             *                                                                *
             *   Add additional if statements if you have subviews to render  *
             *                in a user-defined page type.                    *
             *                                                                * 
             ******************************************************************/
        },
        /*processPageHTML is used for setting up any parts of the page's HTML
         *that cannot be processed in the render function (such as calling
         *previewPage in a text page)
         */
        processPageHTML: function(){
            if(this.model.get("pageType") == "text"){
                previewPage.setPreviewPage();
                previewPage.previewPage('#page-content', '#preview-page');
            }
            /******************************************************************
             *                                                                *
             * Add additional if statements here for a user-defined page type *
             *  if your page type requires processing the page's HTML in any  *
             *        way that can't be done in the render function.          *
             *                                                                *
             ******************************************************************/
        }
    });

    return PageView;
});