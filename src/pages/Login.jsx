import { useState } from 'react'
import axios from 'axios'

export default function Login({ url, path, setIsLogIn }) {
  
    // ====== 登入 ======
    const [user, setUser] = useState({
        username: "",
        password: ""
    })
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    async function login() {
        //console.log(user);
        setLoading(true);
        try {
            const res = await axios.post(`${url}/admin/signin`, user);
            const { token, expired } = res.data;
            //存cookie
            document.cookie = `GlenToken=${token};expires=${new Date(expired)};`
            //設定axios headers
            axios.defaults.headers.common['Authorization'] = token;
            //通知父組件登入成功
            setIsLogIn(true);

        } catch (error) {
            console.log(error);
            setFailed(true);
        }
        setLoading(false);
    }

    function eventHandlerUser(e) {
        const { value, name } = e.target;
        setUser({
            ...user,
            [name]: value
        });
    }
    
    return (
        <div className="panel login-panel">
            <div className="flex-col">
                <div className="input-group">  
                    <label htmlFor="email">信箱</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="username" 
                        onChange={(e) => eventHandlerUser(e)} 
                        placeholder="請輸入 Email"
                    /> 
                </div>
                <div className="input-group">
                    <label htmlFor="password">密碼</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"  
                        onChange={(e) => eventHandlerUser(e)} 
                        placeholder="請輸入 密碼"
                    />
                </div>
                <p className="error">{failed ? "登入失敗，請檢查帳號密碼" : "\u00A0" }</p>
                <button type="button" id="login" className={loading ? "disabled" : ""} onClick={() => login()}>
                    {loading ? "登入中..." : "登入"}
                </button>

            </div>

        </div>

    );
}

