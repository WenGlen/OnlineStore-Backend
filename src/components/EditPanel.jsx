import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function EditPanel({ 
    editingProduct, 
    editingProductIsEnabled, setEditingProductIsEnabled,
    eventHandlereditingProduct, 
    mod, setMod,
    setFocus, 
    resetEditingProduct, 
    inputError, 
    uploading, 
    uploadProduct,
    url,
    path
}){
    // 上傳圖片用
    const [uploadingImage, setUploadingImage] = useState({});
    const [uploadError, setUploadError] = useState({});
    const fileInputRefs = useRef({});

    async function handleImageUpload(file, imageFieldName) {
        // 清除之前的錯誤訊息
        setUploadError(prev => ({ ...prev, [imageFieldName]: '' }));

        // 驗證類型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError(prev => ({ ...prev, [imageFieldName]: '圖片格式錯誤，僅支援 jpg、jpeg 與 png 格式' }));
            return;
        }

        // 驗證大小（3MB ）
        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
            setUploadError(prev => ({ ...prev, [imageFieldName]: '圖片大小超過 3MB，請選擇較小的圖片' }));
            return;
        }

        // 建立 FormData
        const formData = new FormData();
        formData.append('file-to-upload', file);

        // 設定上傳狀態
        setUploadingImage(prev => ({ ...prev, [imageFieldName]: true }));

        try {
            const res = await axios.post(`${url}/api/${path}/admin/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // 檢查響應中是否有圖片網址
            if (res.data && res.data.imageUrl) {
                // 更新對應的輸入欄位
                const syntheticEvent = {
                    target: {
                        name: imageFieldName,
                        value: res.data.imageUrl
                    }
                };
                eventHandlereditingProduct(syntheticEvent);
                // 清除錯誤訊息
                setUploadError(prev => ({ ...prev, [imageFieldName]: '' }));
            } else {
                setUploadError(prev => ({ ...prev, [imageFieldName]: '上傳失敗，請重試' }));
            }
        } catch (error) {
            console.error('圖片上傳錯誤:', error);
            setUploadError(prev => ({ ...prev, [imageFieldName]: '圖片上傳失敗，請檢查網路連線或稍後再試' }));
        } finally {
            setUploadingImage(prev => ({ ...prev, [imageFieldName]: false }));
        }
    }

    // 處理檔案選擇
    function handleFileSelect(e, imageFieldName) {
        const file = e.target.files[0];
        if (file) {
            // 清除之前的錯誤訊息
            setUploadError(prev => ({ ...prev, [imageFieldName]: '' }));
            handleImageUpload(file, imageFieldName);
        }
        // 重置 input，允許選擇相同檔案
        e.target.value = '';
    }

    // 觸發檔案選擇器
    function triggerFileInput(imageFieldName) {
        if (fileInputRefs.current[imageFieldName]) {
            fileInputRefs.current[imageFieldName].click();
        }
    }

    return (
    <div className={`panel ${mod=="add" ? "add" : mod=="update" ? "update" : ""}`}>
        <div className="focus-panel">
            {/*文字資訊*/}    
            <div className="edit-panel-content">
                {/*產品資訊*/}
                <div className="edit-product-form">
                    <div className="edit-product-item">
                        <label htmlFor="title">品名</label>
                        <input id="title" type="text" placeholder="請輸入產品名稱" name="title" 
                            value={editingProduct.title} onChange={(e) => eventHandlereditingProduct(e)} />
                    </div>
                    <div className="edit-product-item">
                        <label htmlFor="content">規格</label>
                        <input id="content" type="text" placeholder="請輸入內容" name="content" 
                            value={editingProduct.content} onChange={(e) => eventHandlereditingProduct(e)} />
                    </div>
                    <div className="edit-product-item">
                        <label htmlFor="description">描述</label>
                        <input id="description" type="text" placeholder="請輸入描述" name="description" 
                            value={editingProduct.description} onChange={(e) => eventHandlereditingProduct(e)} />
                    </div>
                </div>
                {/*其他資訊*/}
                <div className="edit-product-forms">
                    <div className="edit-product-form">

                        <div className="edit-product-item">   
                            <label htmlFor="is_enabled">是否<br/>啟用</label>
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
                            <label htmlFor="origin_price">原價</label>
                            <input id="origin_price" type="number" min="0" placeholder="請輸入原價" name="origin_price" 
                                value={editingProduct.origin_price || ""} onChange={(e) => eventHandlereditingProduct(e)} />
                        </div>
                        <div className="edit-product-item">
                            <label htmlFor="price">售價</label>
                            <input id="price" type="number" min="0" placeholder="請輸入售價" name="price" 
                                value={editingProduct.price || ""} onChange={(e) => eventHandlereditingProduct(e)} />
                        </div>
                    </div>
                    <div className="edit-product-form">

                        <div className="edit-product-item">
                            <label htmlFor="category">分類</label>
                            <input id="category" type="text" placeholder="請輸入分類" name="category" 
                                value={editingProduct.category} onChange={(e) => eventHandlereditingProduct(e)} />
                        </div>
                        <div className="edit-product-item">
                            <label htmlFor="stock">庫存</label>
                            <input id="stock" type="number" placeholder="請輸入庫存" name="stock" 
                                value={editingProduct.stock || ""} onChange={(e) => eventHandlereditingProduct(e)} />
                            <input id="unit" type="text" placeholder="單位" name="unit" className="unit-input"
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
                            <label htmlFor="imageUrl">主要圖片（必填）</label>
                            <input id="imageUrl" type="text" placeholder="主要圖片網址" name="imageUrl" 
                                value={editingProduct.imageUrl} onChange={(e) => eventHandlereditingProduct(e)} />
                            <input 
                                type="file" 
                                accept="image/jpeg,image/jpg,image/png" 
                                ref={el => fileInputRefs.current['imageUrl'] = el}
                                onChange={(e) => handleFileSelect(e, 'imageUrl')}
                                style={{ display: 'none' }}
                            />
                            <button 
                                type="button" 
                                className="light"
                                onClick={() => triggerFileInput('imageUrl')}
                                disabled={uploadingImage['imageUrl']}
                            >
                                上傳圖片
                            </button>
                            <div className="image-container">
                                {editingProduct.imageUrl && 
                                    <img src={editingProduct.imageUrl} alt={editingProduct.imageUrl}/>
                                }
                                {uploadingImage['imageUrl'] && (
                                    <p className="upload-status">上傳中...</p>
                                )}
                                {uploadError['imageUrl'] && (
                                    <p className="upload-error">{uploadError['imageUrl']}</p>
                                )}
                            </div>
                        </div>
                        {[1, 2, 3, 4, 5].map(num => {
                            const imageFieldName = `imageUrl${num}`;
                            return (
                                <div key={num} className="image-list-item">
                                    <label htmlFor={imageFieldName}>圖片{num}（可空白）</label>
                                    <input 
                                        id={imageFieldName}
                                        type="text" 
                                        placeholder={`圖片網址${num} (可空白)`} 
                                        name={imageFieldName} 
                                        value={editingProduct[imageFieldName] || ""} 
                                        onChange={(e) => eventHandlereditingProduct(e)} 
                                    />
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/jpg,image/png" 
                                        ref={el => fileInputRefs.current[imageFieldName] = el}
                                        onChange={(e) => handleFileSelect(e, imageFieldName)}
                                        style={{ display: 'none' }}
                                    />
                                    <button 
                                        type="button" 
                                        className="light"
                                        onClick={() => triggerFileInput(imageFieldName)}
                                        disabled={uploadingImage[imageFieldName]}
                                    >
                                        上傳圖片
                                    </button>
                                    <div className="image-container">
                                        {editingProduct[imageFieldName] && 
                                            <img src={editingProduct[imageFieldName]} alt={editingProduct[imageFieldName]}/>
                                        }
                                        {uploadingImage[imageFieldName] && (
                                            <p className="upload-status">上傳中...</p>
                                        )}
                                        {uploadError[imageFieldName] && (
                                            <p className="upload-error">{uploadError[imageFieldName]}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        
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

    </div>
    );
}