import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"

import GuideLayout from "./GuideLayout"
import { guidesBySlug } from "./guides"

const GuideDetailPage = () => {
  const { slug } = useParams()
  const guide = slug ? guidesBySlug[slug] : undefined
  const [content, setContent] = useState("")

  useEffect(() => {
    if (!guide) return

    fetch(guide.markdownPath)
      .then((res) => res.text())
      .then(setContent)
  }, [guide])

  useEffect(() => {
    if (!guide) return

    const metaName = "description"
    const previous = document.querySelector(`meta[name="${metaName}"]`)
    const previousContent = previous?.getAttribute("content")

    if (previous) {
      previous.setAttribute("content", guide.description)
    } else {
      const meta = document.createElement("meta")
      meta.name = metaName
      meta.content = guide.description
      document.head.appendChild(meta)
    }

    return () => {
      const current = document.querySelector(`meta[name="${metaName}"]`)
      if (!current) return

      if (previousContent !== undefined) {
        current.setAttribute("content", previousContent)
      } else if (!previous) {
        current.remove()
      }
    }
  }, [guide])

  if (!guide) {
    return <Navigate to="/guides" replace />
  }

  return (
    <GuideLayout
      title={guide.title}
      description={guide.description}
      category={guide.category}
      readingTime={guide.readingTime}
      lastUpdated={guide.lastUpdated}
      content={content}
    />
  )
}

export default GuideDetailPage
