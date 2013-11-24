define([
    "jquery",
    "other/text-processors"
], function($, textProcessors){
    textToHTMLwithImages = textProcessors.textToHTMLwithImages;
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

    /*When a textarea with the "has-preview" class and a checkbox with the
     *"has-LaTeX" id are opened, bind events to them so when the textarea is
     *blurred or the checkbox is clicked, previewPage is called.
     */
    setPreviewPage = function(){
        $(".has-preview").on("blur", function(e){
            previewPage($(e.target), $(e.target).data("preview"));
        });
    
        $("#has-LaTeX").on("change", function(e){
            previewPage($(e.target).data("textbox"),
                        $(e.target).data("preview"));
        });
    }
    
    return {
        previewPage: previewPage,
        setPreviewPage: setPreviewPage
    };
});