
const params = (new URL(document.location)).searchParams
const url_tool_id = params.get('id')

function launch_log(){
	const xhr = new XMLHttpRequest()
	const send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2]}
	xhr.open('post', "/ealplus-api/tool_launch", true)
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.send(JSON.stringify(send_json))

	if(collectionLogList.default.access){
		page_change_log()
	}
}

function terminate_log(){
	const xhr = new XMLHttpRequest()
	const send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2]}
	xhr.open('post', "/ealplus-api/tool_terminate", true)
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.send(JSON.stringify(send_json))
}

function tab_status_log(){
	let lastcheck = document.hasFocus()
	
	setInterval( function () {
		let check = document.hasFocus()

		if ( lastcheck !== check ) {
			lastcheck = check
			const xhr = new XMLHttpRequest()
			let send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2]}
			if(check){
				xhr.open('post', "/ealplus-api/tool_active", true)
			}
			else{
				xhr.open('post', "/ealplus-api/tool_inactive", true)
			}
			xhr.setRequestHeader('Content-Type', 'application/json')
			xhr.send(JSON.stringify(send_json))

		}
	}, 200 )
}


function page_change_check(){
	let href_check_interval
	try{
		let lasthref = document.getElementById("tool").contentWindow.location.pathname + document.getElementById("tool").contentWindow.location.search
		let nowhref = document.getElementById("tool").contentWindow.location.pathname + document.getElementById("tool").contentWindow.location.search

		href_check_interval = setInterval(function(){
			nowhref = document.getElementById("tool").contentWindow.location.pathname + document.getElementById("tool").contentWindow.location.search
			if( lasthref !== nowhref){
				lasthref = nowhref
				page_change_log()

				const elementToObserve = document.getElementById("tool").contentWindow.document
				observer.disconnect()
				observer.observe(elementToObserve, {subtree: true, childList: true})
			}
		}, 200)
	}
	catch(err){
		clearInterval(href_check_interval)
	}
}

function page_change_log(){
	const xhr = new XMLHttpRequest()
	let change_url = document.getElementById("tool").contentWindow.location.pathname + document.getElementById("tool").contentWindow.location.search
	change_url = change_url.replace( "/connection/" + location.pathname.split("/")[2] + "/" + url_tool_id , "" )

	const send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2],"page":change_url}
	xhr.open('post', "/ealplus-api/tool_access", true)
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.send(JSON.stringify(send_json))
}

async function click_log(e){
	const xhr = new XMLHttpRequest()
	let click_json = await targetSearch(e)

	let click_url =document.getElementById("tool").contentWindow.location.pathname
	click_url = click_url.replace( "/connection/" + location.pathname.split("/")[2] + "/" + url_tool_id , "" )

	const send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2],"page":click_url,"element":click_json,"value":1,"type":"mouse"};
	xhr.open('post', "/ealplus-api/tool_press", true)
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.send(JSON.stringify(send_json))
}

let key_press_count = 0
let key_press_timer
let last_key_element
async function key_input_log(e){
	last_key_element = e
	key_press_count += 1

	clearTimeout(key_press_timer)
	key_press_timer = setTimeout(function(){
		const xhr = new XMLHttpRequest()
		let key_json = targetSearch(last_key_element)

		let key_input_url =document.getElementById("tool").contentWindow.location.pathname
		key_input_url = key_input_url.replace( "/connection/" + location.pathname.split("/")[2] + "/" + url_tool_id , "" )
		const send_json = {
			"tool_id":url_tool_id,
			"class":location.pathname.split("/")[2],
			"page":key_input_url,
			"element":key_json,
			"value":key_press_count,
			"type":"key"
		}
		
		xhr.open('post', "/ealplus-api/tool_press", true)
		xhr.setRequestHeader('Content-Type', 'application/json')
		xhr.send(JSON.stringify(send_json))

		key_press_count = 0
	}, 5000)
}

let scroll_count = 0
let pre_scroll = false
let scroll_timer
let last_scroll_element
async function scroll_log(e){
	try{
		if(pre_scroll){
			scroll_count += (typeof e.target.scrollTop !== "undefined"?e.target.scrollTop:e.target.scrollingElement.scrollTop) - pre_scroll
		}
		pre_scroll = typeof e.target.scrollTop !== "undefined"?e.target.scrollTop:e.target.scrollingElement.scrollTop 
		last_scroll_element = e
	}
	catch(err){console.log(e)}

	clearTimeout(scroll_timer)
	scroll_timer = setTimeout(function(){
		const xhr = new XMLHttpRequest()
		let scroll_json = targetSearch(last_scroll_element)
		if(last_scroll_element.target == document.getElementById("tool").contentWindow.document){
			scroll_json = {"target":{"value":"body","level":0}}
		}

		let key_input_url = document.getElementById("tool").contentWindow.location.pathname
		key_input_url = key_input_url.replace( "/connection/" + location.pathname.split("/")[2] + "/" + url_tool_id , "" )
		const send_json = {
			"tool_id":url_tool_id,
			"class":location.pathname.split("/")[2],
			"page":key_input_url,
			"element":scroll_json,
			"value":scroll_count,
			"position": (typeof last_scroll_element.target.scrollTop !== "undefined"?last_scroll_element.target.scrollTop:last_scroll_element.target.scrollingElement.scrollTop)
		}

		send_json["position"] = send_json["position"]?send_json["position"]:0
		
		xhr.open('post', "/ealplus-api/tool_scroll", true)
		xhr.setRequestHeader('Content-Type', 'application/json')
		xhr.send(JSON.stringify(send_json))

		scroll_count = 0
		pre_scroll = false
	}, 1000)
}

async function copy_log(e){
	const xhr = new XMLHttpRequest()
	let copy_json = await targetSearch(e)

	let copy_url =document.getElementById("tool").contentWindow.location.pathname
	copy_url = copy_url.replace( "/connection/" + location.pathname.split("/")[2] + "/" + url_tool_id , "" )
	const copy_value = encodeURI(document.getElementById("tool").contentWindow.document.getSelection().toString())

	const send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2],"page":copy_url,"element":copy_json,"value":copy_value,"type":"copy"};
	xhr.open('post', "/ealplus-api/tool_select", true)
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.send(JSON.stringify(send_json))
}

async function cut_log(e){
	const xhr = new XMLHttpRequest()
	let cut_json = await targetSearch(e)

	let cut_url =document.getElementById("tool").contentWindow.location.pathname
	cut_url = cut_url.replace( "/connection/" + location.pathname.split("/")[2] + "/" + url_tool_id , "" )
	const cut_value = encodeURI(document.getElementById("tool").contentWindow.document.getSelection().toString())

	const send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2],"page":cut_url,"element":cut_json,"value":cut_value,"type":"cut"};
	xhr.open('post', "/ealplus-api/tool_select", true)
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.send(JSON.stringify(send_json))
}

async function paste_log(e){
	const xhr = new XMLHttpRequest()
	let paste_json = await targetSearch(e)

	let paste_url =document.getElementById("tool").contentWindow.location.pathname
	paste_url = paste_url.replace( "/connection/" + location.pathname.split("/")[2] + "/" + url_tool_id , "" )
	const paste_value = encodeURI(e.clipboardData.getData('text'))

	const send_json = {"tool_id":url_tool_id,"class":location.pathname.split("/")[2],"page":paste_url,"element":paste_json,"value":paste_value,"type":"paste"};
	xhr.open('post', "/ealplus-api/tool_insert", true)
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.send(JSON.stringify(send_json))
}


function targetSearch(element){
	let deep_level = 0
	let class_value = {}
	let id_value = {}
	let title_value = {}
	let a_value = {}

	for(const path of element.path){
		if(!Object.keys(class_value).length){
			if(path.className){
				class_value["value"] = encodeURI(path.className)
				class_value["level"] = deep_level + 5
			}
		}
		if(!Object.keys(id_value).length){
			if(path.id){
				id_value["value"] = encodeURI(path.id)
				id_value["level"] = deep_level
			}
		}
		if(!Object.keys(title_value).length){
			if(path.title){
				title_value["value"] = encodeURI(path.title)
				title_value["level"] = deep_level
			}
		}
		if(!Object.keys(a_value).length){
			if(path.herf){
				a_value["value"] = encodeURI(path.herf)
				a_value["level"] = deep_level
			}
		}
		deep_level += 1
	}

	if(!Object.keys(class_value).length){
		class_value["value"] = ""
		class_value["level"] = deep_level
	}
	if(!Object.keys(id_value).length){
		id_value["value"] = ""
		id_value["level"] = deep_level
	}
	if(!Object.keys(title_value).length){
		title_value["value"] = ""
		title_value["level"] = deep_level
	}
	if(!Object.keys(a_value).length){
		a_value["value"] = ""
		a_value["level"] = deep_level
	}

	let _json = {
		"class" : class_value,
		"id" : id_value,
		"title" : title_value,
		"a" : a_value
	}
	let sort_json = Object.entries(_json).map(([key, value]) => ({key, value}))
	sort_json.sort((a, b) => {
		if (a.value.level < b.value.level) return -1
		if (a.value.level > b.value.level) return 1
		if (a.key == "id") return 1
		if (b.key == "id") return -1
		if (a.key == "title") return 1
		if (b.key == "title") return -1
		if (a.key == "a") return 1
		if (b.key == "a") return -1
		if (a.key == "class") return 1
		if (b.key == "class") return -1
		return 0;
	})
	_json["class"].level -= 5
	if(sort_json[0].value["value"]){
		_json["target"] = {
			"value":sort_json[0].value["value"],
			"level":sort_json[0].value["level"]
		}
	}
	else{
		_json["target"] = {
			"value":"body",
			"level":deep_level
		}
	}
	return _json
}

function logger_reload(){
	if(collectionLogList){
		if(collectionLogList.default.click){
			document.getElementById("tool").contentDocument.removeEventListener('click', click_log, true)
			document.getElementById("tool").contentDocument.addEventListener('click', click_log, true)
		}

		if(collectionLogList.default.key){
			document.getElementById("tool").contentDocument.removeEventListener('keypress', key_input_log, true)
			document.getElementById("tool").contentDocument.addEventListener('keypress', key_input_log, true)
		}

		if(collectionLogList.default.scroll){
			document.getElementById("tool").contentDocument.removeEventListener('scroll', scroll_log, true)
			document.getElementById("tool").contentDocument.addEventListener('scroll', scroll_log, true)
		}

		if(collectionLogList.default.copy){
			document.getElementById("tool").contentDocument.removeEventListener('copy', copy_log)
			document.getElementById("tool").contentDocument.addEventListener('copy', copy_log)
		}

		if(collectionLogList.default.cut){
			document.getElementById("tool").contentDocument.removeEventListener('cut', cut_log)
			document.getElementById("tool").contentDocument.addEventListener('cut', cut_log)
		}

		if(collectionLogList.default.paste){
			document.getElementById("tool").contentDocument.removeEventListener('paste', paste_log)
			document.getElementById("tool").contentDocument.addEventListener('paste', paste_log)
		}
	}	
}


function logger_init(){
	if(collectionLogList.default.launch){
		launch_log()
	}
	if(collectionLogList.default.terminate){
		window.addEventListener('beforeunload', terminate_log, false)
	}
	if(collectionLogList.default.tab){
		tab_status_log()
	}
	if(collectionLogList.default.access){
		page_change_check()
	}
	logger_reload()
}

const observer = new MutationObserver(function() {
	tool_init()	
})

let collectionLogList = false
function getCollectionLog(){
    const xhr = new XMLHttpRequest
    xhr.onload = function(){
        if(xhr.status == 200){
			collectionLogList = JSON.parse(xhr.response)
			logger_init()
        }
    }
    xhr.open('get', "./collectionLog?id=" + url_tool_id, true)
    xhr.send()
}


window.addEventListener('load', (event) => {
	const elementToObserve = document.getElementById("tool").contentWindow.document
	observer.disconnect()
	observer.observe(elementToObserve, {subtree: true, childList: true})
	getCollectionLog()
})


