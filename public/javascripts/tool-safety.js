function tool_init(){

    for(var a_one of document.getElementById("tool").contentWindow.document.getElementsByTagName('a')){
        a_one.oncontextmenu = function () {return false;};
    }

    document.getElementById("tool").contentWindow.document.onclick = function( e ){

        var event = e || window.event;
    
        var tagName = '';
        try{
            tagName = (event.target || event.srcElement).tagName.toLowerCase();
        }
        catch(e){}
    
        if( (event.shiftKey || event.ctrlKey) && tagName == 'a' ){
            event.keyCode = 0;
            event.returnValue = false;
            event.cancelBubble = true;
            return false;
        }
    }

    page_change_log(document.getElementById("tool").contentWindow.document.location.pathname);

}