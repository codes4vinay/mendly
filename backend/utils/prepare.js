import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let vectorStore = null;

// Initialize embeddings with Azure OpenAI
const embeddings = new OpenAIEmbeddings({
    azureOpenAIApiKey: process.env.OPENAI_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
});

// Initialize Pinecone
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export async function initializeVectorStore() {
    try {
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
        vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: "mendly",
        });
        console.log("Vector store initialized successfully");
        return vectorStore;
    } catch (error) {
        console.error("Error initializing vector store:", error);
        throw error;
    }
}

export async function getVectorStore() {
    if (!vectorStore) {
        await initializeVectorStore();
    }
    return vectorStore;
}

export async function indexTheDocument(filePath) {
    const store = await getVectorStore();

    // Read text file
    if (!fs.existsSync(filePath)) {
        throw new Error(`Document not found at path: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    if (!fileContent || !fileContent.trim()) {
        throw new Error(`No content found in file: ${filePath}`);
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
    });

    const texts = await textSplitter.splitText(fileContent);
    const documents = texts.map((chunk) => ({
        pageContent: chunk,
        metadata: {
            source: filePath,
            timestamp: new Date().toISOString(),
        },
    }));

    if (documents.length === 0) {
        console.warn(`No text chunks were generated from file: ${filePath}`);
        return;
    }

    console.log(`Indexing ${documents.length} document chunks...`);
    await store.addDocuments(documents);
    console.log(`Successfully indexed documents from ${filePath}`);
}

export async function indexMendlyDocumentation() {
    const docPath = path.resolve(process.cwd(), 'docs', 'mendly-documentation.txt');
    try {
        await indexTheDocument(docPath);
        console.log('Mendly documentation indexed successfully');
    } catch (error) {
        console.error('Error indexing Mendly documentation:', error.message);
    }
}

export { vectorStore };
