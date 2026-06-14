import { SignedIn , SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import {ArrowRight} from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-slate-950 [background-image:radial-gradient(ellipse_at_top,rgba(99,102,241,0.2)_0%,transparent_60%),radial-gradient(circle,_#1e293b_1px,_transparent_1px)] [background-size:100%_100%,_28px_28px]" />
      
      <section className="relative z-10 w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col items-center space-y-10 text-center">
        {/* hero content */}
        <header className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-indigo-300 via-white to-indigo-300 bg-clip-text text-transparent">
            AI Agent Assistant
          </h1>
          <p className="max-w-[600px] text-lg text-slate-300 md:text-xl/relaxed xl:text-2xl/relaxed">
            Your new AI chat companion that goes beyond conversation - it can actually get things done for you!
            <br/>
            <span className="text-slate-500 text-sm">
              Powered by Tool&apos;s & your favourite LLM&apos;s.
            </span>
          </p>
        </header>

        <SignedIn>
          <Link href="/dashboard">
            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 shadow-lg hover:shadow-xl hover:translate-y-0.5">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5"/>
              <div className="absolute inset-0 rounded-full bg-linear-to-r from-indigo-300/20 to-indigo-200/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton
          mode="modal" 
          fallbackRedirectUrl={"/dashboard"}
          forceRedirectUrl={"/dashboard"}
          >
            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 shadow-lg hover:shadow-xl hover:translate-y-0.5">
              Sign Up 
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5"/>
            </button>
          </SignInButton>
        </SignedOut>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pt-8 max-w-3xl mx-auto">
          {[
            { 
              title: "Fast" , description: "Real-time streamed responses"},
            {
              title: "Modern", description: "Next.js, Tailwind CSS, Convex, Clerk",

            } , 
            {
              title: "Smart" , description: "Powered by your favourite LLM's"
            },
          ].map(({title , description}) =>(
            <div key={title} className="text-center">
              <div className="text-2xl font-semibold text-indigo-300">
                {title}
              </div>
              <div className="text-sm text-indigo-100 mt-1">{description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}