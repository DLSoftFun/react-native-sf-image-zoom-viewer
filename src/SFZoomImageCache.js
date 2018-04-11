import md5 from "react-native-md5";
export default class SFZoomImageCache{

    static cache = {};
    static insertImage = (key,value) => {
        key = md5.hex_md5(key);
        SFZoomImageCache.cache[key] = value;
    }
    static getImage = (key) => {
        key = md5.hex_md5(key);
        if (SFZoomImageCache.cache.hasOwnProperty(key)){
            return SFZoomImageCache.cache[key];
        }else{
            return null;
        }

    }

}

