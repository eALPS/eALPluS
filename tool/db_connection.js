const mongoose = require('mongoose');

mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://mongo/eALPluS-LTI', {
  useNewUrlParser: true,
},
  (err) => {
    if(err) {
      return console.log(err);
    }
});
mongoose.Promise = Promise;

const template_class = new mongoose.Schema({class: 'String', tool_id: 'String', tool_name: 'String', route_mode: 'String', route_url: 'String', route_list: {}});


exports.connection = mongoose.connection;
exports.collection_class = mongoose.model('classes', template_class);