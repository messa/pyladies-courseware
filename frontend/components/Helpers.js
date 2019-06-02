import _ from 'lodash'

const holdAnchor = _.debounce(function () {
  if (location.hash) {
    var requested_hash = location.hash.slice(1);
    location.hash = '';
    location.hash = requested_hash;
  }
  console.log(location.hash)
}, 250, { trailing: true})

export default holdAnchor
