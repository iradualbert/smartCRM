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
  org?.id?.toString() || org?._id?.toString() || null

export const useOrganizations = () => {
  const { user } = useSelector((state: any) => state)
  const organizations: Organization[] = user?.organizations || []

  const [storedOrgId, setStoredOrgId] = useState<string | null>(null)
  const [isStorageLoaded, setIsStorageLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    setStoredOrgId(saved)
    setIsStorageLoaded(true)
  }, [])

  const currentOrganization = useMemo(() => {
    if (!isStorageLoaded) return null
    if (!organizations.length) return null

    if (storedOrgId) {
      const match = organizations.find((org) => getOrgId(org) === storedOrgId)
      if (match) return match
    }

    return organizations[0] || null
  }, [organizations, storedOrgId, isStorageLoaded])

  useEffect(() => {
    if (!isStorageLoaded) return
    if (!currentOrganization) return

    const id = getOrgId(currentOrganization)
    if (!id) return

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== id) {
      localStorage.setItem(STORAGE_KEY, id)
    }
  }, [currentOrganization, isStorageLoaded])

  const setCurrentOrganization = (org: Organization) => {
    const id = getOrgId(org)
    if (!id) return

    localStorage.setItem(STORAGE_KEY, id)
    setStoredOrgId(id)
    window.location.href = "/dashboard"
  }

  return {
    organizations,
    currentOrganization,
    currentOrganizationId: getOrgId(currentOrganization),
    defaultOrganization: isStorageLoaded ? organizations[0] || null : null,
    isStorageLoaded,
    setCurrentOrganization,
  }
}