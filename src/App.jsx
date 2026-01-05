import { useState } from 'react'
import BackendManagement from './pages/BackendManagement'
import Login from './pages/Login'

import axios from 'axios'






function App(){

    // ====== api ======
    const url = 'https://ec-course-api.hexschool.io/v2'; // 請加入站點
    const path = 'glen-react-homework'; // 請加入個人 API Path

    // ====== 登入狀態 ======
    const [isLogIn, setIsLogIn] = useState(false)
    const [isCheckLogin, setIsCheckLogin] = useState("尚未確認");


    async function checkLogin() {
        try {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("GlenToken="))
            ?.split("=")[1];
          console.log(token);
          axios.defaults.headers.common.Authorization = token;
    
          const res = await axios.post(`${url}/api/user/check`);
          console.log(res);
          setIsCheckLogin("有登入過 (有token)");
        } catch (error) {
          console.error(error);
          setIsCheckLogin("沒有登入過");
        }
      }


    // ====== 實際回傳內容 ======
    return (
        <div className="page-container">
          <div className="layout-center">
              <h1>某電商後台管理系統</h1>

              {isLogIn ?(
                  <BackendManagement url={url} path={path}/>
              ):(
                  <Login url={url} path={path} setIsLogIn={setIsLogIn} />
              )}


              <div className="debug">
                  <button type="button" onClick={() => (setIsLogIn(!isLogIn))}>
                      {isLogIn ? "登出" : "跳過登入"}
                  </button>
                  <button type="button" onClick={() => (checkLogin())}>確認是否登入過</button>
                  <p>{isCheckLogin }</p>
              </div>

              <div className="ver">  Ver 0.3 </div>
            </div>
        </div>
    );
    
}





export default App
