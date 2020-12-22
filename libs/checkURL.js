function oo(url){
    let urlMeta = new URL(url);
    let hostname = urlMeta.hostname;
    if(hostname.includes('www')){
        hostname = hostname.replace('www.', '')
    } 
    
    let url_1 = 'https://www.'+ hostname + urlMeta.pathname;
    let url_2 = 'https://www.' + hostname + urlMeta.pathname + urlMeta.search;

    let url_3 = 'https://'+ hostname + urlMeta.pathname;
    let url_4 = 'https://' + hostname + urlMeta.pathname + urlMeta.search;

    let url_5 = 'http://www.'+ hostname + urlMeta.pathname;
    let url_6 = 'http://www.' + hostname + urlMeta.pathname + urlMeta.search;

    let url_7 = 'http://'+ hostname + urlMeta.pathname;
    let url_8 = 'http://' + hostname + urlMeta.pathname + urlMeta.search;

}

oo('https://stackoverflow.com/questions/32705219/nodejs-accessing-file-with-relative-path?h=3123&u=323x2');