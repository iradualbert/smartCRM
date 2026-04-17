import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"

const STORAGE_KEY = "currentOrganizationId"

type Organization = {
  id?: string | number
  _id?: string | number
  name?: string
  title?: string
  slug?: string
}

const getOrgId = (org?: Organization | null) =>
  org?.id?.toString() || org?._id?.toString()

export const useOrganizations = () => {
  const { user } = useSelector((state: any) => state)
  const organizations: Organization[] = user?.organizations || []

  const [storedOrgId, setStoredOrgId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // ✅ Load from localStorage FIRST
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setStoredOrgId(saved)
    setIsLoaded(true)
  }, [])

  // ✅ Resolve current org
  const currentOrganization = useMemo(() => {
    if (!organizations.length) return null

    if (storedOrgId) {
      const match = organizations.find(
        (org) => getOrgId(org) === storedOrgId
      )
      if (match) return match
    }

    return organizations[0]
  }, [organizations, storedOrgId])

  // ✅ ONLY persist AFTER localStorage is loaded
  useEffect(() => {
    if (!isLoaded) return
    if (!currentOrganization) return

    const id = getOrgId(currentOrganization)
    if (!id) return

    localStorage.setItem(STORAGE_KEY, id)
    setStoredOrgId(id)
  }, [currentOrganization, isLoaded])

  const setCurrentOrganization = (org: Organization) => {
    const id = getOrgId(org)
    if (!id) return

    localStorage.setItem(STORAGE_KEY, id)
    setStoredOrgId(id)

    // window.location.reload()
    // reload and go to the dashboard
    window.location.href = "/dashboard"

  }

  return {
    organizations,
    currentOrganization,
    currentOrganizationId: getOrgId(currentOrganization),
    defaultOrganization: organizations[0] || null,
    setCurrentOrganization,
  }
}