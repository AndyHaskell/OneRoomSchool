define([], function(){
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
    
    return {
        textToHTML:           textToHTML,
        textToHTMLwithImages: textToHTMLwithImages,
        codeToHTML:           codeToHTML
    }
});