import type {
  UseModalReturnType,
  ModalMethods,
  ModalProps,
  ReturnMethods,
  UseModalInnerReturnType,
} from './types';
import { ref, onUnmounted, unref, getCurrentInstance, reactive, computed } from 'vue';
import { isProdMode } from '/@/utils/env';
const dataTransferRef = reactive<any>({});

/**
 * @description: Applicable to independent modal and call outside
 */
export function useModal(): UseModalReturnType {
  if (!getCurrentInstance()) {
    throw new Error('Please put useModal function in the setup function!');
  }
  const modalRef = ref<Nullable<ModalMethods>>(null);
  const loadedRef = ref<Nullable<boolean>>(false);
  const uidRef = ref<string>('');
  function register(modalMethod: ModalMethods, uuid: string) {
    uidRef.value = uuid;

    isProdMode() &&
      onUnmounted(() => {
        modalRef.value = null;
        loadedRef.value = false;
        dataTransferRef[unref(uidRef)] = null;
      });
    if (unref(loadedRef) && isProdMode() && modalMethod === unref(modalRef)) return;

    modalRef.value = modalMethod;
  }
  const getInstance = () => {
    const instance = unref(modalRef);
    if (!instance) {
      throw new Error('instance is undefined!');
    }
    return instance;
  };

  const methods: ReturnMethods = {
    setModalProps: (props: Partial<ModalProps>): void => {
      getInstance().setModalProps(props);
    },

    openModal: (visible = true): void => {
      getInstance().setModalProps({
        visible: visible,
      });
    },

    transferModalData(val: any) {
      dataTransferRef[unref(uidRef)] = val;
    },
  };
  return [register, methods];
}

export const useModalInner = (): UseModalInnerReturnType => {
  const modalInstanceRef = ref<ModalMethods | null>(null);
  const currentInstall = getCurrentInstance();
  const uidRef = ref<string>('');

  if (!currentInstall) {
    throw new Error('instance is undefined!');
  }

  const getInstance = () => {
    const instance = unref(modalInstanceRef);
    if (!instance) {
      throw new Error('instance is undefined!');
    }
    return instance;
  };

  const register = (modalInstance: ModalMethods, uuid: string) => {
    uidRef.value = uuid;
    modalInstanceRef.value = modalInstance;
    currentInstall.emit('register', modalInstance);
  };

  return [
    register,
    {
      receiveModalDataRef: computed(() => {
        return dataTransferRef[unref(uidRef)];
      }),

      changeLoading: (loading = true) => {
        getInstance().setModalProps({ loading });
      },

      changeOkLoading: (loading = true) => {
        getInstance().setModalProps({ confirmLoading: loading });
      },

      closeModal: () => {
        getInstance().setModalProps({ visible: false });
      },

      setModalProps: (props: Partial<ModalProps>) => {
        getInstance().setModalProps(props);
      },
    },
  ];
};
