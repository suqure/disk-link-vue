const BYTES_PER_CHUNK = 24000;
const fileReader = new FileReader();
const imageFormat = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp', '.psd', '.svg', '.tiff'];
const videoFormat = ['.avi', '.wmv', '.mpg', '.mpeg', '.mov', '.ram', '.swf', '.flv', '.mp4', '.avi', '.rmvb', '.mpg', '.mkv'];
const audioFormat = ['.mp3', '.wma', '.rm', '.wav', '.mid', '.ape', '.flac'];
const docFormat = ['.txt', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.csv', '.wps', '.chm'];
export default class FileService {
    readFileAsChunk(file, callback) {
        let totalChunk = file.size % BYTES_PER_CHUNK == 0 ? file.size / BYTES_PER_CHUNK : Math.ceil(file.size / BYTES_PER_CHUNK);
        let currentChunk = 0;
        fileReader.readAsArrayBuffer(file.slice(0, Math.min(file.size, BYTES_PER_CHUNK)));
        fileReader.onload = (event) => {
            callback({ name: file.name, size: file.size, total: totalChunk, current: currentChunk, chunk: this.arrayBufferToBase64(event.target.result) });
            currentChunk++;
            if (currentChunk < totalChunk) {
                let start = BYTES_PER_CHUNK * currentChunk;
                let end = Math.min(file.size, start + BYTES_PER_CHUNK);
                fileReader.readAsArrayBuffer(file.slice(start, end));
            }
        };
    }
    readFileByChunks(file, chunks, callback) {
        let totalChunk = file.size % BYTES_PER_CHUNK == 0 ? file.size / BYTES_PER_CHUNK : Math.ceil(file.size / BYTES_PER_CHUNK);
        let index = 0;
        let first = BYTES_PER_CHUNK * chunks[index];
        fileReader.readAsArrayBuffer(file.slice(first, Math.min(file.size, first)));
        fileReader.onload = (event) => {
            callback({ name: file.name, size: file.size, total: totalChunk, current: chunks[index], chunk: this.arrayBufferToBase64(event.target.result) });
            index++;
            if (index < chunks.lenght) {
                let start = BYTES_PER_CHUNK * chunks[index];
                let end = Math.min(file.size, start + BYTES_PER_CHUNK);
                fileReader.readAsArrayBuffer(file.slice(start, end));
            }
        };
    }
    calculateFileChunks(file,chunkSize){
        if(!chunkSize||chunkSize==0){
            chunkSize = BYTES_PER_CHUNK;
        }
        let totalChunk = file.size % chunkSize == 0 ? file.size / chunkSize : Math.ceil(file.size / chunkSize);
        return { total:totalChunk,size:chunkSize};
    }
    readFileFormat(name) {
        let result = 'file';
        let endFix = name.substring(name.lastIndexOf('.'));
        if (imageFormat.indexOf(endFix.toLowerCase()) > -1) {
            result = 'image';
        } else if (videoFormat.indexOf(endFix.toLowerCase()) > -1) {
            result = 'video';
        } else if (audioFormat.indexOf(endFix.toLowerCase()) > -1) {
            result = 'audio';
        } else if (docFormat.indexOf(endFix.toLowerCase()) > -1) {
            result = 'doc';
        }
        return result;
    }
    base64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
