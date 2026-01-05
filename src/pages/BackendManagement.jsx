import React, { useState, useEffect } from 'react';
import axios from 'axios'

import ModButton from '../components/ModButton';



export default function BackendManagement({ url, path }){
    //API文件： https://hexschool.github.io/ec-courses-api-swaggerDoc
    //API申請平台：https://ec-course-api.hexschool.io/

    
    //====== 初始設定，宣告模式＆產品列表 ======

    const [mod, setMod]=useState("view");
    const [products, setProducts]=useState([])
    const [firstTimeLoading, setFirstTimeLoading]=useState(true);

    // 第一次渲染時執行 getProducts 和 setAuthToken
    useEffect(() => {
        setAuthToken();
        getProducts();
    }, []);

    // ====== 設置 auth token（保險用） ======
    function setAuthToken() {
        const token = document.cookie.replace(
            /(?:(?:^|.*;\s*)GlenToken\s*\=\s*([^;]*).*$)|^.*$/,"$1",
        );
        if (token) {
            axios.defaults.headers.common['Authorization'] = token;
        }
    }

    // ====== 取得產品列表 ======
    async function getProducts() {
        setMod("get");
        setFocus({});
        try {            
            const res = await axios.get (`${url}/api/${path}/admin/products/all`);
            if (res.data.products) {
                const  resProducts  = Object.values(res.data.products);
                resProducts.forEach(product => {
                    // 將 imagesUrl 陣列拆分成5個獨立欄位
                    const imagesArray = product.imagesUrl || [];
                    product.imageUrl1 = imagesArray[0] || "";
                    product.imageUrl2 = imagesArray[1] || "";
                    product.imageUrl3 = imagesArray[2] || "";
                    product.imageUrl4 = imagesArray[3] || "";
                    product.imageUrl5 = imagesArray[4] || "";
                });
                setProducts(resProducts);
                console.log(resProducts);
                setFirstTimeLoading(false);
            } else {
                console.log('API 回應中沒有 products 資料');
                setProducts([]);
            }
        } catch (error) {
            console.log(error);
            setProducts([]); 
        }
        setMod("view");
        resetEditingProduct();
    }
    
    // 當切換到新增模式時，重置表單
    useEffect(() => {
        if (mod === "add") {
            resetEditingProduct();
        }
    }, [mod]);
    

    //====== 查看功能用 ======
    const [focus, setFocus]=useState({});
    
    //====== 刪除功能 ======
    const [deleteTargetId, setDeleteTargetId]=useState("");
    const [deleteing, setDeleteing]=useState(false);

    function DeleteMod(id) {  
        setMod("delete");
        setDeleteTargetId(id);
    }

    async function deleteProduct(id) {
        setDeleteing(true);
        try {            
            const res = await axios.delete (`${url}/api/${path}/admin/product/${id}`);
            console.log(res.data.message);
            getProducts();
            setFocus({});
        } catch (error) {
            console.log(error);
            setMod("view");
        }
        setDeleteing(false);
    }


    //====== 編輯狀態用 ======
    const [editingProductIsEnabled, setEditingProductIsEnabled]=useState(1);
    const [editingProduct, setEditingProduct]=useState({});//一開始就會resetEditingProduct()，所以一開始空物件即可

    function resetEditingProduct() {
        setEditingProduct({
            title: "",
            category: "",
            origin_price: 0,
            price: 0,
            unit: 0,
            description: "",
            content: "",
            is_enabled: 1,
            imageUrl: "",
            imageUrl1: "",
            imageUrl2: "",
            imageUrl3: "",
            imageUrl4: "",
            imageUrl5: "",
            stock: 0,
        });
        setEditingProductIsEnabled(1);
        setInputError("");
    }

    function eventHandlereditingProduct(e) {
        const { value, name } = e.target;
        
        // 處理所有欄位
        setEditingProduct({
            ...editingProduct,
            [name]: name === "origin_price" || name === "price" || name === "stock" ? parseInt(value) || 0 : value
        });
    }

    //====== 編輯產品資訊用（還沒上傳） ======
    function editProduct(item) {
        setFocus({...item});
        setMod("update");
        
        // 將要編輯的產品資料載入到表單狀態（直接使用獨立欄位）
        setEditingProduct({
            title: item.title || "",
            category: item.category || "",
            origin_price: item.origin_price || 0,
            price: item.price || 0,
            stock: item.stock || 0,
            unit: item.unit || "個", // 單位預設為"個"
            description: item.description || "",
            content: item.content || "",
            is_enabled: item.is_enabled !== undefined ? item.is_enabled : 1,
            imageUrl: item.imageUrl || "",
            imageUrl1: item.imageUrl1 || "",
            imageUrl2: item.imageUrl2 || "",
            imageUrl3: item.imageUrl3 || "",
            imageUrl4: item.imageUrl4 || "",
            imageUrl5: item.imageUrl5 || "",
        });
        
        // 設定是否啟用狀態
        setEditingProductIsEnabled(item.is_enabled !== undefined ? item.is_enabled : 1);
        setInputError("");
    }

    //====== 新增/更新 產品用 ======
    const [uploading, setUploading]=useState(false)

    async function uploadProduct(mod) { // mod: "add" or "update"

        if(mod != "add" && mod != "update") {
            console.log("upload mod is not valid");
            return;
        }

        setUploading(true);
        setInputError("");

        const error = checkInputError();
        if(error !== "") {
            setUploading(false);
            setInputError(error);
            return;
        }

        const uploadItem = prepareProductData(editingProduct, editingProductIsEnabled);
        
        try {   
            console.log(`${mod}Item=`,uploadItem);
            let res;
            if(mod === "add") {
                res = await axios.post (`${url}/api/${path}/admin/product`, uploadItem)
            } else {
                res = await axios.put (`${url}/api/${path}/admin/product/${focus.id}`, uploadItem)
            }
                        
            console.log(res.data.message);
            getProducts();
        } catch (error) {
            console.log(error);
        }
        
        setUploading(false);

    }



    //====== 檢查功能 ======
    const [inputError, setInputError]=useState("");
    const errorType = {
        empty: "有漏填資訊，請完整填寫",
        notNumber: "原價、售價、庫存請填寫純數字",
        negative: "原價、售價、庫存當中有負數資訊",
        discontError: "原價不能小於售價",

    }

    function checkInputError() {
        // 可留白的欄位
        const excludeFields = ['origin_price', 'price', 'stock', 'imageUrl1', 'imageUrl2', 'imageUrl3', 'imageUrl4', 'imageUrl5'];

        for (const [key, value] of Object.entries(editingProduct)) {
            // 跳過不需要檢查的欄位
            if (excludeFields.includes(key)) {
                continue;
            }
            //逐一檢查是否有空白
            if (value === "") { 
                return errorType.empty;
            }
        }
        if( typeof editingProduct.origin_price !== "number" || typeof editingProduct.price !== "number" || typeof editingProduct.stock !== "number" ) {
            return errorType.notNumber;
        }

        if(editingProduct.origin_price < 0 || editingProduct.price < 0 || editingProduct.stock < 0) {
            return errorType.negative;
        }

        if(editingProduct.origin_price < editingProduct.price) {
            return errorType.discontError;
        }

        // 沒有錯誤時，清除錯誤訊息並返回空字串
        return ""

    }


    //====== 上傳前轉型 ======
    function prepareProductData(product, isEnabled) {
        
        const productCopy = { ...product }; // 複製產品資料以避免直接修改原始狀態

        //productCopy.unit = String(productCopy.unit);        // 因為把單位當庫存用，所以上傳時要改回字串
        productCopy.is_enabled = isEnabled; // 輸入欄位沒有直接改editingProduct的is_enabled，所以帶入狀態
        
        // 將5個獨立圖片欄位轉換成陣列，過濾掉空字串
        const imagesUrlArray = [
            productCopy.imageUrl1,
            productCopy.imageUrl2,
            productCopy.imageUrl3,
            productCopy.imageUrl4,
            productCopy.imageUrl5
        ].filter(url => url && url.trim() !== "");
        
        // 移除獨立欄位，只保留陣列格式
        const { imageUrl1, imageUrl2, imageUrl3, imageUrl4, imageUrl5, ...productData } = productCopy;
        
        return { data: { ...productData, imagesUrl: imagesUrlArray } };
    }

    



    //====== 實際回傳內容 ======
    return (
    <>
                

        {firstTimeLoading ? (
            <div className="flex-layout">
                <div className="panel login-panel first-time-loading">
                    <div className="loading-animation">
                    </div>
                    資料讀取中...
                </div>
            </div>
        ): (
            
            <div className="RWDlayout">
                <div className="debug hidden">
                    <p>mod: {mod}</p>
                    <button type="button" onClick={() => {setMod("view"); setDeleteTargetId(""); resetEditingProduct();}}>重置</button>
                </div>
                {/*產品列表*/}
                <div className="panel products-panel">
                    <div className="panel-frame products">
                    
                        <table>
                            <thead>
                                <tr className="tr">
                                    <th></th>
                                    <th className="th-title">產品名稱</th>
                                    <th>分類</th>
                                    <th>售價</th>
                                    <th>庫存</th>
                                    <th>上架</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                        <tr key={product.id} className={`tr ${product.is_enabled ? "" : "not-enabled"}`}>
                                            <td className="td"> {index + 1}</td>
                                            <td className="td td-title " > {product.title}</td>
                                            <td className="td td-category"> {product.category}</td>
                                            <td className="td td-price"> {product.price} <span className="unit">元</span></td>
                                            <td className="td td-number"> {product.stock} <span className="unit">{product.unit}</span></td>
                                            <td className="td td-boolean"> {product.is_enabled ? "✔" : "✖"}</td>
                                            <td className="td td-tools">
                                                <div className="tools-container">
                                                    <ModButton type="view" mod={mod} action={() => {setFocus(product);}} />
                                                    <ModButton 
                                                        type="delete" 
                                                        mod={mod} 
                                                        id={product.id} 
                                                        targetId={deleteTargetId} 
                                                        action={() => {DeleteMod(product.id);}} 
                                                        onCancel={() => {setMod("view");setDeleteTargetId("");}}
                                                        onConfirmDelete={(id) => {deleteProduct(id);}}
                                                        deleteing={deleteing}
                                                    />
                                                    <ModButton type="update" mod={mod} action={() => {editProduct(product);}} />
                                                </div>
                                            </td>
                                        </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="products-get-buttons">
                        <ModButton type="get" mod={mod} action={() => {getProducts();}} />
                        <ModButton type="add" mod={mod} action={() => {setMod("add");}} />
                    </div>
                </div>

                {/* 新增產品模式&詳細內容 */}
                <div className={`panel ${mod=="add" ? "add" : mod=="update" ? "update" : ""}`}>
                    {mod!="add" && mod!="update" ? ( 
                    <>
                        {/* 非新增時的詳細內容 */}
                        {!focus.id ? (
                            <div className="focus-panel no-focus">
                                <p> 點擊「操作」按鈕，可查看或編輯產品詳細資訊<br/>點擊「新增產品」按鈕，可新增產品</p>
                            </div>
                        ) : (
                            <div className="focus-panel">
                                <div className="focus-panel-content">
                                    <div className="description">
                                        <h3>{focus.title}</h3>
                                        <p className="muted"> {focus.content}</p>
                                        <p>{focus.description}</p>
                                    </div>

                                    <div className="infos">  
                                        <div className="info"> 
                                            <div className="flex-row-between py-xs">                                    
                                                <div> 原價：</div><div>{focus.origin_price} 元</div>
                                            </div>
                                            <div className="flex-row-between py-xs">                                    
                                                <div> 折扣：</div><div>{Math.round(focus.price/focus.origin_price * 100)} %</div>
                                            </div>
                                            <div className="flex-row-between py-xs">                                    
                                                <div> 售價：</div><div>{focus.price} 元</div>
                                            </div>

                                        </div> 
                                        <div className="info">
                                            <div className="flex-row-between py-xs">                                    
                                                <div> 是否啟用：</div><div>{focus.is_enabled ? "上架" : "隱藏"}</div>
                                            </div>
                                            <div className="flex-row-between py-xs">                                    
                                                <div> 分類：</div><div>{focus.category}</div>
                                            </div>
                                            <div className="flex-row-between py-xs">                                    
                                                <div> 庫存：</div><div>{focus.stock} {focus.unit}</div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* 圖片區域 */}
                                <div className="panel-frame focus">
                                    <div className="image-list-container">
                                        <div className="image-list-item">
                                            <p>主要圖片</p>
                                            <div className="image-container">
                                                {focus.imageUrl && 
                                                    <img src={focus.imageUrl} alt={focus.imageUrl}/>
                                                }
                                            </div>
                                        </div>
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <div key={num} className="image-list-item">
                                                <p>圖片 {num}</p>
                                                <div className="image-container">
                                                    {focus[`imageUrl${num}`] ? (
                                                        <img src={focus[`imageUrl${num}`]} alt={focus[`imageUrl${num}`]}/>
                                                    ):( 
                                                        <p>無</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                        )}
                    </>
                    ) : (
                    <>
                        <div className="focus-panel">
                            {/*文字資訊*/}    
                            <div className="edit-panel-content">
                                {/*產品資訊*/}
                                <div className="edit-product-form">
                                    <div className="edit-product-item">
                                        <label htmlFor="title">品名</label>
                                        <input type="text" placeholder="請輸入產品名稱" name="title" 
                                            value={editingProduct.title} onChange={(e) => eventHandlereditingProduct(e)} />
                                    </div>
                                    <div className="edit-product-item">
                                        <label htmlFor="content">規格</label>
                                        <input type="text" placeholder="請輸入內容" name="content" 
                                            value={editingProduct.content} onChange={(e) => eventHandlereditingProduct(e)} />
                                    </div>
                                    <div className="edit-product-item">
                                        <label htmlFor="description">描述</label>
                                        <input type="text" placeholder="請輸入描述" name="description" 
                                            value={editingProduct.description} onChange={(e) => eventHandlereditingProduct(e)} />
                                    </div>
                                </div>
                                {/*其他資訊*/}
                                <div className="flex-row-between gap-md align-end">
                                    <div className="edit-product-form">

                                        <div className="edit-product-item">
                                            <label htmlFor="origin_price">原價</label>
                                            <input type="number" placeholder="請輸入原價" name="origin_price" 
                                                value={editingProduct.origin_price || ""} onChange={(e) => eventHandlereditingProduct(e)} />
                                        </div>
                                        <div className="edit-product-item">
                                            <label htmlFor="price">售價</label>
                                            <input type="number" placeholder="請輸入售價" name="price" 
                                                value={editingProduct.price || ""} onChange={(e) => eventHandlereditingProduct(e)} />
                                        </div>
                                    </div>
                                    <div className="edit-product-form">
                                        <div className="edit-product-item">   
                                            <label htmlFor="is_enabled">是否啟用</label>
                                            <button type="button" className={`light ${editingProductIsEnabled === 1 ? "active" : ""}`} 
                                                    onClick={() => {setEditingProductIsEnabled(1);}}>
                                                上架
                                            </button>
                                            <button type="button" className={`light ${editingProductIsEnabled === 1 ? "" : "active"}`} 
                                                    onClick={() => {setEditingProductIsEnabled(0);}}>
                                                隱藏
                                            </button>
                                        </div>
                                        <div className="edit-product-item">
                                            <label htmlFor="category">分類</label>
                                            <input type="text" placeholder="請輸入分類" name="category" 
                                                value={editingProduct.category} onChange={(e) => eventHandlereditingProduct(e)} />
                                        </div>
                                        <div className="edit-product-item">
                                            <label htmlFor="stock">庫存</label>
                                            <input type="number" placeholder="請輸入庫存" name="stock" 
                                                value={editingProduct.stock || ""} onChange={(e) => eventHandlereditingProduct(e)} />
                                            <input type="text" placeholder="單位" name="unit" className="unit-input"
                                                value={editingProduct.unit || ""} onChange={(e) => eventHandlereditingProduct(e)} />
                                        </div>

                                    </div>
                                </div>

                            </div>

                            {/*圖片連結*/}
                            <div className={`panel-frame ${mod=="update" ? "update" : "add"}`}>
                                <div className="edit-product-form">
                                    <div className="image-list-container">
                                        <div className="image-list-item">
                                            <p>主要圖片（必填）</p>
                                            <input type="text" placeholder="主要圖片網址" name="imageUrl" 
                                                value={editingProduct.imageUrl} onChange={(e) => eventHandlereditingProduct(e)} />
                                            <div className="image-container">
                                                {editingProduct.imageUrl && 
                                                    <img src={editingProduct.imageUrl} alt={editingProduct.imageUrl}/>
                                                }
                                            </div>
                                        </div>
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <div key={num} className="image-list-item">
                                                <p>圖片{num}（可空白）</p>
                                                <input 
                                                    type="text" 
                                                    placeholder={`圖片網址${num} (可空白)`} 
                                                    name={`imageUrl${num}`} 
                                                    value={editingProduct[`imageUrl${num}`] || ""} 
                                                    onChange={(e) => eventHandlereditingProduct(e)} 
                                                />
                                                <div className="image-container">
                                                    {editingProduct[`imageUrl${num}`] && 
                                                        <img src={editingProduct[`imageUrl${num}`]} alt={editingProduct[`imageUrl${num}`]}/>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                        
                                    </div>
                                </div>
                            </div>

                            <div className="panel-edit-buttons">
                                <p className="error text-right">{inputError || "\u00A0"}</p>
                                <div className="flex-row-between">
                                    <button type="button" className={`light ${uploading ? "disabled" : ""}`}
                                            onClick={() => {resetEditingProduct(); setMod("view"); setFocus({});}}>
                                        {mod === "update" ? "取消編輯（產品不會儲存）" : "取消新增（產品不會儲存）"}
                                    </button>

                                    <button type="button" className={`${uploading ? "disabled" : ""}`}
                                            onClick={() => (uploadProduct(mod))}>
                                        {uploading 
                                            ? (mod === "update" ? "更新產品中..." : "加入新產品中...") 
                                            : (mod === "update" ? "更新產品" : "加入新產品")}
                                    </button>

                                </div>
                            </div>

                        </div>

                    </>

                    )}
                </div>
                
            </div>  
        )}
    </>
    );
    
}

