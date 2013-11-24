//Module for loading control panel templates for pages
define([
    "underscore",
    "text!templates/text-control-panel-template.html",
    "text!templates/code-control-panel-template.html"
], function(_, textTemplate, codeTemplate){
    return {
        text: _.template(textTemplate),
        code: _.template(codeTemplate)
    }
});