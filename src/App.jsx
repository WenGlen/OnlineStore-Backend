import { useState } from 'react'
import BackendManagement from './pages/BackendManagement'
import Login from './pages/Login'







function App(){

    // ====== api ======
    const url = 'https://ec-course-api.hexschool.io/v2'; // 請加入站點
    const path = 'glen-react-homework'; // 請加入個人 API Path

    // ====== 登入狀態 ======
    const [isLogIn, setIsLogIn] = useState(false)


    // ====== 實際回傳內容 ======
    return (
        <div className="page-container">
            <h1>某電商後台管理系統</h1>

            {isLogIn ?(
                <BackendManagement url={url} path={path}/>
            ):(
                <Login url={url} path={path} setIsLogIn={setIsLogIn} />
            )}

        </div>
    );
    
}





export default App
