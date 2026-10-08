import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({children}) {

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {

    const id = ++toastId;

    setToasts((prev) => [...prev, {id, message, type}]);

    setTimeout(() => {

      setToasts((prev) => prev.filter((t) => t.id !== id));

    },duration);
  },[]);

  const removeToast = useCallback((id) => {

    setToasts((prev) => prev.filter((t) => t.id !== id));

  },[]);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);

  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);

  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{success, error, info}}>{children}

      <div className="containerNotificacao">
        {toasts.map((t) => (
          <div key={t.id} className={`notificacao notificacao${t.type.charAt(0).toUpperCase()+t.type.slice(1)}`}>
            <span className="conteudoNotificacao">
              {t.type === 'success' && <CheckCircle size={16}/>}
              {t.type === 'error' && <XCircle size={16}/>}
              {t.type === 'info' && <Info size={16}/>}
              {t.message}
            </span>

            <button className="fecharNotificacao iconeCentralizado" onClick={() => removeToast(t.id)}>
              <X size={14} />
            </button>

          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {

  const context = useContext(ToastContext);

  if(!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }

  return context;
}
