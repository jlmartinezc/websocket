const { Console } = require('console');
const fs = require('fs');

class Chat{
    constructor(filePath){
        this.filePath = filePath;
    }

    async getChats(){
        try{   
            return (fs.existsSync(this.filePath))
                ? await fs.promises.readFile(this.filePath, 'utf-8')
                : {error: 'Chat no encontrado'};
        }
        catch(err){
            return {'Error': err};
        }  
    }  

    incrementChatId(fileContent, chat){
        let id = 1;

        if(fileContent.trim().length == 0) return fileContent = [{'id': id, ...chat}];
        
        fileContent = JSON.parse(fileContent);
        id = Math.max(...fileContent.map(el => el.id)) + 1;
        fileContent.push({'id': id , ...chat});      

        fileContent = {'id': id, 'content': fileContent}
        return fileContent;
    }

    getDateTime(){
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const getDate = [day, month, year].join('/');
        const getTime = [hours, minutes, seconds].join(':');

        const dateTime = `${getDate} ${getTime}`;

        return dateTime;
    }

    async createChat(chat){
        try{        
            if(typeof chat !== 'object' || chat == null) return {error: 'Ingrese un objeto valido'};
            
            let fileContent = await this.getChats();      
            
            fileContent = JSON.parse(fileContent);
            fileContent.push({'date': this.getDateTime(), ...chat});      

            await fs.promises.writeFile(this.filePath, JSON.stringify(fileContent, null, 2));
            return `Se guardado un nuevo chat`;
        }
        catch(err){
            return {'Error': err};
        }
    }
}

module.exports = Chat;
