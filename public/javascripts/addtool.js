var page_list = ["1","2","3","5"];
var now_page = 0;
var route_len = 0;

document.getElementById("back_button").onclick = function(){
    if(now_page != 0){
        document.getElementById('cate_' + page_list[now_page]).classList.remove("display_on");
        document.getElementById('cate_' + page_list[now_page-1]).classList.add("display_on");

        now_page -= 1;

        if(now_page < 2){
            document.getElementById('next_button').innerText = "次へ";
        }
    }
    else{
        location.href = "../";
    }
};

document.getElementById("next_button").onclick = function(){
    document.getElementById('cate_' + page_list[now_page]).classList.remove("display_on");
    document.getElementById('cate_' + page_list[now_page+1]).classList.add("display_on");

    now_page += 1;

    if(now_page == 2){
        document.getElementById('next_button').innerText = "作成";
    }
    else if(now_page == 3){
        document.getElementById('next_button').classList.add("display_off");
        document.getElementById('back_button').classList.add("display_off");

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
            var res = xhr.responseText;
            if (res.length>0) alert(res);
        };
        xhr.onerror = function(){
            alert("error!");
        }
        xhr.open('post', "./AddTool", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(json_text); 
    }
};

function page_list_change(){
    if(document.getElementById("single").checked){
        page_list[2] = "3";
    }
    else{
        page_list[2] = "4";
    }
}

function insertRow(id) {
    // テーブル取得
    var table = document.getElementById(id);
    // 行を行末に追加
    var row = table.insertRow(-1);
    // セルの挿入
    var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);
    // ボタン用 HTML
    var button = '<input type="button" class="del_tb_button" value="×" onclick="deleteRow(this)" />';
 
    // 行数取得
    var row_len = table.rows.length;
 
    // セルの内容入力
    cell1.innerHTML = button;
    cell2.innerHTML = '<input type="text" class="category_input_text" name="route_' + route_len + '_id" size="40">';
    cell3.innerHTML = '<input type="text" class="category_input_text" name="route_' + route_len + '_url" size="40">';

    route_len += 1;
}
 
/**
 * 行削除
 */
function deleteRow(obj) {
    // 削除ボタンを押下された行を取得
    tr = obj.parentNode.parentNode;
    // trのインデックスを取得して行を削除する
    tr.parentNode.deleteRow(tr.sectionRowIndex);
}
 
/**
 * 列追加
 */
function insertColumn(id) {
    // テーブル取得
    var table = document.getElementById(id);
    // 行数取得
    var rows = table.rows.length;
     
    // 各行末尾にセルを追加
    for ( var i = 0; i < rows; i++) {
        var cell = table.rows[i].insertCell(-1);
        var cols = table.rows[i].cells.length;
        if (cols > 10) {
            continue;
        }
        cell.innerHTML = (i + 1) + '-' + (cols - 1);
    }
}
 
/**
 * 列削除
 */
function deleteColumn(id) {
    // テーブル取得
    var table = document.getElementById(id);
    // 行数取得
    var rows = table.rows.length;
     
    // 各行末のセルを削除
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
