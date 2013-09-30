var OneRoomSchool = (function($){
    max = function(x,y){return x>y?x:y;}
    min = function(x,y){return x<y?x:y;}

    /*Takes in code and the number of spaces in a tab, returns HTML that reads
     *like the code in a text file by escaping various characters that do not
     *represent themselves in HTML
     */
    codeToHTML = function(code, tabSize){
        var tab = "";
        for(var i = 0; i < tabSize; i++){
            tab = tab + " ";
        }
        return textToHTML(code).replace(/\t/g, tab).replace(/ /g, "&nbsp;");
    }

    /*Takes in text and the number of spaces in a tab, returns HTML that reads
     *like the text in a text file by escaping various characters that do not
     *represent themselves in HTML
     */    
    textToHTML = function(text){
        return text.replace(/\&/g, "&amp;").replace(/\'/g, "&apos;")
                   .replace(/\"/g, "&quot;").replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    }
    
    /*textToHTMLwithImages calls textToHTML to escape characters that are part
     *of HTML syntax and then replace OneRoomSchool image tags in square
     *brackets with HTML image tags.  Image tags can be escaped by putting
     *backslashes directly before the tag.
     */
    textToHTMLwithImages = function(text){
        var inHTML = textToHTML(text);
        var imgRegex = //See below
/*************************************************************************
 * backslashes   img  The image's URL   The image's size data (optional) *
 *       |      /           |                      |                     *
 *       |     |     /------------\    /-----------------------\         *
 *       V     V    |              |  |                         |        */
        /\\*\[img\s+(http:\/\/)?\S+\s*(thumb|\d+\s*x\s*\d+)?\s*\]/g;
        var imgsrcRegex=/(http:\/\/)?\S+(?=(\s*(thumb|\d+\s*x\s*\d+)?\s*\]))/;
        var imgTagRegex=/\[img\s+(http:\/\/)?\S+\s*(thumb|\d+\s*x\s*\d+)?\s*\]/;
        inHTML = inHTML.replace(imgRegex,
        function(match){
            var slashes = match.match(/\\*/)[0];
            var displaySlashes = slashes.substr(0, slashes.length / 2);
            var imgsrc = match.match(imgsrcRegex)[0].replace(/\&amp;/g, "&");
            var imgtag = match.match(imgTagRegex)[0];
            var sizeOption = match.match(/(thumb|\d+\s*x\s*\d+)(?=(.*\]))/);
            //The default is for the image to be at full size.
            var sizeInfo = "";
            if(sizeOption != null){
                var imgsize = sizeOption[0];
                //Thumbnail, 100px x 100px
                if(imgsize == "thumb"){
                    sizeInfo = "class = 'thumb'";
                }
                //The image's size is specified as width x height.
                if(imgsize.match(/\d\s*x\s*\d/)){
                    imgsizeArray = imgsize.split(/\s*x\s*/);
                    imgwidth = imgsizeArray[0];
                    imgheight = imgsizeArray[1];
                    sizeInfo = "width = '" + imgwidth + "' height = '" +
                               imgheight + "'";
                }
            }
            /*If there is an even number of leading slashes, display the image.
             *Otherwise, display the image tag.
             */
            return displaySlashes + (slashes.length % 2 == 1 ?
                                   imgtag : "<img src = \"" + imgsrc + "\" "+
                                   sizeInfo + " />");
        });
        return inHTML;
    }
    
    /*Uses Rangy to highlight code the user drags over when creating a new
     *subpage or editing a subpage
     */
    highlightCode = function(){
        var highlight = rangy.createCssClassApplier("selected");
        var range = rangy.getSelection().getRangeAt(0);
        if($(range.commonAncestorContainer).is($("#select-code-screen")) ||
           $("#select-code-screen").find($(range.commonAncestorContainer))
                                   .length > 0){
            highlight.applyToSelection();
            rangy.getSelection().collapseToStart();
        }
    }
    
    //The model for storing a tutorial's data
    Tutorial = Backbone.Model.extend({
        defaults: {
            title  : "Insert your title here",
            desc   : "Insert your description here",
            format : "slide-show"
        },
        initialize: function(data){
            //Add a Pages collection to the TutorialView model
            this.set({pages: new Pages()});
            
            /*When loading a Tutorial from another Tutorial's JSON data, the
             *JSON object representing each model's sub-models (such as Pages
             *of a Tutorial or Subpages of a Page) must be converted to
             *Backbone.js models.  Therefore, in this part of the initialize
             *function, each object in data["pages"] must be converted to a Page
             *model in the new Tutorial's Page collection.
             */
            if(typeof(data) != "undefined"){
                var pages = data["pages"];
                if(typeof(pages) != "undefined"){
                    for(var i = 0; i < pages.length; i++){
                        this.get("pages").add(new Page(pages[i]));
                    }
                }
            }
            ////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////
        },
    });
    
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
        },
        id: "slideshow",
        template: _.template($("#slideshow-template").html()),
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
        /*changeTitleHeader is called whenever the tutorial model is changed so
         *the title header reflects the current title of the tutorial.
         */
        changeTitleHeader: function(){
            $("#title-header").html(this.model.get("title"));
        },
        /*editTitle opens the "#set-title" box and hides the title header so
         *the user can edit the title and description of the tutorial.
         */
        editTitle: function(){
            $("#input-title").val(this.model.get("title"));
            $("#input-desc").val(this.model.get("desc"));
            $("#display-title").hide();
            $("#set-title").show();
        },
        /*saveTitle sets the title and description of the tutorial to the values
         *in their respective input boxes in the "#set-title" box.
         */
        saveTitle: function(){
            this.model.set({title: $("#input-title").val(),
                            desc: $("#input-desc").val()});
            this.closeTitle();
        },
        //closeTitle hides the "#set-title" box and opens the title header.
        closeTitle: function(){
            $("#set-title").hide();
            $("#display-title").show();
        },
        /*openNewPage closes the new page toolbar and fills the "#current-page"
         *element with the new page template for the type of new page the user
         *is creating.
         */
        openNewPage: function(e){
                               //Select the template
            var pageTemplate = _.template($("#" + $(e.target).data("template") +
                                            "-new-page-template").html());
            $("#new-page-toolbar").slideUp(400, function(){
                $("#current-page").html(pageTemplate({pageType:
                    $(e.target).data("page-type")})).slideDown(400);
            });
        },
        /*closeNewPage closes and clears the "#current-page" element to exit
         *from making a new page and re-opens the new page toolbar.
         */
        closeNewPage: function(){
            $("#current-page").slideUp(400, function(){
                $("#current-page").html("");
                $("#new-page-toolbar").slideDown(400);
            });
        },
        /*addNewPage adds a new page with the content of the new page textarea
         *to the collection of pages in the tutorial and then closes the new
         *page box.
         */
        addNewPage: function(e){
            if(!$("#new-page-content").hasClass("gray")){
                var insertAt = parseInt($("#at-page").val());
                var pageList = tutorialView.model.get("pages");
                insertAt = max((insertAt >= 0 && insertAt <= pageList.length+1 ?
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
                pageList.add(new Page(newPageAttributes),
                                       {at:insertAt});
                this.closeNewPage();
            }
        },
        /*removeGray clears the prompt text from any input box or textarea with
         *the class "gray" and makes the text in that input box black.
         */
        removeGray: function(e){
            $(e.target).val("").removeClass("gray").addClass("black");
        },
        /*getJSON opens a window containing a textarea with the JSON encoding of
         *the tutorial so the user can copy the JSON. (this button can be
         *replaced with other types of buttons, such as a submit button, on
         *applications that use OneRoomSchool.)
         */
        getJSON: function(){
            var self = this;
            var jsonTemplate = _.template($("#tutorial-json-template").html());
            $("#slideshow-main").slideUp(400, function(){
                $("#tutorial-json").html(jsonTemplate({}));
                $("#tutorial-json-textarea").val(JSON.stringify(self.model));
                $("#tutorial-json").slideDown(400);
            });
        },
////////////////////////////////////////////////////////////////////////////////
        /*loadJSON opens a window containing a textarea where the user can paste
         *the JSON of another tutorial to load a different tutorial.
         */
        loadJSON: function(){
            var self = this;
            var jsonTemplate = _.template($("#load-json-template").html());
            $("#slideshow-main").slideUp(400, function(){
                $("#tutorial-json").html(jsonTemplate({}));
                $("#tutorial-json").slideDown(400);
            });
        },
        
        loadTutorial: function(){
            var newTutorialJSON = $("#tutorial-json-textarea").val();
            var tutorialObject = JSON.parse(newTutorialJSON);
            this.close(function(){
                tutorialView = new SlideShowView({model:
                                                 new Tutorial(tutorialObject)});
                $("body").append(tutorialView.render().el);
            });
        },
        
////////////////////////////////////////////////////////////////////////////////
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
    
    /*The model for a page of the tutorial.  All Pages have attributes that
     *describe the type of the page as well as an encoding of the page's
     *content in text.  Additional attributes can also be added for specific
     *user-defined types of pages.
     */
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
         *pageType is the type of page; pre-defined pageTypes include "text",
         *which is a page that just contains text, images, and LaTeX, and
         *"code", which includes a screen containing a code sample and possibly
         *subpages that highlight and caption different parts of the code.
         *
         *content is a text representation of the main content of the page.  For
         *example, content represents the text of text pages and the code of a
         *code page.
         */
        defaults: {pageType: "text",
                   content: ""},
        //get the type for a Page.
        getType: function(){
            return this.get("pageType");
        },
        //get the content for a page.
        getContent: function(){
            return this.get("content");
        },
        //takes in text and sets the page's content attribute to the text
        setContent: function(content){
            this.set({content: content});
        },
    });
    
    //The view representing a page of the tutorial
    PageView = Backbone.View.extend({
        initialize: function(){
            this.subviews = {};
            this.isClosed = false;
            this.customizeView();
        },
        template: _.template($("#page-template").html()),
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
            this.$el.html(this.template({page: this.model}));
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
                    subpageList.add(new Subpage({
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
                    var subpageTemplate = _.template($("#new-subpage-template").
                                                                        html());
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
                previewPage('#page-content', '#preview-page');
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
    
    Pages = Backbone.Collection.extend({model: Page});
    
    PagesView = Backbone.View.extend({
        initialize: function(){
            /*re-render the list of pages with the correct number of buttons
             *if the number of pages in the collection is changed.
             */
            this.collection.bind("add", this.render, this);
            this.collection.bind("remove", this.render, this);
            
            this.subviews = {};
            this.isClosed = false;
        },
        template: _.template($("#pages-template").html()),
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
            var currentPageView = tutorialView.subviews.currentPageView;
            var pageToOpen = new PageView({
                        model: tutorialView.model.get("pages").at(pageNumber)});
            //A page was already open
            if(currentPageView != null && !currentPageView.isClosed){
                currentPageView.close(function(){
                    $("#current-page").html(pageToOpen.render().el);
                    pageToOpen.processPageHTML();                    
                    $("#current-page").slideDown(400);
                });
            }
            //No pages are open; in the main menu or new page mode
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
    
    /*The view for editing a code page's subpage.  Its HTML is very similar to
     *that of the code page.
     */
    SubpageView = Backbone.View.extend({
        initialize: function(){
            this.subviews = {};
            this.isClosed = false;
        },
        template: _.template($("#subpage-template").html()),
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
            highlightCode();
        },
        //Remove the span used to highlight the code on a given subpage.
        removeSpan: function(e){
            $(e.target).replaceWith($(e.target).html());
        },
        /*Save changes to which code is selected, the subpages's caption, and
         *whether or not the subpage should render LaTeX in its caption and
         *close the subpage.
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

    //A collection of subpages in a code page
    Subpages = Backbone.Collection.extend({model: Subpage});
    
    //The view for a list of subpages in a code page; very similar to PagesView
    SubpagesView = Backbone.View.extend({
        initialize: function(){
            /*Re-render the list of subpages when the number of subpages in the
             *current Page changes.
             */
            this.collection.bind("add", this.render, this);
            this.collection.bind("remove", this.render, this);
            this.subviews = {};
            this.isClosed = false;
        },
        template: _.template($("#subpages-template").html()),
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
            if(this.subviews.currentSubpageView != null &&
               !this.subviews.currentSubpageView.isClosed){
                this.subviews.currentSubpageView.close();
            }
            $("#page-code-screen, #page-control-panel-div").hide();
            var s = $(e.target).data("subpage-number");
            var subpageToOpen = new SubpageView({model:this.collection.at(s)});
            $("#current-subpage").html(subpageToOpen.render().el);
            tutorialView.subviews.currentPageView.subviews.currentSubpageView =
                                                                  subpageToOpen;
            previewPage('#subpage-content', '#preview-page');
        },
    });
    
    /*In pages that display text where the text can be replaced with LaTeX or
     *images, call textToHTMLwithImages on the content of "textbox".  If the
     *checkbox "#has-LaTeX" is checked, then also make it so "#preview-page"
     *displays LaTeX.  Do not display "#preview-page" if the content of the
     *textbox is blank or only contains whitespace.
     */
    previewPage = function(textbox, preview){
        $(preview).html(textToHTMLwithImages($(textbox).val()));
        if($(preview).html().match(/\S/)){
            if($("#has-LaTeX:checked").length == 1){
                MathJax.Hub.Typeset();
            }
            $(preview).show();
        }
        else{
            $(preview).hide();
        }
    }
    
    tutorialView = new SlideShowView({model: new Tutorial()});
    
    return {
        tutorialView: tutorialView,
    };
}(jQuery));

$(document).ready(function(){
    $("body").append(OneRoomSchool.tutorialView.render().el);
});