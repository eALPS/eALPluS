function open_convert_config(id){
    var obj = document.getElementById(id);
    obj.getElementsByClassName("edit_config_rulu")[0].classList.toggle("open_edit_area");
}

function checkbox_label(obj){
    if(!obj.previousElementSibling.checked){
        obj.previousElementSibling.checked = true;
    }
    else{
        obj.previousElementSibling.checked = false;
    }
}

function radio_label(obj){
    if(!obj.previousElementSibling.checked){
        obj.previousElementSibling.checked = true;
    }
}