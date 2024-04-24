

async function post(url : any, formData : FormData) {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data
};


function set_elements(first_name : any, last_name : any, email : any, something : any){
  localStorage.setItem('first_name', first_name);
  localStorage.setItem('last_name', last_name);
  localStorage.setItem('email', email);
  localStorage.setItem('something', something);
}

function get_elements(){
  let first_name = localStorage.getItem('first_name');
  let last_name = localStorage.getItem('last_name');
  let email = localStorage.getItem('email');
  let something = localStorage.getItem('something');
  return {first_name, last_name, email, something}
}

function clear_elements(){
  localStorage.removeItem('first_name');
  localStorage.removeItem('last_name');
  localStorage.removeItem('email');
  localStorage.removeItem('something');
}

export { post, set_elements, get_elements, clear_elements };