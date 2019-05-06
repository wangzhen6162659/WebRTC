//socket地址设置
// const port = "https://192.168.1.124:443";
const port = "https://wzroom.cn";
const getUserByToken = "https://wzroom.cn/api/admin/user/getUserByToken"
const loginUrl = "https://wzroom.cn/user/login"
const version = '1.0.0'
function getPort(){
    return port;
}
function getUserApi(){
    return getUserByToken;
}