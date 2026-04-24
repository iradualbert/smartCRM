import { useMemo } from "react"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

type Organization = {
  id?: string | number
  _id?: string | number
  name?: string
  title?: string
  slug?: string
  logo?: string | null
  logo_url?: string | null
}

type OrganizationSwitcherProps = {
  value?: string | null
  onChange?: (organization: Organization) => void
}

const getOrgLabel = (org?: Organization | null) =>
  org?.name || org?.title || org?.slug || "Untitled organization"

const getOrgId = (org?: Organization | null) =>
  org?.id?.toString() || org?._id?.toString() || getOrgLabel(org)

const OrganizationSwitcher = ({
  value,
  onChange,
}: OrganizationSwitcherProps) => {
  const navigate = useNavigate()
  const {
    organizations = [],
    currentOrganization,
    setCurrentOrganization,
  } = useOrganizations()

  const selectedOrg = useMemo(() => {
    if (!organizations.length) return null

    if (value) {
      return (
        organizations.find((org: Organization) => getOrgId(org) === value) ||
        currentOrganization ||
        organizations[0]
      )
    }

    return currentOrganization || organizations[0]
  }, [organizations, currentOrganization, value])

  if (!organizations.length) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-[220px] justify-between rounded-xl border-slate-200 bg-white px-3 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
            <span className="flex items-center gap-2 truncate">
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {selectedOrg?.logo_url || selectedOrg?.logo ? (
                <img
                  src={selectedOrg.logo_url || selectedOrg.logo || ""}
                  alt={getOrgLabel(selectedOrg)}
                  className="h-full w-full object-contain bg-white p-1"
                />
              ) : (
                <Building2 className="h-4 w-4 text-slate-600" />
              )}
            </span>
            <span className="truncate">{getOrgLabel(selectedOrg)}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={10}
        className="z-[120] w-[320px] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>

            <CommandGroup heading="Organizations">
              {organizations.map((org: Organization) => {
                const orgId = getOrgId(org)
                const isActive = getOrgId(selectedOrg) === orgId

                return (
                  <CommandItem
                    key={orgId}
                    value={getOrgLabel(org)}
                    onSelect={() => {
                      onChange?.(org)
                      setCurrentOrganization(org)
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2 flex h-6 w-6 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                      {org.logo_url || org.logo ? (
                        <img
                          src={org.logo_url || org.logo || ""}
                          alt={getOrgLabel(org)}
                          className="h-full w-full object-contain bg-white p-0.5"
                        />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-slate-600" />
                      )}
                    </span>
                    <span className="truncate">{getOrgLabel(org)}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-lg"
                onClick={() => navigate("/settings/organizations")}
              >
                Manage organizations
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default OrganizationSwitcher
