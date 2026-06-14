import {Id} from "@/convex/_generated/dataModel";
import {auth} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import ChatInterface from "@/components/ChatInterface";
interface ChatPageProps{
    params: Promise<{
        chatId: Id<"chats">;
    }>;
}

export default async function ChatPage({params}: ChatPageProps){
    const {chatId} = await params;

    // get user authentication
    const {userId} = await auth();

    if(!userId){
        redirect("/");
    }
   
   try{
    // get convex client and fetch chat and messages
    const convex= getConvexClient();
    // get messages
    const initialMessages = await convex.query(api.messages.list , {chatId});
    return (
        <div className="flex-1 overflow-hidden">
            <ChatInterface chatId={chatId} initialMessages={initialMessages}/>
        </div>
    )
   }catch(error){
     console.error("Error loading chat:", error);
     redirect("/dashboard");
   }
}