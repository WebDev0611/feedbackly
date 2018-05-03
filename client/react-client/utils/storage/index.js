function localStorageTest(){
  try{
    localStorage.setItem("fbly-test", 1);
    var bool = (localStorage.getItem("fbly-test") === "1" || localStorage.getItem("fbly-test") === 1)
    return bool;
  } catch(e){
    console.log(e)
    return false
  }
}

window._memoryStoreData = {}
const memoryStorage = {
  setItem: function(key, value) {
    window._memoryStoreData[key] = value;
  },
  getItem: function(key){
    return window._memoryStoreData[key];
  }
}


 const dataStorage = typeof Storage === 'undefined' || Storage === null || !Storage || !localStorageTest()
  ? memoryStorage
  : localStorage;

export function set(key, value) {
  dataStorage.setItem(key, JSON.stringify(value));
}

export function get(key) {
  let data = dataStorage.getItem(key);

  return data === undefined
    ? data
    : JSON.parse(data);
}
