import { Link } from "react-router-dom"
import { ArrowRight, BookOpenText } from "lucide-react"

import { Button } from "@/components/ui/button"
import PageTitle from "@/components/PageTitle"
import { guides } from "./guides"

const GuidesIndexPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <PageTitle title="Guides" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              Public guides
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Practical guides for quotations, invoices, and sales documents
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Short, clear guides for teams setting up quotations, invoices, proformas, and email sending inside Beinpark.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {guides.map((guide) => (
              <article
                key={guide.slug}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                      <BookOpenText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                          {guide.category}
                        </div>
                        <span className="text-xs text-slate-500">{guide.readingTime}</span>
                        <span className="text-xs text-slate-400">Updated {guide.lastUpdated}</span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold text-slate-900">{guide.title}</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                        {guide.description}
                      </p>
                    </div>
                  </div>

                  <div className="md:shrink-0">
                    <Button asChild variant="outline" className="w-full rounded-2xl bg-white md:w-auto">
                      <Link to={`/guides/${guide.slug}`}>
                        Read guide
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuidesIndexPage
