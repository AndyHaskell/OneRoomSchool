define([
    "jquery",
], function($, rangyModule){
    require(["rangy", "cssclassapplier"]);
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
    
    return highlightCode;
});