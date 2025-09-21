import { Show } from 'solid-js';

export default function Modal(props) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      props.onClose?.();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);" onClick={handleBackdropClick}>
        <div class={`modal-dialog modal-dialog-centered ${props.size === 'small' ? 'modal-sm' : props.size === 'large' ? 'modal-xl' : 'modal-lg'}`}>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{props.title}</h5>
              <button type="button" class="btn-close" onClick={props.onClose}></button>
            </div>
            
            <div class="modal-body">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
