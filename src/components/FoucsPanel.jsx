export default function FoucsPanel({ focus, setFocus }){

    return (
        <div className="panel">  
            {/* 非新增時的詳細內容 */}
            {!focus.id ? (
                <div className="focus-panel no-focus">
                    <p> 點擊「操作」按鈕，可查看或編輯產品詳細資訊<br/>點擊「新增產品」按鈕，可新增產品</p>
                </div>
            ) : (
                <div className="focus-panel x-overflow">
                    <div className="focus-panel-content">
                        <div className="description">
                            <h3>{focus.title}</h3>
                            <p className="muted"> {focus.content}</p>
                            <p>{focus.description}</p>
                        </div>

                        <div className="infos">  
                            <div className="info"> 
                                <div className="flex-row-between py-xs">                                    
                                    <div> 是否啟用：</div><div>{focus.is_enabled ? "上架" : "隱藏"}</div>
                                </div>
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
                                    <div> 分類：</div><div>{focus.category}</div>
                                </div>
                                <div className="flex-row-between py-xs">                                    
                                    <div> 已售數量：</div><div>{focus.soldQuantity || 0} {focus.unit}</div>
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

                    <button type="button" className="button" onClick={() => {setFocus({});}}>關閉</button>

                </div>

            )}
        </div>
    );
}