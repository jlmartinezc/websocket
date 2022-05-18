const { Console } = require('console');
const fs = require('fs');

class Products{
    constructor(filePath){
        this.filePath = filePath;
    }

    async getProducts(){
        try{   
            return (fs.existsSync(this.filePath))
                ? await fs.promises.readFile(this.filePath, 'utf-8')
                : {error: 'producto no encontrado'};
        }
        catch(err){
            return {'Error': err};
        }  
    }    

    async getProductsById(id){
        try{
            if(isNaN(id) || id == undefined) return {error: 'Ingrese un numero valido'};

            let fileContent = (fs.existsSync(this.filePath)) ? await this.getProducts() : '';

            if(fileContent.trim().length == 0) return {error: 'El archivo no existe o no tiene contenido'};

            fileContent = JSON.parse(fileContent);
            let product = fileContent.find(product => product.id == id);
            return (product) ? product : {error: 'Producto no encontrado'};            
        }
        catch(err){
            return {'Error': err};
        }
    }
    
    incrementProductsId(fileContent, product){
        let id = 1;

        if(fileContent.trim().length == 0) return fileContent = [{'id': id, ...product}];
        
        fileContent = JSON.parse(fileContent);
        id = Math.max(...fileContent.map(el => el.id)) + 1;
        fileContent.push({'id': id , ...product});      

        fileContent = {'id': id, 'content': fileContent}
        return fileContent;
    }

    async createProducts(product){
        try{        
            if(typeof product !== 'object' || product == null) return {error: 'Ingrese un objeto valido'};

            let fileContent = await this.getProducts();      
            fileContent = this.incrementProductsId(fileContent, product);                 

            await fs.promises.writeFile(this.filePath, JSON.stringify(fileContent.content, null, 2));
            return `Se guardado un nuevo producto con id: ${fileContent.id}`;
        }
        catch(err){
            return {'Error': err};
        }
    }

    async updateProductById(product, id){
        try{
            if(isNaN(id) || id == undefined) return {error: 'Ingrese un objeto valido'};

            let fileContent = (fs.existsSync(this.filePath)) ? await this.getProducts() : '';

            if(fileContent.trim().length == 0) return {error: 'El archivo no existe o no tiene contenido'};

            fileContent = JSON.parse(fileContent);

            id = parseInt(id);
            const index = fileContent.findIndex(x => x.id === id);

            fileContent[index].title = product.title;
            fileContent[index].price = product.price;
            fileContent[index].thumbnail = product.thumbnail;

            fileContent = JSON.stringify(fileContent, null, 2);
            await fs.promises.writeFile(this.filePath, fileContent);           
            return `Se actualizo el producto con id: ${id}`;
        }
        catch(err){
            return {'Error': err};
        }

    }

    async deleteProductById(id){
        try{        
            if(isNaN(id) || id == undefined) return {error: 'Ingrese un numero valido'};

            let productExist = false;
            let fileContent = (fs.existsSync(this.filePath)) ? await this.getProducts() : '';
                
            if(fileContent.trim().length == 0) return {error: 'El archivo no existe o no tiene contenido'};

            fileContent = JSON.parse(fileContent);

            fileContent = fileContent.filter(function (product){ 
                if(product.id == id) productExist = true;
                return product.id != id
            }); 

            if(productExist == false) return {error: `El registro con id: ${id} no fue encontrado o ya fue eliminado anteriormente`};
            
            fileContent = JSON.stringify(fileContent, null, 2);
            await fs.promises.writeFile(this.filePath, fileContent);
            return `Se elimino el registro con id: ${id}`;                    
        }
        catch(err){
            return {'Error': err};
        }
    }
}

module.exports = Products;
