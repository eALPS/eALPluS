const mongodb = require('./db_connection')

const Database = require('../node_modules/lti-node-library/Provider/mongoDB/Database')
const { platformSchema, registerPlatform } = require('../node_modules/lti-node-library/Provider/register_platform')

const lti_config = require('../config/lti_config.json')

async function regPlatform(){
    let regResult = []
    for(const platform of lti_config.platform){
        if(platform.name && platform.key && platform.url){
            try{
                const result = await registerPlatform(
                    platform.url,
                    platform.name,
                    platform.key,
                    platform.url + '/mod/lti/auth.php',
                    platform.url + '/mod/lti/token.php',
                    lti_config.my_domain + '/lti/submit',
                    { method: 'JWK_SET', key: platform.url + '/mod/lti/certs.php' }
                )
                result.kid.privateKey = "hidden"
                regResult.push(result)
            }
            catch(err){
                console.error(err)
            }
        }
    }
    return regResult
}

exports.regPlatform = regPlatform