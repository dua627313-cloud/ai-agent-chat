import { DynamicTool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { YoutubeTranscript } from "youtube-transcript";

interface BookItem {
  volumeInfo: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
  };
}

// Tool 1: YouTube Transcript
export const youtubeTranscriptTool = new DynamicTool({
  name: "youtube_transcript",
  description:
    "Fetches the transcript of a YouTube video. Input should be a YouTube video URL or video ID. Use this when the user pastes a YouTube link or asks about a video.",
  func: async (input: string) => {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(input);
      const text = transcript.map((t: { text: string }) => t.text).join(" ");
      return text.slice(0, 8000);
    } catch (error) {
      return `Error fetching transcript: ${error}. Make sure the video has captions enabled.`;
    }
  },
});

// Tool 2: Google Books
export const googleBooksTool = new DynamicTool({
  name: "google_books",
  description:
    "Searches Google Books for book information, summaries, authors, and publication details. Input should be a book title, author name, or topic.",
  func: async (input: string) => {
    try {
      const query = encodeURIComponent(input);
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3&key=${process.env.GOOGLE_BOOKS_API_KEY}`
      );
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        return "No books found for that query.";
      }

      const books = data.items.map((item: BookItem) => {
        const info = item.volumeInfo;
        return `
Title: ${info.title || "Unknown"}
Authors: ${info.authors?.join(", ") || "Unknown"}
Published: ${info.publishedDate || "Unknown"}
Description:
${info.description?.slice(0, 500) || "No description available"}
-----------------------------------`;
      });

      return books.join("\n");
    } catch (error) {
      return `Error searching books: ${error}`;
    }
  },
});

// Tool 3: Wikipedia
export const wikipediaTool = new DynamicTool({
  name: "wikipedia",
  description:
    "Searches Wikipedia for information about people, places, concepts, history, science, and general knowledge topics.",
  func: async (input: string) => {
    try {
      // First, search for the best matching article title
      const searchQuery = encodeURIComponent(input);
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&format=json&origin=*&srlimit=1`
      );
      const searchData = await searchRes.json();

      if (!searchData.query?.search?.length) {
        return "No Wikipedia article found.";
      }

      // Then fetch the summary for the best matching title
      const title = encodeURIComponent(searchData.query.search[0].title);
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
      );
      const data = await summaryRes.json();

      if (!data.extract) {
        return "No Wikipedia article found.";
      }

      return `Title: ${data.title}\n\n${data.extract}`;
    } catch (error) {
      return `Error searching Wikipedia: ${error}`;
    }
  },
});

// Tool 4: Tavily Web Search
export const tavilySearchTool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

// Tool 5: Safe URL Fetcher
export const curlTool = new DynamicTool({
  name: "curl",
  description:
    "Fetches content from a public URL or REST API endpoint. Input should be a valid public URL.",
  func: async (input: string) => {
    try {
      const url = new URL(input);
      const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0"];

      if (blockedHosts.includes(url.hostname)) {
        return "Blocked URL.";
      }

      const res = await fetch(input);
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        return JSON.stringify(data, null, 2).slice(0, 8000);
      }

      const text = await res.text();
      return text.slice(0, 8000);
    } catch (error) {
      return `Error fetching URL: ${error}`;
    }
  },
});

// Export all tools
export const allTools = [
  youtubeTranscriptTool,
  googleBooksTool,
  wikipediaTool,
  tavilySearchTool,
  curlTool,
];