import { createContext, useEffect, useState } from 'react';
import { Upload } from 'lucide-react';

// Create a context to manage the script loading state
const CloudinaryScriptContext = createContext();

function UploadWidget({ uwConfig, setPublicId, setState }) {
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded
    if (!loaded) {
      const uwScript = document.getElementById('uw');
      if (!uwScript) {
        // If not loaded, create and load the script
        const script = document.createElement('script');
        script.setAttribute('async', '');
        script.setAttribute('id', 'uw');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.addEventListener('load', () => setLoaded(true));
        script.addEventListener('error', () => {
          console.error('Failed to load Cloudinary upload widget');
          setLoaded(false);
        });
        document.body.appendChild(script);
      } else {
        // If already loaded, update the state
        setLoaded(true);
      }
    }
  }, [loaded]);

  const initializeCloudinaryWidget = () => {
    if (loaded && window.cloudinary) {
      setUploading(true);

      const myWidget = window.cloudinary.createUploadWidget(
        {
          ...uwConfig,
          // Enhanced configuration
          showPoweredBy: false,
          showAdvancedOptions: false,
          showSkipCropButton: false,
          showRemoveButton: true,
          theme: 'minimal',
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1',
            },
          },
          // Add success and error callbacks
          preBatch: (cb, data) => {
            console.log(
              'Starting upload batch with',
              data.files.length,
              'files'
            );
            cb(data);
          },
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            console.log('Upload successful:', result.info);

            // Add the new image URL to the state
            if (setState) {
              setState((prev) => {
                // Avoid duplicates
                if (!prev.includes(result.info.secure_url)) {
                  return [...prev, result.info.secure_url];
                }
                return prev;
              });
            }

            // If setPublicId is provided, use it (for single uploads)
            if (setPublicId) {
              setPublicId(result.info.public_id);
            }
          } else if (error) {
            console.error('Upload error:', error);
          }

          // Handle widget events
          if (result?.event === 'close') {
            setUploading(false);
            console.log('Upload widget closed');
          }

          if (result?.event === 'display-changed') {
            console.log('Widget display changed');
          }
        }
      );

      // Open the widget
      myWidget.open();
    } else {
      console.error('Cloudinary widget not loaded or not available');
      setUploading(false);
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      <button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed py-3 px-6 text-center text-sm font-medium rounded-lg uppercase w-full text-white transition-colors duration-200 flex items-center justify-center space-x-2"
        onClick={(e) => {
          e.preventDefault();
          if (!uploading && loaded) {
            initializeCloudinaryWidget();
          }
        }}
        disabled={uploading || !loaded}
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Opening Upload...</span>
          </>
        ) : !loaded ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <Upload size={16} />
            <span>Upload Images</span>
          </>
        )}
      </button>
    </CloudinaryScriptContext.Provider>
  );
}

export default UploadWidget;
export { CloudinaryScriptContext };
