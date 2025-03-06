import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { SlClose } from "react-icons/sl";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

function PDFModal({
  isOpen,
  onClose,
  pdfUrl,
  filename,
}: {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = ""; // Restore scrolling
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 100 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="relative w-11/12 h-5/6 max-w-5xl bg-white rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">{filename}</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <SlClose size={24} />
              </button>
            </div>
            <div className="h-full overflow-hidden">
              <object
                data={pdfUrl}
                type="application/pdf"
                // title={filename}
                width="100%"
                height="100%"
              >
                <p>
                  It appears you don't have a PDF plugin for this browser. No
                  biggie... you can{" "}
                  <a href={pdfUrl} download>
                    click here to download the PDF file.
                  </a>
                </p>
              </object>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PDFModal;