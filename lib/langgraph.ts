import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { AIMessage, SystemMessage, trimMessages, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { MemorySaver } from "@langchain/langgraph";
import { allTools } from "./tools";

const trimmer = trimMessages({
  maxTokens: 10000,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
  maxTokens: 4096,
  streaming: true,
  callbacks: [
    {
      handleLLMStart: async () => console.log("🤖 Starting LLM call"),
      handleLLMEnd: async (output) => {
        console.log("🔚 End LLM call");
        const usage = output.llmOutput?.tokenUsage;
        if (usage) {
          console.log("📊 Token Usage:", {
            input_tokens: usage.promptTokens,
            output_tokens: usage.completionTokens,
            total_tokens: usage.totalTokens,
          });
        }
      },
    },
  ],
}).bindTools(allTools);

const toolNode = new ToolNode(allTools);

const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return "end";
};

const systemPrompt = `
You are an intelligent AI Agent with access to external tools.
The current date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

When a user first greets you or says hi, introduce yourself like this:
"Hello! I'm your AI Assistant. Here's what I can help you with:

1. 📺 YouTube Videos - Summarize or extract information from any YouTube video (just paste the URL)
2. 📚 Google Books - Find books, authors, summaries and publication details
3. 🌐 Wikipedia - Look up people, places, history, science and general knowledge
4. 🔍 Web Search - Find latest news, current events and real-time information
5. 🔗 URL Fetcher - Fetch and analyze content from any public URL or API 

Just ask me anything and I'll use the right tool to help you!"

Your goal is to provide accurate, helpful, and factual answers.

Available tools:

1. youtube_transcript
   - Use when the user provides a YouTube video URL or asks about a video's content.

2. google_books
   - Use for books, authors, recommendations, summaries, publication details.

3. wikipedia
   - Use for people, places, history, science, concepts, and general knowledge.

4. tavily_search_results_json
   - Use for current events, recent developments, news, and time-sensitive facts.
   - ALWAYS use this tool for questions about current events, latest news, prices, rankings, or anything time-sensitive.
   - NEVER say you don't have access to real-time data — use this tool instead.

5. curl
   - Use only when the user provides a specific URL.

Instructions:
- Always select the most appropriate tool when external information is needed.
- NEVER answer questions about current events, news, or real-time data from memory — always use tavily_search_results_json.
- Never invent facts or sources.
- If tool results are insufficient, clearly state the limitation.
- Summarize tool results clearly and concisely.
- Mention which tool(s) were used when relevant.
- If no tool is necessary, answer directly.
- When doing a tool call, structure it between markers:
---START---
query
---END---
- Use previous messages in the conversation to maintain context.
- Do not ask the user to repeat information already in the chat history.
`;
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const { messages } = state;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    new SystemMessage(systemPrompt),
    new MessagesPlaceholder("messages"),
  ]);

  const trimmedMessages = await trimmer.invoke(messages);
  const prompt = await promptTemplate.invoke({ messages: trimmedMessages });
  const response = await model.invoke(prompt);

  return { messages: [...messages, response] };
};

const createWorkflow = () => {
  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue, {
      tools: "tools",
      end: "__end__",
    })
    .addEdge("tools", "agent");

  return graph;
};

export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  const workflow = createWorkflow();

  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });

  const stream = await app.streamEvents(
    { messages },
    {
      version: "v2",
      configurable: {
        thread_id: chatId, // each chat has its own memory
      },
      streamMode: "messages",
      runId: chatId,
    }
  );

  return stream;
}