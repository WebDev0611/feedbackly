export function setup(email){
  console.log(email)
  if(process.env.NODE_ENV !== 'development'){
    window.Intercom('boot', {"app_id":"jhwla9h3", email})
  }
}