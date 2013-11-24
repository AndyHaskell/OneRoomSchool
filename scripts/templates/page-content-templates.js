//Module for loading content templates for pages
define([
    "underscore",
    "text!templates/text-content-template.html",
    "text!templates/code-content-template.html"
], function(_, textTemplate, codeTemplate){
    return {
        text: _.template(textTemplate),
        code: _.template(codeTemplate)
    }
});