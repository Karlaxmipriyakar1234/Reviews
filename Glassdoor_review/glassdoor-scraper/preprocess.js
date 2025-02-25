const { Client } = require("pg");
const stopword = require("stopword");
const natural = require("natural");
const vader = require("vader-sentiment");
const compromise = require("compromise");

// PostgreSQL connection
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "company_review",
  password: "laxmi1",
  port: 5432,
});

client.connect();

// Text Preprocessing
const preprocessText = (text) => {
  if (!text || typeof text !== "string") return "";

  let processedText = text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, "") 
    .replace(/<\/?[^>]+(>|$)/g, "");

  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(processedText);
  const filteredTokens = stopword.removeStopwords(tokens);
  const stemmedTokens = filteredTokens.map((token) =>
    natural.PorterStemmer.stem(token)
  );

  return stemmedTokens.join(" ");
};

// Sentiment Analysis
const analyzeSentiment = (text) => {
  if (!text || typeof text !== "string") return { compound: 0 };
  return vader.SentimentIntensityAnalyzer.polarity_scores(text);
};

// Extract Keywords
const extractKeywords = (text) => {
  if (!text || typeof text !== "string") return [];

  let doc = compromise(text);
  let keywords = doc.topics().json().map((entity) => entity.text);

  if (keywords.length === 0) {
    keywords = doc.nouns().out("array");
  }

  return keywords;
};

// Categorize Keywords by Sentiment
const categorizeKeywords = (text) => {
  const keywords = extractKeywords(text);
  const positiveKeywords = [];
  const negativeKeywords = [];

  keywords.forEach((word) => {
    const sentimentScore = analyzeSentiment(word).compound;
    if (sentimentScore >= 0.05) {
      positiveKeywords.push(word);
    } else if (sentimentScore <= -0.05) {
      negativeKeywords.push(word);
    }
  });

  return { positiveKeywords, negativeKeywords };
};

// Fetch and Process Reviews
const fetchReviews = async () => {
  try {
    console.log("Fetching reviews from database...");

    const res = await client.query(
      'SELECT "Reviews", "Pros", "Cons" FROM "Review"'
    );

    const processedData = res.rows.map((review) => {
      const reviewText = review.Reviews || "";
      const prosText = review.Pros || "";
      const consText = review.Cons || "";

      return {
        original: { review: reviewText, pros: prosText, cons: consText },
        processed: {
          review: preprocessText(reviewText),
          pros: preprocessText(prosText),
          cons: preprocessText(consText),
        },
        sentiment: {
          review: analyzeSentiment(reviewText),
          pros: analyzeSentiment(prosText),
          cons: analyzeSentiment(consText),
        },
        keywords: {
          review: categorizeKeywords(reviewText),
          pros: categorizeKeywords(prosText),
          cons: categorizeKeywords(consText),
        },
      };
    });

    return { reviews: processedData };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

module.exports = { fetchReviews };
