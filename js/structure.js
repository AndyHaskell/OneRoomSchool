var OneRoomSchool = (function($){
    codeToHTML = function(code, tabSize){
        var tab = "";
        for(var i = 0; i < tabSize; i++){
            tab = tab + "&nbsp;";
        }
        inHTML = code.replace(/\&/g, "&amp;");
	    inHTML = inHTML.replace(/\t/g, tab).replace(/ /g, "&nbsp;");
	    inHTML = inHTML.replace(/\'/g, "&apos;").replace(/\"/g, "&quot;");
	    inHTML = inHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        inHTML = inHTML.replace(/\n/g, "<br>");
        return inHTML;
    }
    
    highlightCode = function(){
        var highlight = rangy.createCssClassApplier("selected");
        var range = rangy.getSelection().getRangeAt(0);
        if($(range.commonAncestorContainer).is($("#select-code-screen")) ||
           $("#select-code-screen").find($(range.commonAncestorContainer)
                                         ).length > 0){
            highlight.applyToSelection();
            rangy.getSelection().collapseToStart();
        }
    }

    Tutorial = Backbone.Model.extend({
        defaults: {
            title  : "Insert your title here",
            desc   : "Insert your description here",
            format : "slide-show"
        },
        initialize: function(){
            this.set({pages: new Pages()});
        },
    });
    
    SlideShowView = Backbone.View.extend({
        initialize: function(){
            this.model.bind("change", this.changeTitleHeader, this);
        },
        id: "slideshow",
        template: _.template($("#slideshow-template").html()),
        events: {
            "click #save-title"      : "saveTitle",
            "click #edit-title"      : "editTitle",
            "click #cancel-title"    : "closeTitle",
            "click .new-page-button" : "newPage",
            "click .gray"            : "removeGray",
            "click #get-json"        : "getJSON",
            "click #exit-json"       : "exitJSON"
        },
        render: function(){
            this.$el.html(this.template({title: this.model.get("title"),
                                         desc: this.model.get("desc")}));
            return this;
        },
        changeTitleHeader: function(){
            $("#title-header").html(this.model.get("title"));
        },
        editTitle: function(){
            $("#input-title").val(this.model.get("title"));
            $("#input-desc").val(this.model.get("desc"));
            $("#display-title").hide();
            $("#set-title").show();
        },
        saveTitle: function(){
            this.model.set({title: $("#input-title").val(),
                            desc: $("#input-desc").val()});
            this.closeTitle();
        },
        newPage: function(e){
            var pageType = $(e.target).data("page-type");
            $("#new-page-toolbar").slideUp(400, function(){
                newPageView = new NewPageView({model: new Page({pageType:
                                             $(e.target).data("page-type")})});
                $("#current-page").append(newPageView.render().el).
                    slideDown(400);
            });
        },
        closeTitle: function(){
            $("#set-title").hide();
            $("#display-title").show();
        },
        removeGray: function(e){
            $(e.target).val("").removeClass("gray").addClass("black");
        },
        getJSON: function(){
            var self = this;
            var jsonTemplate = _.template($("#tutorial-json-template").html());
            $("#slideshow-main").slideUp(400, function(){
                $("#tutorial-json").html(jsonTemplate({json:
                    JSON.stringify(self.model)})).slideDown(400);
            });
        },
        exitJSON: function(){
            $("#tutorial-json").slideUp(400, function(){
                $("#slideshow-main").slideDown(400);
                $("#tutorial-json").html("");
            })
        }
    });
    
    Page = Backbone.Model.extend({
        defaults: {pageType: "text"}
    });
    
    PageView = Backbone.View.extend({
        template: _.template($("#page-template").html()),
        events: {
            "click #leave-page"  : "close",
            "click #save-page"   : "saveEdit",
            "click #delete-page" : "deletePage",
            "click #new-subpage" : "newSubpage"
        },
        render: function(){
            if(this.model.get("subpages") != null){
                subpagesView = new SubpagesView({
                    collection: this.model.get("subpages")});
            }
            this.$el.html(this.template({page: this.model}));
            return this;
        },
        close: function(){
            var self = this;
            $("#current-page").slideUp(400, function(){
                if(subpagesView != null){
                    subpagesView.close();
                }
                if(currentSubpageView != null){
                    currentSubpageView.close();
                }
                self.remove();
                currentPageView = null;
                if(pageToOpen > -1){
                    currentPageView = new PageView({model:
                        pagesView.collection.at(pageToOpen)});
                    $("#current-page").append(currentPageView.render().el);
                    if(subpagesView != null){
                        $("#subpages").html(subpagesView.render().el);
                    }
                    $("#current-page").slideDown(400, function(){
                        pageToOpen = -1;
                    });
                }
                else{
                    $("#new-page-toolbar").slideDown(400);
                }
            });
        },
        saveEdit: function(){
            if(this.model.get("pageType") == "text"){
                this.model.set({text: $("#page-text").val()});
            }
            this.close();
        },
        deletePage: function(){
            this.model.destroy();
            this.close();
        },
        newSubpage: function(){
            newSubpageView = new NewSubpageView({model: new Subpage()});
            $(".code-screen, #page-control-panel").hide();
            $("#current-subpage").append(newSubpageView.render().el);
        },
    });
    
    NewPageView = Backbone.View.extend({
        template: _.template($("#new-page-template").html()),
        events: {
            "click #cancel-new-page" : "close",
            "click #save-new-page"   : "addPage"
        },
        render: function(){
            this.$el.html(this.template({pageType:this.model.get("pageType")}));
            return this;
        },
        close: function(){
            var self = this;
            $("#current-page").slideUp(400, function(){
                self.remove();
                newPageView = null;
                if(pageToOpen > -1){
                    currentPageView = new PageView({model:
                        pagesView.collection.at(pageToOpen)});
                    $("#current-page").append(currentPageView.render().el);
                    if(subpagesView != null){
                        $("#subpages").html(subpagesView.render().el);
                    }
                    $("#current-page").slideDown(400, function(){
                        pageToOpen = -1;
                    });
                }
                else{
                    $("#new-page-toolbar").slideDown(400);
                }
            });
        },
        addPage: function(){
            if(!$("#new-page-content").hasClass("gray")){
                var pageList = pagesView.collection;
                var index = parseInt($("#at-page").val());
                index = index >= 1 && index < pageList.length ? index - 1 :
                                                                pageList.length;
                if(this.model.get("pageType") == "text"){
                    this.model.set({text: $("#new-page-content").val()});
                }
                if(this.model.get("pageType") == "code"){
                    this.model.set({pageType: "code",
                                    subpages: new Subpages(),
                                    code: $("#new-page-content").val()});
                }
                pagesView.collection.add(this.model, {at: index});
                this.close();
            }
        },
    });
    
    Pages = Backbone.Collection.extend({model: Page});
    
    PagesView = Backbone.View.extend({
        initialize: function(){
            this.collection.bind("add", this.render, this);
            this.collection.bind("remove", this.render, this);
        },
        template: _.template($("#pages-template").html()),
        events: {
            "click .page-button" : "openPage"
        },
        render: function(){
            var pageButtons = "";
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
        openPage: function(e){
            pageToOpen = $(e.target).data("page-number");
            var pageToClose = currentPageView || newPageView;
            if(pageToClose){
                pageToClose.close();
            }
            else{
                currentPageView = new PageView({model:
                    this.collection.at(pageToOpen)});
                $("#current-page").html(currentPageView.render().el);
                if(subpagesView != null){
                    $("#subpages").html(subpagesView.render().el);
                }
                $("#new-page-toolbar").slideUp(400, function(){
                    $("#current-page").slideDown(400, function(){
                        pageToOpen = -1;
                    });
                });
            }
        }
    });
    
    Subpage = Backbone.Model.extend({
        defaults: {
            codeHTML: ""
        }
    });
    
    SubpageView = Backbone.View.extend({
        template: _.template($("#subpage-template").html()),
        events: {
            "click #leave-subpage"      : "close",
            "click #save-subpage"       : "saveSubpage",
            "click #delete-subpage"     : "deleteSubpage",
            "click #select-code-screen" : "highlightCode",
            "click span"                : "removeSpan"
        },
        render: function(){
            this.$el.html(this.template({code:currentPageView.model.get("code"),
                                         subpage: this.model}));
            return this;
        },
        close: function(){
            this.remove();
            $(".code-screen, #page-control-panel").show();
            currentSubpageView = null;
        },
        highlightCode: function(){
            highlightCode();
        },
        removeSpan: function(e){
            $(e.target).replaceWith($(e.target).html());
        },
        saveSubpage: function(){
            this.model.set({text: $("#subpage-text").hasClass("gray") ?
                                         "" : $("#subpage-text").val(),
                            codeHTML: $("#select-code-screen").html()});
            this.close();
        },
        deleteSubpage: function(){
            this.model.destroy();
            this.close();
        },
    });

    NewSubpageView = Backbone.View.extend({
        template: _.template($("#new-subpage-template").html()),
        events: {
            "click #cancel-new-subpage"   : "close",
            "click #save-new-subpage"     : "addSubpage",
            "click #select-code-screen"   : "highlightCode",
            "click span"                  : "removeSpan"
        },
        render: function(){
            this.$el.html(this.template({code: codeToHTML(
                                    currentPageView.model.get("code"), 4)}));
            return this;
        },
        close: function(){
            this.remove();
            $(".code-screen, #page-control-panel").show();
            newSubpageView = null;
        },
        highlightCode: function(){
            highlightCode();
        },
        removeSpan: function(e){
            $(e.target).replaceWith($(e.target).html());
        },
        addSubpage: function(){
            var subpageList = subpagesView.collection;
            var index = parseInt($("#at-subpage").val());
            index = index >= 1 && index < subpageList.length ? index - 1 :
                                                             subpageList.length;
            this.model.set({text: $("#new-subpage-text").hasClass("gray") ? "" :
                                                   $("#new-subpage-text").val(),
                            codeHTML: $("#select-code-screen").html()});
            subpagesView.collection.add(this.model, {at: index});
            this.close();
        },
    });
    
    Subpages = Backbone.Collection.extend({model: Subpage});
    
    SubpagesView = Backbone.View.extend({
        initialize: function(){
            this.collection.bind("add", this.render, this);
            this.collection.bind("remove", this.render, this);
        },
        template: _.template($("#subpages-template").html()),
        events: {
            "click .subpage-button" : "openSubpage"
        },
        render: function(){
            var subpageButtons = "";
            for(var i = 0; i < this.collection.length; i++){
                subpageButtons = subpageButtons + '<p class = "subpage-button' +
                                 ' nav-button" data-subpage-number = "' + i +
                                 '">Subpage ' + (i+1).toString() + '</p>';
            }
            this.$el.html(this.template({noSubpages:this.collection.length == 0,
                                         subpageButtons: subpageButtons}));
            return this;
        },
        close: function(){
            this.remove();
            subpagesView = null;
        }
        openSubpage: function(e){
            if(newSubpageView || currentSubpageView){
                (newSubpageView || currentSubpageView).close();
            }
            var s = $(e.target).data("subpage-number");
            currentSubpageView = new SubpageView({model:this.collection.at(s)});
            $(".code-screen, #page-control-panel").hide();
            $("#current-subpage").html(currentSubpageView.render().el);
        },
    });
    
    tutorialView = new SlideShowView({model: new Tutorial()});
    pagesView = new PagesView({collection: tutorialView.model.get("pages")});
    currentPageView = null;
    subpagesView = null;
    newPageView = null;
    currentSubpageView = null;
    newSubpageView = null;
    pageToOpen = -1;
    
    return {
        tutorialView: tutorialView,
        pagesView: pagesView
    };
})(jQuery);

$(document).ready(function(){
    $("body").append(OneRoomSchool.tutorialView.render().el);
    $("#pages").append(OneRoomSchool.pagesView.render().el);
});