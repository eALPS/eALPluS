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
    }
    else if(document.getElementById("multi").checked){
        document.getElementById("single_mode").classList.remove("display_on");
        document.getElementById("role_mode").classList.remove("display_on");
        document.getElementById("multi_mode").classList.add("display_on");
    }
    else if(document.getElementById("role").checked){
        document.getElementById("single_mode").classList.remove("display_on");
        document.getElementById("multi_mode").classList.remove("display_on");
        document.getElementById("role_mode").classList.add("display_on");
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

document.getElementById("add_tb").onclick = function(){
    insertRow('route_table');
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


document.getElementById("cancel_button").onclick = function(){
    location.href = "./";
}

document.getElementById("save_button").onclick = function(){

    if(tool_edit_form_check()){
        var json_asocc = {};
        var resid_option = [];
        var recid_option = [];

        json_asocc.tool_id = document.getElementsByName("tool_id")[0].value;
        json_asocc.tool_name = document.getElementsByName("tool_name")[0].value;
        if(document.getElementsByName("proxy_rule")[0].checked){
            json_asocc.route_mode = "single";
            json_asocc.route_url = document.getElementsByName("tool_url")[0].value;
            resid_option = document.getElementsByName("tool_single_optinon_resid")[0].value.split(",");
            recid_option = document.getElementsByName("tool_single_optinon_recid")[0].value.split(",");
        }
        else if(document.getElementsByName("proxy_rule")[1].checked){
            json_asocc.route_mode = "multi";
            json_asocc.route_list = {};
            for(var _route = 0; _route < route_len; _route++){
                try {
                    json_asocc.route_list[document.getElementsByName("route_" + _route + "_id")[0].value] = document.getElementsByName("route_" + _route + "_url")[0].value;
                }
                catch (e){}
            }
        }
        else if(document.getElementsByName("proxy_rule")[2].checked){
            json_asocc.route_mode = "role";
            json_asocc.route_list = {};
            json_asocc.route_list.teacher = document.getElementsByName("role_teacher_url")[0].value;
            json_asocc.route_list.student = document.getElementsByName("role_student_url")[0].value;
            resid_option = document.getElementsByName("tool_role_optinon_resid")[0].value.split(",");
            recid_option = document.getElementsByName("tool_role_optinon_recid")[0].value.split(",");
        }

        if(resid_option.length || recid_option.length){
            json_asocc.option = {};
            if(resid_option.length){
                json_asocc.option.pathRewriteStudent = resid_option;
            }
            if(recid_option.length){
                json_asocc.option.pathRewriteClass = recid_option;
            }
        }


        var json_text = JSON.stringify(json_asocc);
        
        //データを送信
        xhr = new XMLHttpRequest;
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

document.getElementById("delete_button").onclick = function(){
    var result = window.confirm('本当に削除しますか');
    
    if( result ) {
        var json_asocc = {};
        json_asocc.tool_id = document.getElementsByName("tool_id")[0].value;

        var json_text = JSON.stringify(json_asocc);
        
        //データを送信
        xhr = new XMLHttpRequest;
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
        var reg = new RegExp('^(https?:\\/\\/)'+'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+'((\\d{1,3}\\.){3}\\d{1,3}))'+'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+'(\\?[;&a-z\\d%_.~+=-]*)?'+'(\\#[-a-z\\d_]*)?$','i');
        if(!reg.test(document.getElementsByName("tool_url")[0].value)){
            checke_flag = false;
            document.getElementById("tool_url_error").textContent="正しいURLを入力してください";
        }
        else{
            document.getElementById("tool_url_error").textContent="";
        }
    }
    else{
        var reg_id = new RegExp(/[!"#$%&'()\*\+\.,\/:;<=>?@\[\\\]^`{|}~]/g);
        var reg_url = new RegExp('^(https?:\\/\\/)'+'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+'((\\d{1,3}\\.){3}\\d{1,3}))'+'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+'(\\?[;&a-z\\d%_.~+=-]*)?'+'(\\#[-a-z\\d_]*)?$','i');
        for(var _route = 0; _route < route_len; _route++){
            try {
                if(document.getElementsByName("route_" + _route + "_id")[0].value){
                    if(reg_id.test(document.getElementsByName("route_" + _route + "_id")[0].value)){
                        checke_flag = false;
                        document.getElementById("route_table_error").textContent="学籍番号に使用できない文字が含まれています";
                        break;
                    }
                    else{
                        if(!reg_url.test(document.getElementsByName("route_" + _route + "_url")[0].value)){
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

