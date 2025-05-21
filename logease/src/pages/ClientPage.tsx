import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchServer } from "../utils/fetchServer";
import { getSignedUrl } from "../utils/getSignedUrl";
import { downloadFile } from "../utils/downloadFile";
import { uploadFile } from "../utils/uploadFile";

interface Client {
  id: number;
  name: string;
}

interface FileStatus {
  installation: boolean;
  service: boolean;
}

export function ClientPage() {
  const { clientId } = useParams({ from: "/client/$clientId" });
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileStatus, setFileStatus] = useState<FileStatus>({ installation: false, service: false });

  useEffect(() => {
    const fetchClient = async () => {
      const response = await fetchServer<Client>(`/get_client/${clientId}`);
      if (response.error) {
        setError(response.error);
        console.error('Error fetching client:', response.error);
      } else if (response.data) {
        setClient(response.data);
      }
    };

    fetchClient();
  }, [clientId]);

  useEffect(() => {
    const checkFiles = async () => {
      if (!client) return;

      try {
        const installationKey = `clients/LogEase Installation Scope of Work For ${client.name}.docx`;
        const serviceKey = `clients/LogEase Professional Service (7x24X4) For ${client.name}.docx`;

        const [installationResponse, serviceResponse] = await Promise.all([
          fetchServer<{ exists: boolean }>('/documents/check', {
            method: 'POST',
            body: { bucket: 'logease', key: installationKey }
          }),
          fetchServer<{ exists: boolean }>('/documents/check', {
            method: 'POST',
            body: { bucket: 'logease', key: serviceKey }
          })
        ]);

        setFileStatus({
          installation: installationResponse.data?.exists ?? false,
          service: serviceResponse.data?.exists ?? false
        });
      } catch (error) {
        console.error('Error checking files:', error);
      }
    };

    checkFiles();
  }, [client]);

  const handleView = async (docType: 'installation' | 'service') => {
    if (!client) return;
    try {
      const key = docType === 'installation' 
        ? `clients/LogEase Installation Scope of Work For ${client.name}.docx`
        : `clients/LogEase Professional Service (7x24X4) For ${client.name}.docx`;
      const url = await getSignedUrl(key);
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      window.open(officeViewerUrl, "_blank");
    } catch (error) {
      console.error("Error viewing document:", error);
      setError("Failed to view document");
    }
  };

  const handleDownload = async (docType: 'installation' | 'service') => {
    if (!client) return;
    try {
      const key = docType === 'installation' 
        ? `clients/LogEase Installation Scope of Work For ${client.name}.docx`
        : `clients/LogEase Professional Service (7x24X4) For ${client.name}.docx`;
      await downloadFile(key);
    } catch (error) {
      console.error("Error downloading document:", error);
      setError("Failed to download document");
    }
  };

  const handleReplace = async (docType: 'installation' | 'service') => {
    if (!client) return;
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".docx,.doc";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const allowedTypes = [
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
          setError("Please select a .docx file");
          return;
        }

        try {
          const key = docType === 'installation' 
            ? `clients/LogEase Installation Scope of Work For ${client.name}.docx`
            : `clients/LogEase Professional Service (7x24X4) For ${client.name}.docx`;
          await uploadFile(file, key);
          setError(null);
          alert("File replaced successfully!");
          
          // Update file status after successful upload
          setFileStatus(prev => ({
            ...prev,
            [docType]: true
          }));
        } catch (error) {
          console.error("Error replacing file:", error);
          setError("Failed to replace file. Please try again.");
        }
      };

      input.click();
    } catch (error) {
      console.error("Error in replace handler:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="main-container font-serif text-white">
      <div className="section-start-justify-start flex-col gap-3">
        <span>Latest Installation Scope of Work</span>
        <div className="section-center-justify-start flex-row gap-3">
          {fileStatus.installation ? (
            <>
              <button className="logease-button" onClick={() => handleView('installation')}>
                View
              </button>
              <button className="logease-button" onClick={() => handleDownload('installation')}>
                Download
              </button>
            </>
          ) : (
            <p className="text-gray-400">No file available</p>
          )}
          <button className="logease-button" onClick={() => handleReplace('installation')}>
            Replace
          </button>
        </div>

        <span>Latest Professional Service Agreement</span>
        <div className="section-center-justify-start flex-row gap-3">
          {fileStatus.service ? (
            <>
              <button className="logease-button" onClick={() => handleView('service')}>
                View
              </button>
              <button className="logease-button" onClick={() => handleDownload('service')}>
                Download
              </button>
            </>
          ) : (
            <p className="text-gray-400">No file available</p>
          )}
          <button className="logease-button" onClick={() => handleReplace('service')}>
            Replace
          </button>
        </div>

        <div className="section-start-justify-start flex-row gap-3">
          <p>&gt;_</p>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : client ? (
            <h1 className="font-bold">{client.name}</h1>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        
        <Link to="/" className="logease-button">
          Back
        </Link>
      </div>
    </div>
  );
}
