document.getElementById("tool_info_tab").onclick = function() {
    document.getElementById("tool_info_contents").classList.add("display_on");
    document.getElementById("log_info_contents").classList.remove("display_on");

    document.getElementById("tool_info_tab").classList.add("info_tab_on");
    document.getElementById("log_info_tab").classList.remove("info_tab_on");
};

document.getElementById("log_info_tab").onclick = function() {
    document.getElementById("log_info_contents").classList.add("display_on");
    document.getElementById("tool_info_contents").classList.remove("display_on");

    document.getElementById("tool_info_tab").classList.remove("info_tab_on");
    document.getElementById("log_info_tab").classList.add("info_tab_on");
};


var route_len = 0;

function page_list_change(){
    if(document.getElementById("single").checked){
        document.getElementById("single_mode").classList.add("display_on");
        document.getElementById("role_mode").classList.remove("display_on");
        document.getElementById("multi_mode").classList.remove("display_on");
        document.getElementById("dynamic_mode").classList.remove("display_on");
    }
    else if(document.getElementById("multi").checked){
        document.getElementById("single_mode").classList.remove("display_on");
        document.getElementById("role_mode").classList.remove("display_on");
        document.getElementById("multi_mode").classList.add("display_on");
        document.getElementById("dynamic_mode").classList.remove("display_on");
    }
    else if(document.getElementById("role").checked){
        document.getElementById("single_mode").classList.remove("display_on");
        document.getElementById("multi_mode").classList.remove("display_on");
        document.getElementById("role_mode").classList.add("display_on");
        document.getElementById("dynamic_mode").classList.remove("display_on");
    }
    else if(document.getElementById("dynamic").checked){
        document.getElementById("single_mode").classList.remove("display_on");
        document.getElementById("multi_mode").classList.remove("display_on");
        document.getElementById("role_mode").classList.remove("display_on");
        document.getElementById("dynamic_mode").classList.add("display_on");
    }
}

function table_init(id){
    var table = document.getElementById(id);
    route_len = table.rows.length - 1;
}

function insertRow(id,route_sid=false,route_url=false){

    var table = document.getElementById(id);

    var row = table.insertRow(-1);

    var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);

    var button = '<input type="button" class="del_tb_button" value="×" onclick="deleteRow(this)" />';
 
    var row_len = table.rows.length;

    cell1.innerHTML = button;

    if(route_sid){
        if(route_url.indexOf("http://") == -1 && route_url.indexOf("https://") == -1){
            route_url = "http://" + route_url
        }
        cell2.innerHTML = '<input type="text" class="category_input_text" name="route_' + route_len + '_id" size="40" value="' + route_sid + '">';
        cell3.innerHTML = '<input type="text" class="category_input_text" name="route_' + route_len + '_url" size="40" value="' + route_url + '">';
    }
    else{
        cell2.innerHTML = '<input type="text" class="category_input_text" name="route_' + route_len + '_id" size="40">';
        cell3.innerHTML = '<input type="text" class="category_input_text" name="route_' + route_len + '_url" size="40">';
    }
    
    route_len += 1;
}
 

function deleteRow(obj) {
    tr = obj.parentNode.parentNode;

    tr.parentNode.deleteRow(tr.sectionRowIndex);
}
 

function insertColumn(id) {
    var table = document.getElementById(id);

    var rows = table.rows.length;
     
    for ( var i = 0; i < rows; i++) {
        var cell = table.rows[i].insertCell(-1);
        var cols = table.rows[i].cells.length;
        if (cols > 10) {
            continue;
        }
        cell.innerHTML = (i + 1) + '-' + (cols - 1);
    }
}
 

function deleteColumn(id) {
    var table = document.getElementById(id);

    var rows = table.rows.length;

    for ( var i = 0; i < rows; i++) {
        var cols = table.rows[i].cells.length;
        if (cols < 2) {
            continue;
        }
        table.rows[i].deleteCell(-1);
    }
}

document.getElementById("add_route").onclick = function(){
    insertRow('route_table');
}

document.getElementById("add_reqheader").onclick = function(){
    insertRow('reqheader_table');
}

document.getElementById("add_resheader").onclick = function(){
    insertRow('resheader_table');
}

document.getElementById("csv_load").addEventListener('change', function(e) {
    var fileData = e.target.files[0];

    if(!fileData.name.match('.csv')) {
        alert('CSVファイルを選択してください');
        return;
    }

    var reader = new FileReader();
    reader.onload = function() {
        var cols = reader.result.split('\n');
        var data = [];
        for (var i = 0; i < cols.length; i++) {
            data[i] = cols[i].split(/[,\t]/);
        }
        for(var one_data of data){
            if(one_data){
                if(one_data.length >= 4){
                    insertRow('route_table', one_data[1], one_data[2] + ":" + one_data[3]);
                }
                else if(one_data.length >= 3){
                    insertRow('route_table', one_data[1], one_data[2]);
                }
                else if(one_data.length >= 2){
                    insertRow('route_table', one_data[0], one_data[1]);
                }
            }
        }
    }
    reader.readAsText(fileData);
});

table_init('route_table');


function edit_cancel(){
    location.href = "./";
}
document.getElementById("cancel_button").onclick = edit_cancel
document.getElementById("log_cancel_button").onclick = edit_cancel

function edit_save(){

    if(tool_edit_form_check()){
        let json_asocc = {};
        let resid_option = [];
        let recid_option = [];
        let reqheader_option = {};
        let resheader_option = {};

        json_asocc.tool_id = document.getElementsByName("tool_id")[0].value;
        json_asocc.tool_name = document.getElementsByName("tool_name")[0].value;
        if(document.getElementsByName("proxy_rule")[0].checked){
            json_asocc.route_mode = "single";
            json_asocc.route_url = urlCheck(document.getElementsByName("tool_url")[0].value);
            resid_option = document.getElementsByName("tool_single_optinon_resid")[0].value.split(",");
            recid_option = document.getElementsByName("tool_single_optinon_recid")[0].value.split(",");
        }
        else if(document.getElementsByName("proxy_rule")[1].checked){
            json_asocc.route_mode = "multi";
            json_asocc.route_list = {};
            for(var _route of document.getElementById("route_table").rows){
                try {
                    if(_route.cells[1].firstChild.value){
                        json_asocc.route_list[_route.cells[1].firstChild.value] = urlCheck(_route.cells[2].firstChild.value);
                    }
                }
                catch (e){}
            }
        }
        else if(document.getElementsByName("proxy_rule")[2].checked){
            json_asocc.route_mode = "role";
            json_asocc.route_list = {};
            json_asocc.route_list.teacher = urlCheck(document.getElementsByName("role_teacher_url")[0].value);
            json_asocc.route_list.student = urlCheck(document.getElementsByName("role_student_url")[0].value);
            resid_option = document.getElementsByName("tool_role_optinon_resid")[0].value.split(",");
            recid_option = document.getElementsByName("tool_role_optinon_recid")[0].value.split(",");
        }
        else if(document.getElementsByName("proxy_rule")[3].checked){
            json_asocc.route_mode = "dynamic";
            json_asocc.route_list = {};
            json_asocc.route_url = urlCheck(document.getElementsByName("dynamic_search_url")[0].value);
            resid_option = document.getElementsByName("tool_dynamic_optinon_resid")[0].value.split(",");
            recid_option = document.getElementsByName("tool_dynamic_optinon_recid")[0].value.split(",");
        }

        for(const _route of document.getElementById("reqheader_table").rows){
            try {
                if(_route.cells[1].firstChild.value){
                    reqheader_option[_route.cells[1].firstChild.value] = _route.cells[2].firstChild.value;
                }
            }
            catch (e){}
        }

        for(const _route of document.getElementById("resheader_table").rows){
            try {
                if(_route.cells[1].firstChild.value){
                    resheader_option[_route.cells[1].firstChild.value] = _route.cells[2].firstChild.value;
                }
            }
            catch (e){}
        }
        
        if(resid_option.length || recid_option.length || Object.keys(reqheader_option).length || Object.keys(resheader_option).length){
            json_asocc.option = {};
            if(resid_option.length){
                json_asocc.option.pathRewriteStudent = resid_option;
            }
            if(recid_option.length){
                json_asocc.option.pathRewriteClass = recid_option;
            }
            if(Object.keys(reqheader_option).length){
                json_asocc.option.reqheader = reqheader_option
            }
            if(Object.keys(resheader_option).length){
                json_asocc.option.resheader = resheader_option
            }
        }

        let logoption = {}
        logoption["launch"] = document.getElementById("launch_true").checked?true:false
        logoption["access"] = document.getElementById("access_true").checked?true:false
        logoption["tab"] = document.getElementById("tab_true").checked?true:false
        logoption["terminate"] = document.getElementById("terminate_true").checked?true:false
        logoption["key"] = document.getElementById("key_true").checked?true:false
        logoption["click"] = document.getElementById("click_true").checked?true:false
        logoption["scroll"] = document.getElementById("scroll_true").checked?true:false
        logoption["copy"] = document.getElementById("copy_true").checked?true:false
        logoption["cut"] = document.getElementById("cut_true").checked?true:false
        logoption["paste"] = document.getElementById("paste_true").checked?true:false

        json_asocc.option.collectionLog = {
            "default": logoption,
            "custom":{}
        }

        var json_text = JSON.stringify(json_asocc);
        console.log(json_text);
        
        //データを送信
        const xhr = new XMLHttpRequest;
        xhr.onload = function(){
            location.href = "./";
        };
        xhr.onerror = function(){
            alert("エラーが発生しました");
        }
        xhr.open('post', "./EditTool", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(json_text);
    }
}
document.getElementById("save_button").onclick = edit_save
document.getElementById("log_save_button").onclick = edit_save


document.getElementById("delete_button").onclick = function(){
    var result = window.confirm('本当に削除しますか');
    
    if( result ) {
        var json_asocc = {};
        json_asocc.tool_id = document.getElementsByName("tool_id")[0].value;

        var json_text = JSON.stringify(json_asocc);
        
        //データを送信
        const xhr = new XMLHttpRequest;
        xhr.onload = function(){
            location.href = "./";
        };
        xhr.onerror = function(){
            alert("エラーが発生しました");
        }
        xhr.open('post', "./DeleteTool", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(json_text);

    }

}

function tool_edit_form_check(){
    var checke_flag = true;

    if(document.getElementsByName("tool_name")[0].value.length){
        var reg = new RegExp(/[!"#$%&'()\*\+\.,\/:;<=>?@\[\\\]^`{|}~]/g);

        if (reg.test(document.getElementsByName("tool_name")[0].value)){
            checke_flag = false;
            document.getElementById("tool_name_error").textContent="使用できない文字が含まれています";
        }
        else{
            document.getElementById("tool_name_error").textContent="";
        }

    }
    else{
        checke_flag = false;
        document.getElementById("tool_name_error").textContent="ツール名を入力してください";
    }

    if(document.getElementsByName("proxy_rule")[0].checked){
        if(!urlCheck(document.getElementsByName("tool_url")[0].value)){
            checke_flag = true;
            document.getElementById("tool_url_error").textContent="正しいURLを入力してください";
        }
        else{
            document.getElementById("tool_url_error").textContent="";
        }
    }
    else{
        var reg_id = new RegExp(/[!"#$%&'()\*\+\.,\/:;<=>?@\[\\\]^`{|}~]/g);
        for(const _route of document.getElementById("route_table").rows){
            try {
                if(typeof _route.cells[1].firstChild.value === "undefined"){
                    continue
                }
                if(_route.cells[1].firstChild.value){
                    if(reg_id.test(_route.cells[1].firstChild.value)){
                        checke_flag = false;
                        document.getElementById("route_table_error").textContent="学籍番号に使用できない文字が含まれています";
                        break;
                    }
                    else{
                        if(!urlCheck(_route.cells[2].firstChild.value)){
                            checke_flag = false;
                            document.getElementById("route_table_error").textContent="正しいURLを入力してください";
                            break;
                        }
                        else{
                            document.getElementById("route_table_error").textContent="";
                        }
                    }
                }
                else{
                    checke_flag = false;
                    document.getElementById("route_table_error").textContent="学籍番号が入力されていません";
                    break;
                }
            }
            catch (e){}
        }
    }
    return checke_flag;
}

function urlCheck(url){
    try{
        const checkedUrl = new URL(url)
        return url
    }
    catch(e){
        return false
    }
}

function collectionLogInit(list){
    for(const logkey in list.default){
        if(list.default[logkey]){
            document.getElementById(logkey + "_true").checked = true
        }
    }
}

function getCollectionLog(){
    const params = (new URL(document.location)).searchParams
    const url_tool_id = params.get('id')
    const xhr = new XMLHttpRequest
    xhr.onload = function(){
        if(xhr.status == 200){
            collectionLogInit(JSON.parse(xhr.response))
        }
    }
    xhr.open('get', "./collectionLog?id=" + url_tool_id, true)
    xhr.send()
}

window.addEventListener('load', (event) => {
    getCollectionLog()
})


