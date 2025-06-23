import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { fetchServer } from "../utils/fetchServer";

interface Message {
    text: string;
    isUser: boolean;
    sources?: Array<{
        source: string;
        text: string;
        score: number;
    }>;
}

export function FileRetrievalPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (inputText.trim()) {
            const userMessage = inputText;
            setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
            setInputText("");
            setIsLoading(true);

            try {
                const result = await fetchServer<{ response: { sources: Array<{ source: string; text: string; score: number }> } }>('/chat/message', {
                    method: 'POST',
                    body: { message: userMessage }
                });

                if (result.error) {
                    throw new Error(result.error);
                }

                if (!result.data) {
                    throw new Error('No data received from server');
                }

                setMessages(prev => [...prev, { 
                    text: "Here are the relevant documents:", 
                    isUser: false,
                    sources: result.data!.response.sources
                }]);
            } catch (error) {
                console.error('Error sending message:', error);
                setMessages(prev => [...prev, { 
                    text: "Sorry, I encountered an error. Please try again.", 
                    isUser: false 
                }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="main-container font-serif text-white min-h-screen bg-gray-900 p-4">
            <Link to="/" className="logease-button mb-4 inline-block">
                Back
            </Link>
            
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-800 rounded-lg p-4 h-[600px] flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className="space-y-2">
                                <div
                                    className={`p-3 rounded-lg ${
                                        message.isUser
                                            ? "bg-blue-600 ml-auto"
                                            : "bg-gray-700"
                                    } max-w-[80%]`}
                                >
                                    {message.text}
                                </div>
                                {!message.isUser && message.sources && message.sources.length > 0 && (
                                    <div className="mt-2">
                                        <div className="font-semibold text-base text-blue-300 mb-2">Relevant Documents</div>
                                        <div className="space-y-4">
                                            {message.sources.map((source, idx) => (
                                                <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="text-xs text-blue-400 break-all flex-1">
                                                            <a href={source.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">
                                                                {source.source}
                                                            </a>
                                                        </div>
                                                        <div className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                                            Score: {source.score.toFixed(3)}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-800 rounded p-3 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                                                        {source.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%]">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                            placeholder="Type your message..."
                            className="flex-1 p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}