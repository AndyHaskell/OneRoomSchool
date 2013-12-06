define([
    "jquery",
    "underscore",
    "backbone",
    "models/Tutorial",
    "views/PagesView",
    "text!templates/slideshow-template.html",
    "text!templates/pages-template.html",
    "text!templates/page-template.html",
    "text!templates/tutorial-json-template.html",
    "text!templates/load-json-template.html",
    "templates/new-page-templates",
    "other/preview-page"
], function($, _, Backbone, Tutorial, PagesView, slideshowTemplate,
            pagesTemplate, pageTemplate, tutorialJSONtemplate, loadJSONtemplate,
            newPageTemplates, previewPage){
    require(["json"]);
    //The view representing the whole tutorial
    SlideShowView = Backbone.View.extend({
        /**********************************************************************
         *                                                                    *
         * All views in OneRoomSchool will come with a hash of references to  *
         * subviews and a Boolean variable isClosed that is used for keeping  *
         *  track of whether or not a view has been removed and unbound from  *
         *              events and can therefore be replaced.                 *
         *                                                                    *
         **********************************************************************/
        initialize: function(){
            this.model.bind("change", this.changeTitleHeader, this);
            this.subviews = {};
            this.isClosed = false;
            this.subviews.pagesView =
                new PagesView({collection: this.model.get("pages")});
            this.listenTo(Backbone, "open-page", this.openPage);
        },
        id: "slideshow",
        template: _.template(slideshowTemplate),
        events: {
            "click #save-title"      : "saveTitle",
            "click #edit-title"      : "editTitle",
            "click #cancel-title"    : "closeTitle",

            "click .new-page-button" : "openNewPage",
            "click #cancel-new-page" : "closeNewPage",
            "click #add-new-page"    : "addNewPage",

            "click .gray"            : "removeGray",

            "click #get-json"        : "getJSON",
            "click #exit-json"       : "exitJSON",
            "click #load-json"       : "loadJSON",
            "click #load-tutorial"   : "loadTutorial"
        },
        render: function(){
            this.$el.html(this.template({title: this.model.get("title"),
                                         desc: this.model.get("desc")}));
            //Render the page list view
            this.subviews.pagesView.setElement(this.$("#pages")).render();
            return this;
        },
        /*All views that have subviews come with a closeSubviews method, which
         *is called when the view is being closed in order to close all of the
         *view's subviews as well.
         */
        closeSubviews: function(){
            var self = this;
            var keys = Object.keys(self.subviews);
            for(var i = 0; i < keys.length; i++){
                if(self.subviews[keys[i]] != null){
                    self.subviews[keys[i]].close();
                }
            }
        },
        /*All views in OneRoomSchool have a close method, which removes and
         *unbinds the view as well as closing all of the view's subviews.
         */
        close: function(callback){
            var self = this;
            this.$el.fadeOut(400, function(){
                self.closeSubviews();
                self.remove();
                self.unbind();
                self.isClosed = true;
                if(typeof(callback) == "function"){
                    callback();
                }
            });
        },
        /*changeTitleHeader is called whenever the Tutorial model is changed so
         *the title header reflects the current title of the Tutorial.
         */
        changeTitleHeader: function(){
            $("#title-header").html(this.model.get("title"));
        },
        /*editTitle opens the "#set-title" box and hides the title header so
         *the user can edit the title and description of the Tutorial.
         */
        editTitle: function(){
            $("#input-title").val(this.model.get("title"));
            $("#input-desc").val(this.model.get("desc"));
            $("#display-title").hide();
            $("#set-title").show();
        },
        /*saveTitle sets the title and description of the Tutorial to the values
         *in their respective input boxes in the "#set-title" box.
         */
        saveTitle: function(){
            this.model.updateTitleInfo($("#input-title").val(),
                                       $("#input-desc").val());
            this.closeTitle();
        },
        //closeTitle hides the "#set-title" box and opens the title header.
        closeTitle: function(){
            $("#set-title").hide();
            $("#display-title").show();
        },
        /*openNewPage closes the new page toolbar and fills the "#current-page"
         *element with the new page template for the type of new Page the user
         *is creating.
         */
        openNewPage: function(e){
            //Select the template
            var newPageTemplate=newPageTemplates[$(e.target).data("template")];
            $("#new-page-toolbar").slideUp(400, function(){
                $("#current-page").html(newPageTemplate({pageType:
                    $(e.target).data("page-type")})).slideDown(400,function(){
                        previewPage.setPreviewPage();
                    });
            });
        },
        /*closeNewPage closes and clears the "#current-page" element to exit
         *from making a new Page and re-opens the new page toolbar.
         */
        closeNewPage: function(){
            $("#current-page").slideUp(400, function(){
                $("#current-page").html("");
                $("#new-page-toolbar").slideDown(400);
            });
        },
        /*addNewPage adds a new Page with the content of the new page textarea
         *to the collection of Pages in the Tutorial and then closes the new
         *page box.
         */
        addNewPage: function(e){
            if(!$("#new-page-content").hasClass("gray")){
                var insertAt = parseInt($("#at-page").val());
                var pageList = this.model.get("pages");
                insertAt = Math.max((insertAt >= 0 &&
                                     insertAt <= pageList.length+1 ?
                                     insertAt-1 : pageList.length), 0);
                newPageAttributes = {pageType: $(e.target).data("page-type"),
                                       content: $("#new-page-content").val()};
                                       
                if(newPageAttributes["pageType"] == "text"){
                    newPageAttributes["hasLaTeX"] =
                        $("#has-LaTeX:checked").length == 1
                }
                /**************************************************************
                *                                                             *
                *  If you are defining a page type that has attributes other  *
                *   than "content" and "pageType", such as hasLaTeX in a text *
                *    page or subpages in a code page, then add an additional  *
                *  if statement here for your page type to add the attributes *
                *                  to the newPageAttributes hash.             *
                *                                                             *
                ***************************************************************/
                pageList.add(new Page(newPageAttributes), {at:insertAt});
                this.closeNewPage();
            }
        },
        
        openPage: function(pageNumber){
            var pagesView = this.subviews.pagesView;
            var currentPageView = this.subviews.currentPageView;
            var pageToOpen = new PageView({
                                   model: pagesView.collection.at(pageNumber)});
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
            this.subviews.currentPageView = pageToOpen;
        },
        
        /*removeGray clears the prompt text from any input box or textarea with
         *the class "gray" and makes the text in that input box black.
         */
        removeGray: function(e){
            $(e.target).val("").removeClass("gray").addClass("black");
        },
        /*getJSON opens a window containing a textarea with the JSON encoding of
         *the Tutorial so the user can copy the JSON. (this button can be
         *replaced with other types of buttons, such as a submit button, on
         *applications that use OneRoomSchool.)
         */
        getJSON: function(){
            var self = this;
            var jsonTemplate = _.template(tutorialJSONtemplate);
            $("#slideshow-main").slideUp(400, function(){
                $("#tutorial-json").html(jsonTemplate({}));
                $("#tutorial-json-textarea").val(JSON.stringify(self.model));
                $("#tutorial-json").slideDown(400);
            });
        },

        /*loadJSON opens a window containing a textarea where the user can paste
         *the JSON of another Tutorial to load a different tutorial.
         */
        loadJSON: function(){
            var self = this;
            var jsonTemplate = _.template(loadJSONtemplate);
            $("#slideshow-main").slideUp(400, function(){
                $("#tutorial-json").html(jsonTemplate({}));
                $("#tutorial-json").slideDown(400);
            });
        },

        /*Loads a OneRoomSchool Tutorial from its JSON encoding and closes the
         *current tutorial.
         */
        loadTutorial: function(){
            var newTutorialJSON = $("#tutorial-json-textarea").val();
            var tutorialObject = JSON.parse(newTutorialJSON);
            this.close(function(){
                tutorialView = new SlideShowView({model:
                                                 new Tutorial(tutorialObject)});
                $("body").append(tutorialView.render().el);
            });
        },

        /*exitJSON closes the JSON window so the user can return to editing the
         *tutorial.
         */
        exitJSON: function(){
            $("#tutorial-json").slideUp(400, function(){
                $("#slideshow-main").slideDown(400);
                $("#tutorial-json").html("");
            });
        }
    });
    
    return SlideShowView;
});