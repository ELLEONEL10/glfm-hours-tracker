export default function Toast({ toast }) {
  return (
    <div
      className={'toast' + (toast.visible ? ' show' : '') + (toast.type === 'ok' ? ' ok' : toast.type === 'err' ? ' err' : '')}
    >
      {toast.msg}
    </div>
  );
}
