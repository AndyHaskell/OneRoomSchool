/*A module for rendering a Page of the Tutorial.  The module uses the modules
 *for loading the content and control panel templates in order to generate the
 *HTML that the page template takes in as its parameters.
 */
define([
    "underscore",
    "templates/page-content-templates",
    "templates/control-panel-templates",
    "text!templates/page-template.html"
], function(_, content, controlPanel, pageTemplateText){
    renderPage = function(page){
        contentHTML = content[page.getType()]({page: page});
        controlPanelHTML = controlPanel[page.getType()]({page: page});
        pageTemplate = _.template(pageTemplateText);
        return pageTemplate({content: contentHTML,
                             controlPanel: controlPanelHTML});
    }
    
    return renderPage;
});