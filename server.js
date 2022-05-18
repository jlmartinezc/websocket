const Products = require('./class/products');
const Chat = require('./class/chat');
const express = require('express');
const { Server: HttpServer } = require('http');
const { Server: IOServer, Socket } = require('socket.io');

const app = express();
const { Router } = express;
const router = Router();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

const PORT = 8080;
const productFilePath = 'files/products.txt';
const chatFilePath = 'files/chats.txt';
const newProduct = new Products(productFilePath);
const newChat = new Chat(chatFilePath);

const getProducts = (async () => JSON.parse(await newProduct.getProducts()));
const getProductById = (async (req) => await newProduct.getProductsById(req.params.id));
const createProduct = (async (req) => await newProduct.createProducts(req.body));
const updateProduct = (async (req) => await newProduct.updateProductById(req.body, req.params.id));
const deleteProductById = (async (req) => await newProduct.deleteProductById(req.params.id));

const getChat = (async () => JSON.parse(await newChat.getChats()));
const createChat = (async (messages) => await newChat.createChat(messages));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/api/productos', async(req, res) => res.send( await getProducts() ));
app.get('/api/productos/:id', async(req, res) => res.send( await getProductById(req) ));
app.post('/api/productos', async(req, res) => res.send( await createProduct(req) ));
app.put('/api/productos/:id', async(req, res) => res.send( await updateProduct(req) ));
app.delete('/api/productos/:id', async(req, res) => res.send( await deleteProductById(req) ));
app.use('/api/productos', router);

app.get('/', async(req, res) =>{ res.render('pages/index')});

io.on('connection', async(socket) => {
    console.log('Un cliente se ha conectado!');
    
    socket.emit('messages', await getChat());
    socket.on('newMessage', async data => {
        await createChat(data);
        io.sockets.emit('messages', await getChat());
    });
    
    socket.emit('products', await getProducts());
    socket.on('newProduct', async () => io.sockets.emit('products', await getProducts())); 

});

httpServer.listen(PORT, () => console.log(`Server ON`));