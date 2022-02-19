const platform = require('./platform')

async function reload(){
    const regResult = await platform.regPlatform()
    console.log(regResult)
    for(const p of regResult){
        //console.log(p)
    }
    return
}

async function main(){
    try{
        if(process.argv[2] == "reload"){
            await reload()
        }
        else{
            throw "command not found"
        }
    }
    catch(err){
        console.log(err)
    }
    process.exit(1)
}

main()