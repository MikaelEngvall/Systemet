import React from 'react';
import { X } from 'lucide-react'; // Importing the X icon component from lucide-react for the close button

// Interface for the Modal component props, specifying the types for each prop
interface ModalProps {
  isOpen: boolean;        // Determines whether the modal is open or not
  onClose: () => void;    // Function to close the modal
  title: string;          // Title to display at the top of the modal
  children: React.ReactNode; // The content to display within the modal
}

// Modal component to render a popup/modal window
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // If the modal is not open, render nothing (return null)
  if (!isOpen) return null;

  return (
    // Fullscreen overlay div that positions the modal in the center of the screen
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Background overlay that closes the modal when clicked */}
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        {/* Modal content container */}
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          
          {/* Header section with title and close button */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}  {/* Title text displayed in the modal header */}
            </h3>
            
            {/* Close button with an X icon */}
            <button
              onClick={onClose} // Calls onClose to close the modal
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" /> {/* X icon to represent close */}
            </button>
          </div>
          
          {/* Body section to display the modal's children (main content) */}
          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children} {/* Render the passed-in children content here */}
          </div>
        </div>
      </div>
    </div>
  );
}
