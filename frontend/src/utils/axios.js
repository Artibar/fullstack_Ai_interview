
import axios from "axios"
const axiosInstance = axios.create({
    baseURL : import.meta.env.MODE ==="development"? "http://localhost:3000": "",
    headers: {
        "Content-Type": "application/json",
        
        Accept: "application/json",
    }
})
axiosInstance.interceptors.request.use((config)=>{
    const accessToken = localStorage.getItem("token")
    console.log("axios interceptor - token raw:", accessToken);

    if( accessToken ){
        config.headers = config.headers || {}
        config.headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("axios interceptor- setting Authprization header");
    } else{
        console.log("axios interceptor - no token, not setting Authorization header");
    }
    return config
}, (error)=> Promise.reject(error))

axiosInstance.interceptors.response.use(
    (response)=>{
    return response;
    }, 
    (error)=>{
        if(error.response){
            if(error.response.status === 401){
                window.location.href="/";
            } else if(error.response.status === 500){
                console.error("Server error. please try again later.", error);
                
                
            } else if(error.code === 'ENCONNABORTED'){
                console.error("Request time out please try again later", error);
                
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance;
