//A module for loading new page templates
define([
    "underscore",
    "text!templates/text-new-page-template.html",
    "text!templates/code-new-page-template.html"
], function(_, textTemplate, codeTemplate){
    return {
        text: _.template(textTemplate),
        code: _.template(codeTemplate)
    }
});