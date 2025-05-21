import { getSignedUrl } from "../utils/getSignedUrl";
import { Link } from '@tanstack/react-router';

export function StartPage() {
  const handleView = async (key: string) => {
    try {
      const url = await getSignedUrl(key);
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      window.open(officeViewerUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const handleDownload = async (key: string) => {
    try {
      const url = await getSignedUrl(key);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <div className="main-container font-serif text-white">

      <div className="section-start-justify-start flex-col gap-3">
        <div className="section-start-justify-start flex-col gap-3">
          <span>Latest Installation Scope of Work</span>
          <div className="section-center-justify-start flex-row gap-3">
            <button className="logease-button" onClick={() => handleView('LogEase Installation Scope of Work.docx')}>
                View
            </button>
            <button className="logease-button" onClick={() => handleDownload('LogEase Installation Scope of Work.docx')}>
                Download
            </button>
          </div>
        </div>
        <div className="section-start-justify-start flex-col gap-3">
          <span>Latest Professional Service (7x24X4)</span>
          <div className="section-center-justify-start flex-row gap-3">
            <button className="logease-button" onClick={() => handleView('LogEase Professional Service (7x24X4).docx')}>
                View
            </button>
            <button className="logease-button" onClick={() => handleDownload('LogEase Professional Service (7x24X4).docx')}>
                Download
            </button>
          </div>
        </div>
        <p>&gt;_</p>
        <Link to="/calculator" className="logease-button">
          Machine Requirement Calculator
        </Link>
      </div>
    </div>
  )
}
