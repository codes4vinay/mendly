import SupportArticle from "../models/SupportArticle.js";
import DEFAULT_SUPPORT_ARTICLES from "../data/defaultSupportArticles.js";

const STOP_WORDS = new Set([
    "a", "an", "and", "are", "can", "do", "for", "how", "i", "in", "is", "it", "me", "my", "of", "on", "the", "to", "what", "with",
]);

const normalize = (value) => String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokensFor = (value) => normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

export async function ensureDefaultSupportArticles() {
    if (!DEFAULT_SUPPORT_ARTICLES.length) return;
    await SupportArticle.bulkWrite(DEFAULT_SUPPORT_ARTICLES.map((article) => ({
        updateOne: {
            filter: { slug: article.slug },
            update: {
                $setOnInsert: {
                    ...article,
                    status: "published",
                    version: 1,
                    publishedAt: new Date(),
                    isSystemDefault: true,
                },
            },
            upsert: true,
        },
    })), { ordered: false });
}

export function scoreSupportArticleMatch(article, message, intent) {
    const messageText = normalize(message);
    const messageTokens = new Set(tokensFor(messageText));
    let score = 0;
    if (intent && intent !== "general" && (article.intents || []).includes(intent)) {
        score += 10;
    }
    for (const keyword of article.keywords || []) {
        const normalizedKeyword = normalize(keyword);
        if (normalizedKeyword && messageText.includes(normalizedKeyword)) {
            score += normalizedKeyword.includes(" ") ? 5 : 3;
        }
    }
    for (const token of tokensFor(`${article.title} ${article.summary}`)) {
        if (messageTokens.has(token)) score += 1;
    }
    return score;
}

export async function findApprovedSupportArticle(message, intent, audience = "customer") {
    const audienceFilter = { $in: ["all", audience] };
    const candidates = await SupportArticle.find({
        status: "published",
        audience: audienceFilter,
    }).select("slug title summary content category intents keywords audience version updatedAt").lean();

    let best = null;
    let bestScore = 0;
    for (const article of candidates) {
        const score = scoreSupportArticleMatch(article, message, intent);
        if (score > bestScore) {
            best = article;
            bestScore = score;
        }
    }

    return bestScore >= 3 ? best : null;
}
