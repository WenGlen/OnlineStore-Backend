
import viewIcon from '../../img/view.png';
import updateIcon from '../../img/update.png';
import deleteIcon from '../../img/delete.png';

export default function ModButton({ 
    type, 
    mod, 
    action,
    id, 
    targetId, 
    onCancel, 
    onConfirmDelete, 
    deleteing

}) {


    const typeText = {
        view: "查看",
        update: "修改",
        delete: "刪除",
        add: "新增產品",
        get: "重新取得產品列表",
    }

    const typeImage = {
        view: viewIcon,
        update: updateIcon,
        delete: deleteIcon,
    }

    function buttonContent(){
        if ( type=="get" && mod=="get") {
            return "產品列表更新時中...";
        } else if ( type=="get" &&( mod=="add" || mod=="update" || mod=="delete" )) {
            return "目前無法更新產品列表";
        } else if ( type=="add" && mod=="add") {
            return "新增產品中...";
        } else if (typeImage[type]) {
            return <img src={typeImage[type]} alt={typeText[type]} />;
        } else {
            return typeText[type];
        }
    }


    return (
        <div className="relative">

            <button type="button" 
                className={`light ${ mod=="view" ? "" : "disabled"}`} 
                onClick={() => { mod=="view" ? action() : null;}}>
                {buttonContent()}       
            </button>

            {type === "delete" && mod==="delete" && id==targetId && (
                <div className="absolute-container">
                    <button type="button" className={`${deleteing ? "disabled" : ""}`} onClick={onCancel}>返回</button>
                    <button type="button" className={`warning ${deleteing ? "disabled" : ""}`} onClick={() => onConfirmDelete(id)}>
                        {deleteing ? "刪除中..." : "確認刪除"}
                    </button>
                </div>
            )}


        </div>
    )
}

