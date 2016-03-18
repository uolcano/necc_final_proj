var CompatUtil = {
    innerText: function (elem, flag, text) {
        var bool = (typeof elem.textContent === 'string');
        switch (flag) {
            case 'get':
                return bool ? elem.textContent : elem.innerText;
                break;
            case 'set':
                bool ? (elem.textContent = text) : (elem.innerText = text);
                break;
            default:
                throw new Error('Error: wrong flag, only accept "get" and "set".');
                break;
        }
    },

    createCORSRequest: function (method, url){
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr){
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined"){
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            xhr = null;
        }
        return xhr;
    }
}