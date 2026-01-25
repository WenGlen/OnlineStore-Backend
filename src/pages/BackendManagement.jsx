import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'


import ModButton from '../components/elements/ModButton';
import FoucsPanel from '../components/FoucsPanel';
import EditPanel from '../components/EditPanel';
import ProductsList from '../components/ProductsList';



export default function BackendManagement({ url, path, setIsLogIn }){
    //API文件： https://hexschool.github.io/ec-courses-api-swaggerDoc
    //API申請平台：https://ec-course-api.hexschool.io/

    
    //====== 初始設定，宣告模式＆產品列表 ======

    const [mod, setMod]=useState("view");``
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
        }else{
            setIsLogIn(false);
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
                // 對產品進行排序：先按分類排序，再按標題排序
                const sortedProducts = sortProductsByCategoryAndTitle(resProducts);
                setProducts(sortedProducts);
                //console.log(sortedProducts);
                setFirstTimeLoading(false);
            } else {
                //console.log('API 回應中沒有 products 資料');
                setProducts([]);
            }
        } catch (error) {
            //console.log(error);
            setProducts([]); 
        }
        setMod("view");
        resetEditingProduct();
    }

    // 排序功能：先抓所有分類 categories 做排序，然後每個類別裡用title 做中文字筆畫排序
    function sortProductsByCategoryAndTitle(products) {
        // 先複製陣列避免直接修改原始資料
        const sortedProducts = [...products];
        
        // 先按分類（category）排序，使用中文排序
        sortedProducts.sort((a, b) => {
            const categoryA = a.category || '';
            const categoryB = b.category || '';
            
            // 先比較分類
            const categoryCompare = categoryA.localeCompare(categoryB, 'zh-CN', { 
                numeric: true,
                sensitivity: 'base'
            });
            
            // 如果分類相同，則按標題（title）排序
            if (categoryCompare === 0) {
                const titleA = a.title || '';
                const titleB = b.title || '';
                return titleA.localeCompare(titleB, 'zh-CN', { 
                    numeric: true,
                    sensitivity: 'base'
                });
            }
            
            return categoryCompare;
        });
        
        return sortedProducts;
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
    const [deleteTargetId, setDeleteTargetId] = useState("");
    const [deleting, setDeleting] = useState(false);

    function DeleteMod(id) {
        setMod("delete");
        setDeleteTargetId(id);
    }

    async function deleteProduct(id) {
        setDeleting(true);
        try {            
            const res = await axios.delete (`${url}/api/${path}/admin/product/${id}`);
            //console.log(res.data.message);
            getProducts();
            setFocus({});
            setMod("view");
            setDeleteTargetId("");
        } catch (error) {
            //console.log(error);
            setMod("view");
        } finally {
            setDeleting(false);
        }
    }

    function handleCancelDelete() {
        setMod("view");
        setDeleteTargetId("");
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
            soldQuantity: 0,
        });
        setEditingProductIsEnabled(1);
        setInputError("");
    }

    function eventHandlereditingProduct(e) {
        const { value, name } = e.target;
        
        // 處理所有欄位
        setEditingProduct({
            ...editingProduct,
            [name]: name === "origin_price" || name === "price" || name === "stock" || name === "soldQuantity" ? parseInt(value) || 0 : value
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
            soldQuantity: item.soldQuantity || 0,
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
            //console.log("upload mod is not valid");
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
            //console.log(`${mod}Item=`,uploadItem);
            let res;
            if(mod === "add") {
                res = await axios.post (`${url}/api/${path}/admin/product`, uploadItem)
            } else {
                res = await axios.put (`${url}/api/${path}/admin/product/${focus.id}`, uploadItem)
            }
                        
            //console.log(res.data.message);
            getProducts();
        } catch (error) {
            //console.log(error);
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
        const excludeFields = ['origin_price', 'price', 'stock', 'soldQuantity', 'imageUrl1', 'imageUrl2', 'imageUrl3', 'imageUrl4', 'imageUrl5'];

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
        if( typeof editingProduct.origin_price !== "number" || typeof editingProduct.price !== "number" || typeof editingProduct.stock !== "number" || typeof editingProduct.soldQuantity !== "number" ) {
            return errorType.notNumber;
        }

        if(editingProduct.origin_price < 0 || editingProduct.price < 0 || editingProduct.stock < 0 || editingProduct.soldQuantity < 0) {
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

    //======  RWD變彈窗，偵測用 ======
    const [WindowWidth, setWindowWidth]=useState(window.innerWidth);

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth);
            //console.log(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


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
                    <button type="button" onClick={() => {setMod("view"); resetEditingProduct();}}>重置</button>
                </div>
                {/*產品列表*/}
                <div className="panel products-panel">
                    <ProductsList
                        products={products}
                        mod={mod}
                        setFocus={setFocus}
                        deleteTargetId={deleteTargetId}
                        onDeleteMod={DeleteMod}
                        onCancelDelete={handleCancelDelete}
                        onConfirmDelete={deleteProduct}
                        deleting={deleting}
                        editProduct={editProduct}
                    />
                    <div className="products-get-buttons">
                        <ModButton type="get" mod={mod} action={() => {getProducts();}} />
                        <ModButton type="add" mod={mod} action={() => {setMod("add");}} />
                    </div>
                </div>

                {/* 新增產品模式&詳細內容 */}
                <div className={`RWD-overlay ${(mod=="view" && !focus.id && WindowWidth < 1080)  ?  "hidden" : ""}`}>
                    <div className="RWD-container">
                        <div className="RWD-content">
                        {mod!="add" && mod!="update" ? ( 
                            <FoucsPanel focus={focus} setFocus={setFocus} />
                        ) : (
                            <EditPanel editingProduct={editingProduct} 
                                        editingProductIsEnabled={editingProductIsEnabled} setEditingProductIsEnabled={setEditingProductIsEnabled}
                                        eventHandlereditingProduct={eventHandlereditingProduct} 
                                        mod={mod} setMod={setMod} 
                                        setFocus={setFocus} 
                                        uploading={uploading} 
                                        resetEditingProduct={resetEditingProduct} 
                                        inputError={inputError} 
                                        uploadProduct={uploadProduct}
                                        url={url}
                                        path={path} />
                        )}
                        </div>
                    </div>
                </div>
                
            </div>  
        )}
    </>
    );
    
}

