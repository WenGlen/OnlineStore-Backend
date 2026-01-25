import { useState, useEffect } from 'react'
import BackendManagement from './pages/BackendManagement'
import Login from './pages/Login'

import axios from 'axios'






function App(){

    // ====== api ======
    const url = 'https://ec-course-api.hexschool.io/v2'; // 請加入站點
    const path = 'glen-react-homework'; // 請加入個人 API Path

    // ====== 登入狀態 ======
    const [isLogIn, setIsLogIn] = useState(false)


    async function checkLogin() {
        try {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("GlenToken="))
            ?.split("=")[1];
          //console.log(token);
          axios.defaults.headers.common.Authorization = token;
          if (!token) return;
    
          const res = await axios.post(`${url}/api/user/check`);
          //console.log(res);
          setIsLogIn(true);
        } catch (error) {
          //console.error(error);
          setIsLogIn(false);
        }
      }

    // 一進網站先檢查是否登入過
    useEffect(() => {
      if(!isLogIn) {
        checkLogin();
      }
    }, []);


    // ====== 實際回傳內容 ======
    return (
        <div className="page-container">
          <div className="layout-center">
              <h1>某電商後台管理系統</h1>

              {isLogIn ?(
                  <BackendManagement url={url} path={path} setIsLogIn={setIsLogIn}/>
              ):(
                  <Login url={url} path={path} setIsLogIn={setIsLogIn} />
              )}

              <div className="ver">  
                <p>開發用</p>
                <button type="button" className={isLogIn ? "" : "disabled"} onClick={() => (setIsLogIn(false))}>
                  登出                
                </button>
                <p>Ver 0.11</p>
              </div>
            </div>
        </div>
    );
    
}





export default App
