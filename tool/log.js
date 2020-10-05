const { exec } = require('child_process');

function logger(class_code,student_id,tool_id,msg){
    exec('logger -t eALPluS ' + class_code + '-' + student_id + ' ' + tool_id + ' ' + msg , (err, stdout, stderr) => {
        if (err) {
          console.log("log error");
        }
        else{
          console.log( class_code + '-' + student_id + ' ' + tool_id + ' ' + msg );
        }
      }
    )
}

exports.log = logger;