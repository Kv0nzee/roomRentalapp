import { create } from 'zustand';

interface useUserDetailModalStore{
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}


const useUserDetailModal = create<useUserDetailModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false})
}));

export default useUserDetailModal;