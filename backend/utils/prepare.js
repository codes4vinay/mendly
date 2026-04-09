import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Embeddings } from "@langchain/core/embeddings";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let vectorStore = null;

const EMBEDDING_PROVIDER = (process.env.EMBEDDING_PROVIDER || 'local-hash').toLowerCase();
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'rpar-local-embedding-v1';
const EMBEDDING_DIMENSION = Number(process.env.EMBEDDING_DIMENSION || 1536);

class LocalHashEmbeddings extends Embeddings {
    constructor(fields = {}) {
        super(fields);
        this.dimension = fields.dimension || 1536;
        this.model = fields.model || 'rpar-local-embedding-v1';
    }

    async embedDocuments(texts) {
        return texts.map((text) => this.embedText(text));
    }

    async embedQuery(text) {
        return this.embedText(text);
    }

    embedText(text) {
        const normalized = (text || '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();

        const vector = new Array(this.dimension).fill(0);
        const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
        const features = new Set();

        for (const token of tokens) {
            features.add(`tok:${token}`);

            if (token.length > 2) {
                for (let i = 0; i <= token.length - 3; i += 1) {
                    features.add(`tri:${token.slice(i, i + 3)}`);
                }
            }
        }

        if (features.size === 0) {
            return vector;
        }

        for (const feature of features) {
            const digest = crypto.createHash('sha256').update(`${this.model}:${feature}`).digest();
            const index = digest.readUInt32BE(0) % this.dimension;
            const sign = (digest[4] & 1) === 0 ? 1 : -1;
            const magnitude = 1 + (digest[5] / 255);
            vector[index] += sign * magnitude;
        }

        const norm = Math.sqrt(vector.reduce((sum, value) => sum + (value * value), 0));
        if (norm === 0) {
            return vector;
        }

        return vector.map((value) => value / norm);
    }
}

function createEmbeddings() {
    if (EMBEDDING_PROVIDER === 'azure-openai') {
        return new OpenAIEmbeddings({
            azureOpenAIApiKey: process.env.OPENAI_API_KEY,
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
        });
    }

    return new LocalHashEmbeddings({
        model: EMBEDDING_MODEL,
        dimension: EMBEDDING_DIMENSION,
    });
}

const embeddings = createEmbeddings();

function getPineconeClient() {
    return new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
}

async function validateEmbeddingDimension() {
    const indexName = process.env.PINECONE_INDEX_NAME;
    const pinecone = getPineconeClient();
    const indexInfo = await pinecone.describeIndex(indexName);
    const sampleVector = await embeddings.embedQuery('dimension check');
    const embeddingDimension = sampleVector.length;

    if (indexInfo.dimension !== embeddingDimension) {
        throw new Error(
            `Embedding dimension mismatch for Pinecone index "${indexName}". ` +
            `Index dimension is ${indexInfo.dimension}, but ${EMBEDDING_PROVIDER} model "${EMBEDDING_MODEL}" outputs ${embeddingDimension}. ` +
            `Create a Pinecone index with dimension ${embeddingDimension}, update PINECONE_INDEX_NAME, and re-index the documentation.`
        );
    }

    console.log(`Embeddings ready: provider=${EMBEDDING_PROVIDER}, model=${EMBEDDING_MODEL}, dimension=${embeddingDimension}`);
}

export async function initializeVectorStore() {
    try {
        await validateEmbeddingDimension();
        const pinecone = getPineconeClient();
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
        vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: "rpar",
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

export async function indexRPARDocumentation() {
    const docPath = path.resolve(process.cwd(), 'docs', 'rpar-documentation.txt');
    try {
        const pinecone = getPineconeClient();
        await pinecone.Index(process.env.PINECONE_INDEX_NAME).namespace("rpar").deleteAll();
        await indexTheDocument(docPath);
        console.log('RPAR documentation indexed successfully');
    } catch (error) {
        console.error('Error indexing RPAR documentation:', error.message);
    }
}

export { vectorStore };
