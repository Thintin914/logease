const { BedrockAgentRuntimeClient, RetrieveCommand } = require("@aws-sdk/client-bedrock-agent-runtime");
const { getSignedUrlFromS3 } = require("./s3Service");

const KNOWLEDGE_BASE_ID = process.env.AWS_BEDROCK_KNOWLEDGE_BASE_ID;

class BedrockService {
    constructor() {
        this.agentClient = new BedrockAgentRuntimeClient({
            region: process.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_BEDROCK_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_BEDROCK_SECRET_ACCESS_KEY
            }
        });
    }

    async getPresignedUrl(s3Uri) {
        // s3Uri format: s3://bucket/key
        const match = s3Uri.match(/^s3:\/\/([^\/]+)\/(.+)$/);
        if (!match) return null;
        const bucket = match[1];
        const key = match[2];
        return await getSignedUrlFromS3(bucket, key);
    }

    async queryKnowledgeBase(query, knowledgeBaseId) {
        try {
            const command = new RetrieveCommand({
                knowledgeBaseId: knowledgeBaseId,
                retrievalQuery: {
                    text: query
                },
                retrievalConfiguration: {
                    vectorSearchConfiguration: {
                        numberOfResults: 5
                    }
                }
            });

            const response = await this.agentClient.send(command);
            return response.retrievalResults;
        } catch (error) {
            console.error("Error querying knowledge base:", error);
            throw error;
        }
    }

    async processChatMessage(message) {
        try {
            // Query the knowledge base
            const knowledgeResults = await this.queryKnowledgeBase(message, KNOWLEDGE_BASE_ID);
            
            // Extract source information and content, then sort and take top 2
            let sources = knowledgeResults
                .map(result => ({
                    text: result.content.text,
                    s3uri: result.location.s3Location?.uri || null,
                    score: result.score
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 2);

            // Generate presigned URLs for each source using s3Service
            sources = await Promise.all(sources.map(async (source) => {
                let url = source.s3uri ? await this.getPresignedUrl(source.s3uri) : null;
                return {
                    source: url || source.s3uri || 'Unknown source',
                    text: source.text
                };
            }));

            // Return only the top 2 sources with their content and presigned URLs
            return {
                sources
            };
        } catch (error) {
            console.error("Error processing chat message:", error);
            throw error;
        }
    }
}

module.exports = BedrockService;
