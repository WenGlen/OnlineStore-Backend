/**
 * 通用的表單事件處理函數
 * 用於更新 state 物件的特定欄位
 * 
 * @param {Object} state - 當前的 state 物件
 * @param {Function} setState - 更新 state 的函數
 * @returns {Function} 事件處理函數
 * 
 * @example
 * const [user, setUser] = useState({ username: "", password: "" });
 * const eventHandler = createEventHandler(user, setUser);
 * <input name="username" onChange={eventHandler} />
 */
export function createEventHandler(state, setState) {
    return function(event) {
        const { value, name } = event.target;
        setState({
            ...state,
            [name]: value
        });
    };
}

