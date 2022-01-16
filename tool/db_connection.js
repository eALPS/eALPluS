const mongoose = require('mongoose');

const db_config = require('../config/db_config.json');


const db_path = 'mongodb://' + db_config.mongo_url ;
mongoose.connect( db_path , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: db_config.user,
  pass: db_config.pass,
  dbName: db_config.db_name,
},
  (err) => {
    if(err) {
      return console.log(err);
    }
});
mongoose.Promise = Promise;

const template_class = new mongoose.Schema({class: 'String', tool_id: 'String', tool_name: 'String', route_mode: 'String', route_url: 'String', route_list: {}, option: {}});

exports.mongoose = mongoose
exports.connection = mongoose.connection;
exports.collection_class = mongoose.model('classes', template_class);