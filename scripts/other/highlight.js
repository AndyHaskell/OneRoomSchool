define([
    "jquery",
    "rangy",
    "cssclassapplier"
], function($, rangy, cssclassapplier){
    /*Uses Rangy to highlight code the user drags over when creating a new
     *subpage or editing a subpage
     */
    var highlightCode = function(){
        rangy.init();
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