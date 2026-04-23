import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import PageTitle from "@/components/PageTitle"
import Markdown from "@/pages/static_content/Markdown"

type GuideLayoutProps = {
  title: string
  description: string
  category: string
  readingTime: string
  lastUpdated: string
  content: string
}

const GuideLayout = ({
  title,
  description,
  category,
  readingTime,
  lastUpdated,
  content,
}: GuideLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <PageTitle title={title} />
      <div className="mx-auto w-full max-w-4xl px-6">
        <div className="mb-8">
          <Button asChild variant="ghost" className="rounded-2xl px-0 text-slate-600 hover:bg-transparent">
            <Link to="/guides">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to guides
            </Link>
          </Button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8">
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              {category}
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{readingTime}</span>
              <span className="text-slate-300">•</span>
              <span>Last updated {lastUpdated}</span>
            </div>
          </div>

          <main>
            <Markdown>{content}</Markdown>
          </main>

          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <BookOpen className="h-4 w-4 text-slate-700" />
              Ready to put this into practice?
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Start with your first quotation or open the app and continue building your customer document workflow.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-2xl">
                <Link to="/signup">
                  Create your first quotation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl">
                <Link to="/login">Try the app</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuideLayout
