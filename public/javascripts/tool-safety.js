let OriginHost

function tool_init(o_host=false){
    const i_url = new URL(document.getElementById("tool").contentWindow.location.href)
    const i_path = i_url.pathname.slice(1).split("/")

    if(o_host){
        OriginHost = o_host

        for(var script_one of document.getElementById("tool").contentWindow.document.getElementsByTagName('script')){
            try{
                let script_src = new URL(script_one.src)
    
                if(script_src.hostname == OriginHost){
                    let script_path = script_src.pathname 
                    if(script_path[0] == "/"){
                        script_path = script_path.slice(1)
                    }
    
                    var ga = document.createElement( 'script' );
                    ga.type = 'text/javascript';
                    ga.src = "/" + i_path[0] + "/" + i_path[1] + "/" + i_path[2] + "/" + script_path + script_src.search + script_src.hash
                    script_one.after(ga);
                }
            }
            catch(e){}
        }

        for(var link_one of document.getElementById("tool").contentWindow.document.getElementsByTagName('link')){
            try{
                let link_href = new URL(link_one.href)
    
                if(link_href.hostname == OriginHost){
                    let link_path = link_href.pathname 
                    if(link_path[0] == "/"){
                        link_path = link_path.slice(1)
                    }
                    link_one.href = i_url.origin + "/" + i_path[0] + "/" + i_path[1] + "/" + i_path[2] + "/" + link_path + link_href.search + link_href.hash
                }
            }
            catch(e){}
        }
    }
    

    try{
        if(i_url.pathname.slice(-4) == ".pdf" || i_url.pathname.slice(-4) == ".PDF"){
            document.getElementById("tool").src = location.origin + "/ealplus-public/pdf/web/viewer.html?file=" + document.getElementById("tool").contentWindow.location.href
        }
    }
    catch(err){}
    

    for(var a_one of document.getElementById("tool").contentWindow.document.getElementsByTagName('a')){
        try{
            let a_href = new URL(a_one.href)
            if(a_href.hostname == OriginHost){
                let a_path = a_href.pathname 
                if(a_path[0] == "/"){
                    a_path = a_path.slice(1)
                }
                a_one.href = "/" + i_path[0] + "/" + i_path[1] + "/" + i_path[2] + "/" + a_path + a_href.search + a_href.hash
                a_one.oncontextmenu = function () {return false;};
                a_one.target = "";

                if(a_href.pathname.slice(-4) == ".pdf" || a_href.pathname.slice(-4) == ".PDF"){
                    a_one.href = location.origin + "/ealplus-public/pdf/web/viewer.html?file=" + a_one.href
                }
            }
            else if(a_href.hostname == i_url.hostname){
                a_one.oncontextmenu = function () {return false;};
                a_one.target = "";

                if(a_href.pathname.slice(-4) == ".pdf" || a_href.pathname.slice(-4) == ".PDF"){
                    a_one.href = location.origin + "/ealplus-public/pdf/web/viewer.html?file=" + a_one.href
                }
            }
            else{
                a_one.target = "_blank";
            }
        }
        catch(e){}
    }


    for(var img_one of document.getElementById("tool").contentWindow.document.getElementsByTagName('img')){
        try{
            let img_href = new URL(img_one.src)
            
            if(img_href.hostname == OriginHost){
                let img_path = img_href.pathname 
                if(img_path[0] == "/"){
                    img_path = img_path.slice(1)
                }
                img_one.src = i_url.origin + "/" + i_path[0] + "/" + i_path[1] + "/" + i_path[2] + "/" + img_path + img_href.search + img_href.hash
                //img_one.src  = encodeURI(img_one.src)
            }

            let regexp = new RegExp("https?:\/\/" + OriginHost + "/", 'g')
            if(img_one.srcset){
                img_one.srcset = img_one.srcset.replace(regexp, "/" + i_path[0] + "/" + i_path[1] + "/" + i_path[2] + "/")
                //img_one.srcset = encodeURI(img_one.srcset)
            }
            
        }
        catch(e){}
    }

    for(var form_one of document.getElementById("tool").contentWindow.document.getElementsByTagName('form')){
        try{
            let form_src = new URL(form_one.action)

            if(form_src.hostname == OriginHost){
                let form_path = form_src.pathname 
                if(form_path[0] == "/"){
                    form_path = form_path.slice(1)
                }

                form_one.action = "/" + i_path[0] + "/" + i_path[1] + "/" + i_path[2] + "/" + form_path + form_src.search + form_src.hash
            }
        }
        catch(e){}
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

    logger_reload()
}






