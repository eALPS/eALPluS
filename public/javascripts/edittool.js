var route_len = 0;


function page_list_change(){
    if(document.getElementById("single").checked){
        document.getElementById("single_mode").classList.add("display_on");
        document.getElementById("multi_mode").classList.remove("display_on");
    }
    else{
        document.getElementById("single_mode").classList.remove("display_on");
        document.getElementById("multi_mode").classList.add("display_on");
    }
}

function table_init(id){
    var table = document.getElementById(id);
    route_len = table.rows.length - 1;
}

function insertRow(id) {

    var table = document.getElementById(id);

    var row = table.insertRow(-1);

    var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);

    var button = '<input type="button" class="del_tb_button" value="×" onclick="deleteRow(this)" />';
 

    cell1.innerHTML = button;
    cell2.innerHTML = '<input type="text" class="category_input_text" name="route_' + route_len + '_id" size="40">';
    cell3.innerHTML = '<input type="text" class="category_input_text" name="route_' + route_len + '_url" size="40">';

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

table_init('route_table');


document.getElementById("cancel_button").onclick = function(){
    location.href = "./";
}

document.getElementById("save_button").onclick = function(){

    var json_asocc = {};

    json_asocc.tool_id = document.getElementsByName("tool_id")[0].value;
    json_asocc.tool_name = document.getElementsByName("tool_name")[0].value;
    if(document.getElementsByName("proxy_rule")[0].checked){
        json_asocc.route_mode = "single";
        json_asocc.route_url = document.getElementsByName("tool_url")[0].value;
    }
    else{
        json_asocc.route_mode = "multi";
        json_asocc.route_list = {};
        for(var _route = 0; _route < route_len; _route++){
            try {
                json_asocc.route_list[document.getElementsByName("route_" + _route + "_id")[0].value] = document.getElementsByName("route_" + _route + "_url")[0].value;
            }
            catch (e){}
        }
    }


    var json_text = JSON.stringify(json_asocc);
    
    //データを送信
    xhr = new XMLHttpRequest;
    xhr.onload = function(){
        
    };
    xhr.onerror = function(){
        alert("エラーが発生しました");
    }
    xhr.open('post', "./EditTool", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(json_text);
    
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

