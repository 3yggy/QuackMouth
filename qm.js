window.onload = function(){

    var fileInput = document.getElementById('fileInput');

    var results = document.getElementById('results');

    fileInput.onchange = Upload;
}   

function Upload(){
    for(let file of this.files){
        if(file){

            let bits = file.name.split('.');
            let type = bits.pop().toLowerCase(); 
            let hatName = bits.join();

            if(type == 'hat'){
                
                let reader = new FileReader();
                reader.onload = function(e) {
                    
                    let bytesBuffer = this.result;
                    let bytes = new Uint8Array(bytesBuffer);
                    let len = 16;
                    let IV = bytes.subarray(4,4+len);            
                    let good = bytes.subarray(len+4);
                    let clear = (new aesjs.ModeOfOperation.cbc(key,IV)).decrypt(good);
                    let name_length = new Uint32Array(clear.subarray(8,9))[0];
                    let indx =  name_length+9+4;
                    clear = clear.subarray(indx);
                    let b64 = "data:image/png;base64,"+btoa(String.fromCharCode(...clear));

                    AppendMan(file, b64,hatName+'.png');
                }
                reader.readAsArrayBuffer(file);

            }
            else if(file.type.startsWith('image')){
                let reader = new FileReader();

                reader.onload = function(e) {

                    let team =Array.from( new Uint8Array(this.result));
                    let IV = GodLikesEliphant;
                    let enc = [];
                    enc = enc.concat([225,50,133,154,95,61,2,0]);
                    let name = bytesFromString(hatName);

                    enc = enc.concat([name.length])
                        .concat(name)
                        .concat(bytesFromInt32(team.length))
                        .concat(team);

                    let padder = 16-(enc.length%16);
                    let padding = new Array(padder);
                    padding.fill(padder);
                    enc = enc.concat(padding);

                    let muddy = bytesFromInt32(IV.length)
                        .concat(IV)
                        .concat(Array.from((new aesjs.ModeOfOperation.cbc(key, IV)).encrypt(enc)));

                    reader.onload = function(){
                        AppendMan(new File([new Uint8Array(muddy)],hatName+'.hat', {type: "application/pdf"}), this.result, file.name);
                    }
                    reader.readAsDataURL(file);
                }
                reader.readAsArrayBuffer(file);
            }
        }
    }
    this.value =null;
}

function AppendMan(hat, img, imgName){ //file obj : data URI

    let Man = document.createElement('div');
    Man.className = 'ImgHatPair';

    let ImgDisplay = document.createElement('img');
    ImgDisplay.src = img;
        
    let HatFile = document.createElement('a');
    HatFile.href = URL.createObjectURL(hat);
    HatFile.text = hat.name;
    HatFile.download = hat.name;
    HatFile.className='DownLoadURI';

    let ImgFile = document.createElement('a');
    ImgFile.href = img;
    ImgFile.text = imgName;
    ImgFile.download = imgName;
    ImgFile.className='DownLoadURI';

    let Close = document.createElement('button');
    Close.innerText = 'x';
    Close.onclick = function(){
        Man.remove();
    }
    Close.className = 'Close';

    let Downloads = document.createElement('div');
    Downloads.className = 'Downloads'

    results.appendChild(Man);
    Man.appendChild(document.createElement('hr'));
    Man.appendChild(Close);
    
    Man.appendChild(ImgDisplay);
    Man.appendChild(Downloads);
    Downloads.appendChild(HatFile);
    Downloads.appendChild(ImgFile);

}

function Clear(){
    results.innerHTML = '';
}

function intFromBytes(bytes){
    var result;
    for (var i = 0; i < bytes.length; i++) {
        result = (result << 8) | bytes[i];
    }
    return result;
}

function bytesFromString(string){
    var result = [];
    for (var i = 0; i < string.length; i++){  
        result.push(string.charCodeAt(i));
    }
    return result;
}

function bytesFromInt32(int32){
    var bytes = [];
    var i = 4;
    do {
    bytes[--i] = int32 & (255);
        int32 = int32>>8;
    } while ( i )
    return bytes.reverse();
}

const GodLikesEliphant = bytesFromString('GodLikesEliphant');

const key = [    
    243,
    22,
    152,
    32,
    1,
    244,
    122,
    111,
    97,
    42,
    13,
    2,
    19,
    15,
    45,
    230
];