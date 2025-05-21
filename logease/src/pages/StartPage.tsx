import { downloadFile } from "../utils/downloadFile";
import { getSignedUrl } from "../utils/getSignedUrl";
import { uploadFile } from "../utils/uploadFile";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchServer } from "../utils/fetchServer";

interface Client {
  id: number;
  name: string;
}

export function StartPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [removingClientId, setRemovingClientId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch all client ids and names on mount
    const fetchClients = async () => {
      const response = await fetchServer<Client[]>("/get_all_clients");
      if (response.status === 200 && response.data) {
        setClients(response.data);
      } else {
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  const handleAddClient = async () => {
    if (isAddingClient) return;
    const trimmedName = newClient.trim();
    if (!trimmedName) return;
    setIsAddingClient(true);
    try {
      const response = await fetchServer<{
        id: number;
        timestamp: string;
        name: string;
      }>("/add_clients", {
        method: "POST",
        body: { name: trimmedName },
      });
      if (response.status === 201 && response.data) {
        setClients([
          ...clients,
          { id: response.data.id, name: response.data.name },
        ]);
        setNewClient("");
      } else if (response.status === 409) {
        alert("Client with this name already exists.");
      } else {
        alert(response.error || "Failed to add client.");
      }
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleRemoveClient = async (index: number) => {
    const client = clients[index];
    if (removingClientId === client.id) return;
    if (window.confirm("Are you sure you want to remove this client?")) {
      setRemovingClientId(client.id);
      try {
        const response = await fetchServer(`/delete_client/${client.id}/${encodeURIComponent(client.name)}`, {
          method: "DELETE",
        });
        if (response.status === 204) {
          setClients(clients.filter((_, i) => i !== index));
        } else if (response.status === 404) {
          alert("Client not found.");
        } else {
          alert(response.error || "Failed to delete client.");
        }
      } finally {
        setRemovingClientId(null);
      }
    }
  };

  const handleView = async (key: string) => {
    try {
      const url = await getSignedUrl(key);
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      window.open(officeViewerUrl, "_blank");
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  };

  const handleDownload = async (key: string) => {
    try {
      const url = await downloadFile(key);
      console.log(url);
      //   window.open(url, '_blank');
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleReplace = async (key: string) => {
    try {
      // Create a file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".docx,.doc";

      // Handle file selection
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // Check file type
        const allowedTypes = [
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
          //   'application/msword' // .doc
        ];

        if (!allowedTypes.includes(file.type)) {
          alert("Please select a .docx file");
          return;
        }

        try {
          // Always use .docx extension for the uploaded file
          const newFileName = key.replace(/\.[^/.]+$/, ".docx");
          await uploadFile(file, newFileName);
          alert("File replaced successfully!");
          // Optionally refresh the page or update the UI
          window.location.reload();
        } catch (error) {
          console.error("Error replacing file:", error);
          alert("Failed to replace file. Please try again.");
        }
      };

      // Trigger file selection dialog
      input.click();
    } catch (error) {
      console.error("Error in replace handler:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="main-container font-serif text-white">
      <div className="section-start-justify-start flex-row gap-3">
        
        {/* Block 1 */}
        <div className="justify-start item-start flex-col flex gap-3">
          <span>Latest Installation Scope of Work</span>
          <div className="section-center-justify-start flex-row gap-3">
            <button
              className="logease-button"
              onClick={() =>
                handleView("LogEase Installation Scope of Work.docx")
              }
            >
              View
            </button>
            <button
              className="logease-button"
              onClick={() =>
                handleDownload("LogEase Installation Scope of Work.docx")
              }
            >
              Download
            </button>
            <button
              className="logease-button"
              onClick={() =>
                handleReplace("LogEase Installation Scope of Work.docx")
              }
            >
              Replace
            </button>
          </div>

          <span>Latest Professional Service (7x24X4)</span>
          <div className="section-center-justify-start flex-row gap-3">
            <button
              className="logease-button"
              onClick={() =>
                handleView("LogEase Professional Service (7x24X4).docx")
              }
            >
              View
            </button>
            <button
              className="logease-button"
              onClick={() =>
                handleDownload("LogEase Professional Service (7x24X4).docx")
              }
            >
              Download
            </button>
            <button
              className="logease-button"
              onClick={() =>
                handleReplace("LogEase Professional Service (7x24X4).docx")
              }
            >
              Replace
            </button>
          </div>

          <p>&gt;_</p>
          <Link to="/calculator" className="logease-button">
            Machine Requirement Calculator
          </Link>
        </div>

        {/* Block 2 */}
        <div className="justify-start items-start flex-col gap-3 max-w-md">
          <div className="section-start-justify-start flex-col gap-3">
            <span>Client List</span>
            <div className="section-center-justify-start flex-row gap-3">
              <input
                type="text"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="Enter client name"
                className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleAddClient()}
              />
              <button
                onClick={handleAddClient}
                className="logease-button"
                disabled={isAddingClient}
              >
                Add Client
              </button>
            </div>
            <div className="flex flex-col gap-3 mt-3">
              {clients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-800 p-3 rounded"
                >
                  <Link
                    to="/client/$clientId"
                    params={{ clientId: client.id.toString() }}
                    className="break-words max-w-[80%] hover:text-blue-400"
                  >
                    {client.name}
                  </Link>
                  <button
                    onClick={() => handleRemoveClient(index)}
                    className="text-red-500 hover:text-red-400 px-2 flex-shrink-0"
                    title="Click to remove client"
                    disabled={removingClientId === client.id}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {clients.length === 0 && (
                <p className="text-gray-500 italic">No clients added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
