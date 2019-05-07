//socket地址设置
// const port = "https://192.168.1.124:443";
// const port = "https://192.168.1.124";
// const loginUrl = "https://192.168.1.124/boke/boke_webapp/#/user/login"
const port = "https://wzroom.cn";
const getUserByToken = "https://wzroom.cn/api/admin/user/getUserByToken"
const loginUrl = "https://wzroom.cn/boke/boke_webapp/#/user/login"
const version = '1.0.1'
function getPort(){
    return port;
}
function getUserApi(){
    return getUserByToken;
}