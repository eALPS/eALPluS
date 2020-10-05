var xhr = new XMLHttpRequest();

var url_tool_id = "";
var pair=location.search.substring(1).split('&');
for(var i=0;pair[i];i++) {
	var kv = pair[i].split('=');
	if(kv[0] == "id"){
		url_tool_id = kv[1];
		break;
	}
}

var lastcheck = document.hasFocus();
setInterval( function () {
	var check = document.hasFocus() ;

	if ( lastcheck !== check ) {
        lastcheck = check;
		var send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2]};
		if(check){
			xhr.open('post', "/ealplus-api/tool_active", true);
		}
		else{
			xhr.open('post', "/ealplus-api/tool_inactive", true);
		}
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(send_json)); 

	}
}, 300 );

window.addEventListener('beforeunload', (event) => {
	var send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2]};
	xhr.open('post', "/ealplus-api/tool_terminate", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify(send_json)); 
});

window.addEventListener('load', (event) => {
	var send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2]};
	xhr.open('post', "/ealplus-api/tool_start", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify(send_json)); 
});

function page_change_log(change_url){
	var send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2],"page":change_url};
	xhr.open('post', "/ealplus-api/tool_view_page", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify(send_json)); 
}



