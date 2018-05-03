var engine = require('./vendor/storejs/src/store-engine')
var storages = [
	require('./vendor/storejs/storages/localStorage'),
	require('./vendor/storejs/storages/cookieStorage'),
  require('./vendor/storejs/storages/sessionStorage')
]
var plugins = [
	require('./vendor/storejs/plugins/defaults'),
	require('./vendor/storejs/plugins/expire')
]
var store = engine.createStore(storages, plugins)

export default store;
