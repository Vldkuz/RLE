const rle_escape={
    ESCAPE_SYMBOL: "#",

    encode_escape(str){
        let [symbol,compressedstr]=[ "" , "" ];
        let [counter,i]=[1,0];

        while (i!=str.length) {
            if (str[i]==str[i+1]) counter++ , symbol=str[i];

            else if (i==str.length-1) {
                compressedstr+=this._Work_Counter(counter,symbol,str,i);
                counter=1;
            }

            else {
                compressedstr+=this._Work_Counter(counter,symbol,str,i);
                counter=1;
            }
            i++;
        }    
        return compressedstr;
    },

    decode_escape(str){
        let [i,prevstr]=[0,""];

        while(i!=str.length){
            if (str[i]=='#' && i<str.length-2) {
                prevstr+=str[i+2].repeat(str.charCodeAt(i+1)) , i+=3; 
            }
            else {
                prevstr+=str[i] , i++;
            }
        }

        return prevstr;
    },

    _Work_Counter(counter,symbol,str,i){
        let res = "";

        if (counter>255) {
            res+=this._codeEscape(255,symbol).repeat(counter/255);

            if (counter%255!=0) res+=this._codeEscape(counter%255,symbol);
        }    

        else if (counter>3 && counter<=255) {
            res+=this._codeEscape(counter,symbol);
        }

        else 
        {
            if (str[i]==this.ESCAPE_SYMBOL)
            {
                res+=this._codeEscape(counter,this.ESCAPE_SYMBOL);
            }
            else
            {
                res+=str[i].repeat(counter);
            }
        }

        return res;
    },

    _codeEscape(counter,symbol){
        return this.ESCAPE_SYMBOL+String.fromCharCode(counter)+symbol;
    },

}


const rle_jump = {
    encode_jump(str){
        let count = 1, compressedstr = "", temp = "";//0-127 повторяющиеся символы

        for(let i = 0; i < str.length; i++){
            if(str[i] == str[i + 1] && count < 127) count++;
            
            else if(count < 3)
            {
                if(temp.length >= 127)// неповт символы
                {
                    compressedstr += this._codeJump(temp.substring(0, 127), 128);
                    temp = temp.substring(127);
                }
                temp += str.substr(i - count + 1, count); count = 1;
            }
            else if(count >= 3)
            {
                if(temp.length != 0)
                {
                    compressedstr += this._codeJump(temp, 128); temp = "";
                }
                compressedstr += this._codeJump(str[i - 1], count - 1); count = 1;
            }
        }
        return temp ? compressedstr + this._codeJump(temp, 128) : compressedstr;
    },

    decode_jump(code){
        let [compressedstr, i] = ["", 0];

        while(i != code.length){
            if(code[i].charCodeAt(0) < 128){ // повт
                compressedstr += code[i + 1].repeat(code[i].charCodeAt(0)); i += 2;
            }
            else {
                let offset = code[i].charCodeAt(0) - 128 + 1;// неповт
                compressedstr += code.substring(i + 1, i + offset); i += offset;
            }
        }
        return compressedstr;
    },

    _codeJump(temp, offset) { return String.fromCharCode(temp.length + offset) + temp},
}


let mode=process.argv[2];
let method=process.argv[3];

const FILE=require('fs');

let IN=process.argv[4];
let OT=process.argv[5];


if (method.startsWith('es'))
{
    const rle_type=rle_escape;
    if (mode.startsWith('en')){   
        if (FILE.existsSync(IN) && FILE.existsSync(OT))
        {
            decision=rle_type.encode_escape(FILE.readFileSync(IN,"utf-8"));
            FILE.writeFileSync(OT,decision);
        }
        else console.log('Oшибка в названии файла/файлов');
    }
    else
    {
        if (FILE.existsSync(IN) && FILE.existsSync(OT))
        {
            decision=rle_type.decode_escape(FILE.readFileSync(IN,"utf-8"));
            FILE.writeFileSync(OT,decision);
        }
        else console.log('Oшибка в названии файла/файлов');
    }
}
else if(method.startsWith('ju'))
{
    const rle_type=rle_jump;
    if (mode.startsWith('en'))
    {
        if (FILE.existsSync(IN) && FILE.existsSync(OT)) 
        {
            output=rle_type.encode_jump(FILE.readFileSync(IN,"utf-8"));
            FILE.writeFileSync(OT,output);
        }
        else console.log("Ошибка в названии файла/файлов"); 
    }
    else
    {
        if (FILE.existsSync(IN) && FILE.existsSync(OT)) 
        {
            output=rle_type.decode_jump(FILE.readFileSync(IN,"utf-8"));
            FILE.writeFileSync(OT,output);
        }
        else console.log('Ошибка в названии файла/файлов');
    }
}
else
{
    console.log("Ошибка в названии метода");
}