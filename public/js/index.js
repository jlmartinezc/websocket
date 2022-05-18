const socket = io.connect();

const products = document.getElementById('addProduct');
const chat = document.getElementById('messageCenter'); 

products.addEventListener('submit', addProduct);
chat.addEventListener('submit', addMessage);

socket.on('messages', (data) => renderMessages(data));
socket.on('products', (data) => renderProducts(data));

function addProduct(event){
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Array.from(formData.entries());
    let product = data.reduce((info, [key, value]) => ({...info, [key]: value,}), {});
    const isEmptyProduct = Object.values(product).some(element => element.trim() == '');

    if(isEmptyProduct){
        alert('Ingrese todos los campos del producto', 'bg-danger');
        return;
    }

    product = JSON.stringify(product);

    const url = '/api/productos';
    const headerConfig = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const request = new Request(url, {
	    method: 'POST',
	    body: product,
        mode: 'cors', 
        headers: headerConfig
    });

    fetch(request)
    .then(() => {  
        alert('Producto agregado', 'bg-success');
        socket.emit('newProduct');
    })

    document.getElementById('title').value = "";
    document.getElementById('price').value = "";
    document.getElementById('thumbnail').value = "";

    return;
}

function addMessage(event) {
    event.preventDefault();
    
    let author = document.getElementById('username').value;
    let text = document.getElementById('text').value.trim();
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

    if(!regex.test(author)){
        alert('Ingrese un email valido', 'bg-danger');
        return;
    }

    if((!text || text.length === 0 )){
        alert('Ingrese un mensaje', 'bg-danger');
        return;
    }

    const messages = {
        author: author,
        message: text,
    }

    socket.emit('newMessage', messages);

    document.getElementById('username').disabled = true;
    document.getElementById('text').value = "";
    document.getElementById('text').focus();

    return;
}

function renderMessages(data) {
    
    const chatMessages = data.map((message, index) => {
        return(`<div>
        <strong>${message.author}</strong>
        <span>[${message.date}] :</span>
        <span>${message.message}</span>
        </div>`);
    }).join(" ");

    document.getElementById("messages").innerHTML = chatMessages;
    let messageCenter = document.getElementById("messages");
    messageCenter.scrollTop = messageCenter.scrollHeight - messageCenter.clientHeight;

    return;
}

function renderProducts(data) {
    
    const allProduts = data.map((product, index) => {
        return(`
        <tr>
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>${product.price}</td>
            <td>
                <img src="${product.thumbnail}">
            </td>
        </tr>`);
    }).join(" ");

    document.getElementById('allProducts').innerHTML = allProduts;

    return;
}


function alert(menssage, type) {     
    let toast = `
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div class="toast align-items-center text-white ${type} border-0" data-bs-delay="2500" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${menssage}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>`;

    document.getElementById('popUpMessages').innerHTML = toast;

    let toastElList = [].slice.call(document.querySelectorAll('.toast'))
    let toastList = toastElList.map(function(toastEl) {
        return new bootstrap.Toast(toastEl)
    })
    toastList.forEach(toast => toast.show()) 
}