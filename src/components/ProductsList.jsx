import React, { useState, useEffect, useRef, useCallback } from 'react';
import ModButton from './elements/ModButton';

// 常量
const CONTAINER_PADDING = 24;
const DEBOUNCE_DELAY = 150;
const INITIAL_CALCULATION_DELAY = 300;

export default function ProductsList({
    products,
    mod,
    setFocus,
    deleteTargetId,
    onDeleteMod,
    onCancelDelete,
    onConfirmDelete,
    deleting,
    editProduct
}) {
    // 分頁狀態
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    

    // Refs
    const tableContainerRef = useRef(null);
    const tableRef = useRef(null);
    const rowHeightRef = useRef(null); // 存儲行高
    const resizeTimeoutRef = useRef(null); // 防抖用的 timeout ID

    // 計算分頁數據
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

    // 計算一頁最多可以容納幾筆
    const calculateMaxItemsPerPage = useCallback(() => {
        if (!tableContainerRef.current || !tableRef.current) return;
        
        const container = tableContainerRef.current;
        const table = tableRef.current;
        const containerHeight = container.clientHeight;
        
        if (containerHeight === 0) return;
        
        const theadHeight = table.querySelector('thead')?.offsetHeight || 0;
        const availableHeight = containerHeight - theadHeight - CONTAINER_PADDING;
        
        if (availableHeight <= 0) return;
        
        // 獲取行高
        let rowHeight = rowHeightRef.current;
        
        if (!rowHeight || rowHeight <= 0) {
            const rows = table.querySelectorAll('tbody tr');
            if (rows.length === 0) return;
            
            // 使用第一行的實際高度
            rowHeight = rows[0].offsetHeight;
            if (rowHeight <= 0) return;
            
            rowHeightRef.current = rowHeight;
        }
        
        // 計算可以顯示的行數（至少顯示1行）
        const calculatedItems = Math.max(1, Math.floor(availableHeight / rowHeight));
        
        if (calculatedItems !== itemsPerPage) {
            setItemsPerPage(calculatedItems);
        }
    }, [itemsPerPage]);

    // 計算每頁顯示數量（根據表格容器高度）
    useEffect(() => {
        if (products.length === 0) return;
        
        // 防抖計算函數
        const debouncedCalculate = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(() => {
                calculateMaxItemsPerPage();
            }, DEBOUNCE_DELAY);
        };
        
        // 初始計算
        const initialTimeoutId = setTimeout(() => {
            calculateMaxItemsPerPage();
        }, INITIAL_CALCULATION_DELAY);

        // 監聽容器大小變化
        const resizeObserver = new ResizeObserver(debouncedCalculate);
        if (tableContainerRef.current) {
            resizeObserver.observe(tableContainerRef.current);
        }

        // 監聽窗口大小變化
        window.addEventListener('resize', debouncedCalculate);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', debouncedCalculate);
            clearTimeout(initialTimeoutId);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [products.length, calculateMaxItemsPerPage]);

    // 當產品列表變化時，重置到第一頁並檢查頁碼範圍
    useEffect(() => {
        setCurrentPage(1);
    }, [products.length]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    // 分頁控制函數
    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const goToPreviousPage = useCallback(() => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    }, [totalPages]);

    return (
        <>
            <div className="panel-frame products" ref={tableContainerRef}>
                <table ref={tableRef}>
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
                        {currentProducts.map((product, index) => {
                            const globalIndex = startIndex + index;
                            return (
                                <tr key={product.id} className={`tr ${product.is_enabled ? "" : "not-enabled"}`}>
                                    <td className="td"> {globalIndex + 1}</td>
                                    <td className="td td-title" title={product.title}> {product.title}</td>
                                    <td className="td td-category"> {product.category}</td>
                                    <td className="td td-price"> {product.price} <span className="unit">元</span></td>
                                    <td className="td td-number"> {product.stock} <span className="unit">{product.unit}</span></td>
                                    <td className="td td-boolean"> {product.is_enabled ? "✔" : "✖"}</td>
                                    <td className="td td-tools">
                                        <div className="tools-container">
                                            <ModButton type="view" mod={mod} action={() => setFocus(product)} />
                                            <ModButton 
                                                type="delete" 
                                                mod={mod} 
                                                id={product.id} 
                                                targetId={deleteTargetId} 
                                                action={() => onDeleteMod(product.id)} 
                                                onCancel={onCancelDelete}
                                                onConfirmDelete={onConfirmDelete}
                                                deleteing={deleting}
                                            />
                                            <ModButton type="update" mod={mod} action={() => editProduct(product)} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* 分頁器 */}
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button 
                        className="pagination-btn" 
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                    >
                        ◄ 
                    </button>
                    <div className="pagination-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => goToPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button 
                        className="pagination-btn" 
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                    >
                        ►
                    </button>
                </div>
            )}
        </>
    );
}
