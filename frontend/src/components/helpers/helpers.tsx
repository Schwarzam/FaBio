

async function post(url : any, formData : FormData) {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data
};


export { post };