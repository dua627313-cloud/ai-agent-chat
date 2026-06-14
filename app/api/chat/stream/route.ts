import { getConvexClient } from "@/lib/convex";
import { ChatRequestBody, StreamMessage, SSE_DATA_PREFIX, SSE_DONE_MESSAGE, SSE_LINE_DELIMITER, StreamMessageType } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { submitQuestion } from "@/lib/langgraph";
function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as ChatRequestBody;
    const { messages, newMessage, chatId } = body;

    const convex = getConvexClient();

    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();
    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

    const startStream = async () => {
      try {
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });

        await convex.mutation(api.messages.send, {
          chatId,
          content: newMessage,
        });

        const langChainMessages = [
          ...messages.map((msg) =>
            msg.role === "user"
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          new HumanMessage(newMessage),
        ];

        try {
          const eventStream = await submitQuestion(langChainMessages, chatId);

          for await (const event of eventStream) {
            if (event.event === "on_chat_model_stream") {
              const token = event.data.chunk;
              if (token && token.content) {
                await sendSSEMessage(writer, {
                  type: StreamMessageType.Token,
                  token: token.content,
                });
              }
            } else if (event.event === "on_tool_start") {
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolStart,
                tool: event.name || "unknown",
                input: event.data?.input,
              });
            } else if (event.event === "on_tool_end") {
              const toolMessage = new ToolMessage(event.data.output);
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolEnd,
                tool: toolMessage.lc_kwargs.name || "unknown",
                output: event.data.output,
              });
            }
          }

          await sendSSEMessage(writer, { type: StreamMessageType.Done });
          await writer.close(); // 

        } catch (streamError) {
          console.error("Error in event stream:", streamError);
          await sendSSEMessage(writer, {
            type: StreamMessageType.Error,
            error: streamError instanceof Error
              ? streamError.message
              : "Stream processing failed",
          });
          await writer.close(); 
        }

      } catch (error) {
        console.error("Error in chat API:", error);
        await writer.close(); 
      }
    };

    startStream();
    return response;

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" } as const,
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const message = searchParams.get("message") || "";

  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { ChatOpenAI } = await import("@langchain/openai");
    
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 20,
    });

    const response = await model.invoke([
      { role: "system", content: "Generate a very short chat title (max 4 words). Just return the title, nothing else." },
      { role: "user", content: message },
    ]);

    const title = response.content.toString().trim() || message.substring(0, 30);
    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json({ title: message.substring(0, 30) });
  }
}