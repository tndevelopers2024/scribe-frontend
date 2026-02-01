import React from 'react';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, isApproved }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in border border-gray-100">
                <div className={`p-6 border-b border-gray-50 flex items-center gap-3 ${isApproved ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className={`p-2 rounded-lg ${isApproved ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                        {isApproved ? <FaExclamationTriangle className="text-xl" /> : <FaTrash />}
                    </div>
                    <h3 className={`font-bold text-lg ${isApproved ? 'text-red-800' : 'text-gray-800'}`}>
                        Confirm Deletion
                    </h3>
                </div>

                <div className="p-6 space-y-4">
                    {isApproved ? (
                        <div className="space-y-3">
                            <p className="text-gray-700 font-medium">
                                This item has been <span className="text-green-600 font-bold uppercase">Approved</span>.
                            </p>
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                <p className="text-red-800 text-sm leading-relaxed">
                                    <span className="font-bold">Warning:</span> Deleting this approved item will <span className="font-bold underline">reduce your total points by 1</span>.
                                </p>
                            </div>
                            <p className="text-gray-600 text-sm italic">
                                Are you sure you want to proceed with deleting "{itemName}"?
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-600">
                            Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
                        </p>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onConfirm}
                            className={`flex-1 text-white px-4 py-3 rounded-xl transition font-bold shadow-sm ${isApproved
                                ? 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
                                : 'bg-gray-800 hover:bg-black active:scale-[0.98]'
                                }`}
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition font-bold border border-gray-200 active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
